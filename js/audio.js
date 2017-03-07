class Audio {
  constructor(processFunction) {
    this.end = false;
    this.waitTime = 50;
    this.processSound = processFunction;
    this.start = Date.now();

    navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(this.configStream.bind(this), function(e) {
      console.log("Error: Can't get audio stream: ", e);
    });
  }

  configStream(stream) {
    //var audio = stream.getAudioTracks()[0];
    var audioCtx = new AudioContext();
    var analyser = audioCtx.createAnalyser();
    var source = audioCtx.createMediaStreamSource(stream);

    /* Get an array that will hold our values */
    var buffer = new Uint8Array(analyser.fftSize);
    var lastTime = 0;
    var levelsCount = 16; //should be factor of 512
    var binCount; //512
    var levelBins;
    var levelsData = []; //levels of each frequecy - from 0 - 1 . no sound is 0. Array [levelsCount]


    analyser.smoothingTimeConstant = 0; //0<->1. 0 is no time smoothing
    analyser.fftSize = 1024;
    binCount = analyser.frequencyBinCount; // = 512
    levelBins = Math.floor(binCount / levelsCount); //number of bins in each level

    source.connect(analyser);

    function audioAnalyse() {
      if (Date.now() - lastTime < this.waitTime) {
        requestAnimationFrame(audioAnalyse.bind(this));
        return;
      }

      this.waitTime = 50;
      analyser.getByteFrequencyData(buffer);

      //normalize levelsData from freqByteData
      for(var i = 0; i < levelsCount; i++) {
        var sum = 0;
      	for(var j = 0; j < levelBins; j++) {
    			sum += buffer[(i * levelBins) + j];
  			}
        levelsData[i] = sum / levelBins / 256; //freqData maxs at 256
      }
      //GET AVG LEVEL
      var sum = 0;
      for(var j = 0; j < levelsCount; j++) {
        sum += levelsData[j];
      }

      var level = sum / levelsCount;
      this.processSound(level);
      lastTime = Date.now();

      if (this.end || Date.now() - this.start > 5000) {
        var tracks = stream.getTracks();
        for (var i = 0; i < tracks.length; ++i) {
          tracks[i].stop();
        }
        audioCtx.close();
      }
      else
        requestAnimationFrame(audioAnalyse.bind(this));
    }

    requestAnimationFrame(audioAnalyse.bind(this));
  }

  pause(ms) {
    this.waitTime = ms;
  }

  stop() {
    this.end = true;
  }
}
