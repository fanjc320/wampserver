'use strict';


function preload() {

}

function setup() {
	
  // if (!window.AudioContext) {
    // window.alert(Locale.get('no_support'));
  // }
  data.init();
  data.control = new Control();
  data.equal_loud = new EqualLoud();
  //frameRate(data.fps);
  var cnv = createCanvas(data.width + data.padding_right, 800);
  cnv.parent('draw_pane');
  // cnv.mouseClicked(data.control.onClick);
  data.fft = new p5.FFT(data.smooth, data.fft_size);

  var x1 = 2;
  var x2 = data.width;
  var y1 = 1;
  var y2 = 0;
  
  if (data.show_vspec) {
    y2 = y1 + 450;
    vspec.init(x1, x2, y1, y2);
    y1 = y2 + 10;
  }

  var audioCtx = getAudioContext();
  var source = audioCtx.createMediaElementSource(data.control.audio);
  data.fft.setInput(source);
  source.connect(audioCtx.destination);
 
  data.use_mic = false;

  if (!data.input_pane) {
    jQuery('#input_pane').hide();
  }
}

function draw() {
  background(255);
  data.pitch = null;

  top_model.getValue();

  if (data.show_vspec) {
    vspec.onDraw();
  }
}

function Control() {
  var self = this;
  this.mic_icon = jQuery("#mic_icon");
  this.audio_pane = jQuery("#audio_pane");
  this.audio = jQuery('#myAudio')[0];
  this.mic_on = false;

  this.pitch_name = jQuery("#pitch_name");
  this.pitch_pure = jQuery("#pitch_pure");

  jQuery('input').on('change', function(e) {
    var path = URL.createObjectURL(jQuery('#audio_file')[0].files[0]);
    self.audio.src = path;
    self.toggleAudio(true);
  });

  this.togglePlay = function() {
    data.lock_spec = !data.lock_spec;
    
    this.toggleAudio(!data.lock_spec);

  };


  this.toggleAudio = function(enable) {
    if (enable) {
      data.use_mic = false;
      this.audio.play();
      this.audio_pane.addClass('on');
      data.lock_spec = false;
    } else {
      this.audio.pause();
      this.audio_pane.removeClass('on');
    }
  };

}


var top_model = {


  getValue: function() {
    data.tops = new Array(data.fft_size);

    if (!data.lock_spec) {
      var fft = data.fft;
      data.spectrum = fft.analyze('db');
      data.sample_rate = fft.input.context.sampleRate;
      var max_eng = 120;
      data.highest_index = 0;
      data.highest_eng = 0;
      data.ori_spectrum = new Array(data.spectrum.length);
      for (var i = 0; i < data.x_max; ++i) {
        var value = data.spectrum[i] + 140;
        data.ori_spectrum[i] = value;
        data.spectrum[i] = data.equal_loud.adjust(i, value);
        if (value > data.highest_eng) {
          data.highest_eng = value;
          data.highest_index = i;
        }
        max_eng = Math.max(max_eng, data.ori_spectrum[i]);
      }
      data.max_eng = max_eng;
      data.top_eng_range = (data.max_eng - data.min_eng) * data.top_eng_range_rate;
    }
  },

};

function sleep(delay) {
  var start = (new Date()).getTime();
  while ((new Date()).getTime() - start < delay) {
    continue;
  }
}

function Buffer(width, height) {
  this.scale = data.image_scale;
  this.width = width * this.scale;
  this.height = height * this.scale;
  this.buffer = createImage(this.width, this.height);
  this.buffer.loadPixels();
}

Buffer.prototype.loadPixels = function() {
  this.buffer.loadPixels();
}

Buffer.prototype.updatePixels = function() {
  this.buffer.updatePixels();
}

Buffer.prototype.fillPoint = function(x, y, color) {
  var scale = this.scale;
  x *= scale;
  y *= scale;
  for (var i = 0; i < scale; ++i) {
    for (var j = 0; j < scale; j++) {
      this.buffer.set(x + i, y + j, color);
    }
  }
}

var vspec = {
  x_min: 0,
  x_max: 100,
  y_min: 0,
  y_max: 100,
  x_scale: 2,
  y_scale: 1,
  x_current: 0,

  fillData: function() {
    if (!data.lock_spec) {
      var spectrum = data.ori_spectrum;
      for (var i = 0; i < spectrum.length; i++) {
        var ii = i * this.y_scale;
        if (ii > this.height) break;
        var eng = spectrum[i];
        var pitch_color = this.engToColor(eng);
        if (data.show_pitch_on_spec && data.pitch && i == Math.round(data.max_top.index)) {
          pitch_color = color(data.vspec_pitch_color);
        }
        for (var xx = 0; xx < this.x_scale; ++xx) {
          for (var yy = 0; yy < this.y_scale; yy++) {
            this.buffer.fillPoint(this.x_current + xx, this.height - ii - yy, pitch_color);
          }
        }
      }
      this.x_current += this.x_scale;
      if (this.x_current >= this.width) {
        this.x_current = 0;
      }
      this.buffer.updatePixels();
    }
  },

  onDraw: function() {
    this.fillData();

    stroke(data.border_color);
    fill(data.spec_background_color);
    //rect(this.x_min, this.y_min, this.width, this.height);
    var x_break = this.x_current * this.buffer.scale;
    image(this.buffer.buffer, x_break, 0, this.buffer.width - x_break, this.buffer.height,
      this.x_min, this.y_min, this.width - this.x_current, this.height);
    if (this.x_current > 0) {
      image(this.buffer.buffer, 0, 0, x_break, this.buffer.height,
        this.x_max - this.x_current, this.y_min, this.x_current, this.height);
    }
  },


  init: function(x1, x2, y1, y2) {
    this.x_min = x1;
    this.x_max = x2;
    this.y_min = y1;
    this.y_max = y2;
    this.y_scale *= data.fft_scale;
    this.width = this.x_max - this.x_min;
    this.height = this.y_max - this.y_min;
    data.x_max = this.height;
    data.y_max = this.height / this.y_scale;
    this.buffer = new Buffer(this.width, this.height);
    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        this.buffer.fillPoint(x, y, color('#FFBBFF'));
      }
    }
    var cache = new Array(101);
    var r = red(data.fill_color);
    var g = green(data.fill_color);
    var b = blue(data.fill_color);
    for (var db = 0; db <= 100; db++) {
      var percent = db / 100;
      cache[db] = color(r * percent, g * percent, b * percent);
    }
    this.color_cache = cache;
  },

  yToFreq: function(y) {
    y -= this.y_min;
    y = this.height - y;
    return map(y / this.y_scale, 0, data.fft_size, 0, data.sample_rate / 2);
  },
  freqToY: function(freq) {
    var y = map(freq, 0, data.sample_rate / 2, 0, data.fft_size);
    return this.y_max - y * this.y_scale;
  },
  engToColor: function(eng) {//不同的能量，不同的颜色，能量越大，颜色越深
    var percent = map(eng, data.min_eng, data.max_eng - data.eng_delta, 0, 100);
    percent = Math.min(100, Math.round(percent));
    percent = Math.max(0, percent);
    return this.color_cache[percent];
  },
}


var data = {
  mic: null,
  audio: null,
  fft: null,
  spectrum: null,
  tops: null,

  input_pane: true,
  show_spec: true,
  show_vspec: true,
  show_piano: false,
  show_pitch_on_spec: false,
  use_mic: true,
  debug: true,

  sample_rate: 44100,
  fft_size: 1024,
  max_db: 140,

  lock_spec: false,

  width: 500,
  padding_right: 150,
  x_max: 1000,
  avg_spec: 0,
  min_eng: 60,
  max_eng: 140,
  eng_delta: 20,
  image_scale: 1,
  fft_scale: 2,
  smooth: 0.01,
  // fps: 30,

   
  top_eng_range_rate: 0.03,
  
  pitch_name: 'inter',
  range_name: 'man_high',

  color_alpha: 220,
  spec_background_color: '#FFC125',
  fill_color: '#00BFFF', //谐波颜色
 
  vspec_pitch_color: '#FF0000', //红色
 
  pitch_color: '#F44336',
 
  line_value: 4000,

  border_color: '#212121',

  getTop: function(left, right) {
    var max_eng = 0;
    var max_top = null;
    left = Math.floor(left);
    right = Math.ceil(right);
    for (var i = left; i <= right; ++i) {
      var top = this.tops[i];
      if (top && top.eng > max_eng) {
        max_eng = top.eng;
        max_top = top;
      }
    }
    return max_top;
  },
  indexToFreq: function(i) {
    return map(i, 0, data.fft_size, 0, data.sample_rate / 2);
  },
  setColor: function(color_name) {
    stroke(this[color_name]);
    fill(this[color_name]);
  },
  setAlphaColor: function(color_name) {
    stroke(this[color_name + '_alpha']);
    fill(this[color_name + '_alpha']);
  },

  init: function() {
    var screen_width = screen.width;
    if (screen_width < this.width) {
      this.width = screen_width - this.padding_right;
      vspec.x_scale = 1;
      this.show_spec = false;
    }


    var is_safari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

    if (!is_safari) {
      this.fft_size = 2048;
      this.fft_scale = 1;
    }

    var prmstr = window.location.search.substr(1);
    if (prmstr != null && prmstr !== "") {

      var params = {};
      var prmarr = prmstr.split("&");
      for (var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        var name = tmparr[0];
        var value = tmparr[1];
        if (value == 'false') {
          value = false
        } else if (jQuery.isNumeric(value)) {
          value = Number(value);
        }
        if (name.localeCompare('backup_pitch') == 0) {
          value = getPitch(value);
        }
        this[name] = value;
      }
    }
    this.line_value /= this.fft_size / 1024 * this.fft_scale;

    // handle colors.
    for (var key in this) {
      if (key.endsWith('_color')) {
        var c_name = this[key];
        if (c_name.length == 6) {
          c_name = '#' + c_name;
        }
        var c = color(c_name);
        this[key] = c;
        this[key + '_alpha'] = color(red(c), green(c), blue(c), this.color_alpha);
      }
    }
  },
};