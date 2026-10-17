function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(42);
  background("#f3ecdd");
  brush.scaleBrushes(4);

  // Flower and seed head
  brush.fill("#ffd666", 200);
  brush.beginShape();
  brush.vertex(-100, 50, 2);
  brush.vertex(-100, 100, 2);
  brush.vertex(-50, 150, 2);
  brush.vertex(50, 150, 2);
  brush.vertex(100, 100, 2);
  brush.vertex(100, 50, 2);
  brush.endShape();

  // Fruit (bud)
  brush.noMass();
  brush.circle(0, 0, 20, 2);
  brush.line(0, 0, 10, 5, 2);
  brush.line(0, 0, -10, 5, 2);
  brush.noWiggle();
  brush.noField();
  brush.fill("#996633", 200);
  brush.beginShape();
  brush.vertex(20, 5);
  brush.vertex(20, 10);
  brush.vertex(-20, 10);
  brush.vertex(-20, 5);
  brush.endShape();

  // Seed
  brush.noMass();
  brush.circle(0, 0, 5, 2);
  brush.noWiggle();
  brush.noField();
  brush.fill("#885522", 200);

  // Foliage and stem
  brush.fill("#805200", 200);
  brush.beginShape();
  brush.vertex(-30, 0, 2);
  brush.vertex(-30, 20, 2);
  brush.vertex(-10, 40, 2);
  brush.vertex(10, 40, 2);
  brush.vertex(30, 20, 2);
  brush.vertex(30, 0, 2);
  brush.endShape();

  brush.stroke("#805200", 200);
  brush.line(-40, 0, 140, 0, 2);
  brush.line(-10, 40, 140, 40, 2);
  brush.line(-40, 0, -10, 40, 2);
}

function draw() {
  brush.set("HB", "#ffd666"); // Set brush and color before drawing
  // Draw the specimen inside the frame
  // You can add text, add some semi-transparent effects, etc.
}