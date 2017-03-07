'use strict';

class PencilEffect extends DefaultTool {
  constructor(canvas, cm) {
    super(canvas, cm)
    this.tool = new WaterColor(canvas);

    //Change size and color
    this.tool.color = [ 96, 126, 198 ];
    this.tool.size = 300;
  }
}
