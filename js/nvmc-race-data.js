function rand() {
  return 190 * Math.random() - 95;
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

  trees : [
    {
      position : [rand(), 0, rand()],
      height   : 2 + 16 * Math.random(),
    },
    {
      position : [rand(), 0, rand()],
      height   : 2 + 16 * Math.random(),
    },
    {
      position : [rand(), 0, rand()],
      height   : 2 + 16 * Math.random(),
    },
    {
      position : [rand(), 0, rand()],
      height   : 2 + 16 * Math.random(),
    },
  ],

  buildings : [],
  weather : {
    sunLightDirection : [ 0.4, 1, 0.6 ],
    cloudDensity      : 0,
    rainStrength      : 0
  }
};
