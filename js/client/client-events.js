// Global NVMC Client: Events Handlers

var NVMCClient = NVMCClient || {};

NVMCClient.onInitialize = function() {
  var gl = this.ui.gl;
  NVMC.log("SpiderGL Version : " + SGL_VERSION_STRING + "\n");
  this.game.player.color = [1.0, 0.0, 0.0, 1.0];
  this.initMotionKeyHandlers();
  this.stack = new SglMatrixStack();
  this.initializeObjects(gl);
  this.initializeCameras();
  this.uniformShader = new uniformShader(gl);
  var that = this;
  setInterval(function(){
    console.log("forward");
    var f = SglVec3.normalize(SglMat4.mul3(that.myFrame(), [0, 0, 1]));
    console.log(f);
    var v = SglVec3.normalize(that.myVelocity());
    console.log("direction");
    console.log(v);
    console.log("dot");
    console.log(SglVec3.dot(f, v));
  }, 1000);
};

NVMCClient.onTerminate = function() {};

NVMCClient.onConnectionOpen = function() {
  NVMC.log("[Connection Open]");
};

NVMCClient.onConnectionError = function(err) {
  NVMC.log("[Connection Error] : " + err);
};

NVMCClient.onLogIn = function() {
  NVMC.log("[Logged In]");
};

NVMCClient.onLogOut = function() {
  NVMC.log("[Logged Out]");
};

NVMCClient.onNewRace = function(race) {
  NVMC.log("[New Race]");
};

NVMCClient.onPlayerJoin = function(id) {
  NVMC.log("[Player Join] : " + id);
  this.game.opponents[id].color = [0.0, 1.0, 0.0, 1.0];
};

NVMCClient.onPlayerLeave = function(id) {
  NVMC.log("[Player Leave] : " + id);
};

NVMCClient.onKeyDown = function(keyCode, event) {
  var carMotion = this.carMotionKey[keyCode];
  if (carMotion)
    carMotion(true);

  this.cameras[this.currentCamera].keyDown(keyCode);
};

NVMCClient.onKeyUp = function(keyCode, event) {
  var cameraSwitch = this.cameraSwitchKey[keyCode];
  if (cameraSwitch) {
    cameraSwitch();
    return;
  }

  var carMotion = this.carMotionKey[keyCode];
  if (carMotion)
    carMotion(false);

  this.cameras[this.currentCamera].keyUp(keyCode);
};

NVMCClient.onKeyPress = function(keyCode, event) {};

NVMCClient.onMouseButtonDown = function(button, x, y, event) {
  this.cameras[this.currentCamera].mouseButtonDown(x,y);
};

NVMCClient.onMouseButtonUp = function(button, x, y, event) {
  this.cameras[this.currentCamera].mouseButtonUp(x,y);
};

NVMCClient.onMouseMove = function(x, y, event) {
  this.cameras[this.currentCamera].mouseMove(x,y);
};

NVMCClient.onMouseWheel = function(delta, x, y, event) {};
NVMCClient.onClick = function(button, x, y, event) {};
NVMCClient.onDoubleClick = function(button, x, y, event) {};
NVMCClient.onDragStart = function(button, x, y) {};
NVMCClient.onDragEnd = function(button, x, y) {};
NVMCClient.onDrag = function(button, x, y) {};
NVMCClient.onResize = function(width, height, event) {};

NVMCClient.onAnimate = function(dt) {
  this.ui.postDrawEvent();
};

NVMCClient.onDraw = function() {
  var gl = this.ui.gl;
  this.drawScene(gl);
};
