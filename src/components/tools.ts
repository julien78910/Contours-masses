import { BreadthFirst } from './breadth';
import { Point } from '../models/point';
import { UTILS } from './utils';
import { Audio } from './audio';
import { DeviceOrientation } from 'ionic-native';

export interface Tool {
  addEffectEndListener(callback: ()=>void): void;
  startDraw(canvas: HTMLCanvasElement): void;
  draw(x: number, y: number): void;
  endDraw(): void;
  applyEffect(canvas: HTMLCanvasElement): void;
  getPoints(): Array<Point>;
}



/***** Orientation Effect *****/

export class OrientationEffect implements Tool {
  private color = [ 96, 126, 198 ];
  private colorEnd = [145, 42, 124];
  private size = 150;
  private points = [];
  private effectEndListener: ()=>void;
  private canvas: HTMLCanvasElement;
  private  gyroscope = (<any>navigator).gyroscope;

  addEffectEndListener(callback: ()=>void): void {
    this.effectEndListener = callback;
  }

  startDraw(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  draw(x: number, y: number): void {
    new BreadthFirst({
      canvas: this.canvas,
      color: this.color,
      pos: [ x, y ],
      size: this.size,
      colorEnd: this.colorEnd
    });
    this.points.push(new Point(x, y));
  }

  endDraw(): void {

  }

  applyEffect(canvas: HTMLCanvasElement): void {
    //FIXME
    this.gyroscope.watch((res) => {
      console.log("res: ", res);
    }, (error) => {
      console.error("Error: Failed to get Gyroscope: ", error);
    }, null);

    //Gyroscope.watch()
   //.subscribe((orientation: GyroscopeOrientation) => {
    //  console.log(orientation.x, orientation.y, orientation.z, orientation.timestamp);
   //});
  }

  getPoints(): Array<Point> {
    return this.points;
  }
}



/***** Sound Effect *****/

export class SoundEffect implements Tool {
  private color = [ 96, 126, 198 ];
  private colorEnd = [145, 42, 124];
  private size = 150;
  private waitTime = 50;
  private effectDuration = 5000; // 5s
  private timeout: number;
  private points = [];
  private effectEndListener: ()=>void;
  private canvas: HTMLCanvasElement;
  private audio: Audio;

  addEffectEndListener(callback: ()=>void): void {
    this.effectEndListener = callback;
  }

  startDraw(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  draw(x: number, y: number): void {
    new BreadthFirst({
      canvas: this.canvas,
      color: this.color,
      pos: [ x, y ],
      size: this.size,
      colorEnd: this.colorEnd
    });
    this.points.push(new Point(x, y));
  }

  endDraw(): void {

  }

  applyEffect(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.audio = new Audio(this.processSound.bind(this));
    this.timeout = setTimeout(() => {
      this.audio.stop();
      this.effectEndListener();
    }, this.effectDuration);
  }

  processSound(level: number): void {
    console.log("lvl: ", level);
    if (level < 0.1)
      return;

    var i = UTILS.getRandomInt(0, this.points.length - 1);
    var p = this.points[i];
    var size = Math.floor(level * this.size);

    new BreadthFirst({
      canvas: this.canvas,
      color: [ 255, 153, 255 ],
      pos: [ p.x, p.y ],
      size: size
    });

    this.audio.pause(1000);
  }

  getPoints(): Array<Point> {
    return this.points;
  }
}



/***** Spray Effect *****/

export class SprayEffect implements Tool {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private started: boolean = false;
  private effectEndListener: ()=>void;
  private points = [];
  private timeout;
  private size: number = 50;
  private color: string = "#33ccff";
  private density: number = 100;

  addEffectEndListener(callback: ()=>void): void {
    this.effectEndListener = callback
  }

  startDraw(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.lineJoin = this.ctx.lineCap = 'round';
    this.ctx.fillStyle = this.color;
  }

  draw(x: number, y: number): void {
    this.points.push(new Point(x, y));

    if (!this.started)
      this.start();
  }

  start(): void {
    this.timeout = setTimeout(function draw() {
      for (var i = this.density; --i; ) {
        var angle = UTILS.getRandomFloat(0, Math.PI * 2);
        var radius = UTILS.getRandomFloat(0, this.size);
        this.ctx.globalAlpha = Math.random();
        this.ctx.fillRect(
          this.points[this.points.length-1].x + radius * Math.cos(angle),
          this.points[this.points.length-1].y + radius * Math.sin(angle),
          UTILS.getRandomFloat(1, 3), UTILS.getRandomFloat(1, 3));
      }
      if (!this.timeout) return;
      this.timeout = setTimeout(draw.bind(this), 40);
    }.bind(this), 40);

    this.started = true;
  }

  endDraw(): void {
    clearTimeout(this.timeout);
    this.started = false;
  }

  applyEffect(canvas: HTMLCanvasElement): void {
    this.effectEndListener();
  }

  getPoints(): Array<Point> {
    return this.points;
  }
}



/***** Pencil Effect *****/

export class PencilEffect implements Tool {
  private color = [ 96, 126, 198 ];
  private colorEnd = [145, 42, 124];
  private size = 150;
  private points = [];
  private effectEndListener: ()=>void;
  private canvas: HTMLCanvasElement;

  addEffectEndListener(callback: ()=>void): void {
    this.effectEndListener = callback;
  }

  startDraw(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  draw(x: number, y: number): void {
    new BreadthFirst({
      canvas: this.canvas,
      color: this.color,
      pos: [ x, y ],
      size: this.size,
      colorEnd: this.colorEnd
    });
    this.points.push(new Point(x, y));
  }

  endDraw(): void {

  }

  applyEffect(canvas: HTMLCanvasElement): void {
    this.effectEndListener();
  }

  getPoints(): Array<Point> {
    return this.points;
  }
}
