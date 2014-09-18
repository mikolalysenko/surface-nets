"use strict"

//Load modules
var surfaceNets = require("../surfacenets.js")
var ndarray = require("ndarray")
var fill = require("ndarray-fill")
var mat4 = require("gl-matrix").mat4
var stl = require("stl")

//Initialize array
var array = ndarray(new Float32Array(32*32*32), [32,32,32])
fill(array, function(i,j,k) {
  return Math.pow(i-16,2) + Math.pow(j-16,2) + Math.pow(k-16,2)
})

//Generate surface!
var complex = surfaceNets(array, 100)

//Render the implicit surface to stdout
var data = {
  description: "surface net 3d object",
  facets: complex.cells.map(function(c) {
    return {
      verts: c.map(function(idx) {
        return complex.positions[idx]
      })
    }
  })
}

console.log(data)

require("fs").writeFileSync("example/3d.stl", stl.fromObject(data))