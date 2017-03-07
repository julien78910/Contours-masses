'use strict';

class ContourMass {
  /**
  * ContourMass constructor
  * parameter:
  *   -shape: An Img element that will be cut in several random pieces.
  *   -container: A div element that will contain all the canvas.
  */
  constructor(shape, container) {
    this.shape = shape;
    this.pieces = [];
    this.container = container;
  }

  function cutShape() {
    var min = 40;
    var max = 100;
    var shapeHeight = this.shape.height;
    var shapewidth = this.shape.width;
    var startY = 0;
    var i = 0;

    while (startY < shapeHeight) {
      var height = UTILS.getRandomInt(min, max);

      //Check if there is enough space for one more piece.
      //If not, the current piece will take all the space left.
      if (startY + height + min > shapeHeight)
        height = shapeHeight - startY;

      var startX = 0;
      this.pieces.push([]);
      while (startX < this.width) {
        var width = UTILS.getRandomInt(min, max);

        //Check if there is enough space for one more piece.
        //If not, the current piece will take all the space left.
        if (startX + width + min > shapewidth)
          width = shapewidth - startX;

        var piece = createPiece(startX, startY, width, height);
        this.pieces[i].push(piece);

        startX += width;
      }
      ++i;
      startY += height;
    }
  }

  function createPiece(x, y, w, h) {
    var c = document.createElement("canvas");

    c.setAttribute("id", getNewId());
    c.width = w;
    c.height = h;
    c.getContext("2d").drawImage(this.shape, x, y, w, h, 0, 0, w, h);
    c.onmousedown = mouseDown;
    c.addEventListener("touchstart", touchStart, false);

    return c;
  }

  function drawPiecesRandom() {
    for (var i = 0; i < this.pieces.length; ++i) {
      for (var j = 0; j < this.pieces[i].length; j++) {
        var c = this.pieces[i][j];
        var x = 0;
        var y = 0;

        do {
          x = UTILS.getRandomInt(this.viewXOffset, this.viewWidth - c.width);
          y = UTILS.getRandomInt(this.viewYOffset, this.viewHeight - c.height);
        } while (!isEmptyArea(x, y, c.width, c.height));

        c.style.position = "absolute";
        c.style.top = pos.y + "px";
        c.style.left = pos.x + "px";
        this.container.appendChild(c);
      }
    }
  }

  //Check if the given coordinate with the given size is not over a shape piece.
  function isEmptyArea(x, y, width, height) {
    for (var i = 0; i < this.pieces.length; ++i) {
      for (var j = 0; j < this.pieces[i].length; ++j) {
        var c = this.pieces[i][j];

        if (x + width < c.offsetLeft || x > c.offsetLeft + c.width ||
            y + height < c.offsetTop || y > c.offsetTop + c.height)
            continue;

        return false;
      }
    }
    return true;
  }
}
