function Character(gl, client) {
  
  this.client_ = client;
  this.gl_ = gl;

  this.params_ = {
    wheelTheta: 0.0,
    legTheta: 0.0,
    leftArmTheta: 0.0,
    leftArmAngle: 0.0,
    legAngle: 0.0,
    deltaWheelTheta: 0.025,
    legMaxAngle: 0.25,
    leftArmMaxAngle: 0.15,
    gunThetaHorizontal: 0.0,
    gunThetaVertical: 0.0,
    deltaGunTheta: 0.01,
    gunMaxThetaHorizontal: 0.5,
    gunMaxThetaVertical: 0.5,
    gunTurningLeft: false,
    gunTurningRight: false,
    gunTurningUp: false,
    gunTurningDown: false,
  };

  this.params = {
    wheel: {
      theta: 0.0,
      deltaT: 0.025,
      radius: 0.3,
      length: 2,
      color: [0.51, 0.32, 0.0, 1.0],
    },
    leg: {
      theta: 0.0,
      deltaT: 0.05,
      maxT: 0.25,
      sideLength: 0.16,
      length: 0.6,
      spaceBetween: 0.24,
      color: [0.8, 0.2, 0.2, 1.0],
    },
    torso: {
      height: 0.6,
      width: 0.6,
      thickness: 0.3,
      color: [0.8, 0.15, 0.15, 1.0],
    },
    leftArm: {
      theta: 0.0,
      deltaT: 0.0125,
      maxT: 0.15,
      sideLength: 0.14,
      length: 0.8,
      shoulderOffsetX: 0.1,
      color: [0.8, 0.2, 0.2, 1.0],
    },
    gun: {
      thetaH: 0.0,
      thetaV: 0.0,
      deltaT: 0.01,
      maxTH: 0.5,
      minTH: -0.5,
      maxTV: 0.5,
      minTV: 0.0,
      turningLeft: false,
      turningRight: false,
      turningUp: false,
      turningDown: false,
      radius: 0.1,
      length: 0.8,
      shoulderOffsetX: 0.0,
      color: [0.9, 0.05, 0.05, 1.0],
    },
    head: {
      radius: 0.2,
      color: [0.8, 0.1, 0.1, 1.0],
    },
  };

  var that = this;
  this.keyHandler_ = {
    T: function(on) {
      that.params_.gunTurningUp  = on;
    },
    G: function(on) {
      that.params_.gunTurningDown = on;
    },
    F: function(on) {
      that.params_.gunTurningLeft = on;
    },
    H: function(on) {
      that.params_.gunTurningRight = on;
    },
  };

  this.prims_ = {
    cube: new Cube(),
    cylinder: new Cylinder(10),
    cone: new Cone(10),
    sphere: new Sphere(2),
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
  var accHeight = 0;

  // Wheel
  stack.push();
  stack.multiply(SglMat4.translation([0, 0.3, 0]));
  accHeight += this.drawWheel_(stack);
  stack.pop();

  // Body
  var psi = Math.atan(2 * Math.sin(this.params_.legAngle)),
      diffHeight = 0.3 * (1 - Math.cos(psi));
  stack.push();
  stack.multiply(SglMat4.translation([0, accHeight - diffHeight, 0]));
  accHeight = accHeight + this.drawBody_(stack) - diffHeight;
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


Character.prototype.updateSelf = function() {

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

  // Left arm
  this.incrParamsAngle_('leftArmTheta', incr / 2);
  var v = this.params_.leftArmTheta,
      m = this.params_.leftArmMaxAngle;
  this.params_.leftArmAngle = m * zigzag(v);

  // Gun
  if (this.params_.gunTurningLeft) {
    this.aimHorizontal(false);
  }
  if (this.params_.gunTurningRight) {
    this.aimHorizontal(true);
  }
  if (this.params_.gunTurningUp) {
    this.aimVertical(true);
  }
  if (this.params_.gunTurningDown) {
    this.aimVertical(false);
  }

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
  return 0.6;
}


// Standing on the XZ-ground
Character.prototype.drawBody_ = function(stack) {
  var client = this.client_;
  var gl = this.gl_;
  var prims = this.prims_;
  var accHeight = 0;

  // Legs
  stack.push();
  stack.multiply(SglMat4.translation([0.12, 0, 0]));
  accHeight += this.drawLeg_(stack, this.params_.legAngle);
  stack.pop();
  stack.push();
  stack.multiply(SglMat4.translation([-0.12, 0, 0]));
  this.drawLeg_(stack, -this.params_.legAngle);
  stack.pop();

  // Torso
  stack.push();
  stack.multiply(SglMat4.translation([0, accHeight, 0]));
  accHeight += this.drawTorso_(stack);
  stack.pop();

  // Left Arm
  stack.push();
  stack.multiply(SglMat4.translation([-0.2, accHeight - 0.07, 0]));
  this.drawArm_(stack);
  stack.pop();

  // Gun
  stack.push();
  stack.multiply(SglMat4.translation([0.3, accHeight - 0.1, 0]));
  stack.multiply(
      SglMat4.rotationAngleAxis(this.params_.gunThetaVertical, [1, 0, 0]));
  stack.multiply(
      SglMat4.rotationAngleAxis(this.params_.gunThetaHorizontal, [0, 1, 0]));
  this.drawGun_(stack);
  stack.pop();

  // Head
  stack.push();
  stack.multiply(SglMat4.translation([0, accHeight, 0]));
  accHeight += this.drawHead_(stack);
  stack.pop();

  return accHeight;
};

// Standing on XZ
Character.prototype.drawLeg_ = function(stack, angle) {
  var client = this.client_,
      gl     = this.gl_,
      cube   = this.prims_.cube;

  var height = 0.6 * Math.cos(angle);

  stack.push();
  stack.multiply(SglMat4.translation([0, height, 0]));
  stack.multiply(SglMat4.rotationAngleAxis(angle, [1, 0, 0]));
  stack.multiply(SglMat4.translation([0, -0.3, 0]));
  stack.multiply(SglMat4.scaling([0.08, 0.3, 0.08]));
  gl.uniformMatrix4fv(
    client.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  client.drawObject(gl, cube, [0.8, 0.2, 0.2, 1.0], [0, 0, 0, 1.0]);
  stack.pop();
  return height;
};

// Standing on XZ
Character.prototype.drawTorso_ = function(stack) {
  var client = this.client_,
      gl     = this.gl_,
      cube   = this.prims_.cube;

  var height = 0.6;
  stack.push();
  stack.multiply(SglMat4.translation([0, height / 2, 0]));
  stack.multiply(SglMat4.scaling([0.3, height / 2, 0.15]));
  gl.uniformMatrix4fv(
    client.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  client.drawObject(gl, cube, [0.8, 0.15, 0.15, 1.0], [0, 0, 0, 1.0]);
  stack.pop();
  return height;
};

// halved by XZ, along X-
Character.prototype.drawArm_ = function(stack) {
  var client = this.client_,
      gl     = this.gl_,
      cube   = this.prims_.cube,
      angle  = this.params_.leftArmAngle;

  stack.push();
  stack.multiply(SglMat4.rotationAngleAxis(angle, [0, 0, 1]));
  stack.multiply(SglMat4.translation([-0.4, 0, 0]))
  stack.multiply(SglMat4.scaling([0.4, 0.07, 0.07]));
  gl.uniformMatrix4fv(
    client.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  client.drawObject(gl, cube, [0.8, 0.2, 0.2, 1.0], [0, 0, 0, 1.0]);
  stack.pop();
}

// Standing on XZ
Character.prototype.drawHead_ = function(stack) {
  var client = this.client_,
      gl     = this.gl_,
      sphere = this.prims_.sphere;
  var height = 0.4;
  stack.push();
  stack.multiply(SglMat4.translation([0, height / 2, 0]));
  stack.multiply(SglMat4.scaling([height / 2, height / 2, height / 2]));
  gl.uniformMatrix4fv(
    client.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  client.drawObject(gl, sphere, [0.8, 0.1, 0.1, 1.0], [0, 0, 0, 1.0]);
  stack.pop();
  return height;
};

// halved by XZ, lying on Z-
Character.prototype.drawGun_ = function(stack) {
  var client   = this.client_,
      gl       = this.gl_,
      cylinder = this.prims_.cylinder;

  stack.push();
  stack.multiply(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1, 0, 0]));
  stack.multiply(SglMat4.scaling([0.1, 0.4, 0.1]));
  gl.uniformMatrix4fv(
    client.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  client.drawObject(gl, cylinder, [0.9, 0.05, 0.05, 1.0], [0, 0, 0, 1.0]);
  stack.pop();

  // Bullet
  stack.push();
  stack.multiply(SglMat4.translation([0, 0, -0.82]));
  this.drawBullet_(stack);
  stack.pop();
};

Character.prototype.drawBullet_ = function(stack) {
  var client      = this.client_,
      gl          = this.gl_,
      tetrahedron = this.prims_.tetrahedron;

  stack.push();
  stack.multiply(SglMat4.rotationAngleAxis(sglDegToRad(180), [1, 0, 0]));
  stack.multiply(SglMat4.scaling([0.09, 0.09, 0.09]));
  gl.uniformMatrix4fv(
    client.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  client.drawObject(gl, tetrahedron, [1.0, 0, 0, 1.0], [0, 0, 0, 1.0]);
  stack.pop();
};

Character.prototype.aimHorizontal = function(right) {
  var e = right ? -1 : 1;
  var v = this.params_.gunThetaHorizontal + e * this.params_.deltaGunTheta,
      m = this.params_.gunMaxThetaHorizontal;
  if (v > m)
    v = m;
  if (v < -m)
    v = -m;
  this.params_.gunThetaHorizontal = v;
};

Character.prototype.aimVertical = function(up) {
  var e = up ? 1 : -1;
  var v = this.params_.gunThetaVertical + e * this.params_.deltaGunTheta,
      m = this.params_.gunMaxThetaVertical;
  if (v > m)
    v = m;
  if (v < 0)
    v = 0;
  this.params_.gunThetaVertical = v;
}


Character.prototype.keyDown = function(keyCode) {
  var f = this.keyHandler_[keyCode];
  if (f)
    f(true);
}

Character.prototype.keyUp = function(keyCode) { 
  var f = this.keyHandler_[keyCode];
  if (f)
    f(false);
};

Character.prototype.getEyeCoord = function() {
  var psi = Math.atan(2 * Math.sin(this.params_.legAngle)),
      diffHeight = 0.3 * (1 - Math.cos(psi));
  var h = 0.6 + 0.6 * Math.cos(this.params_.legAngle) + 0.8 - diffHeight;
  return [0, h, 0.7];
};
