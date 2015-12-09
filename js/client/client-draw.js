// Global NVMC Client: Rendering

var NVMCClient = NVMCClient || {};

var CharacterParams = {
  wheelTheta: 0,
  deltaWheelTheta: 0.005,
};

NVMCClient.drawScene = function(gl) {
  var width  = this.ui.width,
      height = this.ui.height,
      ratio  = width / height;

  gl.viewport(0, 0, width, height);

  // Clear framebuffer
  gl.clearColor(0.4, 0.6, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(this.uniformShader);

  // Projection Matrix
  var P = this.cameras[this.currentCamera].getProjectionMatrix(
      ratio, this.game.race.bbox);
  gl.uniformMatrix4fv(this.uniformShader.uProjectionMatrixLocation, false, P);
  
  var stack = this.stack;
  stack.loadIdentity();
  this.cameras[this.currentCamera].setView(stack, this.myFrame());

  // Draw Car
  stack.push();
  stack.multiply(this.myFrame());
  this.drawCar(gl);
  stack.pop();

  // Draw Trees
  var trees = this.game.race.trees;
  for (var i = 0; i < trees.length; i++) {
    var t = trees[i];
    stack.push();
    stack.multiply(SglMat4.translation(t.position));
    this.drawTree(gl);
    stack.pop();
  }

  // Draw Everything Else
  gl.uniformMatrix4fv(
      this.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  this.drawObject(gl, this.track, [0.9, 0.8, 0.7, 1.0], [0, 0, 0, 1.0]);
  this.drawObject(gl, this.ground, [0.3, 0.7, 0.2, 1.0], [0, 0, 0, 1.0]);
  for (var i = 0; i < this.buildings.length; i++) {
    this.drawObject(gl, this.buildings[i], 
        [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1.0]);
  }

  gl.useProgram(null);
  gl.disable(gl.DEPTH_TEST);
};

NVMCClient.drawObject = function(gl, obj, fillColor, lineColor) {
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.enableVertexAttribArray(this.uniformShader.aPositionIndex);
  gl.vertexAttribPointer(
      this.uniformShader.aPositionIndex, 3, gl.FLOAT, false, 0, 0);

  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
  gl.uniform4fv(this.uniformShader.uColorLocation, fillColor);
  gl.drawElements(
      gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

  gl.disable(gl.POLYGON_OFFSET_FILL);

  gl.uniform4fv(this.uniformShader.uColorLocation, lineColor);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
  gl.drawElements(
      gl.LINES, obj.numTriangles * 6, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  gl.disableVertexAttribArray(this.uniformShader.aPositionIndex);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

NVMCClient.drawTree = function(gl) {
  var stack = this.stack;

  // Tree Top
  stack.push();
  var M_0_tra1 = SglMat4.translation([0, 0.8, 0]);
  stack.multiply(M_0_tra1);
  var M_0_sca = SglMat4.scaling([0.6, 1.65, 0.6]);
  stack.multiply(M_0_sca);

  gl.uniformMatrix4fv(
      this.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  this.drawObject(gl, this.cone, [0.13, 0.62, 0.39, 1.0], [0, 0, 0, 1.0]);
  stack.pop();

  // Tree root
  stack.push();
  var M_1_sca = SglMat4.scaling([0.25, 0.4, 0.25]);
  stack.multiply(M_1_sca);

  gl.uniformMatrix4fv(
      this.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  this.drawObject(gl, this.cylinder, [0.70, 0.56, 0.35, 1.0], [0, 0, 0, 1.0]);
  stack.pop();
};

NVMCClient.drawCar = function(gl) {
  var stack = this.stack;

  // Wheels
  var translations = [
    [ 1, 0.3,  1.4],
    [-1, 0.3,  1.4],
    [-1, 0.3, -1.6],
    [ 1, 0.3, -1.6]
  ];
  for (var i = 0; i < translations.length; i++) {
    stack.push();
    var M = SglMat4.translation(translations[i]);
    stack.multiply(M);
    this.drawWheel(gl);
    stack.pop();
  }

  // Chasis
  stack.push();
  var M_2_tra_0 = SglMat4.translation([0, 0.3, 0]);
  stack.multiply(M_2_tra_0);
  var M_2_sca = SglMat4.scaling([1, 0.25, 2]);
  stack.multiply(M_2_sca);
  var M_2_tra_1 = SglMat4.translation([0, 1, 0]);
  stack.multiply(M_2_tra_1);

  gl.uniformMatrix4fv(
      this.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  this.drawObject(gl, this.cube, [0.8, 0.2, 0.2, 1.0], [0, 0, 0, 1.0]);
  stack.pop();
};

NVMCClient.drawWheel = function(gl) {
  var stack = this.stack;

  stack.push();
  var M_3_sca = SglMat4.scaling([0.05, 0.3, 0.3]);
  stack.multiply(M_3_sca);
  var M_3_rot = SglMat4.rotationAngleAxis(sglDegToRad(90), [0, 0, 1]);
  stack.multiply(M_3_rot);
  var M_3_tra = SglMat4.translation([0, -1, 0]);
  stack.multiply(M_3_tra);

  var forward_v = SglVec3.dot(
      this.myVelocity(),
      SglVec3.normalize(SglVec3.sub(SglMat4.mul3(this.myFrame(), [0, 0, -10]), this.myPos())));
  if (!isNaN(forward_v)) {
    console.log(forward_v);
    CharacterParams.wheelTheta += CharacterParams.deltaWheelTheta * forward_v;
    if (CharacterParams.wheelTheta > 2 * Math.PI) {
      CharacterParams.wheelTheta -= 2 * Math.PI;
    } else if (CharacterParams.wheelTheta < 0) {
      CharacterParams.wheelTheta += 2 * Math.PI;
    }
  }
  var M_3_rot2 = SglMat4.rotationAngleAxis(CharacterParams.wheelTheta, [0, 1, 0]);
  stack.multiply(M_3_rot2);

  gl.uniformMatrix4fv(
      this.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  this.drawObject(gl, this.cylinder, [0.8, 0.2, 0.2, 1.0], [0, 0, 0, 1.0]);
  stack.pop();    
};
