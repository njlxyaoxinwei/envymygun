function randTree() {
  function randC() {
    return 190 * Math.random() - 95;
  }
  var r = 2, h = 20;
  return {
    position: [randC(), 0, randC()],
    height: r + (h - 2 * r) * Math.random()
  };
}

function getNtrees(n) {
  var result = new Array(n);
  for (var i = 0; i < n; i++) {
    result[i] = randTree();
  }
  return result;
}

NVMC.DefaultRace = {
  startPosition : [ 0,0,0 ],

  bbox : [ -100, 0, -100, 100, 20, 100 ],

  track : {
    leftCurb : [],
    rightCurb : [],
  },

  tunnels : [],

  arealigths : [],

  lamps : [],

  trees : getNtrees(20),

  buildings : [],
  weather : {
    sunLightDirection : [ 0.4, 1, 0.6 ],
    cloudDensity      : 0,
    rainStrength      : 0
  }
};
