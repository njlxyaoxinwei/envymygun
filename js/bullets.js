function Bullet(character, client, gl) {
  this.character_ = character;
  this.client_ = client;
  this.gl_ = gl;

  this.params_ = {
    sideLength: 0.2,
    maxSideLength: 0.2,
    minSideLength: 0.1,
    theta: 0.0,
    deltaT: 0.05,
    velocity: 0,
    shot: false,
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
  stack.multiply(this.client_.myFrame());
  stack.multiply(this.character_.getBulletFrame());
  stack.multiply(SglMat4.rotationAngleAxis(this.params_.theta, [0, 0, 1]));
  stack.multiply(SglMat4.scaling([ratio, ratio, ratio]));
  gl.uniformMatrix4fv(
    client.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  client.drawObject(gl, tetrahedron, this.params_.color, [0, 0, 0, 1.0]);
  stack.pop();
};


Bullet.prototype.updateSelf = function() {
  var p = this.params_;
  p.theta = (p.theta + p.deltaT) % (Math.PI * 2);
  var d = p.maxSideLength - p.minSideLength;
  p.sideLength = Math.abs(Math.cos(p.theta) * d) + p.minSideLength;
};
