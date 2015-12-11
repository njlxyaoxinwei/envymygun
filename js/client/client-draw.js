// Global NVMC Client: Rendering

var NVMCClient = NVMCClient || {};

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

  this.character.updateSelf();
  this.bullet.updateSelf();
  this.target.updateSelf();
  
  var stack = this.stack;
  stack.loadIdentity();
  this.cameras[this.currentCamera].setView(
      stack, this.myFrame(), this.character.getEyeCoord());

  // Draw Ground
  gl.uniformMatrix4fv(
      this.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  this.drawObject(gl, this.ground, [0.3, 0.7, 0.2, 1.0], [0, 0, 0, 1.0]);

  // Draw Character
  stack.push();
  stack.multiply(this.myFrame());
  this.character.draw(stack);
  stack.pop();

  // Draw Bullet
  stack.push();
  this.bullet.draw(stack);
  stack.pop();

  // Draw Target
  stack.push();
  this.target.draw(stack);
  stack.pop();
  
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

// NVMCClient.drawTree = function(gl) {
//   var stack = this.stack;

//   // Tree Top
//   stack.push();
//   var M_0_tra1 = SglMat4.translation([0, 0.8, 0]);
//   stack.multiply(M_0_tra1);
//   var M_0_sca = SglMat4.scaling([0.6, 1.65, 0.6]);
//   stack.multiply(M_0_sca);

//   gl.uniformMatrix4fv(
//       this.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
//   this.drawObject(gl, this.cone, [0.13, 0.62, 0.39, 1.0], [0, 0, 0, 1.0]);
//   stack.pop();

//   // Tree root
//   stack.push();
//   var M_1_sca = SglMat4.scaling([0.25, 0.4, 0.25]);
//   stack.multiply(M_1_sca);

//   gl.uniformMatrix4fv(
//       this.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
//   this.drawObject(gl, this.cylinder, [0.70, 0.56, 0.35, 1.0], [0, 0, 0, 1.0]);
//   stack.pop();
// };


