function Character(gl, client) {
  
  this.client_ = client;
  this.gl_ = gl;

  this.params_ = {
    wheelTheta: 0.0,
    legTheta: 0.0,
    legAngle: 0.0,
    deltaWheelTheta: 0.025,
    legMaxAngle: 0.25,
  };

  this.prims_ = {
    cube: new Cube(),
    cylinder: new Cylinder(10),
    cone: new Cone(10),
    sphere: new Sphere(3),
    tetrahedron: new Tetrahedron()
  };

  for (name in this.prims_) {
    var p = this.prims_[name];
    this.client_.createObjectBuffers(gl, p);
  }
}


Character.prototype.draw = function(stack) {
  var client = this.client_;
  var gl = this.gl_;
  var prims = this.prims_;

  // Update State
  this.updateSelf_();


  // Body
  stack.push();
  stack.multiply(SglMat4.translation([0, 0.6, 0]));
  this.drawBody_(stack);
  stack.pop();



  // Wheel
  stack.push();
  stack.multiply(SglMat4.translation([0, 0.3, 0]));
  this.drawWheel_(stack);
  stack.pop();
};

Character.prototype.getForwardV = function() {
  var client = this.client_,
      frame = client.myFrame(),
      pos = client.myPos(),
      vel = client.myVelocity();
  var forwardLocal = [0, 0, -2],
      forward = SglVec3.normalize(
          SglVec3.sub(SglMat4.mul3(frame, forwardLocal), pos));
  var result = SglVec3.dot(vel, forward);
  return isNaN(result) ? 0 : result;
};


Character.prototype.updateSelf_ = function() {

  function zigzag(x) {
    if (x > Math.PI / 2 && x <= Math.PI * 3 / 2) {
      return 2 - 2 * x / Math.PI;
    } else if (x >= Math.PI * 3 / 2) {
      return 2 * x / Math.PI - 4;
    } else {
      return 2 * x / Math.PI;
    }
  }


  // Wheels
  var incr = this.params_.deltaWheelTheta * this.getForwardV();
  this.incrParamsAngle_('wheelTheta', incr);

  // Legs
  this.incrParamsAngle_('legTheta', incr * 2);
  var v = this.params_.legTheta,
      m = this.params_.legMaxAngle;

  this.params_.legAngle = m * zigzag(v);
};

// [0, 2Pi)
Character.prototype.incrParamsAngle_ = function(keyName, incr) {
  var v = this.params_[keyName];
  v = (v + incr) % (Math.PI * 2);
  if (v < 0)
    v = v + Math.PI * 2;
  this.params_[keyName] = v;
}

// 1 x 0.3 x 0.3
Character.prototype.drawWheel_ = function(stack) {
  var client = this.client_;
  var gl = this.gl_;
  var cylinder = this.prims_.cylinder;
  stack.multiply(SglMat4.rotationAngleAxis(sglDegToRad(90), [0, 0, 1]));
  stack.multiply(SglMat4.scaling([0.3, 1, 0.3]));
  stack.multiply(SglMat4.translation([0, -1, 0]));
  stack.multiply(SglMat4.rotationAngleAxis(
      this.params_.wheelTheta, [0, 1, 0]));

  gl.uniformMatrix4fv(
    client.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  client.drawObject(
      gl, cylinder, [0.51, 0.32, 0.0, 1.0], [0, 0, 0, 1.0]);
}


// Standing on the XZ-ground
Character.prototype.drawBody_ = function(stack) {
  var client = this.client_;
  var gl = this.gl_;
  var prims = this.prims_;

  // Legs
  stack.push();
  stack.multiply(SglMat4.translation([0.12, 0, 0]));
  this.drawLeg_(stack, this.params_.legAngle);
  stack.pop();
  stack.push();
  stack.multiply(SglMat4.translation([-0.12, 0, 0]));
  this.drawLeg_(stack, -this.params_.legAngle);
  stack.pop();
};

// Standing on XZ
Character.prototype.drawLeg_ = function(stack, angle) {
  var client = this.client_,
      gl     = this.gl_,
      cube   = this.prims_.cube;

  stack.push();
  stack.multiply(SglMat4.translation([0, 0.6 * Math.cos(angle), 0]));
  stack.multiply(SglMat4.rotationAngleAxis(angle, [1, 0, 0]));
  stack.multiply(SglMat4.translation([0, -0.3, 0]));
  stack.multiply(SglMat4.scaling([0.08, 0.3, 0.08]));
  gl.uniformMatrix4fv(
    client.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  client.drawObject(gl, cube, [0.8, 0.2, 0.2, 1.0], [0, 0, 0, 1.0]);
  stack.pop();
};
