'use strict';

class BlowEffect extends Effect {
  constructor(canvas, points) {
    super(canvas, points);
    this.color = UTILS.INITIAL_COLOR;
    this.points =  points[Math.floor(points.length / 2)];

    this.audio = new Audio(this.processSound.bind(this));
  }

  processSound(lvl) {
    if (lvl < 0.3)
      return;

    var size = Math.floor(UTILS.getRandomInt(3000, 6000) * lvl);

    const breadthFirst = new BreadthFirst({
      canvas: this.canvas,
      color: [ 96, 126, 198 ],
      pos: [ this.points.x, this.points.y ],
      size: size,
      cells: this.cells
    });

    this.stop();
  }

  stop() {
    this.audio.stop();
  }
}
