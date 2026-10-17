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
  randomSeed(62427);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#5f7a44", pet = "#e6bd76", acc = "#b07aa8", stm = "#8c5244";
  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 0, -180);
  leaf(-10, 540, -300, 480, 150, fol, 60);
  leaf(10, 540, 290, 490, 150, fol, 60);
  leaf(-10, 480, -300, 330, 140, fol, 58);
  leaf(10, 480, 290, 340, 140, fol, 58);
  brush.fillBleed(0.5, "out", 25);
  brush.fillTexture(0.5, 0.45);
  brush.fill(pet, 88);
  brush.beginShape(0.8);
  brush.vertex(-120, 330, 1.0);
  brush.vertex(0, 330, 0.5);
  brush.vertex(120, 330, 1.0);
  brush.endShape(true);
  brush.beginShape(0.8);
  brush.vertex(-100, 290, 1.0);
  brush.vertex(0, 290, 0.5);
  brush.vertex(100, 290, 1.0);
  brush.endShape(true);
  brush.fill(acc, 130);
  brush.circle(0, -150, 30, 0.4);
}

function draw() {}