function preload(){
  //sound = loadSound('test.mp3');//ok需开启www服务，用浏览器打开网页http://localhost/bideyuanli_test.html，而不是打开文件
  sound = loadSound('xiaoyao1.mp3');//ok
  // sound = loadSound('erquanyingyue.mp3'); //error
  // sound = loadSound('erquan_part_d.mp3'); //error
}


function setup(){
  var cnv = createCanvas(100,100);
  cnv.mouseClicked(togglePlay);
  fft = new p5.FFT();
  sound.amp(0.2);
}

var Flag=0;

function draw(){
	sleep(2000);
  background(0);

  var spectrum = fft.analyze();
  noStroke();
  fill(0,255,0); // spectrum is green
  
  for (var i = 0; i< spectrum.length; i++){
    var x = map(i, 0, spectrum.length, 0, width);
    var h = -height + map(spectrum[i], 0, 255, height, 0);
    //rect(x, height, width / spectrum.length, h )
	rect(x, 0, width / spectrum.length, h )
	if(Flag==0){
		console.log(spectrum[i])
	}
  }

  var waveform = fft.waveform();
  noFill();
  beginShape();
  stroke(255,0,0); // waveform is red
  strokeWeight(1);
  for (var i = 0; i< waveform.length; i++){
    var x = map(i, 0, waveform.length, 0, width);
    var y = map( waveform[i], -1, 1, 0, height);
    vertex(x,y);
  }
  endShape();

  text('click to play/pause', 4, 10);
  
  Flag=Flag+1;
}

// fade sound if mouse is over canvas
function togglePlay() {
  if (sound.isPlaying()) {
    sound.pause();
  } else {
    sound.loop();
  }
}

function sleep(delay) {
  var start = (new Date()).getTime();
  while ((new Date()).getTime() - start < delay) {
    continue;
  }
}