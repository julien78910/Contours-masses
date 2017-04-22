import { Component, AfterViewInit } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { File } from 'ionic-native';
import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope';

import { GaleriePage } from '../galerie/galerie';
import { UTILS } from '../../components/utils';
import { Point } from '../../models/point';
import { Area } from '../../models/area';
import { BreadthFirst } from '../../components/breadth';
import { Tool, OrientationEffect, SoundEffect, SprayEffect, PencilEffect } from '../../components/tools';

@Component({
  selector: 'page-draw',
  templateUrl: 'draw.html',
  providers: [Gyroscope]
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

  constructor(private navCtrl: NavController, private params: NavParams,
              private gyro: Gyroscope) {
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
    for (var i = 0; i < this.pieces.length; ++i) {
      for (var j = 0; j < this.pieces[i].length; ++j) {
        var p = this.pieces[i][j];

        for (var k = 0; k < this.pieceToCanvas.get(p.id).length; k++) {
          var c = this.pieceToCanvas.get(p.id)[k];

          let decY = p.offsetTop - (this.startY + (<any>p).startTop);
          let decX = p.offsetLeft - (this.startX + (<any>p).startLeft);
          c.style.top = c.offsetTop - decY  + "px";
          c.style.left = c.offsetLeft - decX  + "px";
        }
        this.container.removeChild(p);
      }
    }

    setTimeout(this.createFinalImgAndSave.bind(this), 5500);
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

        if (piece) {
          this.pieces[this.pieces.length - 1].push(piece);
          (<any>piece).startTop = startY;
          (<any>piece).startLeft = startX;
        }

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


  resizeCanvas(canvas: HTMLCanvasElement) : HTMLCanvasElement {
    let context = canvas.getContext("2d");
    let endX = 0, endY = 0, startX = canvas.width, startY = canvas.height;
    let step = 20

    for (let x = 0; x < canvas.width; x += step) {
      for (let y = 0; y < canvas.height; y += step) {
        let pixel = context.getImageData(x, y, step, step);
        for (let i = 0; i < pixel.data.length; i += 4) {
          if (pixel.data[i + 3] != 0) {
            if (x < startX) startX = x;
            if (y < startY) startY = y;
            if (x > endX) endX = x;
            if (y > endY) endY = y;
          }
        }
      }
    }

    let piece = <HTMLCanvasElement> document.createElement("canvas");
    let id = UTILS.getNewId();
    let w = endX - startX, h = endY - startY;

    piece.width = w;
    piece.height = h;
    piece.style.position = "absolute";
    piece.style.left = startX + "px";
    piece.style.top = startY + "px";
    piece.style.pointerEvents = "none";
    piece.className += "canvas";
    piece.getContext("2d").drawImage(canvas, startX, startY, w, h, 0, 0, w, h);
    piece.setAttribute("id", String(id));

    this.container.appendChild(piece);
    return piece;
  }

  /***** Event Handlers *****/
  mouseDownHandler(e) {
    e.stopPropagation();

    switch (this.tool$) {
      case UTILS.TOOLS.ORIENTATION:
        this.currentTool = new OrientationEffect(this.gyro);
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

    this.currentCanvas.style.pointerEvents = "none";
    this.currentTool.addEffectEndListener(() => {
      this.currentTool = null;
      if (!this.isCanvasEmpty(this.currentCanvas)) {
        let c = this.resizeCanvas(this.currentCanvas);
        this.history.push(c.id);
        this.pieceToCanvas.get(piece.id).push(c);
        this.container.removeChild(this.currentCanvas);
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
