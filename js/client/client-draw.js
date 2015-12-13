// Global NVMC Client: Rendering

var NVMCClient = NVMCClient || {};

NVMCClient.drawScene = function(gl) {
  var width  = this.ui.width,
      height = this.ui.height,
      ratio  = width / height;

  this.character.updateSelf();
  this.bullet.updateSelf();
  this.target.updateSelf();
  this.updateSun(this.target.params_.progress);

  gl.viewport(0, 0, width, height);

  // Clear framebuffer
  gl.clearColor(this.skyColor[0], this.skyColor[1], this.skyColor[2], 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(this.lambertianShader);

  // Projection Matrix
  var P = this.cameras[this.currentCamera].getProjectionMatrix(
      ratio, this.game.race.bbox);


  
  var stack = this.stack;
  stack.loadIdentity();
  this.cameras[this.currentCamera].setView(stack, this.myFrame(), {
    character: this.character,
    bullet: this.bullet,
    target: this.target,
  });

  // Shared values in shader
  this.sunLightDirectionViewSpace = SglVec4.normalize(SglMat4.mul(this.stack.matrix, SglVec3.to4(this.sunDirection, 0)));
  gl.uniform4fv(this.lambertianShader.uLightDirectionLocation, this.sunLightDirectionViewSpace);
  gl.uniform3fv(this.lambertianShader.uLightColorLocation, this.sunColor);
  gl.uniformMatrix4fv(this.lambertianShader.uProjectionMatrixLocation, false, P);

  // Draw Ground
  this.drawObject(gl, this.ground, [0.3, 0.7, 0.2, 1.0], stack.matrix);

  // Draw Trees
  var trees = this.game.race.trees;
  var n = this.lastControlTreeIndex;
  for (var i = 0; i < trees.length; i++) {
    stack.push();
    var M_8 = SglMat4.translation(trees[i].position);
    stack.multiply(M_8);
    if (i % 3 == 0) {
      this.drawTree(gl, trees[i], [i / n, 1 - i / n, 0, 1.0]);
    } else {
      this.drawTree(gl, trees[i], [0.13, 0.62, 0.39, 1.0])
    }
    stack.pop();
  }


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

NVMCClient.drawObject = function(gl, obj, fillColor, matrix) {
  var shader = this.lambertianShader;

  // Vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.enableVertexAttribArray(shader.aPositionIndex);
  gl.vertexAttribPointer(
      shader.aPositionIndex, 3, gl.FLOAT, false, 0, 0);

  // Normals
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
  gl.enableVertexAttribArray(shader.aNormalIndex);
  gl.vertexAttribPointer(shader.aNormalIndex, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix3fv(shader.uViewSpaceNormalMatrixLocation, false, SglMat4.inverseTranspose33(matrix));

  // Transformation
  gl.uniformMatrix4fv(shader.uModelViewMatrixLocation, false, matrix);

  // Color
  gl.uniform4fv(shader.uColorLocation, fillColor);


  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
  gl.drawElements(
      gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

  gl.disable(gl.POLYGON_OFFSET_FILL);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  gl.disableVertexAttribArray(shader.aPositionIndex);
  gl.disableVertexAttribArray(shader.aNormalIndex);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

NVMCClient.drawTree = function(gl, t, color) {
  var stack = this.stack;

  // Tree Top
  stack.push();
  var M_0_tra1 = SglMat4.translation([0, t.height - 2, 0]);
  stack.multiply(M_0_tra1);
  var M_0_sca = SglMat4.scaling([3, 1, 3]);
  stack.multiply(M_0_sca);

  this.drawObject(gl, this.cone, color, stack.matrix);
  stack.pop();

  // Tree root
  stack.push();
  var M_1_sca = SglMat4.scaling([0.25, t.height / 2 - 1, 0.25]);
  stack.multiply(M_1_sca);

  this.drawObject(gl, this.cylinder, [0.70, 0.56, 0.35, 1.0], stack.matrix);
  stack.pop();
};


NVMCClient.updateSun = function(p) {
  var angle = p * Math.PI;
  var d = [-Math.cos(angle), -Math.sin(angle), -Math.cos(angle)];
  this.sunDirection = SglVec3.normalize(d);
  var e = Math.abs(p - 0.5) / 0.5;
  var orange = [1.0, 0.5, 0.0];
  var white = [1.0, 1.0, 1.0];
  var color = orange.map(function(ov, i) {
    var wv = white[i];
    return ov * e + wv * (1 - e);
  });
  this.sunColor = color;
  this.skyColor = [0.4 * (1-e), 0.6 * (1-e), 0.8 * (1-e)];
};


