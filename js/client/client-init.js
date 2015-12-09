// Global NVMC Client: Initializers

var NVMCClient = NVMCClient || {};

NVMCClient.myPos = function() {
  return this.game.state.players.me.dynamicState.position;
}
NVMCClient.myOri = function() {
  return this.game.state.players.me.dynamicState.orientation;
}

NVMCClient.myFrame = function() {
  return this.game.state.players.me.dynamicState.frame;
}

NVMCClient.myVelocity = function() {
  return this.game.state.players.me.dynamicState.linearVelocity;
}

NVMCClient.initializeCameras = function() {
  this.cameras = CreateAllCameras();
  this.n_cameras = this.cameras.length;
  this.currentCamera = 0;

  var client = this;
  this.cameraSwitchKey = {
    1: function() {
      if (0 < client.currentCamera)
        client.currentCamera--;
    },
    2: function() {
      if (client.n_cameras - 1 > client.currentCamera)
        client.currentCamera++;
    }
  };
};

NVMCClient.initMotionKeyHandlers = function() {
  var game = this.game;
  this.carMotionKey = {
    W: function(on) {
      game.playerAccelerate = on;
    },
    S: function(on) {
      game.playerBrake = on;
    },
    A: function(on) {
      game.playerSteerLeft = on;
    },
    D: function(on) {
      game.playerSteerRight = on;
    }
  };
};

NVMCClient.initializeObjects = function(gl) {
  this.createObjects();
  this.createBuffers(gl);
};

NVMCClient.createObjects = function() {
  // Primitives
  this.cube = new Cube();
  this.cylinder = new Cylinder(10);
  this.cone = new Cone(10);
  this.sphere = new Sphere(4);

  // Track
  this.track = new Track(this.game.race.track);

  // Ground
  var bbox = this.game.race.bbox;
  var groundLevel = bbox[1] - 0.01
  this.ground = new Quadrilateral([
    bbox[0], groundLevel, bbox[2],
    bbox[3], groundLevel, bbox[2],
    bbox[3], groundLevel, bbox[5],
    bbox[0], groundLevel, bbox[5]
  ]);

  // Buildings
  this.buildings = [];
  this.game.race.buildings.forEach(function(b) {
    this.buildings.push(new Building(b));
  }, this);
};

NVMCClient.createBuffers = function(gl) {
  this.createObjectBuffers(gl, this.cube);
  this.createObjectBuffers(gl, this.cylinder);
  this.createObjectBuffers(gl, this.cone);
  this.createObjectBuffers(gl, this.sphere);
  this.createObjectBuffers(gl, this.track);
  this.createObjectBuffers(gl, this.ground);
  this.buildings.forEach(function(b) {
    this.createObjectBuffers(gl, b);
  }, this);
};

NVMCClient.createObjectBuffers = function(gl, obj) {
  // Vertices
  obj.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Triangle Vertex Index
  obj.indexBufferTriangles = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.triangleIndices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // Edges
  var edges = new Uint16Array(obj.numTriangles * 6);
  for (var i = 0; i < obj.numTriangles; i++) {
    edges[i * 6 + 0] = obj.triangleIndices[i * 3 + 0];
    edges[i * 6 + 1] = obj.triangleIndices[i * 3 + 1];
    edges[i * 6 + 2] = obj.triangleIndices[i * 3 + 0];
    edges[i * 6 + 3] = obj.triangleIndices[i * 3 + 2];
    edges[i * 6 + 4] = obj.triangleIndices[i * 3 + 1];
    edges[i * 6 + 5] = obj.triangleIndices[i * 3 + 2];
  }
  obj.indexBufferEdges = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};
