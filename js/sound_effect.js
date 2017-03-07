'use strict';

class SoundEffect extends DefaultTool {
  constructor(canvas, cm) {
    super(canvas, cm);

    this.points = [];
    this.tool = new WaterColor(canvas);

    //Change size and color of the pen
    this.tool.color = [ 255, 51, 102 ];
    this.tool.size = 50;

    //Change size and color of the effect
    this.color = [ 255, 153, 255 ];
    this.size = 10000000;
  }

  mouseUpHandler(e) {
    super.mouseUpHandler(e);
    if (!this.parent) return;

    var c = this.cm.addPieceCanvas();

    this.selectPoints();
    this.cm.canvas[this.parent.id].push(c);
    c.style.pointerEvents = 'none';
    this.canvas = c;

    this.audio = new Audio(this.processSound.bind(this));
  }


  processSound(level) {
    //console.log("lvl: ", level);
    if (level < 0.1)
      return;

    var i = UTILS.getRandomInt(0, this.points.length - 1);
    var p = this.points.splice(i, 1)[0];
    var size = Math.floor(level * 5000);

    const breadthFirst = new BreadthFirst({
      canvas: this.canvas,
      color: [ 255, 153, 255 ],
      pos: [ p.x, p.y ],
      size: size,
      cells: this.cells
    });

    this.audio.pause(1000);

    if (this.points.length == 0) {
      this.stop();
      this.cm.currentTool = null;
    }
  }

  stop() {
    this.audio.stop();
  }

  selectPoints() {
    var i = UTILS.getRandomInt(0, 20);
    var points = this.tool.getPoints();
    while (i < points.length) {
      this.points.push(points[i]);
      i += UTILS.getRandomInt(20, 40);
    }
  }

}
