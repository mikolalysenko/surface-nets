"use strict"

var tape = require("tape")
var surfaceNets = require("../surfacenets")
var ndarray = require("ndarray")
var fill = require("ndarray-fill")
var det = require("robust-determinant")
var gamma = require("gamma")

tape("sphere-test", function(t) {
  var shape = []
  var size = 1
  var fact = 1
  var funcs = [
    function(x) {
      return Math.pow(x-8,2)
    },
    function(x,y) {
      return Math.pow(x-8,2) + Math.pow(y-8,2)
    },
    function(x,y,z) {
      return Math.pow(x-8,2) + Math.pow(y-8,2) + Math.pow(z-8,2)
    },
    function(x,y,z,w) {
      return Math.pow(x-8,2) + Math.pow(y-8,2) + Math.pow(z-8,2) + Math.pow(w-8,2)
    }
  ]
  for(var d=1; d<4; ++d) {
    shape.push(16)
    size *= 16
    fact *= d

    var x = ndarray(new Float32Array(size), shape)
    fill(x, funcs[d-1])
    var surf = surfaceNets(x, 36)
    for(var k=0; k<surf.positions.length; ++k) {
      var p = surf.positions[k]
      var u = 0.0
      for(var j=0; j<d; ++j) {
        u += Math.pow(p[j]-8,2)
      }
      t.ok(Math.abs(u-36) <= 1.2, "test: " + d + "d - " + u)
    }

    if(d > 1) {
      //Compute volume of surface
      var vol = 0.0
      for(var k=0; k<surf.cells.length; ++k) {
        var c = surf.cells[k]
        var m = []
        for(var i=0; i<c.length; ++i) {
          var pp = surf.positions[c[i]].slice()
          for(var j=0; j<d; ++j) {
            pp[j] -= 8
          }
          m.push(pp)
        }
        var r = det(m)
        t.ok(r[r.length-1] >= -1e-6, "check orientation: " + r)
        vol += r[r.length-1] / gamma(d+1)
      }
      var bvol = Math.pow(Math.PI, Math.floor(d/2)) * Math.pow(6.0, d)
      if((d % 2) === 0) {
        bvol /= gamma((d/2) + 1)
      } else {
        var kk = Math.floor(d/2)
        bvol *= Math.pow(2.0, d) * gamma(1+kk) / gamma(1+d)
      }
      t.ok(Math.abs(vol / bvol - 1.0) < 0.05, "check volume - vol=" + vol + " vs bvol=" + bvol)
    }
  }
  t.end()
})