const UTILITY = {
  INITIAL_COLOR: [255, 76, 104],
  INITIAL_SIZE: 300,
  BRUSH_INPUT_SIZE: ['2', '10', '5'],
  WATER_INPUT_SIZE: ['100', '1000', '300'],
  rgb: (colorArray) => {
    return `rgb(${colorArray.map(n => parseInt(n)).join(", ")})`;
  }

  getRandomInt: (min, max) => {
    return min + Math.floor(Math.random() * (max - min));
  }

  getRandomFloat: (min, max) => {
    return min + Math.random() * (max - min);
  }
};
