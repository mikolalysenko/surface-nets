"use strict"

var surfaceNets = require("../surfacenets.js")
var ndarray = require("ndarray")
var fill = require("ndarray-fill")

var array = ndarray(new Float32Array(32*32), [32,32])
fill(array, function(i,j) {
  return Math.pow(i-16,2) + Math.pow(j-16,2)
})

var complex = surfaceNets(array, 16*16)

var svgFile = ['<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320">']
complex.cells.forEach(function(cell) {
  var p0 = complex.positions[cell[0]]
  var p1 = complex.positions[cell[1]]
  svgFile.push('<line x1="', 10*p0[0], '" y1="', 10*p0[1], '" x2="', 10*p1[0], '" y2="', 10*p1[1], '" style="stroke:rgb(255,0,0);stroke-width:1" />')
})
complex.positions.forEach(function(p) {
  svgFile.push('<circle cx="', 10*p[0], '" cy="', 10*p[1], '" r="1" stroke="black" stroke-width="0.1" fill="black" />')
})
svgFile.push('<circle cx="', 10*16, '" cy="', 10*16, '" r="160" stroke="black" stroke-width="1" fill="none" />')
svgFile.push('</svg>')

var fs = require("fs")
fs.writeFileSync("example/2d.svg", svgFile.join(""))