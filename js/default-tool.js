'use strict';

class DefaultTool {
  constructor(canvas, cm) {
    canvas.addEventListener('mouseup', this.mouseUpHandler.bind(this));
    canvas.addEventListener('touchend', this.touchEndHandler);
    this.cm = cm;
    this.canvas = canvas;
    this.parent = null;
    this.tool = { getPoints: function() {return [];}};
  }



  mouseUpHandler(e) {
    var points = this.tool.getPoints();
    var i = 0;
    var parent = null;
    var mid = Math.floor(points.length / 2);

    while (!parent && i < mid) {
      var p = points[mid + i];
      parent = this.cm.foundCanvas(p.x, p.y);
      if (!parent) {
        p = points[mid - i];
        parent = this.cm.foundCanvas(p.x, p.y);
      }
      ++i;
    }

    if (!parent) {
      this.cm.container.removeChild(this.canvas);
      return;
    }

    this.parent = parent;
    this.canvas.style.pointerEvents = "none";
    this.cm.canvas[parent.id].push(this.canvas);

  }

  touchEndHandler(e) {
    var mouseEvent = new MouseEvent("mouseup", {});
    this.dispatchEvent(mouseEvent);
  }

  stop() {

  }
}
