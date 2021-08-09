"use strict"

module.exports = surfaceNets

var generateContourExtractor = require("ndarray-extract-contour")
var zeroCrossings = require("zero-crossings")

var F1_6 = 1 / 6
var F5_6 = 5 / 6
var F7_18 = 7 / 18
var F1_14 = 1 / 14
var F3_14 = 3 / 14
var F5_14 = 5 / 14
var F9_14 = 9 / 14
var F11_18 = 11 / 18

var allFns = {
  "2d": function (genContour, order, dtype) {
    var contour = genContour({
      order: order,
      scalarArguments: 3,
      getters: dtype === "generic" ? [0] : undefined,
      phase: function phaseFunc(p, a, b, c) {
        return (p > c) | 0;
      },
      vertex: function vertexFunc(d0, d1, v0, v1, v2, v3, p0, p1, p2, p3, a, b, c) {
        var m = ((p0 << 0) + (p1 << 1) + (p2 << 2) + (p3 << 3)) | 0;
        if (m === 0 || m === 15) {
          return;
        }
        switch (m) {
          case 0:
            a.push([d0 - 0.5, d1 - 0.5]);
            break;
          case 1:
            a.push([d0 - 0.25 - (0.25 * (v1 + v0 - 2 * c)) / (v0 - v1), d1 - 0.25 - (0.25 * (v2 + v0 - 2 * c)) / (v0 - v2)]);
            break;
          case 2:
            a.push([d0 - 0.75 - (0.25 * (-v1 - v0 + 2 * c)) / (v1 - v0), d1 - 0.25 - (0.25 * (v3 + v1 - 2 * c)) / (v1 - v3)]);
            break;
          case 3:
            a.push([d0 - 0.5, d1 - 0.5 - (0.5 * (v2 + v0 + v3 + v1 - 4 * c)) / (v0 - v2 + v1 - v3)]);
            break;
          case 4:
            a.push([d0 - 0.25 - (0.25 * (v3 + v2 - 2 * c)) / (v2 - v3), d1 - 0.75 - (0.25 * (-v2 - v0 + 2 * c)) / (v2 - v0)]);
            break;
          case 5:
            a.push([d0 - 0.5 - (0.5 * (v1 + v0 + v3 + v2 - 4 * c)) / (v0 - v1 + v2 - v3), d1 - 0.5]);
            break;
          case 6:
            a.push([d0 - 0.5 - (0.25 * (-v1 - v0 + v3 + v2)) / (v1 - v0 + v2 - v3), d1 - 0.5 - (0.25 * (-v2 - v0 + v3 + v1)) / (v2 - v0 + v1 - v3)]);
            break;
          case 7:
            a.push([d0 - 0.75 - (0.25 * (v3 + v2 - 2 * c)) / (v2 - v3), d1 - 0.75 - (0.25 * (v3 + v1 - 2 * c)) / (v1 - v3)]);
            break;
          case 8:
            a.push([d0 - 0.75 - (0.25 * (-v3 - v2 + 2 * c)) / (v3 - v2), d1 - 0.75 - (0.25 * (-v3 - v1 + 2 * c)) / (v3 - v1)]);
            break;
          case 9:
            a.push([d0 - 0.5 - (0.25 * (v1 + v0 + -v3 - v2)) / (v0 - v1 + v3 - v2), d1 - 0.5 - (0.25 * (v2 + v0 + -v3 - v1)) / (v0 - v2 + v3 - v1)]);
            break;
          case 10:
            a.push([d0 - 0.5 - (0.5 * (-v1 - v0 + -v3 - v2 + 4 * c)) / (v1 - v0 + v3 - v2), d1 - 0.5]);
            break;
          case 11:
            a.push([d0 - 0.25 - (0.25 * (-v3 - v2 + 2 * c)) / (v3 - v2), d1 - 0.75 - (0.25 * (v2 + v0 - 2 * c)) / (v0 - v2)]);
            break;
          case 12:
            a.push([d0 - 0.5, d1 - 0.5 - (0.5 * (-v2 - v0 + -v3 - v1 + 4 * c)) / (v2 - v0 + v3 - v1)]);
            break;
          case 13:
            a.push([d0 - 0.75 - (0.25 * (v1 + v0 - 2 * c)) / (v0 - v1), d1 - 0.25 - (0.25 * (-v3 - v1 + 2 * c)) / (v3 - v1)]);
            break;
          case 14:
            a.push([d0 - 0.25 - (0.25 * (-v1 - v0 + 2 * c)) / (v1 - v0), d1 - 0.25 - (0.25 * (-v2 - v0 + 2 * c)) / (v2 - v0)]);
            break;
          case 15:
            a.push([d0 - 0.5, d1 - 0.5]);
            break;
        }
      },
      cell: function cellFunc(v0, v1, c0, c1, p0, p1, a, b, c) {
        if (p0) {
          b.push([v0, v1]);
        } else {
          b.push([v1, v0]);
        }
      },
    });
    return function (array, level) {
      var verts = [],
        cells = [];
      contour(array, verts, cells, level);
      return { positions: verts, cells: cells };
    };
  },
  "3d": function (genContour, order, dtype) {
    var contour = genContour({
      order: order,
      scalarArguments: 3,
      getters: dtype === "generic" ? [0] : undefined,
      phase: function phaseFunc(p, a, b, c) {
        return (p > c) | 0;
      },
      vertex: function vertexFunc(d0, d1, d2, v0, v1, v2, v3, v4, v5, v6, v7, p0, p1, p2, p3, p4, p5, p6, p7, a, b, c) {
        var m = ((p0 << 0) + (p1 << 1) + (p2 << 2) + (p3 << 3) + (p4 << 4) + (p5 << 5) + (p6 << 6) + (p7 << 7)) | 0;
        if (m === 0 || m === 255) {
          return;
        }
        switch (m >>> 7) {
          case 0:
            vExtra0(m & 0x7f, d0, d1, d2, v0, v1, v2, v3, v4, v5, v6, v7, p0, p1, p2, p3, p4, p5, p6, p7, a, c);
            break;
          case 1:
            vExtra1(m & 0x7f, d0, d1, d2, v0, v1, v2, v3, v4, v5, v6, v7, p0, p1, p2, p3, p4, p5, p6, p7, a, c);
            break;
        }
      },
      cell: function cellFunc(v0, v1, v2, v3, c0, c1, p0, p1, a, b, c) {
        if (p0) {
          b.push([v3, v2, v0], [v0, v1, v3]);
        } else {
          b.push([v0, v2, v3], [v3, v1, v0]);
        }
      },
    });
    return function (array, level) {
      var verts = [],
        cells = [];
      contour(array, verts, cells, level);
      return { positions: verts, cells: cells };
    };
    function vExtra0(m, d0, d1, d2, v0, v1, v2, v3, v4, v5, v6, v7, p0, p1, p2, p3, p4, p5, p6, p7, a, c) {
      switch (m) {
        case 0:
          a.push([d0 - 0.5, d1 - 0.5, d2 - 0.5]);
          break;
        case 1:
          a.push([
            d0 - F1_6 - (F1_6 * (v1 + v0 - 2 * c)) / (v0 - v1),
            d1 - F1_6 - (F1_6 * (v2 + v0 - 2 * c)) / (v0 - v2),
            d2 - F1_6 - (F1_6 * (v4 + v0 - 2 * c)) / (v0 - v4),
          ]);
          break;
        case 2:
          a.push([
            d0 - F5_6 - (F1_6 * (-v1 - v0 + 2 * c)) / (v1 - v0),
            d1 - F1_6 - (F1_6 * (v3 + v1 - 2 * c)) / (v1 - v3),
            d2 - F1_6 - (F1_6 * (v5 + v1 - 2 * c)) / (v1 - v5),
          ]);
          break;
        case 3:
          a.push([d0 - 0.5, d1 - 0.25 - (0.25 * (v2 + v0 + v3 + v1 - 4 * c)) / (v0 - v2 + v1 - v3), d2 - 0.25 - (0.25 * (v4 + v0 + v5 + v1 - 4 * c)) / (v0 - v4 + v1 - v5)]);
          break;
        case 4:
          a.push([
            d0 - F1_6 - (F1_6 * (v3 + v2 - 2 * c)) / (v2 - v3),
            d1 - F5_6 - (F1_6 * (-v2 - v0 + 2 * c)) / (v2 - v0),
            d2 - F1_6 - (F1_6 * (v6 + v2 - 2 * c)) / (v2 - v6),
          ]);
          break;
        case 5:
          a.push([d0 - 0.25 - (0.25 * (v1 + v0 + v3 + v2 - 4 * c)) / (v0 - v1 + v2 - v3), d1 - 0.5, d2 - 0.25 - (0.25 * (v4 + v0 + v6 + v2 - 4 * c)) / (v0 - v4 + v2 - v6)]);
          break;
        case 6:
          a.push([
            d0 - 0.5 - (F1_6 * (-v1 - v0 + v3 + v2)) / (v1 - v0 + v2 - v3),
            d1 - 0.5 - (F1_6 * (-v2 - v0 + v3 + v1)) / (v2 - v0 + v1 - v3),
            d2 - F1_6 - (F1_6 * (v5 + v1 + v6 + v2 - 4 * c)) / (v1 - v5 + v2 - v6),
          ]);
          break;
        case 7:
          a.push([d0 - 0.5 - (0.1 * (v3 + v2 - 2 * c)) / (v2 - v3), d1 - 0.5 - (0.1 * (v3 + v1 - 2 * c)) / (v1 - v3), d2 - 0.3 - (0.3 * (v4 + v0 + v5 + v1 + v6 + v2 - 6 * c)) / (v0 - v4 + v1 - v5 + v2 - v6)]);
          break;
        case 8:
          a.push([
            d0 - F5_6 - (F1_6 * (-v3 - v2 + 2 * c)) / (v3 - v2),
            d1 - F5_6 - (F1_6 * (-v3 - v1 + 2 * c)) / (v3 - v1),
            d2 - F1_6 - (F1_6 * (v7 + v3 - 2 * c)) / (v3 - v7),
          ]);
          break;
        case 9:
          a.push([
            d0 - 0.5 - (F1_6 * (v1 + v0 + -v3 - v2)) / (v0 - v1 + v3 - v2),
            d1 - 0.5 - (F1_6 * (v2 + v0 + -v3 - v1)) / (v0 - v2 + v3 - v1),
            d2 - F1_6 - (F1_6 * (v4 + v0 + v7 + v3 - 4 * c)) / (v0 - v4 + v3 - v7),
          ]);
          break;
        case 10:
          a.push([d0 - 0.75 - (0.25 * (-v1 - v0 + -v3 - v2 + 4 * c)) / (v1 - v0 + v3 - v2), d1 - 0.5, d2 - 0.25 - (0.25 * (v5 + v1 + v7 + v3 - 4 * c)) / (v1 - v5 + v3 - v7)]);
          break;
        case 11:
          a.push([d0 - 0.5 - (0.1 * (-v3 - v2 + 2 * c)) / (v3 - v2), d1 - 0.5 - (0.1 * (v2 + v0 - 2 * c)) / (v0 - v2), d2 - 0.3 - (0.3 * (v4 + v0 + v5 + v1 + v7 + v3 - 6 * c)) / (v0 - v4 + v1 - v5 + v3 - v7)]);
          break;
        case 12:
          a.push([d0 - 0.5, d1 - 0.75 - (0.25 * (-v2 - v0 + -v3 - v1 + 4 * c)) / (v2 - v0 + v3 - v1), d2 - 0.25 - (0.25 * (v6 + v2 + v7 + v3 - 4 * c)) / (v2 - v6 + v3 - v7)]);
          break;
        case 13:
          a.push([d0 - 0.5 - (0.1 * (v1 + v0 - 2 * c)) / (v0 - v1), d1 - 0.5 - (0.1 * (-v3 - v1 + 2 * c)) / (v3 - v1), d2 - 0.3 - (0.3 * (v4 + v0 + v6 + v2 + v7 + v3 - 6 * c)) / (v0 - v4 + v2 - v6 + v3 - v7)]);
          break;
        case 14:
          a.push([d0 - 0.5 - (0.1 * (-v1 - v0 + 2 * c)) / (v1 - v0), d1 - 0.5 - (0.1 * (-v2 - v0 + 2 * c)) / (v2 - v0), d2 - 0.3 - (0.3 * (v5 + v1 + v6 + v2 + v7 + v3 - 6 * c)) / (v1 - v5 + v2 - v6 + v3 - v7)]);
          break;
        case 15:
          a.push([d0 - 0.5, d1 - 0.5, d2 - 0.5 - (0.5 * (v4 + v0 + v5 + v1 + v6 + v2 + v7 + v3 - 8 * c)) / (v0 - v4 + v1 - v5 + v2 - v6 + v3 - v7)]);
          break;
        case 16:
          a.push([
            d0 - F1_6 - (F1_6 * (v5 + v4 - 2 * c)) / (v4 - v5),
            d1 - F1_6 - (F1_6 * (v6 + v4 - 2 * c)) / (v4 - v6),
            d2 - F5_6 - (F1_6 * (-v4 - v0 + 2 * c)) / (v4 - v0),
          ]);
          break;
        case 17:
          a.push([d0 - 0.25 - (0.25 * (v1 + v0 + v5 + v4 - 4 * c)) / (v0 - v1 + v4 - v5), d1 - 0.25 - (0.25 * (v2 + v0 + v6 + v4 - 4 * c)) / (v0 - v2 + v4 - v6), d2 - 0.5]);
          break;
        case 18:
          a.push([
            d0 - 0.5 - (F1_6 * (-v1 - v0 + v5 + v4)) / (v1 - v0 + v4 - v5),
            d1 - F1_6 - (F1_6 * (v3 + v1 + v6 + v4 - 4 * c)) / (v1 - v3 + v4 - v6),
            d2 - 0.5 - (F1_6 * (-v4 - v0 + v5 + v1)) / (v4 - v0 + v1 - v5),
          ]);
          break;
        case 19:
          a.push([d0 - 0.5 - (0.1 * (v5 + v4 - 2 * c)) / (v4 - v5), d1 - 0.3 - (0.3 * (v2 + v0 + v3 + v1 + v6 + v4 - 6 * c)) / (v0 - v2 + v1 - v3 + v4 - v6), d2 - 0.5 - (0.1 * (v5 + v1 - 2 * c)) / (v1 - v5)]);
          break;
        case 20:
          a.push([
            d0 - F1_6 - (F1_6 * (v3 + v2 + v5 + v4 - 4 * c)) / (v2 - v3 + v4 - v5),
            d1 - 0.5 - (F1_6 * (-v2 - v0 + v6 + v4)) / (v2 - v0 + v4 - v6),
            d2 - 0.5 - (F1_6 * (-v4 - v0 + v6 + v2)) / (v4 - v0 + v2 - v6),
          ]);
          break;
        case 21:
          a.push([d0 - 0.3 - (0.3 * (v1 + v0 + v3 + v2 + v5 + v4 - 6 * c)) / (v0 - v1 + v2 - v3 + v4 - v5), d1 - 0.5 - (0.1 * (v6 + v4 - 2 * c)) / (v4 - v6), d2 - 0.5 - (0.1 * (v6 + v2 - 2 * c)) / (v2 - v6)]);
          break;
        case 22:
          a.push([
            d0 - F7_18 - (F1_6 * (-v1 - v0 + v3 + v2 + v5 + v4 - 2 * c)) / (v1 - v0 + v2 - v3 + v4 - v5),
            d1 - F7_18 - (F1_6 * (-v2 - v0 + v3 + v1 + v6 + v4 - 2 * c)) / (v2 - v0 + v1 - v3 + v4 - v6),
            d2 - F7_18 - (F1_6 * (-v4 - v0 + v5 + v1 + v6 + v2 - 2 * c)) / (v4 - v0 + v1 - v5 + v2 - v6),
          ]);
          break;
        case 23:
          a.push([
            d0 - 0.5 - (F1_6 * (v3 + v2 + v5 + v4 - 4 * c)) / (v2 - v3 + v4 - v5),
            d1 - 0.5 - (F1_6 * (v3 + v1 + v6 + v4 - 4 * c)) / (v1 - v3 + v4 - v6),
            d2 - 0.5 - (F1_6 * (v5 + v1 + v6 + v2 - 4 * c)) / (v1 - v5 + v2 - v6),
          ]);
          break;
        case 24:
          a.push([d0 - 0.5 - (F1_6 * (-v3 - v2 + v5 + v4)) / (v3 - v2 + v4 - v5), d1 - 0.5 - (F1_6 * (-v3 - v1 + v6 + v4)) / (v3 - v1 + v4 - v6), d2 - 0.5 - (F1_6 * (-v4 - v0 + v7 + v3)) / (v4 - v0 + v3 - v7)]);
          break;
        case 25:
          a.push([
            d0 - 0.5 - (F3_14 * (v1 + v0 + -v3 - v2 + v5 + v4 - 2 * c)) / (v0 - v1 + v3 - v2 + v4 - v5),
            d1 - 0.5 - (F3_14 * (v2 + v0 + -v3 - v1 + v6 + v4 - 2 * c)) / (v0 - v2 + v3 - v1 + v4 - v6),
            d2 - F5_14 - (F1_14 * (v7 + v3 - 2 * c)) / (v3 - v7),
          ]);
          break;
        case 26:
          a.push([
            d0 - 0.5 - (F3_14 * (-v1 - v0 + -v3 - v2 + v5 + v4 + 2 * c)) / (v1 - v0 + v3 - v2 + v4 - v5),
            d1 - F5_14 - (F1_14 * (v6 + v4 - 2 * c)) / (v4 - v6),
            d2 - 0.5 - (F3_14 * (-v4 - v0 + v5 + v1 + v7 + v3 - 2 * c)) / (v4 - v0 + v1 - v5 + v3 - v7),
          ]);
          break;
        case 27:
          a.push([
            d0 - 0.5 - (F1_6 * (-v3 - v2 + v5 + v4)) / (v3 - v2 + v4 - v5),
            d1 - 0.5 - (F1_6 * (v2 + v0 + v6 + v4 - 4 * c)) / (v0 - v2 + v4 - v6),
            d2 - 0.5 - (F1_6 * (v5 + v1 + v7 + v3 - 4 * c)) / (v1 - v5 + v3 - v7),
          ]);
          break;
        case 28:
          a.push([
            d0 - F5_14 - (F1_14 * (v5 + v4 - 2 * c)) / (v4 - v5),
            d1 - 0.5 - (F3_14 * (-v2 - v0 + -v3 - v1 + v6 + v4 + 2 * c)) / (v2 - v0 + v3 - v1 + v4 - v6),
            d2 - 0.5 - (F3_14 * (-v4 - v0 + v6 + v2 + v7 + v3 - 2 * c)) / (v4 - v0 + v2 - v6 + v3 - v7),
          ]);
          break;
        case 29:
          a.push([
            d0 - 0.5 - (F1_6 * (v1 + v0 + v5 + v4 - 4 * c)) / (v0 - v1 + v4 - v5),
            d1 - 0.5 - (F1_6 * (-v3 - v1 + v6 + v4)) / (v3 - v1 + v4 - v6),
            d2 - 0.5 - (F1_6 * (v6 + v2 + v7 + v3 - 4 * c)) / (v2 - v6 + v3 - v7),
          ]);
          break;
        case 30:
          a.push([
            d0 - 0.375 - (0.125 * (-v1 - v0 + v5 + v4)) / (v1 - v0 + v4 - v5),
            d1 - 0.375 - (0.125 * (-v2 - v0 + v6 + v4)) / (v2 - v0 + v4 - v6),
            d2 - 0.5 - (0.25 * (-v4 - v0 + v5 + v1 + v6 + v2 + v7 + v3 - 4 * c)) / (v4 - v0 + v1 - v5 + v2 - v6 + v3 - v7),
          ]);
          break;
        case 31:
          a.push([d0 - 0.5 - (0.1 * (v5 + v4 - 2 * c)) / (v4 - v5), d1 - 0.5 - (0.1 * (v6 + v4 - 2 * c)) / (v4 - v6), d2 - 0.7 - (0.3 * (v5 + v1 + v6 + v2 + v7 + v3 - 6 * c)) / (v1 - v5 + v2 - v6 + v3 - v7)]);
          break;
        case 32:
          a.push([
            d0 - F5_6 - (F1_6 * (-v5 - v4 + 2 * c)) / (v5 - v4),
            d1 - F1_6 - (F1_6 * (v7 + v5 - 2 * c)) / (v5 - v7),
            d2 - F5_6 - (F1_6 * (-v5 - v1 + 2 * c)) / (v5 - v1),
          ]);
          break;
        case 33:
          a.push([
            d0 - 0.5 - (F1_6 * (v1 + v0 + -v5 - v4)) / (v0 - v1 + v5 - v4),
            d1 - F1_6 - (F1_6 * (v2 + v0 + v7 + v5 - 4 * c)) / (v0 - v2 + v5 - v7),
            d2 - 0.5 - (F1_6 * (v4 + v0 + -v5 - v1)) / (v0 - v4 + v5 - v1),
          ]);
          break;
        case 34:
          a.push([d0 - 0.75 - (0.25 * (-v1 - v0 + -v5 - v4 + 4 * c)) / (v1 - v0 + v5 - v4), d1 - 0.25 - (0.25 * (v3 + v1 + v7 + v5 - 4 * c)) / (v1 - v3 + v5 - v7), d2 - 0.5]);
          break;
        case 35:
          a.push([d0 - 0.5 - (0.1 * (-v5 - v4 + 2 * c)) / (v5 - v4), d1 - 0.3 - (0.3 * (v2 + v0 + v3 + v1 + v7 + v5 - 6 * c)) / (v0 - v2 + v1 - v3 + v5 - v7), d2 - 0.5 - (0.1 * (v4 + v0 - 2 * c)) / (v0 - v4)]);
          break;
        case 36:
          a.push([d0 - 0.5 - (F1_6 * (v3 + v2 + -v5 - v4)) / (v2 - v3 + v5 - v4), d1 - 0.5 - (F1_6 * (-v2 - v0 + v7 + v5)) / (v2 - v0 + v5 - v7), d2 - 0.5 - (F1_6 * (-v5 - v1 + v6 + v2)) / (v5 - v1 + v2 - v6)]);
          break;
        case 37:
          a.push([
            d0 - 0.5 - (F3_14 * (v1 + v0 + v3 + v2 + -v5 - v4 - 2 * c)) / (v0 - v1 + v2 - v3 + v5 - v4),
            d1 - F5_14 - (F1_14 * (v7 + v5 - 2 * c)) / (v5 - v7),
            d2 - 0.5 - (F3_14 * (v4 + v0 + -v5 - v1 + v6 + v2 - 2 * c)) / (v0 - v4 + v5 - v1 + v2 - v6),
          ]);
          break;
        case 38:
          a.push([
            d0 - 0.5 - (F3_14 * (-v1 - v0 + v3 + v2 + -v5 - v4 + 2 * c)) / (v1 - v0 + v2 - v3 + v5 - v4),
            d1 - 0.5 - (F3_14 * (-v2 - v0 + v3 + v1 + v7 + v5 - 2 * c)) / (v2 - v0 + v1 - v3 + v5 - v7),
            d2 - F5_14 - (F1_14 * (v6 + v2 - 2 * c)) / (v2 - v6),
          ]);
          break;
        case 39:
          a.push([
            d0 - 0.5 - (F1_6 * (v3 + v2 + -v5 - v4)) / (v2 - v3 + v5 - v4),
            d1 - 0.5 - (F1_6 * (v3 + v1 + v7 + v5 - 4 * c)) / (v1 - v3 + v5 - v7),
            d2 - 0.5 - (F1_6 * (v4 + v0 + v6 + v2 - 4 * c)) / (v0 - v4 + v2 - v6),
          ]);
          break;
        case 40:
          a.push([
            d0 - F5_6 - (F1_6 * (-v3 - v2 + -v5 - v4 + 4 * c)) / (v3 - v2 + v5 - v4),
            d1 - 0.5 - (F1_6 * (-v3 - v1 + v7 + v5)) / (v3 - v1 + v5 - v7),
            d2 - 0.5 - (F1_6 * (-v5 - v1 + v7 + v3)) / (v5 - v1 + v3 - v7),
          ]);
          break;
        case 41:
          a.push([
            d0 - F11_18 - (F1_6 * (v1 + v0 + -v3 - v2 + -v5 - v4 + 2 * c)) / (v0 - v1 + v3 - v2 + v5 - v4),
            d1 - F7_18 - (F1_6 * (v2 + v0 + -v3 - v1 + v7 + v5 - 2 * c)) / (v0 - v2 + v3 - v1 + v5 - v7),
            d2 - F7_18 - (F1_6 * (v4 + v0 + -v5 - v1 + v7 + v3 - 2 * c)) / (v0 - v4 + v5 - v1 + v3 - v7),
          ]);
          break;
        case 42:
          a.push([d0 - 0.7 - (0.3 * (-v1 - v0 + -v3 - v2 + -v5 - v4 + 6 * c)) / (v1 - v0 + v3 - v2 + v5 - v4), d1 - 0.5 - (0.1 * (v7 + v5 - 2 * c)) / (v5 - v7), d2 - 0.5 - (0.1 * (v7 + v3 - 2 * c)) / (v3 - v7)]);
          break;
        case 43:
          a.push([
            d0 - 0.5 - (F1_6 * (-v3 - v2 + -v5 - v4 + 4 * c)) / (v3 - v2 + v5 - v4),
            d1 - 0.5 - (F1_6 * (v2 + v0 + v7 + v5 - 4 * c)) / (v0 - v2 + v5 - v7),
            d2 - 0.5 - (F1_6 * (v4 + v0 + v7 + v3 - 4 * c)) / (v0 - v4 + v3 - v7),
          ]);
          break;
        case 44:
          a.push([
            d0 - F9_14 - (F1_14 * (-v5 - v4 + 2 * c)) / (v5 - v4),
            d1 - 0.5 - (F3_14 * (-v2 - v0 + -v3 - v1 + v7 + v5 + 2 * c)) / (v2 - v0 + v3 - v1 + v5 - v7),
            d2 - 0.5 - (F3_14 * (-v5 - v1 + v6 + v2 + v7 + v3 - 2 * c)) / (v5 - v1 + v2 - v6 + v3 - v7),
          ]);
          break;
        case 45:
          a.push([
            d0 - 0.625 - (0.125 * (v1 + v0 + -v5 - v4)) / (v0 - v1 + v5 - v4),
            d1 - 0.375 - (0.125 * (-v3 - v1 + v7 + v5)) / (v3 - v1 + v5 - v7),
            d2 - 0.5 - (0.25 * (v4 + v0 + -v5 - v1 + v6 + v2 + v7 + v3 - 4 * c)) / (v0 - v4 + v5 - v1 + v2 - v6 + v3 - v7),
          ]);
          break;
        case 46:
          a.push([
            d0 - 0.5 - (F1_6 * (-v1 - v0 + -v5 - v4 + 4 * c)) / (v1 - v0 + v5 - v4),
            d1 - 0.5 - (F1_6 * (-v2 - v0 + v7 + v5)) / (v2 - v0 + v5 - v7),
            d2 - 0.5 - (F1_6 * (v6 + v2 + v7 + v3 - 4 * c)) / (v2 - v6 + v3 - v7),
          ]);
          break;
        case 47:
          a.push([d0 - 0.5 - (0.1 * (-v5 - v4 + 2 * c)) / (v5 - v4), d1 - 0.5 - (0.1 * (v7 + v5 - 2 * c)) / (v5 - v7), d2 - 0.7 - (0.3 * (v4 + v0 + v6 + v2 + v7 + v3 - 6 * c)) / (v0 - v4 + v2 - v6 + v3 - v7)]);
          break;
        case 48:
          a.push([d0 - 0.5, d1 - 0.25 - (0.25 * (v6 + v4 + v7 + v5 - 4 * c)) / (v4 - v6 + v5 - v7), d2 - 0.75 - (0.25 * (-v4 - v0 + -v5 - v1 + 4 * c)) / (v4 - v0 + v5 - v1)]);
          break;
        case 49:
          a.push([d0 - 0.5 - (0.1 * (v1 + v0 - 2 * c)) / (v0 - v1), d1 - 0.3 - (0.3 * (v2 + v0 + v6 + v4 + v7 + v5 - 6 * c)) / (v0 - v2 + v4 - v6 + v5 - v7), d2 - 0.5 - (0.1 * (-v5 - v1 + 2 * c)) / (v5 - v1)]);
          break;
        case 50:
          a.push([d0 - 0.5 - (0.1 * (-v1 - v0 + 2 * c)) / (v1 - v0), d1 - 0.3 - (0.3 * (v3 + v1 + v6 + v4 + v7 + v5 - 6 * c)) / (v1 - v3 + v4 - v6 + v5 - v7), d2 - 0.5 - (0.1 * (-v4 - v0 + 2 * c)) / (v4 - v0)]);
          break;
        case 51:
          a.push([d0 - 0.5, d1 - 0.5 - (0.5 * (v2 + v0 + v3 + v1 + v6 + v4 + v7 + v5 - 8 * c)) / (v0 - v2 + v1 - v3 + v4 - v6 + v5 - v7), d2 - 0.5]);
          break;
        case 52:
          a.push([
            d0 - F5_14 - (F1_14 * (v3 + v2 - 2 * c)) / (v2 - v3),
            d1 - 0.5 - (F3_14 * (-v2 - v0 + v6 + v4 + v7 + v5 - 2 * c)) / (v2 - v0 + v4 - v6 + v5 - v7),
            d2 - 0.5 - (F3_14 * (-v4 - v0 + -v5 - v1 + v6 + v2 + 2 * c)) / (v4 - v0 + v5 - v1 + v2 - v6),
          ]);
          break;
        case 53:
          a.push([
            d0 - 0.5 - (F1_6 * (v1 + v0 + v3 + v2 - 4 * c)) / (v0 - v1 + v2 - v3),
            d1 - 0.5 - (F1_6 * (v6 + v4 + v7 + v5 - 4 * c)) / (v4 - v6 + v5 - v7),
            d2 - 0.5 - (F1_6 * (-v5 - v1 + v6 + v2)) / (v5 - v1 + v2 - v6),
          ]);
          break;
        case 54:
          a.push([
            d0 - 0.375 - (0.125 * (-v1 - v0 + v3 + v2)) / (v1 - v0 + v2 - v3),
            d1 - 0.5 - (0.25 * (-v2 - v0 + v3 + v1 + v6 + v4 + v7 + v5 - 4 * c)) / (v2 - v0 + v1 - v3 + v4 - v6 + v5 - v7),
            d2 - 0.375 - (0.125 * (-v4 - v0 + v6 + v2)) / (v4 - v0 + v2 - v6),
          ]);
          break;
        case 55:
          a.push([d0 - 0.5 - (0.1 * (v3 + v2 - 2 * c)) / (v2 - v3), d1 - 0.7 - (0.3 * (v3 + v1 + v6 + v4 + v7 + v5 - 6 * c)) / (v1 - v3 + v4 - v6 + v5 - v7), d2 - 0.5 - (0.1 * (v6 + v2 - 2 * c)) / (v2 - v6)]);
          break;
        case 56:
          a.push([
            d0 - F9_14 - (F1_14 * (-v3 - v2 + 2 * c)) / (v3 - v2),
            d1 - 0.5 - (F3_14 * (-v3 - v1 + v6 + v4 + v7 + v5 - 2 * c)) / (v3 - v1 + v4 - v6 + v5 - v7),
            d2 - 0.5 - (F3_14 * (-v4 - v0 + -v5 - v1 + v7 + v3 + 2 * c)) / (v4 - v0 + v5 - v1 + v3 - v7),
          ]);
          break;
        case 57:
          a.push([
            d0 - 0.625 - (0.125 * (v1 + v0 + -v3 - v2)) / (v0 - v1 + v3 - v2),
            d1 - 0.5 - (0.25 * (v2 + v0 + -v3 - v1 + v6 + v4 + v7 + v5 - 4 * c)) / (v0 - v2 + v3 - v1 + v4 - v6 + v5 - v7),
            d2 - 0.375 - (0.125 * (-v5 - v1 + v7 + v3)) / (v5 - v1 + v3 - v7),
          ]);
          break;
        case 58:
          a.push([
            d0 - 0.5 - (F1_6 * (-v1 - v0 + -v3 - v2 + 4 * c)) / (v1 - v0 + v3 - v2),
            d1 - 0.5 - (F1_6 * (v6 + v4 + v7 + v5 - 4 * c)) / (v4 - v6 + v5 - v7),
            d2 - 0.5 - (F1_6 * (-v4 - v0 + v7 + v3)) / (v4 - v0 + v3 - v7),
          ]);
          break;
        case 59:
          a.push([d0 - 0.5 - (0.1 * (-v3 - v2 + 2 * c)) / (v3 - v2), d1 - 0.7 - (0.3 * (v2 + v0 + v6 + v4 + v7 + v5 - 6 * c)) / (v0 - v2 + v4 - v6 + v5 - v7), d2 - 0.5 - (0.1 * (v7 + v3 - 2 * c)) / (v3 - v7)]);
          break;
        case 60:
          a.push([d0 - 0.5, d1 - 0.5 - (0.25 * (-v2 - v0 + -v3 - v1 + v6 + v4 + v7 + v5)) / (v2 - v0 + v3 - v1 + v4 - v6 + v5 - v7), d2 - 0.5 - (0.25 * (-v4 - v0 + -v5 - v1 + v6 + v2 + v7 + v3)) / (v4 - v0 + v5 - v1 + v2 - v6 + v3 - v7)]);
          break;
        case 61:
          a.push([
            d0 - F9_14 - (F1_14 * (v1 + v0 - 2 * c)) / (v0 - v1),
            d1 - 0.5 - (F3_14 * (-v3 - v1 + v6 + v4 + v7 + v5 - 2 * c)) / (v3 - v1 + v4 - v6 + v5 - v7),
            d2 - 0.5 - (F3_14 * (-v5 - v1 + v6 + v2 + v7 + v3 - 2 * c)) / (v5 - v1 + v2 - v6 + v3 - v7),
          ]);
          break;
        case 62:
          a.push([
            d0 - F5_14 - (F1_14 * (-v1 - v0 + 2 * c)) / (v1 - v0),
            d1 - 0.5 - (F3_14 * (-v2 - v0 + v6 + v4 + v7 + v5 - 2 * c)) / (v2 - v0 + v4 - v6 + v5 - v7),
            d2 - 0.5 - (F3_14 * (-v4 - v0 + v6 + v2 + v7 + v3 - 2 * c)) / (v4 - v0 + v2 - v6 + v3 - v7),
          ]);
          break;
        case 63:
          a.push([d0 - 0.5, d1 - 0.75 - (0.25 * (v6 + v4 + v7 + v5 - 4 * c)) / (v4 - v6 + v5 - v7), d2 - 0.75 - (0.25 * (v6 + v2 + v7 + v3 - 4 * c)) / (v2 - v6 + v3 - v7)]);
          break;
        case 64:
          a.push([
            d0 - F1_6 - (F1_6 * (v7 + v6 - 2 * c)) / (v6 - v7),
            d1 - F5_6 - (F1_6 * (-v6 - v4 + 2 * c)) / (v6 - v4),
            d2 - F5_6 - (F1_6 * (-v6 - v2 + 2 * c)) / (v6 - v2),
          ]);
          break;
        case 65:
          a.push([
            d0 - F1_6 - (F1_6 * (v1 + v0 + v7 + v6 - 4 * c)) / (v0 - v1 + v6 - v7),
            d1 - 0.5 - (F1_6 * (v2 + v0 + -v6 - v4)) / (v0 - v2 + v6 - v4),
            d2 - 0.5 - (F1_6 * (v4 + v0 + -v6 - v2)) / (v0 - v4 + v6 - v2),
          ]);
          break;
        case 66:
          a.push([d0 - 0.5 - (F1_6 * (-v1 - v0 + v7 + v6)) / (v1 - v0 + v6 - v7), d1 - 0.5 - (F1_6 * (v3 + v1 + -v6 - v4)) / (v1 - v3 + v6 - v4), d2 - 0.5 - (F1_6 * (v5 + v1 + -v6 - v2)) / (v1 - v5 + v6 - v2)]);
          break;
        case 67:
          a.push([
            d0 - F5_14 - (F1_14 * (v7 + v6 - 2 * c)) / (v6 - v7),
            d1 - 0.5 - (F3_14 * (v2 + v0 + v3 + v1 + -v6 - v4 - 2 * c)) / (v0 - v2 + v1 - v3 + v6 - v4),
            d2 - 0.5 - (F3_14 * (v4 + v0 + v5 + v1 + -v6 - v2 - 2 * c)) / (v0 - v4 + v1 - v5 + v6 - v2),
          ]);
          break;
        case 68:
          a.push([d0 - 0.25 - (0.25 * (v3 + v2 + v7 + v6 - 4 * c)) / (v2 - v3 + v6 - v7), d1 - 0.75 - (0.25 * (-v2 - v0 + -v6 - v4 + 4 * c)) / (v2 - v0 + v6 - v4), d2 - 0.5]);
          break;
        case 69:
          a.push([d0 - 0.3 - (0.3 * (v1 + v0 + v3 + v2 + v7 + v6 - 6 * c)) / (v0 - v1 + v2 - v3 + v6 - v7), d1 - 0.5 - (0.1 * (-v6 - v4 + 2 * c)) / (v6 - v4), d2 - 0.5 - (0.1 * (v4 + v0 - 2 * c)) / (v0 - v4)]);
          break;
        case 70:
          a.push([
            d0 - 0.5 - (F3_14 * (-v1 - v0 + v3 + v2 + v7 + v6 - 2 * c)) / (v1 - v0 + v2 - v3 + v6 - v7),
            d1 - 0.5 - (F3_14 * (-v2 - v0 + v3 + v1 + -v6 - v4 + 2 * c)) / (v2 - v0 + v1 - v3 + v6 - v4),
            d2 - F5_14 - (F1_14 * (v5 + v1 - 2 * c)) / (v1 - v5),
          ]);
          break;
        case 71:
          a.push([
            d0 - 0.5 - (F1_6 * (v3 + v2 + v7 + v6 - 4 * c)) / (v2 - v3 + v6 - v7),
            d1 - 0.5 - (F1_6 * (v3 + v1 + -v6 - v4)) / (v1 - v3 + v6 - v4),
            d2 - 0.5 - (F1_6 * (v4 + v0 + v5 + v1 - 4 * c)) / (v0 - v4 + v1 - v5),
          ]);
          break;
        case 72:
          a.push([
            d0 - 0.5 - (F1_6 * (-v3 - v2 + v7 + v6)) / (v3 - v2 + v6 - v7),
            d1 - F5_6 - (F1_6 * (-v3 - v1 + -v6 - v4 + 4 * c)) / (v3 - v1 + v6 - v4),
            d2 - 0.5 - (F1_6 * (-v6 - v2 + v7 + v3)) / (v6 - v2 + v3 - v7),
          ]);
          break;
        case 73:
          a.push([
            d0 - F7_18 - (F1_6 * (v1 + v0 + -v3 - v2 + v7 + v6 - 2 * c)) / (v0 - v1 + v3 - v2 + v6 - v7),
            d1 - F11_18 - (F1_6 * (v2 + v0 + -v3 - v1 + -v6 - v4 + 2 * c)) / (v0 - v2 + v3 - v1 + v6 - v4),
            d2 - F7_18 - (F1_6 * (v4 + v0 + -v6 - v2 + v7 + v3 - 2 * c)) / (v0 - v4 + v6 - v2 + v3 - v7),
          ]);
          break;
        case 74:
          a.push([
            d0 - 0.5 - (F3_14 * (-v1 - v0 + -v3 - v2 + v7 + v6 + 2 * c)) / (v1 - v0 + v3 - v2 + v6 - v7),
            d1 - F9_14 - (F1_14 * (-v6 - v4 + 2 * c)) / (v6 - v4),
            d2 - 0.5 - (F3_14 * (v5 + v1 + -v6 - v2 + v7 + v3 - 2 * c)) / (v1 - v5 + v6 - v2 + v3 - v7),
          ]);
          break;
        case 75:
          a.push([
            d0 - 0.375 - (0.125 * (-v3 - v2 + v7 + v6)) / (v3 - v2 + v6 - v7),
            d1 - 0.625 - (0.125 * (v2 + v0 + -v6 - v4)) / (v0 - v2 + v6 - v4),
            d2 - 0.5 - (0.25 * (v4 + v0 + v5 + v1 + -v6 - v2 + v7 + v3 - 4 * c)) / (v0 - v4 + v1 - v5 + v6 - v2 + v3 - v7),
          ]);
          break;
        case 76:
          a.push([d0 - 0.5 - (0.1 * (v7 + v6 - 2 * c)) / (v6 - v7), d1 - 0.7 - (0.3 * (-v2 - v0 + -v3 - v1 + -v6 - v4 + 6 * c)) / (v2 - v0 + v3 - v1 + v6 - v4), d2 - 0.5 - (0.1 * (v7 + v3 - 2 * c)) / (v3 - v7)]);
          break;
        case 77:
          a.push([
            d0 - 0.5 - (F1_6 * (v1 + v0 + v7 + v6 - 4 * c)) / (v0 - v1 + v6 - v7),
            d1 - 0.5 - (F1_6 * (-v3 - v1 + -v6 - v4 + 4 * c)) / (v3 - v1 + v6 - v4),
            d2 - 0.5 - (F1_6 * (v4 + v0 + v7 + v3 - 4 * c)) / (v0 - v4 + v3 - v7),
          ]);
          break;
        case 78:
          a.push([
            d0 - 0.5 - (F1_6 * (-v1 - v0 + v7 + v6)) / (v1 - v0 + v6 - v7),
            d1 - 0.5 - (F1_6 * (-v2 - v0 + -v6 - v4 + 4 * c)) / (v2 - v0 + v6 - v4),
            d2 - 0.5 - (F1_6 * (v5 + v1 + v7 + v3 - 4 * c)) / (v1 - v5 + v3 - v7),
          ]);
          break;
        case 79:
          a.push([d0 - 0.5 - (0.1 * (v7 + v6 - 2 * c)) / (v6 - v7), d1 - 0.5 - (0.1 * (-v6 - v4 + 2 * c)) / (v6 - v4), d2 - 0.7 - (0.3 * (v4 + v0 + v5 + v1 + v7 + v3 - 6 * c)) / (v0 - v4 + v1 - v5 + v3 - v7)]);
          break;
        case 80:
          a.push([d0 - 0.25 - (0.25 * (v5 + v4 + v7 + v6 - 4 * c)) / (v4 - v5 + v6 - v7), d1 - 0.5, d2 - 0.75 - (0.25 * (-v4 - v0 + -v6 - v2 + 4 * c)) / (v4 - v0 + v6 - v2)]);
          break;
        case 81:
          a.push([d0 - 0.3 - (0.3 * (v1 + v0 + v5 + v4 + v7 + v6 - 6 * c)) / (v0 - v1 + v4 - v5 + v6 - v7), d1 - 0.5 - (0.1 * (v2 + v0 - 2 * c)) / (v0 - v2), d2 - 0.5 - (0.1 * (-v6 - v2 + 2 * c)) / (v6 - v2)]);
          break;
        case 82:
          a.push([
            d0 - 0.5 - (F3_14 * (-v1 - v0 + v5 + v4 + v7 + v6 - 2 * c)) / (v1 - v0 + v4 - v5 + v6 - v7),
            d1 - F5_14 - (F1_14 * (v3 + v1 - 2 * c)) / (v1 - v3),
            d2 - 0.5 - (F3_14 * (-v4 - v0 + v5 + v1 + -v6 - v2 + 2 * c)) / (v4 - v0 + v1 - v5 + v6 - v2),
          ]);
          break;
        case 83:
          a.push([
            d0 - 0.5 - (F1_6 * (v5 + v4 + v7 + v6 - 4 * c)) / (v4 - v5 + v6 - v7),
            d1 - 0.5 - (F1_6 * (v2 + v0 + v3 + v1 - 4 * c)) / (v0 - v2 + v1 - v3),
            d2 - 0.5 - (F1_6 * (v5 + v1 + -v6 - v2)) / (v1 - v5 + v6 - v2),
          ]);
          break;
        case 84:
          a.push([d0 - 0.3 - (0.3 * (v3 + v2 + v5 + v4 + v7 + v6 - 6 * c)) / (v2 - v3 + v4 - v5 + v6 - v7), d1 - 0.5 - (0.1 * (-v2 - v0 + 2 * c)) / (v2 - v0), d2 - 0.5 - (0.1 * (-v4 - v0 + 2 * c)) / (v4 - v0)]);
          break;
        case 85:
          a.push([d0 - 0.5 - (0.5 * (v1 + v0 + v3 + v2 + v5 + v4 + v7 + v6 - 8 * c)) / (v0 - v1 + v2 - v3 + v4 - v5 + v6 - v7), d1 - 0.5, d2 - 0.5]);
          break;
        case 86:
          a.push([
            d0 - 0.5 - (0.25 * (-v1 - v0 + v3 + v2 + v5 + v4 + v7 + v6 - 4 * c)) / (v1 - v0 + v2 - v3 + v4 - v5 + v6 - v7),
            d1 - 0.375 - (0.125 * (-v2 - v0 + v3 + v1)) / (v2 - v0 + v1 - v3),
            d2 - 0.375 - (0.125 * (-v4 - v0 + v5 + v1)) / (v4 - v0 + v1 - v5),
          ]);
          break;
        case 87:
          a.push([d0 - 0.7 - (0.3 * (v3 + v2 + v5 + v4 + v7 + v6 - 6 * c)) / (v2 - v3 + v4 - v5 + v6 - v7), d1 - 0.5 - (0.1 * (v3 + v1 - 2 * c)) / (v1 - v3), d2 - 0.5 - (0.1 * (v5 + v1 - 2 * c)) / (v1 - v5)]);
          break;
        case 88:
          a.push([
            d0 - 0.5 - (F3_14 * (-v3 - v2 + v5 + v4 + v7 + v6 - 2 * c)) / (v3 - v2 + v4 - v5 + v6 - v7),
            d1 - F9_14 - (F1_14 * (-v3 - v1 + 2 * c)) / (v3 - v1),
            d2 - 0.5 - (F3_14 * (-v4 - v0 + -v6 - v2 + v7 + v3 + 2 * c)) / (v4 - v0 + v6 - v2 + v3 - v7),
          ]);
          break;
        case 89:
          a.push([
            d0 - 0.5 - (0.25 * (v1 + v0 + -v3 - v2 + v5 + v4 + v7 + v6 - 4 * c)) / (v0 - v1 + v3 - v2 + v4 - v5 + v6 - v7),
            d1 - 0.625 - (0.125 * (v2 + v0 + -v3 - v1)) / (v0 - v2 + v3 - v1),
            d2 - 0.375 - (0.125 * (-v6 - v2 + v7 + v3)) / (v6 - v2 + v3 - v7),
          ]);
          break;
        case 90:
          a.push([d0 - 0.5 - (0.25 * (-v1 - v0 + -v3 - v2 + v5 + v4 + v7 + v6)) / (v1 - v0 + v3 - v2 + v4 - v5 + v6 - v7), d1 - 0.5, d2 - 0.5 - (0.25 * (-v4 - v0 + v5 + v1 + -v6 - v2 + v7 + v3)) / (v4 - v0 + v1 - v5 + v6 - v2 + v3 - v7)]);
          break;
        case 91:
          a.push([
            d0 - 0.5 - (F3_14 * (-v3 - v2 + v5 + v4 + v7 + v6 - 2 * c)) / (v3 - v2 + v4 - v5 + v6 - v7),
            d1 - F9_14 - (F1_14 * (v2 + v0 - 2 * c)) / (v0 - v2),
            d2 - 0.5 - (F3_14 * (v5 + v1 + -v6 - v2 + v7 + v3 - 2 * c)) / (v1 - v5 + v6 - v2 + v3 - v7),
          ]);
          break;
        case 92:
          a.push([
            d0 - 0.5 - (F1_6 * (v5 + v4 + v7 + v6 - 4 * c)) / (v4 - v5 + v6 - v7),
            d1 - 0.5 - (F1_6 * (-v2 - v0 + -v3 - v1 + 4 * c)) / (v2 - v0 + v3 - v1),
            d2 - 0.5 - (F1_6 * (-v4 - v0 + v7 + v3)) / (v4 - v0 + v3 - v7),
          ]);
          break;
        case 93:
          a.push([d0 - 0.7 - (0.3 * (v1 + v0 + v5 + v4 + v7 + v6 - 6 * c)) / (v0 - v1 + v4 - v5 + v6 - v7), d1 - 0.5 - (0.1 * (-v3 - v1 + 2 * c)) / (v3 - v1), d2 - 0.5 - (0.1 * (v7 + v3 - 2 * c)) / (v3 - v7)]);
          break;
        case 94:
          a.push([
            d0 - 0.5 - (F3_14 * (-v1 - v0 + v5 + v4 + v7 + v6 - 2 * c)) / (v1 - v0 + v4 - v5 + v6 - v7),
            d1 - F5_14 - (F1_14 * (-v2 - v0 + 2 * c)) / (v2 - v0),
            d2 - 0.5 - (F3_14 * (-v4 - v0 + v5 + v1 + v7 + v3 - 2 * c)) / (v4 - v0 + v1 - v5 + v3 - v7),
          ]);
          break;
        case 95:
          a.push([d0 - 0.75 - (0.25 * (v5 + v4 + v7 + v6 - 4 * c)) / (v4 - v5 + v6 - v7), d1 - 0.5, d2 - 0.75 - (0.25 * (v5 + v1 + v7 + v3 - 4 * c)) / (v1 - v5 + v3 - v7)]);
          break;
        case 96:
          a.push([
            d0 - 0.5 - (F1_6 * (-v5 - v4 + v7 + v6)) / (v5 - v4 + v6 - v7),
            d1 - 0.5 - (F1_6 * (-v6 - v4 + v7 + v5)) / (v6 - v4 + v5 - v7),
            d2 - F5_6 - (F1_6 * (-v5 - v1 + -v6 - v2 + 4 * c)) / (v5 - v1 + v6 - v2),
          ]);
          break;
        case 97:
          a.push([
            d0 - F7_18 - (F1_6 * (v1 + v0 + -v5 - v4 + v7 + v6 - 2 * c)) / (v0 - v1 + v5 - v4 + v6 - v7),
            d1 - F7_18 - (F1_6 * (v2 + v0 + -v6 - v4 + v7 + v5 - 2 * c)) / (v0 - v2 + v6 - v4 + v5 - v7),
            d2 - F11_18 - (F1_6 * (v4 + v0 + -v5 - v1 + -v6 - v2 + 2 * c)) / (v0 - v4 + v5 - v1 + v6 - v2),
          ]);
          break;
        case 98:
          a.push([
            d0 - 0.5 - (F3_14 * (-v1 - v0 + -v5 - v4 + v7 + v6 + 2 * c)) / (v1 - v0 + v5 - v4 + v6 - v7),
            d1 - 0.5 - (F3_14 * (v3 + v1 + -v6 - v4 + v7 + v5 - 2 * c)) / (v1 - v3 + v6 - v4 + v5 - v7),
            d2 - F9_14 - (F1_14 * (-v6 - v2 + 2 * c)) / (v6 - v2),
          ]);
          break;
        case 99:
          a.push([
            d0 - 0.375 - (0.125 * (-v5 - v4 + v7 + v6)) / (v5 - v4 + v6 - v7),
            d1 - 0.5 - (0.25 * (v2 + v0 + v3 + v1 + -v6 - v4 + v7 + v5 - 4 * c)) / (v0 - v2 + v1 - v3 + v6 - v4 + v5 - v7),
            d2 - 0.625 - (0.125 * (v4 + v0 + -v6 - v2)) / (v0 - v4 + v6 - v2),
          ]);
          break;
        case 100:
          a.push([
            d0 - 0.5 - (F3_14 * (v3 + v2 + -v5 - v4 + v7 + v6 - 2 * c)) / (v2 - v3 + v5 - v4 + v6 - v7),
            d1 - 0.5 - (F3_14 * (-v2 - v0 + -v6 - v4 + v7 + v5 + 2 * c)) / (v2 - v0 + v6 - v4 + v5 - v7),
            d2 - F9_14 - (F1_14 * (-v5 - v1 + 2 * c)) / (v5 - v1),
          ]);
          break;
        case 101:
          a.push([
            d0 - 0.5 - (0.25 * (v1 + v0 + v3 + v2 + -v5 - v4 + v7 + v6 - 4 * c)) / (v0 - v1 + v2 - v3 + v5 - v4 + v6 - v7),
            d1 - 0.375 - (0.125 * (-v6 - v4 + v7 + v5)) / (v6 - v4 + v5 - v7),
            d2 - 0.625 - (0.125 * (v4 + v0 + -v5 - v1)) / (v0 - v4 + v5 - v1),
          ]);
          break;
        case 102:
          a.push([d0 - 0.5 - (0.25 * (-v1 - v0 + v3 + v2 + -v5 - v4 + v7 + v6)) / (v1 - v0 + v2 - v3 + v5 - v4 + v6 - v7), d1 - 0.5 - (0.25 * (-v2 - v0 + v3 + v1 + -v6 - v4 + v7 + v5)) / (v2 - v0 + v1 - v3 + v6 - v4 + v5 - v7), d2 - 0.5]);
          break;
        case 103:
          a.push([
            d0 - 0.5 - (F3_14 * (v3 + v2 + -v5 - v4 + v7 + v6 - 2 * c)) / (v2 - v3 + v5 - v4 + v6 - v7),
            d1 - 0.5 - (F3_14 * (v3 + v1 + -v6 - v4 + v7 + v5 - 2 * c)) / (v1 - v3 + v6 - v4 + v5 - v7),
            d2 - F9_14 - (F1_14 * (v4 + v0 - 2 * c)) / (v0 - v4),
          ]);
          break;
        case 104:
          a.push([
            d0 - F11_18 - (F1_6 * (-v3 - v2 + -v5 - v4 + v7 + v6 + 2 * c)) / (v3 - v2 + v5 - v4 + v6 - v7),
            d1 - F11_18 - (F1_6 * (-v3 - v1 + -v6 - v4 + v7 + v5 + 2 * c)) / (v3 - v1 + v6 - v4 + v5 - v7),
            d2 - F11_18 - (F1_6 * (-v5 - v1 + -v6 - v2 + v7 + v3 + 2 * c)) / (v5 - v1 + v6 - v2 + v3 - v7),
          ]);
          break;
        case 105:
          a.push([
            d0 - 0.5 - (F1_6 * (v1 + v0 + -v3 - v2 + -v5 - v4 + v7 + v6)) / (v0 - v1 + v3 - v2 + v5 - v4 + v6 - v7),
            d1 - 0.5 - (F1_6 * (v2 + v0 + -v3 - v1 + -v6 - v4 + v7 + v5)) / (v0 - v2 + v3 - v1 + v6 - v4 + v5 - v7),
            d2 - 0.5 - (F1_6 * (v4 + v0 + -v5 - v1 + -v6 - v2 + v7 + v3)) / (v0 - v4 + v5 - v1 + v6 - v2 + v3 - v7),
          ]);
          break;
        case 106:
          a.push([
            d0 - 0.5 - (0.25 * (-v1 - v0 + -v3 - v2 + -v5 - v4 + v7 + v6 + 4 * c)) / (v1 - v0 + v3 - v2 + v5 - v4 + v6 - v7),
            d1 - 0.625 - (0.125 * (-v6 - v4 + v7 + v5)) / (v6 - v4 + v5 - v7),
            d2 - 0.625 - (0.125 * (-v6 - v2 + v7 + v3)) / (v6 - v2 + v3 - v7),
          ]);
          break;
        case 107:
          a.push([
            d0 - F7_18 - (F1_6 * (-v3 - v2 + -v5 - v4 + v7 + v6 + 2 * c)) / (v3 - v2 + v5 - v4 + v6 - v7),
            d1 - F11_18 - (F1_6 * (v2 + v0 + -v6 - v4 + v7 + v5 - 2 * c)) / (v0 - v2 + v6 - v4 + v5 - v7),
            d2 - F11_18 - (F1_6 * (v4 + v0 + -v6 - v2 + v7 + v3 - 2 * c)) / (v0 - v4 + v6 - v2 + v3 - v7),
          ]);
          break;
        case 108:
          a.push([
            d0 - 0.625 - (0.125 * (-v5 - v4 + v7 + v6)) / (v5 - v4 + v6 - v7),
            d1 - 0.5 - (0.25 * (-v2 - v0 + -v3 - v1 + -v6 - v4 + v7 + v5 + 4 * c)) / (v2 - v0 + v3 - v1 + v6 - v4 + v5 - v7),
            d2 - 0.625 - (0.125 * (-v5 - v1 + v7 + v3)) / (v5 - v1 + v3 - v7),
          ]);
          break;
        case 109:
          a.push([
            d0 - F11_18 - (F1_6 * (v1 + v0 + -v5 - v4 + v7 + v6 - 2 * c)) / (v0 - v1 + v5 - v4 + v6 - v7),
            d1 - F7_18 - (F1_6 * (-v3 - v1 + -v6 - v4 + v7 + v5 + 2 * c)) / (v3 - v1 + v6 - v4 + v5 - v7),
            d2 - F11_18 - (F1_6 * (v4 + v0 + -v5 - v1 + v7 + v3 - 2 * c)) / (v0 - v4 + v5 - v1 + v3 - v7),
          ]);
          break;
        case 110:
          a.push([
            d0 - 0.5 - (F3_14 * (-v1 - v0 + -v5 - v4 + v7 + v6 + 2 * c)) / (v1 - v0 + v5 - v4 + v6 - v7),
            d1 - 0.5 - (F3_14 * (-v2 - v0 + -v6 - v4 + v7 + v5 + 2 * c)) / (v2 - v0 + v6 - v4 + v5 - v7),
            d2 - F9_14 - (F1_14 * (v7 + v3 - 2 * c)) / (v3 - v7),
          ]);
          break;
        case 111:
          a.push([
            d0 - 0.5 - (F1_6 * (-v5 - v4 + v7 + v6)) / (v5 - v4 + v6 - v7),
            d1 - 0.5 - (F1_6 * (-v6 - v4 + v7 + v5)) / (v6 - v4 + v5 - v7),
            d2 - F5_6 - (F1_6 * (v4 + v0 + v7 + v3 - 4 * c)) / (v0 - v4 + v3 - v7),
          ]);
          break;
        case 112:
          a.push([d0 - 0.5 - (0.1 * (v7 + v6 - 2 * c)) / (v6 - v7), d1 - 0.5 - (0.1 * (v7 + v5 - 2 * c)) / (v5 - v7), d2 - 0.7 - (0.3 * (-v4 - v0 + -v5 - v1 + -v6 - v2 + 6 * c)) / (v4 - v0 + v5 - v1 + v6 - v2)]);
          break;
        case 113:
          a.push([
            d0 - 0.5 - (F1_6 * (v1 + v0 + v7 + v6 - 4 * c)) / (v0 - v1 + v6 - v7),
            d1 - 0.5 - (F1_6 * (v2 + v0 + v7 + v5 - 4 * c)) / (v0 - v2 + v5 - v7),
            d2 - 0.5 - (F1_6 * (-v5 - v1 + -v6 - v2 + 4 * c)) / (v5 - v1 + v6 - v2),
          ]);
          break;
        case 114:
          a.push([
            d0 - 0.5 - (F1_6 * (-v1 - v0 + v7 + v6)) / (v1 - v0 + v6 - v7),
            d1 - 0.5 - (F1_6 * (v3 + v1 + v7 + v5 - 4 * c)) / (v1 - v3 + v5 - v7),
            d2 - 0.5 - (F1_6 * (-v4 - v0 + -v6 - v2 + 4 * c)) / (v4 - v0 + v6 - v2),
          ]);
          break;
        case 115:
          a.push([d0 - 0.5 - (0.1 * (v7 + v6 - 2 * c)) / (v6 - v7), d1 - 0.7 - (0.3 * (v2 + v0 + v3 + v1 + v7 + v5 - 6 * c)) / (v0 - v2 + v1 - v3 + v5 - v7), d2 - 0.5 - (0.1 * (-v6 - v2 + 2 * c)) / (v6 - v2)]);
          break;
        case 116:
          a.push([
            d0 - 0.5 - (F1_6 * (v3 + v2 + v7 + v6 - 4 * c)) / (v2 - v3 + v6 - v7),
            d1 - 0.5 - (F1_6 * (-v2 - v0 + v7 + v5)) / (v2 - v0 + v5 - v7),
            d2 - 0.5 - (F1_6 * (-v4 - v0 + -v5 - v1 + 4 * c)) / (v4 - v0 + v5 - v1),
          ]);
          break;
        case 117:
          a.push([d0 - 0.7 - (0.3 * (v1 + v0 + v3 + v2 + v7 + v6 - 6 * c)) / (v0 - v1 + v2 - v3 + v6 - v7), d1 - 0.5 - (0.1 * (v7 + v5 - 2 * c)) / (v5 - v7), d2 - 0.5 - (0.1 * (-v5 - v1 + 2 * c)) / (v5 - v1)]);
          break;
        case 118:
          a.push([
            d0 - 0.5 - (F3_14 * (-v1 - v0 + v3 + v2 + v7 + v6 - 2 * c)) / (v1 - v0 + v2 - v3 + v6 - v7),
            d1 - 0.5 - (F3_14 * (-v2 - v0 + v3 + v1 + v7 + v5 - 2 * c)) / (v2 - v0 + v1 - v3 + v5 - v7),
            d2 - F5_14 - (F1_14 * (-v4 - v0 + 2 * c)) / (v4 - v0),
          ]);
          break;
        case 119:
          a.push([d0 - 0.75 - (0.25 * (v3 + v2 + v7 + v6 - 4 * c)) / (v2 - v3 + v6 - v7), d1 - 0.75 - (0.25 * (v3 + v1 + v7 + v5 - 4 * c)) / (v1 - v3 + v5 - v7), d2 - 0.5]);
          break;
        case 120:
          a.push([
            d0 - 0.625 - (0.125 * (-v3 - v2 + v7 + v6)) / (v3 - v2 + v6 - v7),
            d1 - 0.625 - (0.125 * (-v3 - v1 + v7 + v5)) / (v3 - v1 + v5 - v7),
            d2 - 0.5 - (0.25 * (-v4 - v0 + -v5 - v1 + -v6 - v2 + v7 + v3 + 4 * c)) / (v4 - v0 + v5 - v1 + v6 - v2 + v3 - v7),
          ]);
          break;
        case 121:
          a.push([
            d0 - F11_18 - (F1_6 * (v1 + v0 + -v3 - v2 + v7 + v6 - 2 * c)) / (v0 - v1 + v3 - v2 + v6 - v7),
            d1 - F11_18 - (F1_6 * (v2 + v0 + -v3 - v1 + v7 + v5 - 2 * c)) / (v0 - v2 + v3 - v1 + v5 - v7),
            d2 - F7_18 - (F1_6 * (-v5 - v1 + -v6 - v2 + v7 + v3 + 2 * c)) / (v5 - v1 + v6 - v2 + v3 - v7),
          ]);
          break;
        case 122:
          a.push([
            d0 - 0.5 - (F3_14 * (-v1 - v0 + -v3 - v2 + v7 + v6 + 2 * c)) / (v1 - v0 + v3 - v2 + v6 - v7),
            d1 - F9_14 - (F1_14 * (v7 + v5 - 2 * c)) / (v5 - v7),
            d2 - 0.5 - (F3_14 * (-v4 - v0 + -v6 - v2 + v7 + v3 + 2 * c)) / (v4 - v0 + v6 - v2 + v3 - v7),
          ]);
          break;
        case 123:
          a.push([
            d0 - 0.5 - (F1_6 * (-v3 - v2 + v7 + v6)) / (v3 - v2 + v6 - v7),
            d1 - F5_6 - (F1_6 * (v2 + v0 + v7 + v5 - 4 * c)) / (v0 - v2 + v5 - v7),
            d2 - 0.5 - (F1_6 * (-v6 - v2 + v7 + v3)) / (v6 - v2 + v3 - v7),
          ]);
          break;
        case 124:
          a.push([
            d0 - F9_14 - (F1_14 * (v7 + v6 - 2 * c)) / (v6 - v7),
            d1 - 0.5 - (F3_14 * (-v2 - v0 + -v3 - v1 + v7 + v5 + 2 * c)) / (v2 - v0 + v3 - v1 + v5 - v7),
            d2 - 0.5 - (F3_14 * (-v4 - v0 + -v5 - v1 + v7 + v3 + 2 * c)) / (v4 - v0 + v5 - v1 + v3 - v7),
          ]);
          break;
        case 125:
          a.push([
            d0 - F5_6 - (F1_6 * (v1 + v0 + v7 + v6 - 4 * c)) / (v0 - v1 + v6 - v7),
            d1 - 0.5 - (F1_6 * (-v3 - v1 + v7 + v5)) / (v3 - v1 + v5 - v7),
            d2 - 0.5 - (F1_6 * (-v5 - v1 + v7 + v3)) / (v5 - v1 + v3 - v7),
          ]);
          break;
        case 126:
          a.push([d0 - 0.5 - (F1_6 * (-v1 - v0 + v7 + v6)) / (v1 - v0 + v6 - v7), d1 - 0.5 - (F1_6 * (-v2 - v0 + v7 + v5)) / (v2 - v0 + v5 - v7), d2 - 0.5 - (F1_6 * (-v4 - v0 + v7 + v3)) / (v4 - v0 + v3 - v7)]);
          break;
        case 127:
          a.push([
            d0 - F5_6 - (F1_6 * (v7 + v6 - 2 * c)) / (v6 - v7),
            d1 - F5_6 - (F1_6 * (v7 + v5 - 2 * c)) / (v5 - v7),
            d2 - F5_6 - (F1_6 * (v7 + v3 - 2 * c)) / (v3 - v7),
          ]);
          break;
      }
    }
    function vExtra1(m, d0, d1, d2, v0, v1, v2, v3, v4, v5, v6, v7, p0, p1, p2, p3, p4, p5, p6, p7, a, c) {
      switch (m) {
        case 0:
          a.push([
            d0 - F5_6 - (F1_6 * (-v7 - v6 + 2 * c)) / (v7 - v6),
            d1 - F5_6 - (F1_6 * (-v7 - v5 + 2 * c)) / (v7 - v5),
            d2 - F5_6 - (F1_6 * (-v7 - v3 + 2 * c)) / (v7 - v3),
          ]);
          break;
        case 1:
          a.push([d0 - 0.5 - (F1_6 * (v1 + v0 + -v7 - v6)) / (v0 - v1 + v7 - v6), d1 - 0.5 - (F1_6 * (v2 + v0 + -v7 - v5)) / (v0 - v2 + v7 - v5), d2 - 0.5 - (F1_6 * (v4 + v0 + -v7 - v3)) / (v0 - v4 + v7 - v3)]);
          break;
        case 2:
          a.push([
            d0 - F5_6 - (F1_6 * (-v1 - v0 + -v7 - v6 + 4 * c)) / (v1 - v0 + v7 - v6),
            d1 - 0.5 - (F1_6 * (v3 + v1 + -v7 - v5)) / (v1 - v3 + v7 - v5),
            d2 - 0.5 - (F1_6 * (v5 + v1 + -v7 - v3)) / (v1 - v5 + v7 - v3),
          ]);
          break;
        case 3:
          a.push([
            d0 - F9_14 - (F1_14 * (-v7 - v6 + 2 * c)) / (v7 - v6),
            d1 - 0.5 - (F3_14 * (v2 + v0 + v3 + v1 + -v7 - v5 - 2 * c)) / (v0 - v2 + v1 - v3 + v7 - v5),
            d2 - 0.5 - (F3_14 * (v4 + v0 + v5 + v1 + -v7 - v3 - 2 * c)) / (v0 - v4 + v1 - v5 + v7 - v3),
          ]);
          break;
        case 4:
          a.push([
            d0 - 0.5 - (F1_6 * (v3 + v2 + -v7 - v6)) / (v2 - v3 + v7 - v6),
            d1 - F5_6 - (F1_6 * (-v2 - v0 + -v7 - v5 + 4 * c)) / (v2 - v0 + v7 - v5),
            d2 - 0.5 - (F1_6 * (v6 + v2 + -v7 - v3)) / (v2 - v6 + v7 - v3),
          ]);
          break;
        case 5:
          a.push([
            d0 - 0.5 - (F3_14 * (v1 + v0 + v3 + v2 + -v7 - v6 - 2 * c)) / (v0 - v1 + v2 - v3 + v7 - v6),
            d1 - F9_14 - (F1_14 * (-v7 - v5 + 2 * c)) / (v7 - v5),
            d2 - 0.5 - (F3_14 * (v4 + v0 + v6 + v2 + -v7 - v3 - 2 * c)) / (v0 - v4 + v2 - v6 + v7 - v3),
          ]);
          break;
        case 6:
          a.push([
            d0 - F11_18 - (F1_6 * (-v1 - v0 + v3 + v2 + -v7 - v6 + 2 * c)) / (v1 - v0 + v2 - v3 + v7 - v6),
            d1 - F11_18 - (F1_6 * (-v2 - v0 + v3 + v1 + -v7 - v5 + 2 * c)) / (v2 - v0 + v1 - v3 + v7 - v5),
            d2 - F7_18 - (F1_6 * (v5 + v1 + v6 + v2 + -v7 - v3 - 2 * c)) / (v1 - v5 + v2 - v6 + v7 - v3),
          ]);
          break;
        case 7:
          a.push([
            d0 - 0.625 - (0.125 * (v3 + v2 + -v7 - v6)) / (v2 - v3 + v7 - v6),
            d1 - 0.625 - (0.125 * (v3 + v1 + -v7 - v5)) / (v1 - v3 + v7 - v5),
            d2 - 0.5 - (0.25 * (v4 + v0 + v5 + v1 + v6 + v2 + -v7 - v3 - 4 * c)) / (v0 - v4 + v1 - v5 + v2 - v6 + v7 - v3),
          ]);
          break;
        case 8:
          a.push([d0 - 0.75 - (0.25 * (-v3 - v2 + -v7 - v6 + 4 * c)) / (v3 - v2 + v7 - v6), d1 - 0.75 - (0.25 * (-v3 - v1 + -v7 - v5 + 4 * c)) / (v3 - v1 + v7 - v5), d2 - 0.5]);
          break;
        case 9:
          a.push([
            d0 - 0.5 - (F3_14 * (v1 + v0 + -v3 - v2 + -v7 - v6 + 2 * c)) / (v0 - v1 + v3 - v2 + v7 - v6),
            d1 - 0.5 - (F3_14 * (v2 + v0 + -v3 - v1 + -v7 - v5 + 2 * c)) / (v0 - v2 + v3 - v1 + v7 - v5),
            d2 - F5_14 - (F1_14 * (v4 + v0 - 2 * c)) / (v0 - v4),
          ]);
          break;
        case 10:
          a.push([d0 - 0.7 - (0.3 * (-v1 - v0 + -v3 - v2 + -v7 - v6 + 6 * c)) / (v1 - v0 + v3 - v2 + v7 - v6), d1 - 0.5 - (0.1 * (-v7 - v5 + 2 * c)) / (v7 - v5), d2 - 0.5 - (0.1 * (v5 + v1 - 2 * c)) / (v1 - v5)]);
          break;
        case 11:
          a.push([
            d0 - 0.5 - (F1_6 * (-v3 - v2 + -v7 - v6 + 4 * c)) / (v3 - v2 + v7 - v6),
            d1 - 0.5 - (F1_6 * (v2 + v0 + -v7 - v5)) / (v0 - v2 + v7 - v5),
            d2 - 0.5 - (F1_6 * (v4 + v0 + v5 + v1 - 4 * c)) / (v0 - v4 + v1 - v5),
          ]);
          break;
        case 12:
          a.push([d0 - 0.5 - (0.1 * (-v7 - v6 + 2 * c)) / (v7 - v6), d1 - 0.7 - (0.3 * (-v2 - v0 + -v3 - v1 + -v7 - v5 + 6 * c)) / (v2 - v0 + v3 - v1 + v7 - v5), d2 - 0.5 - (0.1 * (v6 + v2 - 2 * c)) / (v2 - v6)]);
          break;
        case 13:
          a.push([
            d0 - 0.5 - (F1_6 * (v1 + v0 + -v7 - v6)) / (v0 - v1 + v7 - v6),
            d1 - 0.5 - (F1_6 * (-v3 - v1 + -v7 - v5 + 4 * c)) / (v3 - v1 + v7 - v5),
            d2 - 0.5 - (F1_6 * (v4 + v0 + v6 + v2 - 4 * c)) / (v0 - v4 + v2 - v6),
          ]);
          break;
        case 14:
          a.push([
            d0 - 0.5 - (F1_6 * (-v1 - v0 + -v7 - v6 + 4 * c)) / (v1 - v0 + v7 - v6),
            d1 - 0.5 - (F1_6 * (-v2 - v0 + -v7 - v5 + 4 * c)) / (v2 - v0 + v7 - v5),
            d2 - 0.5 - (F1_6 * (v5 + v1 + v6 + v2 - 4 * c)) / (v1 - v5 + v2 - v6),
          ]);
          break;
        case 15:
          a.push([d0 - 0.5 - (0.1 * (-v7 - v6 + 2 * c)) / (v7 - v6), d1 - 0.5 - (0.1 * (-v7 - v5 + 2 * c)) / (v7 - v5), d2 - 0.7 - (0.3 * (v4 + v0 + v5 + v1 + v6 + v2 - 6 * c)) / (v0 - v4 + v1 - v5 + v2 - v6)]);
          break;
        case 16:
          a.push([
            d0 - 0.5 - (F1_6 * (v5 + v4 + -v7 - v6)) / (v4 - v5 + v7 - v6),
            d1 - 0.5 - (F1_6 * (v6 + v4 + -v7 - v5)) / (v4 - v6 + v7 - v5),
            d2 - F5_6 - (F1_6 * (-v4 - v0 + -v7 - v3 + 4 * c)) / (v4 - v0 + v7 - v3),
          ]);
          break;
        case 17:
          a.push([
            d0 - 0.5 - (F3_14 * (v1 + v0 + v5 + v4 + -v7 - v6 - 2 * c)) / (v0 - v1 + v4 - v5 + v7 - v6),
            d1 - 0.5 - (F3_14 * (v2 + v0 + v6 + v4 + -v7 - v5 - 2 * c)) / (v0 - v2 + v4 - v6 + v7 - v5),
            d2 - F9_14 - (F1_14 * (-v7 - v3 + 2 * c)) / (v7 - v3),
          ]);
          break;
        case 18:
          a.push([
            d0 - F11_18 - (F1_6 * (-v1 - v0 + v5 + v4 + -v7 - v6 + 2 * c)) / (v1 - v0 + v4 - v5 + v7 - v6),
            d1 - F7_18 - (F1_6 * (v3 + v1 + v6 + v4 + -v7 - v5 - 2 * c)) / (v1 - v3 + v4 - v6 + v7 - v5),
            d2 - F11_18 - (F1_6 * (-v4 - v0 + v5 + v1 + -v7 - v3 + 2 * c)) / (v4 - v0 + v1 - v5 + v7 - v3),
          ]);
          break;
        case 19:
          a.push([
            d0 - 0.625 - (0.125 * (v5 + v4 + -v7 - v6)) / (v4 - v5 + v7 - v6),
            d1 - 0.5 - (0.25 * (v2 + v0 + v3 + v1 + v6 + v4 + -v7 - v5 - 4 * c)) / (v0 - v2 + v1 - v3 + v4 - v6 + v7 - v5),
            d2 - 0.625 - (0.125 * (v5 + v1 + -v7 - v3)) / (v1 - v5 + v7 - v3),
          ]);
          break;
        case 20:
          a.push([
            d0 - F7_18 - (F1_6 * (v3 + v2 + v5 + v4 + -v7 - v6 - 2 * c)) / (v2 - v3 + v4 - v5 + v7 - v6),
            d1 - F11_18 - (F1_6 * (-v2 - v0 + v6 + v4 + -v7 - v5 + 2 * c)) / (v2 - v0 + v4 - v6 + v7 - v5),
            d2 - F11_18 - (F1_6 * (-v4 - v0 + v6 + v2 + -v7 - v3 + 2 * c)) / (v4 - v0 + v2 - v6 + v7 - v3),
          ]);
          break;
        case 21:
          a.push([
            d0 - 0.5 - (0.25 * (v1 + v0 + v3 + v2 + v5 + v4 + -v7 - v6 - 4 * c)) / (v0 - v1 + v2 - v3 + v4 - v5 + v7 - v6),
            d1 - 0.625 - (0.125 * (v6 + v4 + -v7 - v5)) / (v4 - v6 + v7 - v5),
            d2 - 0.625 - (0.125 * (v6 + v2 + -v7 - v3)) / (v2 - v6 + v7 - v3),
          ]);
          break;
        case 22:
          a.push([
            d0 - 0.5 - (F1_6 * (-v1 - v0 + v3 + v2 + v5 + v4 + -v7 - v6)) / (v1 - v0 + v2 - v3 + v4 - v5 + v7 - v6),
            d1 - 0.5 - (F1_6 * (-v2 - v0 + v3 + v1 + v6 + v4 + -v7 - v5)) / (v2 - v0 + v1 - v3 + v4 - v6 + v7 - v5),
            d2 - 0.5 - (F1_6 * (-v4 - v0 + v5 + v1 + v6 + v2 + -v7 - v3)) / (v4 - v0 + v1 - v5 + v2 - v6 + v7 - v3),
          ]);
          break;
        case 23:
          a.push([
            d0 - F11_18 - (F1_6 * (v3 + v2 + v5 + v4 + -v7 - v6 - 2 * c)) / (v2 - v3 + v4 - v5 + v7 - v6),
            d1 - F11_18 - (F1_6 * (v3 + v1 + v6 + v4 + -v7 - v5 - 2 * c)) / (v1 - v3 + v4 - v6 + v7 - v5),
            d2 - F11_18 - (F1_6 * (v5 + v1 + v6 + v2 + -v7 - v3 - 2 * c)) / (v1 - v5 + v2 - v6 + v7 - v3),
          ]);
          break;
        case 24:
          a.push([
            d0 - 0.5 - (F3_14 * (-v3 - v2 + v5 + v4 + -v7 - v6 + 2 * c)) / (v3 - v2 + v4 - v5 + v7 - v6),
            d1 - 0.5 - (F3_14 * (-v3 - v1 + v6 + v4 + -v7 - v5 + 2 * c)) / (v3 - v1 + v4 - v6 + v7 - v5),
            d2 - F9_14 - (F1_14 * (-v4 - v0 + 2 * c)) / (v4 - v0),
          ]);
          break;
        case 25:
          a.push([d0 - 0.5 - (0.25 * (v1 + v0 + -v3 - v2 + v5 + v4 + -v7 - v6)) / (v0 - v1 + v3 - v2 + v4 - v5 + v7 - v6), d1 - 0.5 - (0.25 * (v2 + v0 + -v3 - v1 + v6 + v4 + -v7 - v5)) / (v0 - v2 + v3 - v1 + v4 - v6 + v7 - v5), d2 - 0.5]);
          break;
        case 26:
          a.push([
            d0 - 0.5 - (0.25 * (-v1 - v0 + -v3 - v2 + v5 + v4 + -v7 - v6 + 4 * c)) / (v1 - v0 + v3 - v2 + v4 - v5 + v7 - v6),
            d1 - 0.375 - (0.125 * (v6 + v4 + -v7 - v5)) / (v4 - v6 + v7 - v5),
            d2 - 0.625 - (0.125 * (-v4 - v0 + v5 + v1)) / (v4 - v0 + v1 - v5),
          ]);
          break;
        case 27:
          a.push([
            d0 - 0.5 - (F3_14 * (-v3 - v2 + v5 + v4 + -v7 - v6 + 2 * c)) / (v3 - v2 + v4 - v5 + v7 - v6),
            d1 - 0.5 - (F3_14 * (v2 + v0 + v6 + v4 + -v7 - v5 - 2 * c)) / (v0 - v2 + v4 - v6 + v7 - v5),
            d2 - F9_14 - (F1_14 * (v5 + v1 - 2 * c)) / (v1 - v5),
          ]);
          break;
        case 28:
          a.push([
            d0 - 0.375 - (0.125 * (v5 + v4 + -v7 - v6)) / (v4 - v5 + v7 - v6),
            d1 - 0.5 - (0.25 * (-v2 - v0 + -v3 - v1 + v6 + v4 + -v7 - v5 + 4 * c)) / (v2 - v0 + v3 - v1 + v4 - v6 + v7 - v5),
            d2 - 0.625 - (0.125 * (-v4 - v0 + v6 + v2)) / (v4 - v0 + v2 - v6),
          ]);
          break;
        case 29:
          a.push([
            d0 - 0.5 - (F3_14 * (v1 + v0 + v5 + v4 + -v7 - v6 - 2 * c)) / (v0 - v1 + v4 - v5 + v7 - v6),
            d1 - 0.5 - (F3_14 * (-v3 - v1 + v6 + v4 + -v7 - v5 + 2 * c)) / (v3 - v1 + v4 - v6 + v7 - v5),
            d2 - F9_14 - (F1_14 * (v6 + v2 - 2 * c)) / (v2 - v6),
          ]);
          break;
        case 30:
          a.push([
            d0 - F7_18 - (F1_6 * (-v1 - v0 + v5 + v4 + -v7 - v6 + 2 * c)) / (v1 - v0 + v4 - v5 + v7 - v6),
            d1 - F7_18 - (F1_6 * (-v2 - v0 + v6 + v4 + -v7 - v5 + 2 * c)) / (v2 - v0 + v4 - v6 + v7 - v5),
            d2 - F11_18 - (F1_6 * (-v4 - v0 + v5 + v1 + v6 + v2 - 2 * c)) / (v4 - v0 + v1 - v5 + v2 - v6),
          ]);
          break;
        case 31:
          a.push([
            d0 - 0.5 - (F1_6 * (v5 + v4 + -v7 - v6)) / (v4 - v5 + v7 - v6),
            d1 - 0.5 - (F1_6 * (v6 + v4 + -v7 - v5)) / (v4 - v6 + v7 - v5),
            d2 - F5_6 - (F1_6 * (v5 + v1 + v6 + v2 - 4 * c)) / (v1 - v5 + v2 - v6),
          ]);
          break;
        case 32:
          a.push([d0 - 0.75 - (0.25 * (-v5 - v4 + -v7 - v6 + 4 * c)) / (v5 - v4 + v7 - v6), d1 - 0.5, d2 - 0.75 - (0.25 * (-v5 - v1 + -v7 - v3 + 4 * c)) / (v5 - v1 + v7 - v3)]);
          break;
        case 33:
          a.push([
            d0 - 0.5 - (F3_14 * (v1 + v0 + -v5 - v4 + -v7 - v6 + 2 * c)) / (v0 - v1 + v5 - v4 + v7 - v6),
            d1 - F5_14 - (F1_14 * (v2 + v0 - 2 * c)) / (v0 - v2),
            d2 - 0.5 - (F3_14 * (v4 + v0 + -v5 - v1 + -v7 - v3 + 2 * c)) / (v0 - v4 + v5 - v1 + v7 - v3),
          ]);
          break;
        case 34:
          a.push([d0 - 0.7 - (0.3 * (-v1 - v0 + -v5 - v4 + -v7 - v6 + 6 * c)) / (v1 - v0 + v5 - v4 + v7 - v6), d1 - 0.5 - (0.1 * (v3 + v1 - 2 * c)) / (v1 - v3), d2 - 0.5 - (0.1 * (-v7 - v3 + 2 * c)) / (v7 - v3)]);
          break;
        case 35:
          a.push([
            d0 - 0.5 - (F1_6 * (-v5 - v4 + -v7 - v6 + 4 * c)) / (v5 - v4 + v7 - v6),
            d1 - 0.5 - (F1_6 * (v2 + v0 + v3 + v1 - 4 * c)) / (v0 - v2 + v1 - v3),
            d2 - 0.5 - (F1_6 * (v4 + v0 + -v7 - v3)) / (v0 - v4 + v7 - v3),
          ]);
          break;
        case 36:
          a.push([
            d0 - 0.5 - (F3_14 * (v3 + v2 + -v5 - v4 + -v7 - v6 + 2 * c)) / (v2 - v3 + v5 - v4 + v7 - v6),
            d1 - F9_14 - (F1_14 * (-v2 - v0 + 2 * c)) / (v2 - v0),
            d2 - 0.5 - (F3_14 * (-v5 - v1 + v6 + v2 + -v7 - v3 + 2 * c)) / (v5 - v1 + v2 - v6 + v7 - v3),
          ]);
          break;
        case 37:
          a.push([d0 - 0.5 - (0.25 * (v1 + v0 + v3 + v2 + -v5 - v4 + -v7 - v6)) / (v0 - v1 + v2 - v3 + v5 - v4 + v7 - v6), d1 - 0.5, d2 - 0.5 - (0.25 * (v4 + v0 + -v5 - v1 + v6 + v2 + -v7 - v3)) / (v0 - v4 + v5 - v1 + v2 - v6 + v7 - v3)]);
          break;
        case 38:
          a.push([
            d0 - 0.5 - (0.25 * (-v1 - v0 + v3 + v2 + -v5 - v4 + -v7 - v6 + 4 * c)) / (v1 - v0 + v2 - v3 + v5 - v4 + v7 - v6),
            d1 - 0.625 - (0.125 * (-v2 - v0 + v3 + v1)) / (v2 - v0 + v1 - v3),
            d2 - 0.375 - (0.125 * (v6 + v2 + -v7 - v3)) / (v2 - v6 + v7 - v3),
          ]);
          break;
        case 39:
          a.push([
            d0 - 0.5 - (F3_14 * (v3 + v2 + -v5 - v4 + -v7 - v6 + 2 * c)) / (v2 - v3 + v5 - v4 + v7 - v6),
            d1 - F9_14 - (F1_14 * (v3 + v1 - 2 * c)) / (v1 - v3),
            d2 - 0.5 - (F3_14 * (v4 + v0 + v6 + v2 + -v7 - v3 - 2 * c)) / (v0 - v4 + v2 - v6 + v7 - v3),
          ]);
          break;
        case 40:
          a.push([d0 - 0.7 - (0.3 * (-v3 - v2 + -v5 - v4 + -v7 - v6 + 6 * c)) / (v3 - v2 + v5 - v4 + v7 - v6), d1 - 0.5 - (0.1 * (-v3 - v1 + 2 * c)) / (v3 - v1), d2 - 0.5 - (0.1 * (-v5 - v1 + 2 * c)) / (v5 - v1)]);
          break;
        case 41:
          a.push([
            d0 - 0.5 - (0.25 * (v1 + v0 + -v3 - v2 + -v5 - v4 + -v7 - v6 + 4 * c)) / (v0 - v1 + v3 - v2 + v5 - v4 + v7 - v6),
            d1 - 0.375 - (0.125 * (v2 + v0 + -v3 - v1)) / (v0 - v2 + v3 - v1),
            d2 - 0.375 - (0.125 * (v4 + v0 + -v5 - v1)) / (v0 - v4 + v5 - v1),
          ]);
          break;
        case 42:
          a.push([d0 - 0.5 - (0.5 * (-v1 - v0 + -v3 - v2 + -v5 - v4 + -v7 - v6 + 8 * c)) / (v1 - v0 + v3 - v2 + v5 - v4 + v7 - v6), d1 - 0.5, d2 - 0.5]);
          break;
        case 43:
          a.push([d0 - 0.3 - (0.3 * (-v3 - v2 + -v5 - v4 + -v7 - v6 + 6 * c)) / (v3 - v2 + v5 - v4 + v7 - v6), d1 - 0.5 - (0.1 * (v2 + v0 - 2 * c)) / (v0 - v2), d2 - 0.5 - (0.1 * (v4 + v0 - 2 * c)) / (v0 - v4)]);
          break;
        case 44:
          a.push([
            d0 - 0.5 - (F1_6 * (-v5 - v4 + -v7 - v6 + 4 * c)) / (v5 - v4 + v7 - v6),
            d1 - 0.5 - (F1_6 * (-v2 - v0 + -v3 - v1 + 4 * c)) / (v2 - v0 + v3 - v1),
            d2 - 0.5 - (F1_6 * (-v5 - v1 + v6 + v2)) / (v5 - v1 + v2 - v6),
          ]);
          break;
        case 45:
          a.push([
            d0 - 0.5 - (F3_14 * (v1 + v0 + -v5 - v4 + -v7 - v6 + 2 * c)) / (v0 - v1 + v5 - v4 + v7 - v6),
            d1 - F5_14 - (F1_14 * (-v3 - v1 + 2 * c)) / (v3 - v1),
            d2 - 0.5 - (F3_14 * (v4 + v0 + -v5 - v1 + v6 + v2 - 2 * c)) / (v0 - v4 + v5 - v1 + v2 - v6),
          ]);
          break;
        case 46:
          a.push([d0 - 0.3 - (0.3 * (-v1 - v0 + -v5 - v4 + -v7 - v6 + 6 * c)) / (v1 - v0 + v5 - v4 + v7 - v6), d1 - 0.5 - (0.1 * (-v2 - v0 + 2 * c)) / (v2 - v0), d2 - 0.5 - (0.1 * (v6 + v2 - 2 * c)) / (v2 - v6)]);
          break;
        case 47:
          a.push([d0 - 0.25 - (0.25 * (-v5 - v4 + -v7 - v6 + 4 * c)) / (v5 - v4 + v7 - v6), d1 - 0.5, d2 - 0.75 - (0.25 * (v4 + v0 + v6 + v2 - 4 * c)) / (v0 - v4 + v2 - v6)]);
          break;
        case 48:
          a.push([d0 - 0.5 - (0.1 * (-v7 - v6 + 2 * c)) / (v7 - v6), d1 - 0.5 - (0.1 * (v6 + v4 - 2 * c)) / (v4 - v6), d2 - 0.7 - (0.3 * (-v4 - v0 + -v5 - v1 + -v7 - v3 + 6 * c)) / (v4 - v0 + v5 - v1 + v7 - v3)]);
          break;
        case 49:
          a.push([
            d0 - 0.5 - (F1_6 * (v1 + v0 + -v7 - v6)) / (v0 - v1 + v7 - v6),
            d1 - 0.5 - (F1_6 * (v2 + v0 + v6 + v4 - 4 * c)) / (v0 - v2 + v4 - v6),
            d2 - 0.5 - (F1_6 * (-v5 - v1 + -v7 - v3 + 4 * c)) / (v5 - v1 + v7 - v3),
          ]);
          break;
        case 50:
          a.push([
            d0 - 0.5 - (F1_6 * (-v1 - v0 + -v7 - v6 + 4 * c)) / (v1 - v0 + v7 - v6),
            d1 - 0.5 - (F1_6 * (v3 + v1 + v6 + v4 - 4 * c)) / (v1 - v3 + v4 - v6),
            d2 - 0.5 - (F1_6 * (-v4 - v0 + -v7 - v3 + 4 * c)) / (v4 - v0 + v7 - v3),
          ]);
          break;
        case 51:
          a.push([d0 - 0.5 - (0.1 * (-v7 - v6 + 2 * c)) / (v7 - v6), d1 - 0.7 - (0.3 * (v2 + v0 + v3 + v1 + v6 + v4 - 6 * c)) / (v0 - v2 + v1 - v3 + v4 - v6), d2 - 0.5 - (0.1 * (-v7 - v3 + 2 * c)) / (v7 - v3)]);
          break;
        case 52:
          a.push([
            d0 - 0.375 - (0.125 * (v3 + v2 + -v7 - v6)) / (v2 - v3 + v7 - v6),
            d1 - 0.625 - (0.125 * (-v2 - v0 + v6 + v4)) / (v2 - v0 + v4 - v6),
            d2 - 0.5 - (0.25 * (-v4 - v0 + -v5 - v1 + v6 + v2 + -v7 - v3 + 4 * c)) / (v4 - v0 + v5 - v1 + v2 - v6 + v7 - v3),
          ]);
          break;
        case 53:
          a.push([
            d0 - 0.5 - (F3_14 * (v1 + v0 + v3 + v2 + -v7 - v6 - 2 * c)) / (v0 - v1 + v2 - v3 + v7 - v6),
            d1 - F9_14 - (F1_14 * (v6 + v4 - 2 * c)) / (v4 - v6),
            d2 - 0.5 - (F3_14 * (-v5 - v1 + v6 + v2 + -v7 - v3 + 2 * c)) / (v5 - v1 + v2 - v6 + v7 - v3),
          ]);
          break;
        case 54:
          a.push([
            d0 - F7_18 - (F1_6 * (-v1 - v0 + v3 + v2 + -v7 - v6 + 2 * c)) / (v1 - v0 + v2 - v3 + v7 - v6),
            d1 - F11_18 - (F1_6 * (-v2 - v0 + v3 + v1 + v6 + v4 - 2 * c)) / (v2 - v0 + v1 - v3 + v4 - v6),
            d2 - F7_18 - (F1_6 * (-v4 - v0 + v6 + v2 + -v7 - v3 + 2 * c)) / (v4 - v0 + v2 - v6 + v7 - v3),
          ]);
          break;
        case 55:
          a.push([
            d0 - 0.5 - (F1_6 * (v3 + v2 + -v7 - v6)) / (v2 - v3 + v7 - v6),
            d1 - F5_6 - (F1_6 * (v3 + v1 + v6 + v4 - 4 * c)) / (v1 - v3 + v4 - v6),
            d2 - 0.5 - (F1_6 * (v6 + v2 + -v7 - v3)) / (v2 - v6 + v7 - v3),
          ]);
          break;
        case 56:
          a.push([
            d0 - 0.5 - (F1_6 * (-v3 - v2 + -v7 - v6 + 4 * c)) / (v3 - v2 + v7 - v6),
            d1 - 0.5 - (F1_6 * (-v3 - v1 + v6 + v4)) / (v3 - v1 + v4 - v6),
            d2 - 0.5 - (F1_6 * (-v4 - v0 + -v5 - v1 + 4 * c)) / (v4 - v0 + v5 - v1),
          ]);
          break;
        case 57:
          a.push([
            d0 - 0.5 - (F3_14 * (v1 + v0 + -v3 - v2 + -v7 - v6 + 2 * c)) / (v0 - v1 + v3 - v2 + v7 - v6),
            d1 - 0.5 - (F3_14 * (v2 + v0 + -v3 - v1 + v6 + v4 - 2 * c)) / (v0 - v2 + v3 - v1 + v4 - v6),
            d2 - F5_14 - (F1_14 * (-v5 - v1 + 2 * c)) / (v5 - v1),
          ]);
          break;
        case 58:
          a.push([d0 - 0.3 - (0.3 * (-v1 - v0 + -v3 - v2 + -v7 - v6 + 6 * c)) / (v1 - v0 + v3 - v2 + v7 - v6), d1 - 0.5 - (0.1 * (v6 + v4 - 2 * c)) / (v4 - v6), d2 - 0.5 - (0.1 * (-v4 - v0 + 2 * c)) / (v4 - v0)]);
          break;
        case 59:
          a.push([d0 - 0.25 - (0.25 * (-v3 - v2 + -v7 - v6 + 4 * c)) / (v3 - v2 + v7 - v6), d1 - 0.75 - (0.25 * (v2 + v0 + v6 + v4 - 4 * c)) / (v0 - v2 + v4 - v6), d2 - 0.5]);
          break;
        case 60:
          a.push([
            d0 - F5_14 - (F1_14 * (-v7 - v6 + 2 * c)) / (v7 - v6),
            d1 - 0.5 - (F3_14 * (-v2 - v0 + -v3 - v1 + v6 + v4 + 2 * c)) / (v2 - v0 + v3 - v1 + v4 - v6),
            d2 - 0.5 - (F3_14 * (-v4 - v0 + -v5 - v1 + v6 + v2 + 2 * c)) / (v4 - v0 + v5 - v1 + v2 - v6),
          ]);
          break;
        case 61:
          a.push([d0 - 0.5 - (F1_6 * (v1 + v0 + -v7 - v6)) / (v0 - v1 + v7 - v6), d1 - 0.5 - (F1_6 * (-v3 - v1 + v6 + v4)) / (v3 - v1 + v4 - v6), d2 - 0.5 - (F1_6 * (-v5 - v1 + v6 + v2)) / (v5 - v1 + v2 - v6)]);
          break;
        case 62:
          a.push([
            d0 - F1_6 - (F1_6 * (-v1 - v0 + -v7 - v6 + 4 * c)) / (v1 - v0 + v7 - v6),
            d1 - 0.5 - (F1_6 * (-v2 - v0 + v6 + v4)) / (v2 - v0 + v4 - v6),
            d2 - 0.5 - (F1_6 * (-v4 - v0 + v6 + v2)) / (v4 - v0 + v2 - v6),
          ]);
          break;
        case 63:
          a.push([
            d0 - F1_6 - (F1_6 * (-v7 - v6 + 2 * c)) / (v7 - v6),
            d1 - F5_6 - (F1_6 * (v6 + v4 - 2 * c)) / (v4 - v6),
            d2 - F5_6 - (F1_6 * (v6 + v2 - 2 * c)) / (v2 - v6),
          ]);
          break;
        case 64:
          a.push([d0 - 0.5, d1 - 0.75 - (0.25 * (-v6 - v4 + -v7 - v5 + 4 * c)) / (v6 - v4 + v7 - v5), d2 - 0.75 - (0.25 * (-v6 - v2 + -v7 - v3 + 4 * c)) / (v6 - v2 + v7 - v3)]);
          break;
        case 65:
          a.push([
            d0 - F5_14 - (F1_14 * (v1 + v0 - 2 * c)) / (v0 - v1),
            d1 - 0.5 - (F3_14 * (v2 + v0 + -v6 - v4 + -v7 - v5 + 2 * c)) / (v0 - v2 + v6 - v4 + v7 - v5),
            d2 - 0.5 - (F3_14 * (v4 + v0 + -v6 - v2 + -v7 - v3 + 2 * c)) / (v0 - v4 + v6 - v2 + v7 - v3),
          ]);
          break;
        case 66:
          a.push([
            d0 - F9_14 - (F1_14 * (-v1 - v0 + 2 * c)) / (v1 - v0),
            d1 - 0.5 - (F3_14 * (v3 + v1 + -v6 - v4 + -v7 - v5 + 2 * c)) / (v1 - v3 + v6 - v4 + v7 - v5),
            d2 - 0.5 - (F3_14 * (v5 + v1 + -v6 - v2 + -v7 - v3 + 2 * c)) / (v1 - v5 + v6 - v2 + v7 - v3),
          ]);
          break;
        case 67:
          a.push([d0 - 0.5, d1 - 0.5 - (0.25 * (v2 + v0 + v3 + v1 + -v6 - v4 + -v7 - v5)) / (v0 - v2 + v1 - v3 + v6 - v4 + v7 - v5), d2 - 0.5 - (0.25 * (v4 + v0 + v5 + v1 + -v6 - v2 + -v7 - v3)) / (v0 - v4 + v1 - v5 + v6 - v2 + v7 - v3)]);
          break;
        case 68:
          a.push([d0 - 0.5 - (0.1 * (v3 + v2 - 2 * c)) / (v2 - v3), d1 - 0.7 - (0.3 * (-v2 - v0 + -v6 - v4 + -v7 - v5 + 6 * c)) / (v2 - v0 + v6 - v4 + v7 - v5), d2 - 0.5 - (0.1 * (-v7 - v3 + 2 * c)) / (v7 - v3)]);
          break;
        case 69:
          a.push([
            d0 - 0.5 - (F1_6 * (v1 + v0 + v3 + v2 - 4 * c)) / (v0 - v1 + v2 - v3),
            d1 - 0.5 - (F1_6 * (-v6 - v4 + -v7 - v5 + 4 * c)) / (v6 - v4 + v7 - v5),
            d2 - 0.5 - (F1_6 * (v4 + v0 + -v7 - v3)) / (v0 - v4 + v7 - v3),
          ]);
          break;
        case 70:
          a.push([
            d0 - 0.625 - (0.125 * (-v1 - v0 + v3 + v2)) / (v1 - v0 + v2 - v3),
            d1 - 0.5 - (0.25 * (-v2 - v0 + v3 + v1 + -v6 - v4 + -v7 - v5 + 4 * c)) / (v2 - v0 + v1 - v3 + v6 - v4 + v7 - v5),
            d2 - 0.375 - (0.125 * (v5 + v1 + -v7 - v3)) / (v1 - v5 + v7 - v3),
          ]);
          break;
        case 71:
          a.push([
            d0 - F9_14 - (F1_14 * (v3 + v2 - 2 * c)) / (v2 - v3),
            d1 - 0.5 - (F3_14 * (v3 + v1 + -v6 - v4 + -v7 - v5 + 2 * c)) / (v1 - v3 + v6 - v4 + v7 - v5),
            d2 - 0.5 - (F3_14 * (v4 + v0 + v5 + v1 + -v7 - v3 - 2 * c)) / (v0 - v4 + v1 - v5 + v7 - v3),
          ]);
          break;
        case 72:
          a.push([d0 - 0.5 - (0.1 * (-v3 - v2 + 2 * c)) / (v3 - v2), d1 - 0.7 - (0.3 * (-v3 - v1 + -v6 - v4 + -v7 - v5 + 6 * c)) / (v3 - v1 + v6 - v4 + v7 - v5), d2 - 0.5 - (0.1 * (-v6 - v2 + 2 * c)) / (v6 - v2)]);
          break;
        case 73:
          a.push([
            d0 - 0.375 - (0.125 * (v1 + v0 + -v3 - v2)) / (v0 - v1 + v3 - v2),
            d1 - 0.5 - (0.25 * (v2 + v0 + -v3 - v1 + -v6 - v4 + -v7 - v5 + 4 * c)) / (v0 - v2 + v3 - v1 + v6 - v4 + v7 - v5),
            d2 - 0.375 - (0.125 * (v4 + v0 + -v6 - v2)) / (v0 - v4 + v6 - v2),
          ]);
          break;
        case 74:
          a.push([
            d0 - 0.5 - (F1_6 * (-v1 - v0 + -v3 - v2 + 4 * c)) / (v1 - v0 + v3 - v2),
            d1 - 0.5 - (F1_6 * (-v6 - v4 + -v7 - v5 + 4 * c)) / (v6 - v4 + v7 - v5),
            d2 - 0.5 - (F1_6 * (v5 + v1 + -v6 - v2)) / (v1 - v5 + v6 - v2),
          ]);
          break;
        case 75:
          a.push([
            d0 - F5_14 - (F1_14 * (-v3 - v2 + 2 * c)) / (v3 - v2),
            d1 - 0.5 - (F3_14 * (v2 + v0 + -v6 - v4 + -v7 - v5 + 2 * c)) / (v0 - v2 + v6 - v4 + v7 - v5),
            d2 - 0.5 - (F3_14 * (v4 + v0 + v5 + v1 + -v6 - v2 - 2 * c)) / (v0 - v4 + v1 - v5 + v6 - v2),
          ]);
          break;
        case 76:
          a.push([d0 - 0.5, d1 - 0.5 - (0.5 * (-v2 - v0 + -v3 - v1 + -v6 - v4 + -v7 - v5 + 8 * c)) / (v2 - v0 + v3 - v1 + v6 - v4 + v7 - v5), d2 - 0.5]);
          break;
        case 77:
          a.push([d0 - 0.5 - (0.1 * (v1 + v0 - 2 * c)) / (v0 - v1), d1 - 0.3 - (0.3 * (-v3 - v1 + -v6 - v4 + -v7 - v5 + 6 * c)) / (v3 - v1 + v6 - v4 + v7 - v5), d2 - 0.5 - (0.1 * (v4 + v0 - 2 * c)) / (v0 - v4)]);
          break;
        case 78:
          a.push([d0 - 0.5 - (0.1 * (-v1 - v0 + 2 * c)) / (v1 - v0), d1 - 0.3 - (0.3 * (-v2 - v0 + -v6 - v4 + -v7 - v5 + 6 * c)) / (v2 - v0 + v6 - v4 + v7 - v5), d2 - 0.5 - (0.1 * (v5 + v1 - 2 * c)) / (v1 - v5)]);
          break;
        case 79:
          a.push([d0 - 0.5, d1 - 0.25 - (0.25 * (-v6 - v4 + -v7 - v5 + 4 * c)) / (v6 - v4 + v7 - v5), d2 - 0.75 - (0.25 * (v4 + v0 + v5 + v1 - 4 * c)) / (v0 - v4 + v1 - v5)]);
          break;
        case 80:
          a.push([d0 - 0.5 - (0.1 * (v5 + v4 - 2 * c)) / (v4 - v5), d1 - 0.5 - (0.1 * (-v7 - v5 + 2 * c)) / (v7 - v5), d2 - 0.7 - (0.3 * (-v4 - v0 + -v6 - v2 + -v7 - v3 + 6 * c)) / (v4 - v0 + v6 - v2 + v7 - v3)]);
          break;
        case 81:
          a.push([
            d0 - 0.5 - (F1_6 * (v1 + v0 + v5 + v4 - 4 * c)) / (v0 - v1 + v4 - v5),
            d1 - 0.5 - (F1_6 * (v2 + v0 + -v7 - v5)) / (v0 - v2 + v7 - v5),
            d2 - 0.5 - (F1_6 * (-v6 - v2 + -v7 - v3 + 4 * c)) / (v6 - v2 + v7 - v3),
          ]);
          break;
        case 82:
          a.push([
            d0 - 0.625 - (0.125 * (-v1 - v0 + v5 + v4)) / (v1 - v0 + v4 - v5),
            d1 - 0.375 - (0.125 * (v3 + v1 + -v7 - v5)) / (v1 - v3 + v7 - v5),
            d2 - 0.5 - (0.25 * (-v4 - v0 + v5 + v1 + -v6 - v2 + -v7 - v3 + 4 * c)) / (v4 - v0 + v1 - v5 + v6 - v2 + v7 - v3),
          ]);
          break;
        case 83:
          a.push([
            d0 - F9_14 - (F1_14 * (v5 + v4 - 2 * c)) / (v4 - v5),
            d1 - 0.5 - (F3_14 * (v2 + v0 + v3 + v1 + -v7 - v5 - 2 * c)) / (v0 - v2 + v1 - v3 + v7 - v5),
            d2 - 0.5 - (F3_14 * (v5 + v1 + -v6 - v2 + -v7 - v3 + 2 * c)) / (v1 - v5 + v6 - v2 + v7 - v3),
          ]);
          break;
        case 84:
          a.push([
            d0 - 0.5 - (F1_6 * (v3 + v2 + v5 + v4 - 4 * c)) / (v2 - v3 + v4 - v5),
            d1 - 0.5 - (F1_6 * (-v2 - v0 + -v7 - v5 + 4 * c)) / (v2 - v0 + v7 - v5),
            d2 - 0.5 - (F1_6 * (-v4 - v0 + -v7 - v3 + 4 * c)) / (v4 - v0 + v7 - v3),
          ]);
          break;
        case 85:
          a.push([d0 - 0.7 - (0.3 * (v1 + v0 + v3 + v2 + v5 + v4 - 6 * c)) / (v0 - v1 + v2 - v3 + v4 - v5), d1 - 0.5 - (0.1 * (-v7 - v5 + 2 * c)) / (v7 - v5), d2 - 0.5 - (0.1 * (-v7 - v3 + 2 * c)) / (v7 - v3)]);
          break;
        case 86:
          a.push([
            d0 - F11_18 - (F1_6 * (-v1 - v0 + v3 + v2 + v5 + v4 - 2 * c)) / (v1 - v0 + v2 - v3 + v4 - v5),
            d1 - F7_18 - (F1_6 * (-v2 - v0 + v3 + v1 + -v7 - v5 + 2 * c)) / (v2 - v0 + v1 - v3 + v7 - v5),
            d2 - F7_18 - (F1_6 * (-v4 - v0 + v5 + v1 + -v7 - v3 + 2 * c)) / (v4 - v0 + v1 - v5 + v7 - v3),
          ]);
          break;
        case 87:
          a.push([
            d0 - F5_6 - (F1_6 * (v3 + v2 + v5 + v4 - 4 * c)) / (v2 - v3 + v4 - v5),
            d1 - 0.5 - (F1_6 * (v3 + v1 + -v7 - v5)) / (v1 - v3 + v7 - v5),
            d2 - 0.5 - (F1_6 * (v5 + v1 + -v7 - v3)) / (v1 - v5 + v7 - v3),
          ]);
          break;
        case 88:
          a.push([
            d0 - 0.5 - (F1_6 * (-v3 - v2 + v5 + v4)) / (v3 - v2 + v4 - v5),
            d1 - 0.5 - (F1_6 * (-v3 - v1 + -v7 - v5 + 4 * c)) / (v3 - v1 + v7 - v5),
            d2 - 0.5 - (F1_6 * (-v4 - v0 + -v6 - v2 + 4 * c)) / (v4 - v0 + v6 - v2),
          ]);
          break;
        case 89:
          a.push([
            d0 - 0.5 - (F3_14 * (v1 + v0 + -v3 - v2 + v5 + v4 - 2 * c)) / (v0 - v1 + v3 - v2 + v4 - v5),
            d1 - 0.5 - (F3_14 * (v2 + v0 + -v3 - v1 + -v7 - v5 + 2 * c)) / (v0 - v2 + v3 - v1 + v7 - v5),
            d2 - F5_14 - (F1_14 * (-v6 - v2 + 2 * c)) / (v6 - v2),
          ]);
          break;
        case 90:
          a.push([
            d0 - 0.5 - (F3_14 * (-v1 - v0 + -v3 - v2 + v5 + v4 + 2 * c)) / (v1 - v0 + v3 - v2 + v4 - v5),
            d1 - F5_14 - (F1_14 * (-v7 - v5 + 2 * c)) / (v7 - v5),
            d2 - 0.5 - (F3_14 * (-v4 - v0 + v5 + v1 + -v6 - v2 + 2 * c)) / (v4 - v0 + v1 - v5 + v6 - v2),
          ]);
          break;
        case 91:
          a.push([d0 - 0.5 - (F1_6 * (-v3 - v2 + v5 + v4)) / (v3 - v2 + v4 - v5), d1 - 0.5 - (F1_6 * (v2 + v0 + -v7 - v5)) / (v0 - v2 + v7 - v5), d2 - 0.5 - (F1_6 * (v5 + v1 + -v6 - v2)) / (v1 - v5 + v6 - v2)]);
          break;
        case 92:
          a.push([d0 - 0.5 - (0.1 * (v5 + v4 - 2 * c)) / (v4 - v5), d1 - 0.3 - (0.3 * (-v2 - v0 + -v3 - v1 + -v7 - v5 + 6 * c)) / (v2 - v0 + v3 - v1 + v7 - v5), d2 - 0.5 - (0.1 * (-v4 - v0 + 2 * c)) / (v4 - v0)]);
          break;
        case 93:
          a.push([d0 - 0.75 - (0.25 * (v1 + v0 + v5 + v4 - 4 * c)) / (v0 - v1 + v4 - v5), d1 - 0.25 - (0.25 * (-v3 - v1 + -v7 - v5 + 4 * c)) / (v3 - v1 + v7 - v5), d2 - 0.5]);
          break;
        case 94:
          a.push([
            d0 - 0.5 - (F1_6 * (-v1 - v0 + v5 + v4)) / (v1 - v0 + v4 - v5),
            d1 - F1_6 - (F1_6 * (-v2 - v0 + -v7 - v5 + 4 * c)) / (v2 - v0 + v7 - v5),
            d2 - 0.5 - (F1_6 * (-v4 - v0 + v5 + v1)) / (v4 - v0 + v1 - v5),
          ]);
          break;
        case 95:
          a.push([
            d0 - F5_6 - (F1_6 * (v5 + v4 - 2 * c)) / (v4 - v5),
            d1 - F1_6 - (F1_6 * (-v7 - v5 + 2 * c)) / (v7 - v5),
            d2 - F5_6 - (F1_6 * (v5 + v1 - 2 * c)) / (v1 - v5),
          ]);
          break;
        case 96:
          a.push([d0 - 0.5 - (0.1 * (-v5 - v4 + 2 * c)) / (v5 - v4), d1 - 0.5 - (0.1 * (-v6 - v4 + 2 * c)) / (v6 - v4), d2 - 0.7 - (0.3 * (-v5 - v1 + -v6 - v2 + -v7 - v3 + 6 * c)) / (v5 - v1 + v6 - v2 + v7 - v3)]);
          break;
        case 97:
          a.push([
            d0 - 0.375 - (0.125 * (v1 + v0 + -v5 - v4)) / (v0 - v1 + v5 - v4),
            d1 - 0.375 - (0.125 * (v2 + v0 + -v6 - v4)) / (v0 - v2 + v6 - v4),
            d2 - 0.5 - (0.25 * (v4 + v0 + -v5 - v1 + -v6 - v2 + -v7 - v3 + 4 * c)) / (v0 - v4 + v5 - v1 + v6 - v2 + v7 - v3),
          ]);
          break;
        case 98:
          a.push([
            d0 - 0.5 - (F1_6 * (-v1 - v0 + -v5 - v4 + 4 * c)) / (v1 - v0 + v5 - v4),
            d1 - 0.5 - (F1_6 * (v3 + v1 + -v6 - v4)) / (v1 - v3 + v6 - v4),
            d2 - 0.5 - (F1_6 * (-v6 - v2 + -v7 - v3 + 4 * c)) / (v6 - v2 + v7 - v3),
          ]);
          break;
        case 99:
          a.push([
            d0 - F5_14 - (F1_14 * (-v5 - v4 + 2 * c)) / (v5 - v4),
            d1 - 0.5 - (F3_14 * (v2 + v0 + v3 + v1 + -v6 - v4 - 2 * c)) / (v0 - v2 + v1 - v3 + v6 - v4),
            d2 - 0.5 - (F3_14 * (v4 + v0 + -v6 - v2 + -v7 - v3 + 2 * c)) / (v0 - v4 + v6 - v2 + v7 - v3),
          ]);
          break;
        case 100:
          a.push([
            d0 - 0.5 - (F1_6 * (v3 + v2 + -v5 - v4)) / (v2 - v3 + v5 - v4),
            d1 - 0.5 - (F1_6 * (-v2 - v0 + -v6 - v4 + 4 * c)) / (v2 - v0 + v6 - v4),
            d2 - 0.5 - (F1_6 * (-v5 - v1 + -v7 - v3 + 4 * c)) / (v5 - v1 + v7 - v3),
          ]);
          break;
        case 101:
          a.push([
            d0 - 0.5 - (F3_14 * (v1 + v0 + v3 + v2 + -v5 - v4 - 2 * c)) / (v0 - v1 + v2 - v3 + v5 - v4),
            d1 - F5_14 - (F1_14 * (-v6 - v4 + 2 * c)) / (v6 - v4),
            d2 - 0.5 - (F3_14 * (v4 + v0 + -v5 - v1 + -v7 - v3 + 2 * c)) / (v0 - v4 + v5 - v1 + v7 - v3),
          ]);
          break;
        case 102:
          a.push([
            d0 - 0.5 - (F3_14 * (-v1 - v0 + v3 + v2 + -v5 - v4 + 2 * c)) / (v1 - v0 + v2 - v3 + v5 - v4),
            d1 - 0.5 - (F3_14 * (-v2 - v0 + v3 + v1 + -v6 - v4 + 2 * c)) / (v2 - v0 + v1 - v3 + v6 - v4),
            d2 - F5_14 - (F1_14 * (-v7 - v3 + 2 * c)) / (v7 - v3),
          ]);
          break;
        case 103:
          a.push([d0 - 0.5 - (F1_6 * (v3 + v2 + -v5 - v4)) / (v2 - v3 + v5 - v4), d1 - 0.5 - (F1_6 * (v3 + v1 + -v6 - v4)) / (v1 - v3 + v6 - v4), d2 - 0.5 - (F1_6 * (v4 + v0 + -v7 - v3)) / (v0 - v4 + v7 - v3)]);
          break;
        case 104:
          a.push([
            d0 - 0.5 - (F1_6 * (-v3 - v2 + -v5 - v4 + 4 * c)) / (v3 - v2 + v5 - v4),
            d1 - 0.5 - (F1_6 * (-v3 - v1 + -v6 - v4 + 4 * c)) / (v3 - v1 + v6 - v4),
            d2 - 0.5 - (F1_6 * (-v5 - v1 + -v6 - v2 + 4 * c)) / (v5 - v1 + v6 - v2),
          ]);
          break;
        case 105:
          a.push([
            d0 - F7_18 - (F1_6 * (v1 + v0 + -v3 - v2 + -v5 - v4 + 2 * c)) / (v0 - v1 + v3 - v2 + v5 - v4),
            d1 - F7_18 - (F1_6 * (v2 + v0 + -v3 - v1 + -v6 - v4 + 2 * c)) / (v0 - v2 + v3 - v1 + v6 - v4),
            d2 - F7_18 - (F1_6 * (v4 + v0 + -v5 - v1 + -v6 - v2 + 2 * c)) / (v0 - v4 + v5 - v1 + v6 - v2),
          ]);
          break;
        case 106:
          a.push([d0 - 0.3 - (0.3 * (-v1 - v0 + -v3 - v2 + -v5 - v4 + 6 * c)) / (v1 - v0 + v3 - v2 + v5 - v4), d1 - 0.5 - (0.1 * (-v6 - v4 + 2 * c)) / (v6 - v4), d2 - 0.5 - (0.1 * (-v6 - v2 + 2 * c)) / (v6 - v2)]);
          break;
        case 107:
          a.push([
            d0 - F1_6 - (F1_6 * (-v3 - v2 + -v5 - v4 + 4 * c)) / (v3 - v2 + v5 - v4),
            d1 - 0.5 - (F1_6 * (v2 + v0 + -v6 - v4)) / (v0 - v2 + v6 - v4),
            d2 - 0.5 - (F1_6 * (v4 + v0 + -v6 - v2)) / (v0 - v4 + v6 - v2),
          ]);
          break;
        case 108:
          a.push([d0 - 0.5 - (0.1 * (-v5 - v4 + 2 * c)) / (v5 - v4), d1 - 0.3 - (0.3 * (-v2 - v0 + -v3 - v1 + -v6 - v4 + 6 * c)) / (v2 - v0 + v3 - v1 + v6 - v4), d2 - 0.5 - (0.1 * (-v5 - v1 + 2 * c)) / (v5 - v1)]);
          break;
        case 109:
          a.push([
            d0 - 0.5 - (F1_6 * (v1 + v0 + -v5 - v4)) / (v0 - v1 + v5 - v4),
            d1 - F1_6 - (F1_6 * (-v3 - v1 + -v6 - v4 + 4 * c)) / (v3 - v1 + v6 - v4),
            d2 - 0.5 - (F1_6 * (v4 + v0 + -v5 - v1)) / (v0 - v4 + v5 - v1),
          ]);
          break;
        case 110:
          a.push([d0 - 0.25 - (0.25 * (-v1 - v0 + -v5 - v4 + 4 * c)) / (v1 - v0 + v5 - v4), d1 - 0.25 - (0.25 * (-v2 - v0 + -v6 - v4 + 4 * c)) / (v2 - v0 + v6 - v4), d2 - 0.5]);
          break;
        case 111:
          a.push([
            d0 - F1_6 - (F1_6 * (-v5 - v4 + 2 * c)) / (v5 - v4),
            d1 - F1_6 - (F1_6 * (-v6 - v4 + 2 * c)) / (v6 - v4),
            d2 - F5_6 - (F1_6 * (v4 + v0 - 2 * c)) / (v0 - v4),
          ]);
          break;
        case 112:
          a.push([d0 - 0.5, d1 - 0.5, d2 - 0.5 - (0.5 * (-v4 - v0 + -v5 - v1 + -v6 - v2 + -v7 - v3 + 8 * c)) / (v4 - v0 + v5 - v1 + v6 - v2 + v7 - v3)]);
          break;
        case 113:
          a.push([d0 - 0.5 - (0.1 * (v1 + v0 - 2 * c)) / (v0 - v1), d1 - 0.5 - (0.1 * (v2 + v0 - 2 * c)) / (v0 - v2), d2 - 0.3 - (0.3 * (-v5 - v1 + -v6 - v2 + -v7 - v3 + 6 * c)) / (v5 - v1 + v6 - v2 + v7 - v3)]);
          break;
        case 114:
          a.push([d0 - 0.5 - (0.1 * (-v1 - v0 + 2 * c)) / (v1 - v0), d1 - 0.5 - (0.1 * (v3 + v1 - 2 * c)) / (v1 - v3), d2 - 0.3 - (0.3 * (-v4 - v0 + -v6 - v2 + -v7 - v3 + 6 * c)) / (v4 - v0 + v6 - v2 + v7 - v3)]);
          break;
        case 115:
          a.push([d0 - 0.5, d1 - 0.75 - (0.25 * (v2 + v0 + v3 + v1 - 4 * c)) / (v0 - v2 + v1 - v3), d2 - 0.25 - (0.25 * (-v6 - v2 + -v7 - v3 + 4 * c)) / (v6 - v2 + v7 - v3)]);
          break;
        case 116:
          a.push([d0 - 0.5 - (0.1 * (v3 + v2 - 2 * c)) / (v2 - v3), d1 - 0.5 - (0.1 * (-v2 - v0 + 2 * c)) / (v2 - v0), d2 - 0.3 - (0.3 * (-v4 - v0 + -v5 - v1 + -v7 - v3 + 6 * c)) / (v4 - v0 + v5 - v1 + v7 - v3)]);
          break;
        case 117:
          a.push([d0 - 0.75 - (0.25 * (v1 + v0 + v3 + v2 - 4 * c)) / (v0 - v1 + v2 - v3), d1 - 0.5, d2 - 0.25 - (0.25 * (-v5 - v1 + -v7 - v3 + 4 * c)) / (v5 - v1 + v7 - v3)]);
          break;
        case 118:
          a.push([
            d0 - 0.5 - (F1_6 * (-v1 - v0 + v3 + v2)) / (v1 - v0 + v2 - v3),
            d1 - 0.5 - (F1_6 * (-v2 - v0 + v3 + v1)) / (v2 - v0 + v1 - v3),
            d2 - F1_6 - (F1_6 * (-v4 - v0 + -v7 - v3 + 4 * c)) / (v4 - v0 + v7 - v3),
          ]);
          break;
        case 119:
          a.push([
            d0 - F5_6 - (F1_6 * (v3 + v2 - 2 * c)) / (v2 - v3),
            d1 - F5_6 - (F1_6 * (v3 + v1 - 2 * c)) / (v1 - v3),
            d2 - F1_6 - (F1_6 * (-v7 - v3 + 2 * c)) / (v7 - v3),
          ]);
          break;
        case 120:
          a.push([d0 - 0.5 - (0.1 * (-v3 - v2 + 2 * c)) / (v3 - v2), d1 - 0.5 - (0.1 * (-v3 - v1 + 2 * c)) / (v3 - v1), d2 - 0.3 - (0.3 * (-v4 - v0 + -v5 - v1 + -v6 - v2 + 6 * c)) / (v4 - v0 + v5 - v1 + v6 - v2)]);
          break;
        case 121:
          a.push([
            d0 - 0.5 - (F1_6 * (v1 + v0 + -v3 - v2)) / (v0 - v1 + v3 - v2),
            d1 - 0.5 - (F1_6 * (v2 + v0 + -v3 - v1)) / (v0 - v2 + v3 - v1),
            d2 - F1_6 - (F1_6 * (-v5 - v1 + -v6 - v2 + 4 * c)) / (v5 - v1 + v6 - v2),
          ]);
          break;
        case 122:
          a.push([d0 - 0.25 - (0.25 * (-v1 - v0 + -v3 - v2 + 4 * c)) / (v1 - v0 + v3 - v2), d1 - 0.5, d2 - 0.25 - (0.25 * (-v4 - v0 + -v6 - v2 + 4 * c)) / (v4 - v0 + v6 - v2)]);
          break;
        case 123:
          a.push([
            d0 - F1_6 - (F1_6 * (-v3 - v2 + 2 * c)) / (v3 - v2),
            d1 - F5_6 - (F1_6 * (v2 + v0 - 2 * c)) / (v0 - v2),
            d2 - F1_6 - (F1_6 * (-v6 - v2 + 2 * c)) / (v6 - v2),
          ]);
          break;
        case 124:
          a.push([d0 - 0.5, d1 - 0.25 - (0.25 * (-v2 - v0 + -v3 - v1 + 4 * c)) / (v2 - v0 + v3 - v1), d2 - 0.25 - (0.25 * (-v4 - v0 + -v5 - v1 + 4 * c)) / (v4 - v0 + v5 - v1)]);
          break;
        case 125:
          a.push([
            d0 - F5_6 - (F1_6 * (v1 + v0 - 2 * c)) / (v0 - v1),
            d1 - F1_6 - (F1_6 * (-v3 - v1 + 2 * c)) / (v3 - v1),
            d2 - F1_6 - (F1_6 * (-v5 - v1 + 2 * c)) / (v5 - v1),
          ]);
          break;
        case 126:
          a.push([
            d0 - F1_6 - (F1_6 * (-v1 - v0 + 2 * c)) / (v1 - v0),
            d1 - F1_6 - (F1_6 * (-v2 - v0 + 2 * c)) / (v2 - v0),
            d2 - F1_6 - (F1_6 * (-v4 - v0 + 2 * c)) / (v4 - v0),
          ]);
          break;
        case 127:
          a.push([d0 - 0.5, d1 - 0.5, d2 - 0.5]);
          break;
      }
    }
  },
}

function buildSurfaceNets(order, dtype) {
  var inKey = order.length + 'd'
  var fn = allFns[inKey]
  if(fn) return fn(generateContourExtractor, order, dtype)
}

//1D case: Need to handle specially
function mesh1D(array, level) {
  var zc = zeroCrossings(array, level)
  var n = zc.length
  var npos = new Array(n)
  var ncel = new Array(n)
  for(var i=0; i<n; ++i) {
    npos[i] = [ zc[i] ]
    ncel[i] = [ i ]
  }
  return {
    positions: npos,
    cells: ncel
  }
}

var CACHE = {}

function surfaceNets(array,level) {
  if(array.dimension <= 0) {
    return { positions: [], cells: [] }
  } else if(array.dimension === 1) {
    return mesh1D(array, level)
  }
  var typesig = array.order.join() + "-" + array.dtype
  var proc = CACHE[typesig]
  var level = (+level) || 0.0
  if(!proc) {
    proc = CACHE[typesig] = buildSurfaceNets(array.order, array.dtype)
  }
  return proc(array,level)
}