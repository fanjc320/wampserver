var a = 100;
var t;
function setup(){
 t = 53.1301024 / 360 * 2 * PI;
 createCanvas(windowWidth, windowHeight);
 background(255);
 noLoop();
}
function draw(){
 translate(windowWidth/2, windowHeight - a * 2);
 Pythagorian(a);
  
}
function Pythagorian(x){
 noStroke();
 fill(107, 142, 35,map(x, 0, a, 150, 255));
 rect(0,0,x,x);
  
 if(x <= 3) return 0;
  
 push();
 rotate(PI / 2 - t);
 translate(0,-x/5 * 3 - x/5*4);
 Pythagorian(x/5*4);
 pop();
  
 push();
 rotate( - t);
 translate(0,-x/5 * 3);
 Pythagorian(x/5*3);
 pop(); 
  
}