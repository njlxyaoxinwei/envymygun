function Bullet(character, client, gl, bbox) {
  this.character_ = character;
  this.client_ = client;
  this.gl_ = gl;
  this.bbox_ = bbox;

  this.params_ = {
    sideLength: 0.2,
    maxSideLength: 0.2,
    minSideLength: 0.1,
    theta: 0.0,
    deltaT: 0.05,
    velocity: 0.5,
    shot: false,
    position: [0, 0, 0],
    color: [1.0, 0, 0, 1.0],
  };

  this.tetrahedron = new Tetrahedron();
  client.createObjectBuffers(gl, this.tetrahedron);
}

Bullet.prototype.draw = function(stack) {
  var client      = this.client_,
      gl          = this.gl_,
      tetrahedron = this.tetrahedron;

  var ratio = this.params_.sideLength / 2;
  stack.push();
  if (!this.params_.shot) {  
    stack.multiply(this.client_.myFrame());
    stack.multiply(this.character_.getBulletFrame());
  } else {
    stack.multiply(this.M_);
    stack.multiply(SglMat4.translation(this.params_.position));
  }
  stack.multiply(SglMat4.rotationAngleAxis(this.params_.theta, [0, 0, 1]));
  stack.multiply(SglMat4.scaling([ratio, ratio, ratio]));
  gl.uniformMatrix4fv(
    client.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  client.drawObject(gl, tetrahedron, this.params_.color, [0, 0, 0, 1.0]);
  stack.pop();
};

Bullet.prototype.shoot_ = function() {
  var M = SglMat4.mul(this.client_.myFrame(), this.character_.getBulletFrame());
  this.params_.shot = true;
  this.params_.sideLength *= 2;
  this.params_.deltaT *= 2;
  this.params_.color = [0, 0, 1.0, 1.0];
  var characterV = SglMat4.mul3(
      SglMat4.inverse(M), 
      SglVec3.add(
          this.client_.myVelocity(),
          SglMat4.mul3(M, [0, 0, 0]))).map(function(n) {
      return isNaN(n) ? 0 : n / 60;
  })
  this.velocity_ = SglVec3.add(characterV, [0,0,this.params_.velocity]);
  this.M_ = M;
};

Bullet.prototype.updateSelf = function() {
  var p = this.params_;
  p.theta = (p.theta + p.deltaT) % (Math.PI * 2);
  var d = p.maxSideLength - p.minSideLength;
  p.sideLength = Math.abs(Math.cos(p.theta) * d) + p.minSideLength;
  if (this.params_.shot) {
    p.position = SglVec3.add(p.position, this.velocity_);
    if (this.isOutOfBound_())
      this.reset();
  }
};

Bullet.prototype.isOutOfBound_ = function() {
  var coord = SglMat4.mul3(this.M_, this.params_.position);
  var xmin = this.bbox_[0],
      xmax = this.bbox_[3],
      ymin = this.bbox_[1],
      ymax = this.bbox_[4],
      zmin = this.bbox_[2],
      zmax = this.bbox_[5];
  if (coord[0] <= xmin || coord[0] >=xmax || 
      coord[2] >= zmax || coord[2] <=zmin || 
      coord[1] <= ymin || coord[1] >=ymax) {
    return true;
  } else {
    return false;
  }
};

Bullet.prototype.reset = function() {
  this.M_ = null;
  this.velocity_ = null;
  this.params_.color = [1.0, 0, 0, 1.0];
  this.params_.shot = false;
  this.params_.position = [0, 0, 0];
  this.params_.sideLength /= 2;
  this.params_.deltaT /= 2;
};

Bullet.prototype.keyUp = function(keyCode) {
  if (keyCode == ' ' && !this.params_.shot) {
    this.shoot_();
  }
}
