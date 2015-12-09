/* Cameras
  0. Chase Camera
  1. BirdView Camera
*/

function CreateAllCameras() {
  return [
    new ChaseCamera(),
    new BirdViewCamera(),
  ];  
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

  this.setView = function(stack, carFrame) {
    var Rx = SglMat4.rotationAngleAxis(sglDegToRad(-15), [1.0, 0.0, 0.0]);
    var T  = SglMat4.translation([0.0, 2.5, 4.5]);
    var V_0 = SglMat4.mul(carFrame, SglMat4.mul(T, Rx));
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
