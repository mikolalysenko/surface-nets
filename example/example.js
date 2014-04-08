"use strict"

var surfaceNets = require("../surfacenets.js")
var ndarray = require("ndarray")
var fill = require("ndarray-fill")

var array = ndarray(new Float32Array(32*32), [32,32])
fill(array, function(i,j) {
  return Math.pow(i-16,2) + Math.pow(j-16,2)
})

var cells = surfaceNets(array, 16*16)