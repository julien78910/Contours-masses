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
    this.done = [];
    this.canvas = {};
    this.container = container;
    this.viewXOffset = 100;
    this.viewYOffset = 100;
    this.startX = 400;
    this.startY = 300;
    this.tool = UTILS.TOOLS.DEFAULT;
    this.currentTool = null;
    this.container.onmousedown = this.mouseDownHandler.bind(this);
    this.container.addEventListener("touchstart", this.touchStartHandler, false);
  }

  start() {
    this.cutShape();
    this.drawPiecesRandom();
  }

  cutShape() {
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
      while (startX < shapewidth) {
        var width = UTILS.getRandomInt(min, max);

        //Check if there is enough space for one more piece.
        //If not, the current piece will take all the space left.
        if (startX + width + min > shapewidth)
          width = shapewidth - startX;

        var piece = this.createPiece(startX, startY, width, height);
        this.pieces[i].push(piece);
        this.container.appendChild(piece);

        startX += width;
      }
      ++i;
      startY += height;
    }
  }

  createPiece(x, y, w, h) {
    var p = document.createElement("canvas");
    var id = UTILS.getNewId();

    //canvas property
    p.width = w;
    p.height = h;
    p.style.position = "absolute";
    p.style.left = (this.shape.offsetLeft + x) + "px";
    p.style.top = (this.shape.offsetTop + y) + "px";
    p.className += "canvas-test";
    p.getContext("2d").drawImage(this.shape, x, y, w, h, 0, 0, w, h);
    p.setAttribute("id", id);

    //canvas events
    p.onmousedown = this.mouseDownHandler.bind(this);
    p.addEventListener("touchstart", this.touchStartHandler, false);

    this.canvas[id] = [];

    if (this.isCanvasEmpty(p))
      p.style.pointerEvents = "none";

    return p;
  }

  drawPiecesRandom() {
    for (var i = 0; i < this.pieces.length; ++i) {
      for (var j = 0; j < this.pieces[i].length; j++) {
        var c = this.pieces[i][j];
        var x = 0;
        var y = 0;

        do {
          x = UTILS.getRandomInt(this.viewXOffset, this.container.offsetWidth - 2 * this.viewXOffset - c.width);
          y = UTILS.getRandomInt(this.viewYOffset, this.container.offsetHeight - 2 * this.viewYOffset - c.height);
        } while (!this.isEmptyArea(x, y, c.width, c.height));

        c.style.top = y + "px";
        c.style.left = x + "px";
        this.done.push({ "left": x, "top": y, "width": c.width, "height": c.height });
      }
    }
  }

  //Check if the given coordinate with the given size is not over a shape piece.
  isEmptyArea(x, y, width, height) {
    for (var i = 0; i < this.done.length; ++i) {
      var c = this.done[i];

      if (x + width < c.left || x > c.left + c.width ||
          y + height < c.top || y > c.top + c.height)
          continue;

      return false;
    }
    return true;
  }

  canvasContain(c, x, y) {
    return x < c.offsetLeft + c.width && x > c.offsetLeft
          && y < c.offsetTop + c.height && y > c.offsetTop;
  }

  isCanvasEmpty(canvas) {
    var c = document.createElement("canvas");
    c.height = canvas.height;
    c.width = canvas.width;

    return c.toDataURL() == canvas.toDataURL();
  }

  rebuild(link) {
    var offsetTop = 0;

    for (var i = 0; i < this.pieces.length; ++i) {
      var offsetLeft = 0;
      var height = 0;

      for (var j = 0; j < this.pieces[i].length; ++j) {
        var p = this.pieces[i][j];

        for (var k = 0; k < this.canvas[p.id].length; k++) {
          var c = this.canvas[p.id][k];

          c.style.top = this.startY + offsetTop - p.offsetTop + "px";
          c.style.left = this.startX + offsetLeft - p.offsetLeft + "px";
          c.left = this.startX + offsetLeft - p.offsetLeft;
          c.top = this.startY + offsetTop - p.offsetTop;
        }
        offsetLeft += p.width;
        height = p.height;
        this.container.removeChild(p);
      }
      offsetTop += height;
    }

    this.createFinalImgAndSave(link);
  }

  createFinalImgAndSave() {
    var c = document.createElement("canvas");
    c.width = this.container.offsetWidth;
    c.height = this.container.offsetHeight;
    c.style.position = "absolute";
    c.style.top = "0px";
    c.style.left = "0px";

    var ctx = c.getContext("2d");

    for (var id in this.canvas) {
      for (var j = 0; j < this.canvas[id].length; j++) {
        var canvas = this.canvas[id][j];
        ctx.drawImage(canvas, canvas.left, canvas.top);
      }
    }

    var d = new Date();

    $.ajax({
      type: "POST",
      url: "https://jeremylorent.fr/saveImg.php",
      data: {
         img: c.toDataURL(),
         name: d.getDate() + "-" + d.getMonth() + 1 + "-" + d.getFullYear() + "-" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds()
      }
    }).done(function(o) {
      console.log('saved');
    });
  }

  addPieceCanvas() {
    var c = document.createElement("canvas");
    var id = UTILS.getNewId();

    //this.canvas[pieceId].push(c);
    c.setAttribute("id", id);
    c.width = this.container.offsetWidth;
    c.height = this.container.offsetHeight;
    c.style.position = "absolute";
    c.style.top = "0px";
    c.style.left = "0px";
    c.className += "canvas"
    this.container.appendChild(c);

    return c;
  }

  setTool(tool) {
    this.tool = tool;
  }

  back() {
    var lastCanvas = this.container.lastElementChild;

    //This work fine but it is not memory friendly since we don't remove the canvas from the this.canvas object.
    if (lastCanvas.style.pointerEvents == "none")
      this.container.removeChild(lastCanvas);
  }

  foundCanvas(x, y) {
    for (var j = 0; j < this.pieces.length; ++j) {
      for (var k = 0; k < this.pieces[j].length; ++k) {
        var c = this.pieces[j][k];

        if (c.style.pointerEvents != "none" && this.canvasContain(c, x, y)) {
          return c;
        }
      }
    }

    return null;
  }

  /***** Event Handlers *****/
  mouseDownHandler(e) {
    e.stopPropagation();
    var c = this.addPieceCanvas(e.target.id);

    c.focus();

    if (this.currentTool) {
      this.currentTool.stop();
      this.currentTool = null;
    }

    switch (this.tool) {
      case UTILS.TOOLS.ORIENTATION:
        this.currentTool = new OrientationEffect(c, this);
        break;
      case UTILS.TOOLS.SOUND:
        this.currentTool = new SoundEffect(c, this);
        break;
      case UTILS.TOOLS.BLOW:
        this.currentTool = new SprayEffect(c, this);
        break
      default:
        this.currentTool = new PencilEffect(c, this);
    }
  }

  touchStartHandler(e) {
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    this.dispatchEvent(mouseEvent);
  }
}
