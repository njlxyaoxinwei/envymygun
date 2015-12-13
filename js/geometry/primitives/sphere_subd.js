///// Sphere Definition
/////
///// The Sphere is centered at the origin
///// Radius is assumed to be 1

function Sphere(n) {

  this.name = "sphere";

  var r = 1;

  var scaleToNorm = function(r, p) {
    var normSquared = Math.pow(p.x, 2) + Math.pow(p.y, 2) + Math.pow(p.z, 2);
    var scale = r / Math.sqrt(normSquared);
    return {
      x: p.x * scale,
      y: p.y * scale,
      z: p.z * scale
    };
  };

  var getStringKey = function(a, b) {
    return (a < b) ? a + ";" + b : b + ";" + a;
  };

  var getMidPoint = function(map, i1, i2, arr) {
    var key = getStringKey(i1, i2);
    var index = map.get(key);
    if (index !== undefined) {
      return index;
    } else {
      var p1 = arr[i1], p2 = arr[i2];
      var p = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
        z: (p1.z + p2.z) / 2
      };
      index = arr.length;
      map.set(key, index);
      arr.push(scaleToNorm(r, p));
      return index;
    }
  };

  // Setting up octahedron

  var vertexArray = [
    {x: 0.0, y: 0.0, z: 1.0},
    {x: 1.0, y: 0.0, z: 0.0},
    {x: 0.0, y: 1.0, z: 0.0},
    {x: -1.0, y: 0.0, z: 0.0},
    {x: 0.0, y: -1.0, z: 0.0},
    {x: 0.0, y: 0.0, z: -1.0}
  ];

  var triangleArray = [
    [0, 2, 1],
    [0, 3, 2],
    [0, 4, 3],
    [0, 1, 4],
    [1, 2, 5],
    [2, 3, 5],
    [3, 4, 5],
    [4, 1, 5]
  ];
  var nTriangle = 8;
  var map =  new Map();
  for (var i = 0; i < n; i++) {
    map.clear();
    for (var j = 0; j < nTriangle; j++) {
      var is = triangleArray[j];
      var i1 = getMidPoint(map, is[0], is[1], vertexArray),
          i2 = getMidPoint(map, is[1], is[2], vertexArray),
          i3 = getMidPoint(map, is[2], is[0], vertexArray);
      triangleArray.push([i1, i2, i3]);
      triangleArray.push([i1, is[1], i2]);
      triangleArray.push([i3, i2, is[2]]);
      triangleArray[j][1] = i1;
      triangleArray[j][2] = i3;
    }
    nTriangle = triangleArray.length;
  }

  // Translate arrays into Typed Arrays
  this.numVertices = vertexArray.length;
  this.numTriangles = triangleArray.length;

  this.vertices = new Float32Array(3 * this.numVertices);
  for (var i = 0; i < this.numVertices; i++) {
    this.vertices[3 * i] = vertexArray[i].x;
    this.vertices[3 * i + 1] = vertexArray[i].y;
    this.vertices[3 * i + 2] = vertexArray[i].z;
  }
  this.triangleIndices = new Uint16Array(3 * this.numTriangles);
  for (var i = 0; i < this.numTriangles; i++) {
    this.triangleIndices[3 * i] = triangleArray[i][0];
    this.triangleIndices[3 * i + 1] = triangleArray[i][1];
    this.triangleIndices[3 * i + 2] = triangleArray[i][2];
  }
}
