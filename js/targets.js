function Target(client, gl) {
  this.client_ = client;
  this.gl_ = gl;

  this.params_ = {
    radius: 3,
    position: [10, 3, 10],
    color: [0.5, 0.5, 0.5, 1.0],
  };
  this.exploding = false;
  this.sphere = new Sphere(4);
  client.createObjectBuffers(gl, this.sphere);
}

Target.prototype.draw = function(stack) {
  var client      = this.client_,
      gl          = this.gl_,
      sphere      = this.sphere;

  var r = this.params_.radius;
  stack.push();
  stack.multiply(SglMat4.translation(this.params_.position));
  stack.multiply(SglMat4.scaling([r, r, r]));
  gl.uniformMatrix4fv(
    client.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  client.drawObject(gl, sphere, this.params_.color, [0, 0, 0, 1.0]);
  stack.pop();
};

Target.prototype.updateSelf = function() {
  if (this.exploding) {
    var gl = this.gl_
    var s = this.sphere;
    for (var i = 0; i < s.numTriangles; i++) {
      for (var j = 0; j < 3; j++) {
        for (var k = 0; k < 3; k++) {
          s.vertices[s.triangleIndices[i * 3 + j] * 3 + k] += 
              s.randvs[i][k] / 30;
        }
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, s.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, s.vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
};

Target.prototype.explode = function() {
  console.log("EXPLODE");
  this.exploding = true;
  var sphere = this.prepareExplosion_(this.sphere);
  this.client_.createObjectBuffers(this.gl_, sphere);
  this.sphere = sphere;
};

Target.prototype.checkHit = function(pos) {
  var l = SglVec3.length(SglVec3.sub(pos, this.params_.position));
  if (l < this.params_.radius) {
    return true;
  } else {
    return false;
  }
};


Target.prototype.prepareExplosion_ = function(sphere) {
  var result = {};
  result.numTriangles = sphere.numTriangles;
  result.numVertices = result.numTriangles * 3;
  result.triangleIndices = new Uint16Array(result.numVertices);
  for (var i = 0; i < result.numVertices; i++) {
    result.triangleIndices[i] = i;
  }
  result.vertices = new Float32Array(3 * result.numVertices);
  for (var i = 0; i < result.numTriangles; i++) {
    for (var j = 0; j < 3; j++) {
      var index = i * 9 + j * 3;
      var index2 = i * 3;
      for (var k = 0; k < 3; k++) {
        result.vertices[index + k] = 
            sphere.vertices[sphere.triangleIndices[index2 + j] * 3 + k];
      }
    }
  }
  result.randvs = new Array(result.numTriangles);
  for (var i = 0; i < result.numTriangles; i++) {
    result.randvs[i] = [Math.random(), Math.random(), Math.random()];
  }
  return result;
}
