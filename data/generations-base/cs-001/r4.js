// Import p5 library
const p5 = require('p5');

// Create the p5 instance
let myP5 = new p5(function(sketch) {

  // Create canvas
  sketch.createCanvas(1000, 1400, WEBGL);
  sketch.randomSeed(42);
  sketch.background("#f3ecdd");

  // Pivot the canvas
  sketch.translate(sketch.width / 2, sketch.height / 2);
  sketch.scale(100);

  // Set the brush
  sketch.brush.set("2B", "#f3ecdd", 2);

  // Draw the plant
  // Stem and leaves
  sketch.brush.circle(-100, -400, 50, 2);
  sketch.brush.circle(-100, -500, 50, 2);
  sketch.brush.circle(100, -400, 50, 2);
  sketch.brush.circle(100, -500, 50, 2);
  sketch.brush.circle(125, -450, 35, 2);
  sketch.brush.circle(125, -550, 35, 2);
  sketch.brush.circle(-125, -450, 35, 2);
  sketch.brush.circle(-125, -550, 35, 2);
  sketch.brush.circle(85, -500, 15, 2);
  sketch.brush.circle(85, -400, 15, 2);

  // Leaves and flowers
  sketch.brush.circle(100, -650, 25, 2);
  sketch.brush.circle(-100, -650, 25, 2);
  sketch.brush.circle(125, -650, 25, 2);
  sketch.brush.circle(-125, -650, 25, 2);
  sketch.brush.circle(85, -650, 10, 2);
  sketch.brush.circle(85, -550, 10, 2);

  // Colors and fill texture
  sketch.brush.fill("#f3ecdd", 0.5);
  sketch.brush.fillTexture(0.1, 1);

  // Fill snowflake pattern
  sketch.beginShape();

  let size = 50;
  let angle = 0;

  for (let i = 0; i < 10; i++) {
    sketch.brush.hatchStyle("rotring", "#f3ecdd", 2);
    sketch.brush.circle(100, -700, size, 2);
    sketch.brush.circle(-100, -700, size, 2);
    sketch.brush.circle(125, -700, size, 2);
    sketch.brush.circle(-125, -700, size, 2);
    sketch.brush.circle(85, -700, size / 1.5, 2);
    sketch.brush.circle(85, -650, size / 1.5, 2);

    angle += Math.PI / 6;
    size += 10;
  }

  sketch.endShape(true);
});

// Initialize the p5 instance
myP5.size(1000, 1400);