surface-nets
============
Extract a simplicial level set from an [ndarray](https://github.com/mikolalysenko/ndarray) in any dimension using naive surface nets.  This module works in both node.js and with [browserify](http://browserify.org/)!

# Example

Here is a 2D example:

```javascript
//Load modules
var surfaceNets = require("surface-nets")
var ndarray = require("ndarray")
var fill = require("ndarray-fill")

//Initialize array to a circle
var array = ndarray(new Float32Array(32*32), [32,32])
fill(array, function(i,j) {
  return Math.pow(i-16,2) + Math.pow(j-16,2)
})

//Extract contour
var complex = surfaceNets(array, 16*16)

//Write to SVG header
var svgFile = ['<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320">']

//Draw lines
complex.cells.forEach(function(cell) {
  var p0 = complex.positions[cell[0]]
  var p1 = complex.positions[cell[1]]
  svgFile.push('<line x1="', 10*p0[0], '" y1="', 10*p0[1], '" x2="', 10*p1[0], '" y2="', 10*p1[1], '" style="stroke:rgb(255,0,0);stroke-width:1" />')
})

//Draw vertices
complex.positions.forEach(function(p) {
  svgFile.push('<circle cx="', 10*p[0], '" cy="', 10*p[1], '" r="1" stroke="black" stroke-width="0.1" fill="black" />')
})

//Close tags, and serialize to stdout
svgFile.push('</svg>')
console.log(svgFile.join(""))
```

And here is the output SVG:

<img src="https://mikolalysenko.github.io/surface-nets/example/2d.svg">

This module also works in 3D.  Here is an example:

```javascript
//TODO: Finish 3D example
```

And here is the result:

```
TODO: Finish example
```

4D and higher dimensions are possible, but harder to visualize

# Install

```
npm install surface-nets
```

# API

#### `require("surface-nets")(array[,level])`
Extracts the level set at `level` from `array` as a simplicial complex.

* `array` is an [ndarray](https://github.com/mikolalysenko/ndarray)
* `level` is an optional number which determines the level at which the levelset is evaluated (default `0`)

**Returns** An object with a pair of properties representing a simplicial complex:

* `positions` is an array encoding the positions of the vertices
* `cells` is an array encoding the cells of the simplicial complex as tuples of indices into the `position` array.

# Credits
(c) 2014 Mikola Lysenko. MIT License