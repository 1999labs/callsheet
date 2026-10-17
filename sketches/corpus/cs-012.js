function leaf(bx, by, tx, ty, s, col, al) {
  brush.fill(col, al);
  brush.fillBleed(0.4, "out", -15);
  brush.fillTexture(0.45, 0.35);
  brush.beginShape(0.6);
  brush.vertex(bx, by - s, 0.4);
  brush.vertex(tx, ty, 1.0);
  brush.vertex(bx, by + s, 0.4);
  brush.endShape(true);
}

function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(8093);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#6f8a7a", pet = "#c76b2a", acc = "#8a3f16", stm = "#7a8a5a";
  brush.set("2B", stm, 1.1);
  brush.line(0, 620, 0, -360);
  leaf(-10, 500, -300, 380, 150, fol, 60);
  leaf(10, 340, 290, 200, 140, fol, 58);
  brush.fillBleed(0.55, "out", 35);
  brush.fillTexture(0.5, 0.4);
  brush.fill(pet, 88);
  brush.beginShape(0.8);
  brush.vertex(-120, -290, 1.0);
  brush.vertex(0, -540, 0.5);
  brush.vertex(120, -290, 1.0);
  brush.endShape(true);
  brush.set("rotring", acc, 0.6);
  brush.line(-92, -302, 0, -526);
  brush.line(92, -302, 0, -526);
}

function draw() {}
