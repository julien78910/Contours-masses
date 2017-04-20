declare var audioinput;

export class Audio {
    private end = false;
    private waitTime = 10;
    private start = Date.now();
    private lastUpdate: Date;
    private processSound: (level: number)=>void;

  constructor(processFunction) {
    this.processSound = processFunction;

    audioinput.start({
      streamToWebAudio: true
    });

    this.configStream();
  }

  configStream() {
    var analyser = audioinput.getAudioContext().createAnalyser();

    analyser.smoothingTimeConstant = 0; //0<->1. 0 is no time smoothing
    analyser.fftSize = 1024;

    audioinput.connect(analyser);

    function audioAnalyse() {
      if (Date.now() - this.lastUpdate < this.waitTime) {
        requestAnimationFrame(audioAnalyse.bind(this));
        return;
      }

      this.waitTime = 10;

      var array =  new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      var averageVolume = this.getAverageVolume(array) / 256;
      this.processSound(averageVolume);
      this.lastUpdate = Date.now();

      if (this.end)
        audioinput.stop();
      else
        requestAnimationFrame(audioAnalyse.bind(this));
    }

    requestAnimationFrame(audioAnalyse.bind(this));
  }

  private getAverageVolume(array) {
    var amplitudeSum = 0;

    for (var i = 0; i < array.length; ++i) {
      amplitudeSum += array[i];
    }

    return amplitudeSum / array.length;
  }

  pause(ms) {
    this.waitTime = ms;
  }

  stop() {
    this.end = true;
  }
}
