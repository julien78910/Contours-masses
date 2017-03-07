'use strict';

class SprayEffect extends DefaultTool {
  constructor(canvas, cm) {
    super(canvas, cm);
    canvas.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
    canvas.addEventListener('touchmove', this.touchMoveHandler);

    this.ctx = canvas.getContext("2d");
    this.ctx.lineJoin = this.ctx.lineCap = 'round';

    //Change color and size
    this.ctx.fillStyle = "#33ccff";
    this.size = 50;

    this.cm = cm;
    this.canvas = canvas;
    this.parent = null;
    this.timeout = null;
    this.density = 100;
    this.points = [];
    this.clientX = 0;
    this.clientY = 0;
    this.tool = { getPoints: function() { return this.points }.bind(this) };
    this.started = false;
  }

  start() {
    this.timeout = setTimeout(function draw() {
      for (var i = this.density; --i; ) {
        var angle = UTILS.getRandomFloat(0, Math.PI * 2);
        var radius = UTILS.getRandomFloat(0, this.size);
        this.ctx.globalAlpha = Math.random();
        this.ctx.fillRect(
          this.clientX + radius * Math.cos(angle),
          this.clientY + radius * Math.sin(angle),
          UTILS.getRandomFloat(1, 3), UTILS.getRandomFloat(1, 3));
      }
      if (!this.timeout) return;
      this.timeout = setTimeout(draw.bind(this), 40);
    }.bind(this), 40);

    this.started = true;
  }

  mouseMoveHandler(e) {
    this.clientX = e.clientX;
    this.clientY = e.clientY;

    this.points.push({ 'x': e.clientX, 'y': e.clientY });

    if (!this.started) {
      this.start();
    }
  }

  touchMoveHandler(e) {
    e.preventDefault();
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    this.dispatchEvent(mouseEvent);
  }

  mouseUpHandler(e) {
    clearTimeout(this.timeout);
    super.mouseUpHandler(e);
  }

}
