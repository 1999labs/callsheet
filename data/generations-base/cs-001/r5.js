createCanvas(1000, 1400, WEBGL);
randomSeed(42);
background("#f3ecdd");
brush.scaleBrushes(4);

function setup() {
  createCanvas(1000, 1400, WEBGL);
  brush.set("HB", "#c0a262", 1.5);

  brush.line(500, -600, 500, 300);
  brush.line(500, 300, 700, 300);
  brush.line(700, 300, 700, 600);
  brush.line(700, 600, 500, 600);
  brush.line(500, 600, 500, -600);

  brush.fillTexture(0.8, 0.6);
  brush.beginShape();
  brush.vertex(-200, -200, 1);
  brush.vertex(-200, 200, 1);
  brush.vertex(200, 200, 1);
  brush.vertex(200, -200, 1);
  brush.endShape(true);

  brush.beginShape();
  brush.vertex(-150, 100, 1);
  brush.vertex(-150, -100, 1);
  brush.vertex(150, -100, 1);
  brush.vertex(150, 100, 1);
  brush.endShape(true);

  brush.beginShape();
  brush.vertex(-100, -200, 1);
  brush.vertex(-100, 200, 1);
  brush.vertex(100, 200, 1);
  brush.vertex(100, -200, 1);
  brush.endShape(true);

  brush.beginShape();
  brush.vertex(-50, -300, 1);
  brush.vertex(-50, 300, 1);
  brush.vertex(50, 300, 1);
  brush.vertex(50, -300, 1);
  brush.endShape(true);

  brush.beginShape();
  brush.vertex(0, -400, 1);
  brush.vertex(0, 400, 1);
  brush.endShape(true);
}

function draw() {
  brush.noFill();
  brush.mass("HB", "#c0a262", { strength: 0.85 });
  brush.wiggle(0.1);
}