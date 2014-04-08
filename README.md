surface-nets
============
Extract a triangulated level set from an ndarray in any dimension.

# Example

```javascript
var surfaceNets = require("surface-nets")
var ndarray = require("ndarray")
var fill = require("ndarray-fill")

var array = ndarray(new Float32Array(32*32), [32,32])
fill(array, function(i,j) {
  return Math.pow(i-16,2) + Math.pow(j-16,2)
})

console.log(surfaceNets(array, 16*16))
```

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