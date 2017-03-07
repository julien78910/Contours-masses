'use strict';

var mainDiv = document.getElementById("mainDiv");
var cm;

function assemble() {
  cm.rebuild();
}

function chooseTool(tool) {
  cm.setTool(tool);
}

function back() {
  cm.back();
}

function start() {
  var img = mainDiv.getElementsByTagName("img")[0];
  cm = new ContourMass(img, mainDiv);
  cm.start();
  mainDiv.removeChild(img);
}
