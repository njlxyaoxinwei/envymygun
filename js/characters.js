function Character(gl, client) {
  
  this.client_ = client;
  this.gl_ = gl;

  this.params_ = {
    wheel: {
      theta: 0.0,
      deltaT: 0.025,
      radius: 0.3,
      length: 1,
      color: [0.51, 0.32, 0.0, 1.0],
    },
    leg: {
      angle: 0.0,
      t: 0.0,
      deltaT: 0.05,
      maxAngle: 0.25,
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
      t: 0.0,
      deltaT: 0.0125,
      maxAngle: 0.15,
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
      minTV: -0.1,
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
    T: function(on) { that.params_.gun.turningUp = on; },
    G: function(on) { that.params_.gun.turningDown = on; },
    F: function(on) { that.params_.gun.turningLeft = on; },
    H: function(on) { that.params_.gun.turningRight = on; },
  };

  this.prims_ = {
    cube: new Cube(),
    cylinder: new Cylinder(20),
    cone: new Cone(20),
    sphere: new Sphere(4),
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
  var radius = this.params_.wheel.radius;
  stack.push();
  stack.multiply(SglMat4.translation([0, radius, 0]));
  this.drawWheel_(stack);
  accHeight += 2 * radius;
  stack.pop();

  // Body
  var diffHeight = this.getBodySink_();
  accHeight -= diffHeight;
  stack.push();
  stack.multiply(SglMat4.translation([0, accHeight, 0]));
  this.drawBody_(stack);
  stack.pop();
};

Character.prototype.getBodySink_ = function() {
  var psi = Math.atan(2 * Math.sin(this.params_.leg.angle));
  return this.params_.wheel.radius * (1 - Math.cos(psi));
};

Character.prototype.getLegSink_ = function() {
  return this.params_.leg.length * (1 - Math.cos(this.params_.leg.angle));
}

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

  var f = this.getForwardV();
  // Wheel
  var incr = this.params_.wheel.deltaT * f;
  this.incrParamsAngle_(this.params_.wheel, 'theta', incr);

  // Legs
  var incr1 = this.params_.leg.deltaT * f;
  this.incrParamsAngle_(this.params_.leg, 't', incr1)
  var v1 = this.params_.leg.t;
      m1 = this.params_.leg.maxAngle;
  this.params_.leg.angle = m1 * zigzag(v1);

  // Left arm
  var incr2 = this.params_.leftArm.deltaT * f;
  this.incrParamsAngle_(this.params_.leftArm, 't', incr2);
  var v2 = this.params_.leftArm.t,
      m2 = this.params_.leftArm.maxAngle;
  this.params_.leftArm.angle = m2 * zigzag(v2);

  // Gun
  var p = this.params_.gun;
  if (p.turningLeft) {
    this.incrParamsAngleInRange_(p, 'thetaH', p.deltaT, [p.minTH, p.maxTH]);
  }
  if (p.turningRight) {
    this.incrParamsAngleInRange_(p, 'thetaH', -p.deltaT, [p.minTH, p.maxTH]);
  }
  if (p.turningUp) {
    this.incrParamsAngleInRange_(p, 'thetaV', p.deltaT, [p.minTV, p.maxTV]);
  }
  if (p.turningDown) {
    this.incrParamsAngleInRange_(p, 'thetaV', -p.deltaT, [p.minTV, p.maxTV]);
  }

};

// Normalize to [0, 2Pi)
Character.prototype.incrParamsAngle_ = function(p, keyName, inc) {
  var v = p[keyName];
  v = (v + inc) % (Math.PI * 2);
  if (v < 0)
    v = v + Math.PI * 2;
  p[keyName] = v;
};

// Clip to range
Character.prototype.incrParamsAngleInRange_ = function(p, keyName, inc, range) {
  var v = p[keyName] + inc;
  if (range !== undefined) {
    if (v > range[1])
      v = range[1];
    else if (v < range[0])
      v = range[0];
  };
  p[keyName] = v;
}

// Centered at origin, lying along X.
Character.prototype.drawWheel_ = function(stack) {
  var client = this.client_;
  var gl = this.gl_;
  var cylinder = this.prims_.cylinder;
  var radius = this.params_.wheel.radius,
      length = this.params_.wheel.length,
      theta  = this.params_.wheel.theta,
      color  = this.params_.wheel.color;

  stack.multiply(SglMat4.rotationAngleAxis(sglDegToRad(90), [0, 0, 1]));
  stack.multiply(SglMat4.scaling([radius, length, radius]));
  stack.multiply(SglMat4.translation([0, -1, 0]));
  stack.multiply(SglMat4.rotationAngleAxis(theta, [0, 1, 0]));

  client.drawObject(gl, cylinder, color, stack.matrix);
}


// Standing on the XZ-ground
Character.prototype.drawBody_ = function(stack) {
  var client = this.client_;
  var gl = this.gl_;
  var accHeight = 0;

  // Legs
  var legP = this.params_.leg;
  stack.push();
  stack.multiply(SglMat4.translation([legP.spaceBetween / 2, 0, 0]));
  this.drawLeg_(stack, legP.angle);
  stack.pop();
  stack.push();
  stack.multiply(SglMat4.translation([-legP.spaceBetween / 2, 0, 0]));
  this.drawLeg_(stack, -legP.angle);
  stack.pop();
  accHeight += legP.length - this.getLegSink_();

  // Torso
  var torsoP = this.params_.torso;
  stack.push();
  stack.multiply(SglMat4.translation([0, accHeight, 0]));
  this.drawTorso_(stack);
  stack.pop();
  accHeight += torsoP.height;

  // Left Arm
  var armP = this.params_.leftArm,
      offset = armP.shoulderOffsetX - torsoP.width / 2,
      halfH = armP.sideLength / 2;
  stack.push();
  stack.multiply(SglMat4.translation([offset, accHeight - halfH, 0]));
  this.drawArm_(stack);
  stack.pop();

  // Gun
  var gunP = this.params_.gun,
      radius = gunP.radius,
      offset = torsoP.width / 2 - gunP.shoulderOffsetX;
  stack.push();
  stack.multiply(SglMat4.translation([offset, accHeight - radius, 0]));
  stack.multiply(SglMat4.rotationAngleAxis(gunP.thetaV, [1, 0, 0]));
  stack.multiply(SglMat4.rotationAngleAxis(gunP.thetaH, [0, 1, 0]));
  this.drawGun_(stack);
  stack.pop();

  // Head
  stack.push();
  stack.multiply(SglMat4.translation([0, accHeight, 0]));
  this.drawHead_(stack);
  stack.pop();
};

// Standing on XZ
Character.prototype.drawLeg_ = function(stack, angle) {
  var client = this.client_,
      gl     = this.gl_,
      cube   = this.prims_.cube,
      p      = this.params_.leg;

  var height = p.length - this.getLegSink_(),
      halfL  = p.length / 2,
      halfS  = p.sideLength / 2;

  stack.push();
  stack.multiply(SglMat4.translation([0, height, 0]));
  stack.multiply(SglMat4.rotationAngleAxis(angle, [1, 0, 0]));
  stack.multiply(SglMat4.translation([0, -halfL, 0]));
  stack.multiply(SglMat4.scaling([halfS, halfL, halfS]));
  client.drawObject(gl, cube, p.color, stack.matrix);
  stack.pop();
};

// Standing on XZ
Character.prototype.drawTorso_ = function(stack) {
  var client = this.client_,
      gl     = this.gl_,
      cube   = this.prims_.cube,
      p      = this.params_.torso;

  var halfH = p.height / 2,
      halfW = p.width / 2,
      halfT = p.thickness / 2;
  stack.push();
  stack.multiply(SglMat4.translation([0, halfH, 0]));
  stack.multiply(SglMat4.scaling([halfW, halfH, halfT]));
  client.drawObject(gl, cube, p.color, stack.matrix);
  stack.pop();
};

// halved by XZ, along X- from the origin
Character.prototype.drawArm_ = function(stack) {
  var client = this.client_,
      gl     = this.gl_,
      cube   = this.prims_.cube,
      p      = this.params_.leftArm;

  var halfL = p.length / 2,
      halfS = p.sideLength / 2;  
  stack.push();
  stack.multiply(SglMat4.rotationAngleAxis(p.angle, [0, 0, 1]));
  stack.multiply(SglMat4.translation([-halfL, 0, 0]))
  stack.multiply(SglMat4.scaling([halfL, halfS, halfS]));
  client.drawObject(gl, cube, p.color, stack.matrix);
  stack.pop();
}

// Standing on XZ
Character.prototype.drawHead_ = function(stack) {
  var client = this.client_,
      gl     = this.gl_,
      sphere = this.prims_.sphere,
      p      = this.params_.head;

  stack.push();
  stack.multiply(SglMat4.translation([0, p.radius, 0]));
  stack.multiply(SglMat4.scaling([p.radius, p.radius, p.radius]));
  client.drawObject(gl, sphere, p.color, stack.matrix);
  stack.pop();
};

// halved by XZ, lying on Z- from the origin
Character.prototype.drawGun_ = function(stack) {
  var client   = this.client_,
      gl       = this.gl_,
      cylinder = this.prims_.cylinder,
      p        = this.params_.gun;

  var radius = p.radius,
      halfL  = p.length / 2;
  stack.push();
  stack.multiply(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1, 0, 0]));
  stack.multiply(SglMat4.scaling([radius, halfL, radius]));
  client.drawObject(gl, cylinder, p.color, stack.matrix);
  stack.pop();
};

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
  var p = this.params_;
  var sink = this.getLegSink_() + this.getBodySink_();
  var h = p.leg.length + p.wheel.radius * 2 + p.torso.height + p.head.radius;
  h -= sink;
  return [0, h, 0.7];
};

Character.prototype.getEyeAngle = function() {
  return this.params_.gun.thetaV / 2 ;
};

Character.prototype.getGunBottomCenterCoord_ = function() {
  var p = this.params_;
  var result = [
    p.torso.width / 2 - p.gun.shoulderOffsetX,
    this.getEyeCoord()[1] - p.head.radius - p.gun.radius,
    0
  ]; 
  return result;
};

Character.prototype.getBulletFrame = function() {
  var base = this.getGunBottomCenterCoord_();
  var p = this.params_;
  var M0 = SglMat4.translation(base),
      M1 = SglMat4.rotationAngleAxis(p.gun.thetaV, [1, 0, 0]),
      M2 = SglMat4.rotationAngleAxis(p.gun.thetaH, [0, 1, 0]),
      M3 = SglMat4.translation([0, 0, -p.gun.length]),
      M4 = SglMat4.rotationAngleAxis(sglDegToRad(180), [1, 0, 0]);
  var M = 
      SglMat4.mul(M0, SglMat4.mul(M1, SglMat4.mul(M2, SglMat4.mul(M3, M4))));
  return M;
}
