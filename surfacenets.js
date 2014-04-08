"use strict"

module.exports = surfaceNets

var beautify = require("js-beautify")

var generateContourExtractor = require("ndarray-extract-contour")
var triangulateCube = require("triangulate-hypercube")

function buildSurfaceNets(order, dtype) {
  var dimension = order.length
  var code = ["'use strict';"]
  var funcName = "surfaceNets" + order.join("_") + "d" + dtype

  //Contour extraction function
  code.push(
    "var contour=genContour({",
      "order:[", order.join(), "],",
      "scalarArguments: 3,",
      "phase:function phaseFunc(p,a,b,c) { return (p > c)|0 },")
  if(dtype === "generic") {
    code.push("getters:[0],")
  }

  //Generate vertex function
  var cubeArgs = []
  for(var i=0; i<dimension; ++i) {
    cubeArgs.push("d" + i)
  }
  for(var i=0; i<(1<<dimension); ++i) {
    cubeArgs.push("v" + i)
  }
  for(var i=0; i<(1<<dimension); ++i) {
    cubeArgs.push("p" + i)
  }
  cubeArgs.push("a")
  cubeArgs.push("b")
  cubeArgs.push("c")
  code.push("vertex:function vertexFunc(", cubeArgs.join(), "){")
  //Mask args together
  var maskStr = []
  for(var i=0; i<(1<<dimension); ++i) {
    maskStr.push("(p" + i + "<<" + i + ")")
  }
  //Generate variables and giganto switch statement
  code.push("var m=", maskStr.join("+"), ";console.log(v0,v1,v2,v3,p0,p1,p2,p3,m);switch(m){")
  for(var i=0; i<1<<(1<<dimension); ++i) {
    code.push("case ", i, ":")
    var crossings = new Array(dimension)
    var denoms = new Array(dimension)
    for(var j=0; j<dimension; ++j) {
      crossings[j] = []
      denoms[j] = []
    }
    for(var j=0; j<(1<<dimension); ++j) {
      for(var k=0; k<dimension; ++k) {
        var u = j ^ (1<<k)
        if(u > j) {
          continue
        }
        if(!(i&(1<<u)) !== !(i&(1<<j))) {
          if(!(i&(1<<k))) {
            denoms[k].push("v" + u + "-v" + j)
          } else {
            denoms[k].push("v" + j + "-v" + u)
          }
          crossings[k].push("v" + j + "+v" + u)
        }
      }
    }
    var vertexStr = []
    for(var k=0; k<dimension; ++k) {
      if(crossings[k].length === 0) {
        vertexStr.push("d" + k + "+0.5")
      } else {
        var cStr = (2*crossings[k].length) + "*c"
        vertexStr.push("d" + k + "+0.5+0.5*(" + crossings[k].join("+") + "-" + cStr + ")/(" + denoms[k].join("+") + ")")
      }
    }
    code.push("a.push([", vertexStr.join(), "]);break;")
  }
  code.push("default:}},")

  //Create face function
  var faceArgs = []
  for(var i=0; i<(1<<(dimension-1)); ++i) {
    faceArgs.push("v" + i)
  }
  faceArgs.push("c0", "c1", "p0", "p1", "a", "b", "c")
  code.push("cell:function cellFunc(", faceArgs.join(), "){")
  var facets = triangulateCube(dimension-1)
  code.push("if(p0){b.push(",
    facets.map(function(f) {
      return "[" + f.map(function(v) {
        return "v" + v
      }) + "]"
    }).join(), ")}else{b.push(",
    facets.map(function(f) {
      var e = f.slice()
      e.reverse()
      return "[" + e.map(function(v) {
        return "v" + v
      }) + "]"
    }).join(),
    ")}}});function ", funcName, "(array,level){var verts=[],cells=[];contour(array,verts,cells,level);return {positions:verts,cells:cells};} return ", funcName)

  console.log(beautify(code.join("")))

  //Compile and link
  var proc = new Function("genContour", code.join(""))
  return proc(generateContourExtractor)
}

var CACHE = {}

function surfaceNets(array,level) {
  var typesig = array.order.join() + "-" + array.dtype
  var proc = CACHE[typesig]
  var level = (+level) || 0.0
  if(!proc) {
    proc = CACHE[typesig] = buildSurfaceNets(array.order, array.dtype)
  }
  return proc(array,level)
}