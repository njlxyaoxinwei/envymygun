///// Tetrahedron Definition
/////
///// The Tetrahedron is centered at the origin
///// Side length is assumed to be 2

function Tetrahedron() {
  
  // CW if looking from the bottom
  var getRegularPolygonCoords = function(radius, n) {
    var theta = 2 * Math.PI / n;
    var result = [];
    for (var i = 0; i < n; i++) {
      result.push({
        x: Math.cos(theta * i) * radius,
        y: Math.sin(theta * i) * radius
      });
    }
    return result;
  };

  this.name = "tetrahedron";

  // vertices definition
  ////////////////////////////////////////////////////////////
  var l = 2 * Math.sqrt(6) / 4;
  var h = 2 * Math.sqrt(6) / 3;
  var r = 2 * Math.sqrt(3) / 3;
  var base = getRegularPolygonCoords(r, 3);

  this.vertices = new Float32Array([
    0.0, 0.0, l, // apex, 0
    base[0].x, base[0].y, l - h, // 1
    base[1].x, base[1].y, l - h, // 2
    base[2].x, base[2].y, l - h  // 3
  ]);

  // triangles definition
  ////////////////////////////////////////////////////////////
  // CW from outside
  this.triangleIndices = new Uint16Array([
    1, 2, 3,  // base
    0, 2, 1,
    0, 3, 2,
    0, 1, 3
  ]);

  this.numVertices = this.vertices.length/3;
  this.numTriangles = this.triangleIndices.length/3;
}
