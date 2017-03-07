'use strict';

class Effect {
  constructor(canvas, points) {
    this.canvas = canvas;
    this.points = [];
    this.choosePoints(points);
  }

  choosePoints(points) {
    var i = UTILS.getRandomInt(0, 20);
    while (i < points.length) {
      this.points.push(points[i]);
      i += UTILS.getRandomInt(10, 40);
    }
  }


}
