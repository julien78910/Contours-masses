'use strict';

class OrientationEffect extends DefaultTool {
  constructor(canvas, cm) {
    super(canvas, cm);

    this.start =  Date.now();
    this.points = [];
    this.tool = new WaterColor(canvas);

    //Change size and color of the pen
    this.tool.color = [ 102, 153, 51 ];
    this.tool.size = 100;

    //Change size and color of the effect
    this.color = [ 255, 153, 255 ];
    this.size = 400;

    gyro.stopTracking(); // Stop periodic calls
  }

  mouseUpHandler(e) {
    super.mouseUpHandler(e);

    this.selectPoints();
    gyro.calibrate(); // Calibrate measurement during the page loading
    gyro.startTracking(this.gyroHandler.bind(this));
    gyro.frequency = 100;
  }

  //Alpha around Z axis, beta around X axis and gamma around Y axis intrinsic local space

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


  gyroHandler(o) {
    var q = this.computeQuaternionFromEulers(o.alpha, o.beta, o.gamma);
    var vector = new THREE.Vector3(0, 0, 1);

    vector.applyQuaternion(q);

    for (var i = 0; i < this.points.length; ++i) {
      var p = this.points[i];

      p.x += Math.floor(UTILS.getRandomInt(5, 15) * vector.y);
      p.y += Math.floor(UTILS.getRandomInt(5, 15) * vector.x);

      const breadthFirst = new BreadthFirst({
        canvas: this.canvas,
        color: this.color,
        pos: [ p.x, p.y ],
        size: this.size,
        cells: this.cells
      });
    }

    if (Date.now() - this.start > 5000) {
      this.stop();
      this.cm.currentTool = null;
    }
  }

  stop() {
    gyro.stopTracking();
  }

  selectPoints() {
    var i = UTILS.getRandomInt(0, 20);
    var points = this.tool.getPoints();
    while (i < points.length) {
      this.points.push(points[i]);
      i += UTILS.getRandomInt(10, 40);
    }
  }
}
