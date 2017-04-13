import { BreadthFirst } from './breadth';
import { Point } from '../models/point';
import { UTILS } from './utils';
import { Audio } from './audio';
import { DeviceOrientation } from 'ionic-native';

declare var gyro, THREE;

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
  private colorStart = 'rgba(96, 126, 198, 1)';
  private colorMiddle = 'rgba(120, 80, 150, 0.5)';
  private colorEnd = 'rgba(145, 42, 124, 0)';
  private effectColor = [ 255, 153, 255 ];
  private size = 50;
  private points = [];
  private effectEndListener: ()=>void;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private  gyroscope = (<any>navigator).gyroscope;
  private timeout: number;
  private effectDuration: number = 5000;

  addEffectEndListener(callback: ()=>void): void {
    this.effectEndListener = callback;
  }

  startDraw(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  draw(x: number, y: number): void {
    /*
    new BreadthFirst({
      canvas: this.canvas,
      color: this.color,
      pos: [ x, y ],
      size: this.size,
      colorEnd: this.colorEnd
    });
    */

    let radgrad = this.ctx.createRadialGradient(x, y, 10, x, y,20);
    radgrad.addColorStop(0, this.colorStart);
    radgrad.addColorStop(0.5, this.colorMiddle);
    radgrad.addColorStop(1, this.colorEnd);
    this.ctx.fillStyle = radgrad;
    this.ctx.fillRect(x - 20, y - 20, 40, 40);

    this.points.push(new Point(x, y));
  }

  endDraw(): void {

  }


  computeQuaternionFromEulers(alpha, beta, gamma) {
  	var x = beta * Math.PI / 180 ; // beta value
  	var y = gamma  * Math.PI / 180; // gamma value
  	var z = alpha  * Math.PI / 180 ; // alpha value

  	//precompute to save on processing time
  	var cX = Math.cos( x/2 );
  	var cY = Math.cos( y/2 );
  	var cZ = Math.cos( z/2 );
  	var sX = Math.sin( x/2 );
  	var sY = Math.sin( y/2 );
  	var sZ = Math.sin( z/2 );

  	var w = cX * cY * cZ - sX * sY * sZ;
  	var x = sX * cY * cZ - cX * sY * sZ;
  	var y = cX * sY * cZ + sX * cY * sZ;
  	var z = cX * cY * sZ + sX * sY * cZ;


    return new THREE.Quaternion(x, y, z, w);
  }

  selectPoints(): Array<any>{
    var selected: Array<any> = [];
    var i = UTILS.getRandomInt(0, 20);
    var points = this.getPoints();
    while (i < points.length) {
      selected.push(points[i]);
      i += UTILS.getRandomInt(10, 40);
    }

    return selected;
  }

  applyEffect(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    var selected = this.selectPoints();
    gyro.calibrate();
    gyro.startTracking((o) => {
      var q = this.computeQuaternionFromEulers(o.alpha, o.beta, o.gamma);
      var vector = new THREE.Vector3(0, 0, 1);

      vector.applyQuaternion(q);

      for (var i = 0; i < selected.length; ++i) {
        var p = selected[i];

        p.x += Math.floor(UTILS.getRandomInt(5, 15) * vector.y);
        p.y += Math.floor(UTILS.getRandomInt(5, 15) * vector.x);

        const breadthFirst = new BreadthFirst({
          canvas: this.canvas,
          color: this.effectColor,
          pos: [ p.x, p.y ],
          size: this.size
        });
      }
    });
    gyro.frequency = 100;
    this.timeout = setTimeout(() => {
      gyro.stopTracking();
      this.effectEndListener();
      this.points = null;
    }, this.effectDuration);
  }

  getPoints(): Array<Point> {
    return this.points;
  }
}



/***** Sound Effect *****/

export class SoundEffect implements Tool {
  private colorStart = 'rgba(96, 126, 198, 1)';
  private colorMiddle = 'rgba(120, 80, 150, 0.5)';
  private colorEnd = 'rgba(145, 42, 124, 0)';
  private effectColor = '#ff90ff';
  private size = 150;
  private effectSize = 100;
  private waitTime = 50;
  private effectDuration = 5000; // 5s
  private timeout: number;
  private points = [];
  private effectPoint;
  private effectEndListener: ()=>void;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audio: Audio;

  addEffectEndListener(callback: ()=>void): void {
    this.effectEndListener = callback;
  }

  startDraw(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  draw(x: number, y: number): void {
    let radgrad = this.ctx.createRadialGradient(x, y, 10, x, y,20);
    radgrad.addColorStop(0, this.colorStart);
    radgrad.addColorStop(0.5, this.colorMiddle);
    radgrad.addColorStop(1, this.colorEnd);
    this.ctx.fillStyle = radgrad;
    this.ctx.fillRect(x - 20, y - 20, 40, 40);

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
      this.points = null;
    }, this.effectDuration);
  }

  processSound(level: number): void {
    console.log("lvl: ", level);
    if (level < 0.1) {
      this.effectPoint = null;
      return;
    }

    if (!this.effectPoint) {
      if(!this.points) return;
      var i = UTILS.getRandomInt(0, this.points.length - 1);
      this.effectPoint = this.points[i];
    }

    var size = Math.floor(level * this.effectSize);

    var ctx = this.canvas.getContext("2d");
    ctx.save();
    ctx.translate(this.effectPoint.x, this.effectPoint.y);
    ctx.rotate(Math.PI * 180 / UTILS.getRandomInt(0, 180));
    ctx.fillStyle = this.effectColor;
    ctx.fillRect(0, 0, size, 1.5);
    ctx.restore();
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
    this.points = null;
  }

  getPoints(): Array<Point> {
    return this.points;
  }
}



/***** Pencil Effect *****/

export class PencilEffect implements Tool {
  private colorStart = 'rgba(96, 126, 198, 1)';
  private colorMiddle = 'rgba(120, 80, 150, 0.5)';
  private colorEnd = 'rgba(145, 42, 124, 0)';
  private size = 40;
  private points = [];
  private effectEndListener: ()=>void;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  addEffectEndListener(callback: ()=>void): void {
    this.effectEndListener = callback;
  }

  startDraw(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  draw(x: number, y: number): void {
    /*
    new BreadthFirst({
      canvas: this.canvas,
      color: this.color,
      pos: [ x, y ],
      size: this.size,
      colorEnd: this.colorEnd
    });
    */

    let radgrad = this.ctx.createRadialGradient(x, y, this.size / 4, x, y, this.size / 2);
    radgrad.addColorStop(0, this.colorStart);
    radgrad.addColorStop(0.5, this.colorMiddle);
    radgrad.addColorStop(1, this.colorEnd);
    this.ctx.fillStyle = radgrad;
    this.ctx.fillRect(x - this.size / 2, y - this.size / 2, this.size, this.size);

    this.points.push(new Point(x, y));
  }

  endDraw(): void {

  }

  applyEffect(canvas: HTMLCanvasElement): void {
    this.effectEndListener();
    this.points = null;
  }

  getPoints(): Array<Point> {
    return this.points;
  }
}
