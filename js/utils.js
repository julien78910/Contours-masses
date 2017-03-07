
UTILS = {
  TOOLS: { ORIENTATION: 0, SOUND: 1, BLOW: 2, DEFAULT: 3 },
  INITIAL_COLOR: [96, 126, 198],
  INITIAL_SIZE: 300,
  BRUSH_INPUT_SIZE: ['2', '10', '5'],
  WATER_INPUT_SIZE: ['100', '1000', '300'],
  ID: 0,
  rgb: function(colorArray)  {
    return 'rgb(${colorArray.map(n => parseInt(n)).join(", ")})';
  },

  getRandomInt: function(min, max) {
    return min + Math.floor(Math.random() * (max - min));
  },

  getRandomFloat: function(min, max) {
    return min + Math.random() * (max - min);
  },

  getNewId: function() {
    return ++UTILS.ID;
  }
};
