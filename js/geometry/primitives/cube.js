///// CUBE DEFINTION
/////
///// Cube is defined to be centered at the origin of the coordinate reference system. 
///// Cube size is assumed to be 2.0 x 2.0 x 2.0 .
function Cube () {

	this.name = "cube";
	
	// vertices definition
	////////////////////////////////////////////////////////////
	
	this.vertices = new Float32Array([
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0
	]);

	// triangles definition
	////////////////////////////////////////////////////////////
	
	this.triangleIndices = new Uint16Array([
		0, 2, 1,  2, 3, 1,  // front
		5, 7, 4,  7, 6, 4,  // back
		4, 6, 0,  6, 2, 0,  // left
		1, 3, 5,  3, 7, 5,  // right
		2, 6, 3,  6, 7, 3,  // top
		4, 0, 5,  0, 1, 5   // bottom
	]);
	
	this.numVertices = this.vertices.length/3;
	this.numTriangles = this.triangleIndices.length/3;
	
}
