/* Cameras
  0. First-person Camera
  1. BirdView Camera
  2. Chase Camera
  3. Bullet Camera
  4. Photographer Camera
*/

function CreateAllCameras() {
  return [
    new FirstPersonCamera(),
    new BulletCamera(),
    new BirdViewCamera(),
    new ChaseCamera(),
    new PhotographerCamera(),
  ];  
}

function BulletCamera() {
  this.position = [0.0, 0.0, 0.0];
  this.keyDown         = function() {};
  this.keyUp           = function() {};
  this.mouseMove       = function() {};
  this.mouseButtonDown = function() {};
  this.mouseButtonUp   = function() {};

  this.getProjectionMatrix = function(ratio, bbox) {
    return SglMat4.perspective(Math.PI / 4, ratio, 0.1, 200);
  };

  this.setView = function(stack, carFrame, opt) {
    var V_0 = opt.bullet.getFrame();
    this.position = SglMat4.col(V_0, 3);
    var invV = SglMat4.inverse(V_0);
    stack.multiply(invV);
  };
}

function ChaseCamera() {
  this.position = [0.0, 0.0, 0.0];
  this.keyDown         = function() {};
  this.keyUp           = function() {};
  this.mouseMove       = function() {};
  this.mouseButtonDown = function() {};
  this.mouseButtonUp   = function() {};

  this.getProjectionMatrix = function(ratio, bbox) {
    return SglMat4.perspective(Math.PI / 4, ratio, 1, 200);
  };

  this.setView = function(stack, carFrame, opt) {
    var Rx = SglMat4.rotationAngleAxis(
        sglDegToRad(-10) + opt.character.getEyeAngle(), [1.0, 0.0, 0.0]);
    var T  = SglMat4.translation([0.0, 2.5, 4.5]);
    var V_0 = SglMat4.mul(carFrame, SglMat4.mul(T, Rx));
    this.position = SglMat4.col(V_0, 3);
    var invV = SglMat4.inverse(V_0);
    stack.multiply(invV);
  };
}

function FirstPersonCamera() {
  this.position = [0.0, 0.0, 0.0];
  this.keyDown         = function() {};
  this.keyUp           = function() {};
  this.mouseMove       = function() {};
  this.mouseButtonDown = function() {};
  this.mouseButtonUp   = function() {};

  this.getProjectionMatrix = function(ratio, bbox) {
    return SglMat4.perspective(Math.PI/4, ratio, 1, 200);
  };

  this.setView = function(stack, carFrame, opt) {
    var R   = SglMat4.rotationAngleAxis(
        opt.character.getEyeAngle(), [1.0, 0.0, 0.0]);
    var T   = SglMat4.translation(opt.character.getEyeCoord());
    var V_0 = SglMat4.mul(carFrame, SglMat4.mul(T, R));
    this.position = SglMat4.col(V_0, 3);
    var invV = SglMat4.inverse(V_0);
    stack.multiply(invV);
  };
}

function BirdViewCamera() {
  this.position = [0, 20, 0];
  this.keyDown         = function() {};
  this.keyUp           = function() {};
  this.mouseMove       = function() {};
  this.mouseButtonDown = function() {};
  this.mouseButtonUp   = function() {};

  this.getProjectionMatrix = function(ratio, bbox) {
    var winH = bbox[5] - bbox[2];
    winW = ratio * winH;
    return SglMat4.ortho(
      [-winW / 2, -winH / 2, 0.0],
      [winW / 2, winH / 2, 21.0]
    );
  };

  this.setView = function(stack, carFrame) {
    stack.multiply(SglMat4.lookAt([0, 20, 0], [0, 0, 0], [1, 0, 0]));
  };
}

function PhotographerCamera() {
  this.position = [0, 0, 3];
  this.orientation = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  this.t_V = [0, 0, 0];
  this.orienting_view = false;
  this.lockToCar = false;
  this.start_x = 0;
  this.start_y = 0;

  var me = this;
  this.handleKey = {};
  this.handleKey["R"] = function() {me.t_V = [0, 0.1, 0];};
  this.handleKey["V"] = function() {me.t_V = [0, -0.1, 0];};
  this.handleKey["L"] = function() {me.lockToCar= true;};
  this.handleKey["U"] = function() {me.lockToCar= false;};

  this.keyUp = function() {};
  
  this.keyDown = function(keyCode) {
    if (this.handleKey[keyCode])
      this.handleKey[keyCode](true);
  };

  this.mouseMove = function(x,y) {
    if (!this.orienting_view) return;

    var alpha = (x - this.start_x)/10.0;
    var beta  = -(y - this.start_y)/10.0;
    this.start_x = x;
    this.start_y = y;

    var R_alpha = SglMat4.rotationAngleAxis(sglDegToRad( alpha  ), [0, 1, 0]);
    var R_beta = SglMat4.rotationAngleAxis(sglDegToRad (beta  ), [1, 0, 0]);
    this.orientation = SglMat4.mul(
        SglMat4.mul(R_alpha, this.orientation), R_beta);
  };

  this.mouseButtonDown = function(x,y) {
    if (!this.lock_to_car) {
      this.orienting_view = true;
      this.start_x = x;
      this.start_y = y;
    }
  };

  this.mouseButtonUp = function() {
    this.orienting_view = false;
  };

  this.updatePosition = function(t_V) {
    this.position = SglVec3.add(
        this.position, SglMat4.mul3(this.orientation, t_V));
    if (this.position[1] > 2) this.position[1] = 2;
    if (this.position[1] < 0.5) this.position[1] = 0.5;
  };


  this.getProjectionMatrix = function(ratio, bbox) {
    return SglMat4.perspective(Math.PI / 4, ratio, 1, 200);
  };

  this.setView = function (stack, carFrame) {
    this.updatePosition (this.t_V);
    var car_position = SglMat4.col(carFrame,3);
    var invV;
    if (this.lockToCar)
      invV = SglMat4.lookAt(this.position, car_position, [0, 1, 0]);
    else
      invV = SglMat4.lookAt(
        this.position, 
        SglVec3.sub(this.position, SglMat4.col(this.orientation, 2)), 
        SglMat4.col(this.orientation, 1)
      );
    stack.multiply(invV);
  };
};
