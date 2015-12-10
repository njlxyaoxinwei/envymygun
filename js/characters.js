function Character(gl, client) {
  
  this.client_ = client;
  this.gl_ = gl;

  this.params_ = {
    wheelTheta: 0,
    deltaWheelTheta: 0.05
  };

  this.prims_ = {
    cube: new Cube(),
    cylinder: new Cylinder(10),
    cone: new Cone(10),
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
    this.drawWheel_(stack);
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
      client.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  client.drawObject(gl, prims.cube, [0.8, 0.2, 0.2, 1.0], [0, 0, 0, 1.0]);
  stack.pop();
};

Character.prototype.drawWheel_ = function(stack) {

  var client = this.client_;
  var gl = this.gl_;
  var prims = this.prims_;

  stack.push();
  var M_3_sca = SglMat4.scaling([0.05, 0.3, 0.3]);
  stack.multiply(M_3_sca);
  var M_3_rot = SglMat4.rotationAngleAxis(sglDegToRad(90), [0, 0, 1]);
  stack.multiply(M_3_rot);
  var M_3_tra = SglMat4.translation([0, -1, 0]);
  stack.multiply(M_3_tra);

  gl.uniformMatrix4fv(
      client.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  client.drawObject(gl, prims.cylinder, [0.8, 0.2, 0.2, 1.0], [0, 0, 0, 1.0]);
  stack.pop();    
};

