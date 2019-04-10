function EqualLoud() {
  this.x = [0, 20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000];
  this.y = [140, 109.51, 104.23, 99.08, 94.18, 89.96, 85.94, 82.05, 78.65, 75.56, 72.47, 69.86, 67.53, 65.39, 63.45, 62.05, 60.81, 59.89, 60.01, 62.15, 63.19, 59.96, 57.26, 56.42, 57.57, 60.89, 66.36, 71.66, 73.16, 68.63, 68.43, 104.92];
  
  this.init = function() {
    this.deltas = new Array(data.x_max + 2);
    var index = 0;
    for (var i = 0; i < this.deltas.length; ++i) {
      var freq = map(i, 0, data.fft_size, 0, data.sample_rate / 2);
      if (freq > this.x[index + 1]) index++;
      this.deltas[i] = map(freq, this.x[index], this.x[index + 1], this.y[index], this.y[index +1]) - 60;
    }
  }
  
  this.adjust = function(x, eng) {
    if (x >= this.deltas.length) return eng;
    return Math.max(0, eng - this.deltas[x]);
  }
  this.init();
}