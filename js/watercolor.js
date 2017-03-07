'use strict';

class WaterColor {
  constructor(canvas) {
    this.canvas = canvas;
    this.color = UTILS.INITIAL_COLOR;
    this.size = 50;
    this.points = [];
    this.ctx = this.canvas.getContext("2d");

    //this.colorChangeHandler();
    //this.sizeChangeHandler

    this.canvas.addEventListener('mousemove', this.dragHandler.bind(this));
    this.canvas.addEventListener('touchmove', this.touchMoveHandler);
  }

  getPoints() {
    return this.points;
  }


  sizeChangeHandler() {
    this.sizeInput = document.getElementById('size');
    this.sizeInput.addEventListener('change', (e) => {
      this.size = parseInt(e.target.value);
      this.ctx.lineWidth = this.size;
    });
  }

  colorChangeHandler() {
    const colorInput = document.getElementById('color');
    colorInput.addEventListener('change', (e) => {
      this.color = e.target.style.backgroundColor.match(/\d+/g).map((n) => parseInt(n));
      this.ctx.strokeStyle = UTILS.rgb(this.color);
    });
  }


  waterColorDrop(e) {
    const breadthFirst = new BreadthFirst({
      canvas: this.canvas,
      color: this.color,
      pos: [e.offsetX, e.offsetY],
      size: this.size,
      cells: this.cells
    });
    this.points.push({ "x": e.offsetX, "y": e.offsetY });
  }


  dragHandler(e) {
    this.waterColorDrop(e);
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

}
