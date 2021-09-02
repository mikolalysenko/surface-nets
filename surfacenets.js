"use strict"

module.exports = surfaceNets

var generateContourExtractor = require("ndarray-extract-contour")
var zeroCrossings = require("zero-crossings")

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
  }
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