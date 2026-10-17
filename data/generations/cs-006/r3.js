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
  const fol = "#7f8f77", pet = "#8fa8c4", acc = "#6d86a3", stm = "#9a9280";
  const cv = "#8fa8c4", vt = "#b07aa8", th = "#7a4a74", ot = "#4a7aa8";
  const co = "#6d86a3", p1 = "#a93438", p2 = "#6d86a3", p3 = "#a93438", p4 = "#6d86a3";
  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 0, -180);
  leaf(-10, 540, -300, 500, 150, fol, 60);
  leaf(10, 540, 290, 500, 150, fol, 60);
  leaf(-5, 640, -250, 620, 140, fol, 56);
  leaf(5, 640, 260, 620, 140, fol, 56);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TWO_PI;
    brush.fill(pet, 82);
    brush.beginShape(0.9);
    brush.vertex(10 * cos(a) - 90, 10 * sin(a) - 550, 1.0);
    brush.vertex(10 * cos(a) - 70, 10 * sin(a) - 510, 0.5);
    brush.vertex(10 * cos(a) - 50, 10 * sin(a) - 470, 0.0);
    brush.vertex(10 * cos(a) - 30, 10 * sin(a) - 430, -0.5);
    brush.vertex(10 * cos(a) - 10, 10 * sin(a) - 390, -1.0);
    brush.endShape(true);
  }
  brush.set("2H", cv, 0.5);
  brush.line(-10, -520, 0, -180);
  brush.line(10, -520, 0, -180);
}

function draw() {}