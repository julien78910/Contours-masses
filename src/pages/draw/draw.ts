import { Component, AfterViewInit } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { File } from 'ionic-native';

import { GaleriePage } from '../galerie/galerie';
import { UTILS } from '../../components/utils';
import { Point } from '../../models/point';
import { Area } from '../../models/area';
import { BreadthFirst } from '../../components/breadth';
import { Tool, OrientationEffect, SoundEffect, SprayEffect, PencilEffect } from '../../components/tools';

@Component({
  selector: 'page-draw',
  templateUrl: 'draw.html'
})
export class DrawPage implements AfterViewInit {
  private galeriePage;
  private started$: boolean = false;
  private objectImg$: string;
  private outils1$: boolean = true;
  private outils2$: boolean = false;
  private infoOutils$: boolean = true;
  private masquer$: boolean = false;
  private galerie$: boolean = false;
  private article$: boolean = true;
  private tool$: number = 0;

  private currentTool: Tool;
  private container: HTMLDivElement;
  private object: HTMLImageElement;

  private viewXOffset: number = 50;
  private viewYOffset: number = 50;
  private startX: number;
  private startY: number;

  private pieces: Array<Array<HTMLCanvasElement>> = [];
  private pieceToCanvas = new Map<string, Array<HTMLCanvasElement>>();
  private currentCanvas: HTMLCanvasElement;
  private history: Array<string>;

  constructor(private navCtrl: NavController, private params: NavParams) {
    this.objectImg$ = this.params.get("object");
    this.galeriePage = GaleriePage;
    this.history = new Array<string>();
  }

  ngAfterViewInit() {
    this.object = <HTMLImageElement> document.getElementById("object");
    this.container = <HTMLDivElement> document.getElementById("mainDiv");
  }

  goRoot$(): void {
    this.navCtrl.popToRoot();
  }

  start$(): void {
    this.started$ = true;
    this.startX = this.object.offsetLeft;
    this.startY = this.object.offsetTop;
    this.cutObject();

    this.pieces.forEach(p => {
        p.forEach(c => {
            this.container.appendChild(c);
        }, this);
    }, this);

    this.shake();
    this.currentCanvas = this.addPieceCanvas();
  }

  assemble$(): void {
    var offsetTop = 0;

    for (var i = 0; i < this.pieces.length; ++i) {
      var offsetLeft = 0;
      var height = 0;

      for (var j = 0; j < this.pieces[i].length; ++j) {
        var p = this.pieces[i][j];

        for (var k = 0; k < this.pieceToCanvas.get(p.id).length; k++) {
          var c = this.pieceToCanvas.get(p.id)[k];

          c.style.top = this.startY + offsetTop - p.offsetTop + "px";
          c.style.left = this.startX + offsetLeft - p.offsetLeft + "px";
        }
        offsetLeft += p.width;
        height = p.height;
        this.container.removeChild(p);
      }
      offsetTop += height;
    }

    this.createFinalImgAndSave();
  }

  back$(): void {
    let last = this.history.pop();
    let iter = this.pieceToCanvas.values();
    let canvas = iter.next();
    while (!canvas.done) {
      for (let i = 0; i < canvas.value.length; ++i) {
        if (canvas.value[i].id == last) {
            this.container.removeChild(canvas.value.splice(i, 1)[0]);
        }
      }

      canvas = iter.next();
    }
  }

  cutObject(): void {
    var min = 40;
    var max = 100;
    var startY = 0

    while(startY < this.object.height) {
      var height = UTILS.getRandomInt(min, max);

      //Check if there is enough space for one more piece.
      //If not, the current piece will take all the space left.
      if (startY + height + min > this.object.height)
        height = this.object.height - startY;

      var startX = 0;
      this.pieces.push([]);
      while (startX < this.object.width) {
        var width = UTILS.getRandomInt(min, max);

        //Check if there is enough space for one more piece.
        //If not, the current piece will take all the space left.
        if (startX + width + min > this.object.width)
          width = this.object.width - startX;

        var piece = this.createPiece(startX, startY, width, height);

        if (piece)
          this.pieces[this.pieces.length - 1].push(piece);

        startX += width;
      }
      startY += height;
    }
  }

  createPiece(x:number, y: number, w: number, h: number): HTMLCanvasElement {
    var piece = <HTMLCanvasElement> document.createElement("canvas");
    var id = UTILS.getNewId();

    piece.width = w;
    piece.height = h;
    piece.style.position = "absolute";
    piece.style.left = (this.object.offsetLeft + x) + "px";
    piece.style.top = (this.object.offsetTop + y) + "px";
    piece.style.pointerEvents = "none";
    piece.className += "canvas-test";
    piece.getContext("2d").drawImage(this.object, x, y, w, h, 0, 0, w, h);
    piece.setAttribute("id", String(id));

    if (this.isCanvasEmpty(piece))
      return null;

    this.pieceToCanvas.set(piece.id, []);

    return piece;
  }

  isCanvasEmpty(canvas: HTMLCanvasElement): boolean {
    var c = document.createElement("canvas");
    c.height = canvas.height;
    c.width = canvas.width;

    return c.toDataURL() == canvas.toDataURL();
  }

  shake(): void {
    var canvas = []

    for (var i = 0; i < this.pieces.length; ++i) {
      for (var j = 0; j < this.pieces[i].length; j++) {
        var c = this.pieces[i][j];
        var x = 0;
        var y = 0;
        var limit = 0;

        do {
          x = UTILS.getRandomInt(this.viewXOffset, this.container.offsetWidth - 2 * this.viewXOffset - c.width);
          y = UTILS.getRandomInt(this.viewYOffset, this.container.offsetHeight - 2 * this.viewYOffset - c.height);
          ++limit;
        } while (limit < 50 && !this.isEmptyArea(x, y, c.width, c.height, canvas));

        canvas.push({ "left": x, "top": y, "width": c.width, "height": c.height });
        c.style.top = y + "px";
        c.style.left = x + "px";
      }
    }
  }

  isEmptyArea(x: number, y: number, w: number, h: number, canvas: Array<Area>) : boolean {
    for (var i = 0; i < canvas.length; ++i) {
      var c = canvas[i];
      if (x + w > c.left && x < c.left + c.width &&
          y + h > c.top && y < c.top + c.height)
        return false;
    }

    return true;
  }

  addPieceCanvas(): HTMLCanvasElement {
    var c = document.createElement("canvas");
    var id = UTILS.getNewId();

    c.setAttribute("id", String(id));
    c.width = this.container.offsetWidth;
    c.height = this.container.offsetHeight;
    c.style.position = "absolute";
    c.style.top = "0px";
    c.style.left = "0px";
    c.className += "canvas"
    this.container.appendChild(c);

    c.onmousedown = this.mouseDownHandler.bind(this);
    c.addEventListener("touchstart", this.touchStartHandler, false);
    c.onmouseup = this.mouseUpHandler.bind(this);
    c.addEventListener("touchend", this.touchEndHandler, false);
    c.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
    c.addEventListener('touchmove', this.touchMoveHandler);

    return c;
  }

  foundPiece(points: Array<Point>): HTMLCanvasElement {
    var i = 0;
    var mid = Math.floor(points.length / 2);

    while (i < mid) {
      var p1 = points[mid + i];
      var p2 = points[mid - i];

      for (var j = 0; j < this.pieces.length; ++j) {
        for (var k = 0; k < this.pieces[j].length; ++k) {
          var c = this.pieces[j][k];

          if (p1.x < c.offsetLeft + c.width && p1.x > c.offsetLeft
                && p1.y < c.offsetTop + c.height && p1.y > c.offsetTop) {
            return c;
          }

          if (p2.x < c.offsetLeft + c.width && p2.x > c.offsetLeft
                && p2.y < c.offsetTop + c.height && p2.y > c.offsetTop) {
            return c;
          }
        }
      }
      ++i;
    }
    return null;
  }


  createFinalImgAndSave(): void {
    var c = document.createElement("canvas");
    c.width = this.container.offsetWidth;
    c.height = this.container.offsetHeight;
    c.style.position = "absolute";
    c.style.top = "0px";
    c.style.left = "0px";

    var ctx = c.getContext("2d");

    this.pieceToCanvas.forEach((value, key, map) => {
      for (var j = 0; j < value.length; ++j) {
        var canvas = value[j];
        console.log("canvas: ", canvas);
        ctx.drawImage(canvas, canvas.offsetLeft, canvas.offsetTop);
      }
    });

    var d = new Date();
    var name = d.getDate() + "-" + d.getMonth() + 1 + "-" + d.getFullYear()
                + "-" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds() + ".png";

    File.checkDir((<any>File).dataDirectory, "images")
    .then(_ => {
      File.writeFile((<any>File).dataDirectory + "images", name, c.toDataURL('image/png'));
    })
    .catch(_ => {
      File.createDir((<any>File).dataDirectory, "images", false)
      .then(dir => {
        File.writeFile((<any>File).dataDirectory + "images", name, c.toDataURL('image/png'));
      });
    });


  }

  /***** Event Handlers *****/
  mouseDownHandler(e) {
    e.stopPropagation();

    switch (this.tool$) {
      case UTILS.TOOLS.ORIENTATION:
        this.currentTool = new OrientationEffect();
        break;
      case UTILS.TOOLS.SOUND:
        this.currentTool = new SoundEffect();
        break;
      case UTILS.TOOLS.SPRAY:
        this.currentTool = new SprayEffect();
        break;
      case UTILS.TOOLS.DEFAULT:
        this.currentTool = new PencilEffect();
        break;
    }

    this.currentTool.startDraw(this.currentCanvas);
    this.currentTool.draw(e.offsetX, e.offsetY);
  }

  touchStartHandler(e: TouchEvent): void {
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    e.target.dispatchEvent(mouseEvent);
  }

  mouseUpHandler(e) {
    e.stopPropagation();

    this.currentTool.endDraw();
    var piece = this.foundPiece(this.currentTool.getPoints());

    if (!piece) {
      this.currentTool = null;
      this.container.removeChild(this.currentCanvas);
      this.currentCanvas = this.addPieceCanvas();
      return;
    }

    this.history.push(this.currentCanvas.id);
    this.pieceToCanvas.get(piece.id).push(this.currentCanvas);
    this.currentCanvas = this.addPieceCanvas();
    this.currentCanvas.style.pointerEvents = "none";
    this.currentTool.addEffectEndListener(() => {
      this.currentTool = null;
      if (!this.isCanvasEmpty(this.currentCanvas)) {
        this.history.push(this.currentCanvas.id);
        this.pieceToCanvas.get(piece.id).push(this.currentCanvas);
        this.currentCanvas = this.addPieceCanvas();
      }
    });
    this.currentTool.applyEffect(this.currentCanvas);
  }

  touchEndHandler(e: TouchEvent): void {
    var touch = e.changedTouches[0];
    var mouseEvent = new MouseEvent("mouseup", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    e.target.dispatchEvent(mouseEvent);
  }

  mouseMoveHandler(e) {
    e.stopPropagation();

    /* FIXME */
    if (!this.currentTool)
      return;

    this.currentTool.draw(e.offsetX, e.offsetY);
  }

  touchMoveHandler(e: TouchEvent): void {
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    e.target.dispatchEvent(mouseEvent);
  }
}
