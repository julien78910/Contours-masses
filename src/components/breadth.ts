import { Store } from './store';
import { UTILS } from './utils';

export class BreadthFirst {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private size: number;
  private color: any;
  private dist: number;
  private propVal: number
  private colorGap: any;
  private segments: Store;
  private interval: number;

  constructor(data: any) {
    this.ctx = data.canvas.getContext("2d");
    this.width = data.canvas.width;
    this.height = data.canvas.height;
    this.size = data.size;
    this.color = data.color;
    this.dist = 0;
    this.propVal = 1;
    if (!data.colorEnd)
      data.colorEnd = [255, 255, 255];
    this.colorGap = [
      (data.colorEnd[0] - this.color[0]) / (this.size / this.propVal),
      (data.colorEnd[1] - this.color[1]) / (this.size / this.propVal),
      (data.colorEnd[2] - this.color[2]) / (this.size / this.propVal)
    ]

    this.segments = new Store();
    this.segmentNeighbors(data.pos);

    // don't color the start cell
    if (this.isOpenCell(data.pos)) {
      this.fillCell(data.pos);
    }

    this.interval = window.setInterval(this.onePixelProcess.bind(this), 0);
  }

  onePixelProcess() {
    if (this.segments.length === 0 || this.dist >= this.size) {
      window.clearInterval(this.interval);
    }
    let randomSeg = this.segments.popRandom();
    if (!randomSeg) { return; }
    var randomSegNum = randomSeg.split(' ').map(Number);
    this.fillCell(randomSegNum);
    this.segmentNeighbors(randomSegNum);
    this.color = this.color.map((c, i) => c + this.colorGap[i]);
  }

  isOpenCell(pos) {
    const data = this.ctx.getImageData(pos[0], pos[1], 1, 1).data;
    return data.every((i) => i === 0);
  }

  segmentNeighbors(pos) {
    const [x, y] = pos;
    if (x === 0 || x === this.width - 1) { return; }
    const neighbors = [[x-this.propVal, y], [x+this.propVal, y], [x, y-this.propVal], [x, y+this.propVal]];
    neighbors.forEach((n) => {
      let str = n.join(' ');
      if (n[0] >= 0 && n[1] >= 0 &&
        n[0] < this.width && n[1] < this.height &&
        this.isOpenCell(n) && !this.segments.has(str)) {
        this.segments.insert(str);
      }
    });
  }

  fillCell(pos) {
    this.dist += this.propVal;
    this.ctx.fillStyle = UTILS.rgb(this.color);
    this.ctx.fillRect(pos[0], pos[1], this.propVal, this.propVal);
  }
}
