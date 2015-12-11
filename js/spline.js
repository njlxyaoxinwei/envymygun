function BezierSpline(p0, p1, p2, p3) {
  this.dt_ = 0.001;
  this.controlPoints = [
    p0, p1, p2, p3
  ];
  this.table = this.getArclengthTable();
  this.arclength = this.table[this.table.length - 1][1];
}

BezierSpline.prototype.f = function(t) {
  if (t < 0 || t > 1) {
    throw 'Bezier Error : parameter outside [0,1]'
  }
  var es = [
    Math.pow(1 - t, 3),
    3 * Math.pow(1 - t, 2) * t,
    3 * (1 - t) * Math.pow(t, 2),
    Math.pow(t, 3)
  ];
  var qs = es.map(function(e, i) {
    return SglVec3.muls(this.controlPoints[i], e);
  }, this);
  var result = qs.reduce(function(acc, v) {
    return SglVec3.add(acc, v);
  }, SglVec3.zero());
  return result;
};

BezierSpline.prototype.dfdt = function(t) {
  if (t < 0 || t > 1) {
    throw 'Bezier Error : parameter outside [0,1]'
  }
  var es = [
    3 * Math.pow(1 - t, 2),
    6 * (1 - t) * t,
    3 * Math.pow(t, 2),
  ];
  var qs = es.map(function(e, i) {
    var d = SglVec3.sub(this.controlPoints[i + 1], this.controlPoints[i]);
    return SglVec3.muls(d, e);
  }, this);
  var result = qs.reduce(function(acc, v) {
    return SglVec3.add(acc, v);
  }, SglVec3.zero());
  return result;
};

BezierSpline.prototype.dsdt = function(t) {
  if (t < 0 || t > 1) {
    throw 'Bezier Error : parameter outside [0,1]'
  }
  var temp = this.dfdt(t).map(function(x) { return Math.pow(x, 2); });
  return Math.sqrt(temp[0] + temp[1] + temp[2]);
};

BezierSpline.prototype.getArclengthTable = function() {
  var dt = this.dt_;
  var table = [[0, 0]];
  var acc = 0;
  for (var t = 0; t + dt <= 1; t += dt) {
    var ds = this.dsdt(t + dt / 2) * dt;
    acc += ds;
    table.push([t + dt, acc]);
  }
  if (t <= 1) {
    var ds = this.dsdt(t + (1 - t) / 2) * (1 - t);
    acc += ds;
    table.push([1, acc]);
  }
  return table;
};

BezierSpline.prototype.findTFromS = function(s) {
  if (s >= this.arclength) {
    return 1;
  }
  var table = this.table;
  for (var i = 0; table[i][1] <= s; i++)
    ;
  var s1 = table[i-1][1],
      t1 = table[i-1][0],
      s2 = table[i][1],
      t2 = table[i][0];
  if (s1 == s2) {
    return (t1 + t2) / 2;
  } else {
    var a = (s2 - s) / (s2 - s1);
    return a * t1 + (1 - a) * t2;
  }
}
