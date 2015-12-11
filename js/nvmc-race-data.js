NVMC.DefaultRace = {
  startPosition : [ 0,0,0 ],

  bbox : [ -100, 0, -100, 100, 10, 100 ],

  track : {
    leftCurb : [],
    rightCurb : [],
  },

  tunnels : [],

  arealigths : [],

  lamps : [],

  trees : [
    {
      position : [-50, 0, 50],
      height   : 5,
    },
    {
      position : [50, 0, 50],
      height   : 3,
    },
    {
      position : [-50, 0, -50],
      height   : 7,
    },
    {
      position : [50, 0, -50],
      height   : 9,
    },
  ],

  buildings : [],
  weather : {
    sunLightDirection : [ 0.4, 1, 0.6 ],
    cloudDensity      : 0,
    rainStrength      : 0
  }
};
