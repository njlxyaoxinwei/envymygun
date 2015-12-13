function Target(client, gl, spline) {
  this.client_ = client;
  this.gl_ = gl;
  this.spline_ = spline;

  this.params_ = {
    radius: 2,
    speed: 1 / 10,
    progress: 0,
    position: spline.f(0),
    color: [0.0, 1.0, 0.0, 1.0],
  };
  this.exploding = false;
  this.fail = 0;
  this.sphere = new Sphere(2);
  client.createObjectBuffers(gl, this.sphere);
}

Target.prototype.draw = function(stack) {
  var client      = this.client_,
      gl          = this.gl_,
      sphere      = this.sphere;

  var r = this.params_.radius * (1 - this.fail);
  stack.push();
  stack.multiply(SglMat4.translation(this.params_.position));
  stack.multiply(SglMat4.scaling([r, r, r]));
  client.drawObject(gl, sphere, this.params_.color, stack.matrix);
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
              s.randvs[i][k];
        }
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, s.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, s.vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  } else if (this.params_.progress < 1) {
      this.params_.progress += this.params_.speed / this.spline_.arclength;
      if (this.params_.progress > 1)
        this.params_.progress = 1;
      this.params_.position = 
          this.spline_.getPointFromPercentage(this.params_.progress);

      this.params_.color = 
          [this.params_.progress, 1 - this.params_.progress, 0.0, 1.0];
  } else if (this.fail < 1) {
    this.fail += 0.01;
    if (this.fail >=1) {
      NVMC.log("\nTarget Missed!\n[GAME OVER]");
    }
  }
};

Target.prototype.explode = function() {
  this.exploding = true;
  var sphere = this.prepareExplosion_(this.sphere);
  this.client_.createObjectBuffers(this.gl_, sphere);
  this.sphere = sphere;
};

Target.prototype.checkHit = function(pos) {
  var l = SglVec3.length(SglVec3.sub(pos, this.params_.position));
  if (l < this.params_.radius * (1 - this.fail)) {
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
  var t = 
      this.spline_.findTFromS(this.spline_.arclength * this.params_.progress);
  for (var i = 0; i < result.numTriangles; i++) {
    result.randvs[i] = SglVec3.add(
      [Math.random() / 30, Math.random() / 30, Math.random() / 30],
      SglVec3.muls(SglVec3.normalize(this.spline_.dfdt(t)), this.params_.speed)
    );
  }
  return result;
};

Target.prototype.getPosition = function() {
  return this.params_.position;
};

Target.prototype.getDirection = function() {
  var t =
      this.spline_.findTFromS(this.spline_.arclength * this.params_.progress);
  return SglVec3.normalize(this.spline_.dfdt(t));
}
