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
  randomSeed(64760);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#7f8f44", pet = "#e69a44", acc = "#b07aa8", stm = "#8f5a34";
  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 0, -180);
  for (let i = 0; i < 12; i++) {
    leaf(0, 540 - i * 170, (i % 6) ? 1 : -1, 500 - i * 170, 110, fol, 58);
  }
  brush.fillBleed(0.3, "out", 40);
  brush.fillTexture(0.4, 0.3);
  for (let i = 0; i < 2; i++) {
    const y = -200 - i * 340, dx = (i % 2 ? 1 : -1) * 90;
    brush.beginShape(0.8);
    brush.vertex(dx, y, 0.4);
    brush.vertex(dx - 15, y - 70, 1.0);
    brush.vertex(dx, y - 140, 0.4);
    brush.vertex(dx + 15, y - 70, 1.0);
    brush.vertex(dx, y, 0.4);
    brush.endShape(true);
    brush.set("2H", pet, 0.6);
    brush.line(dx, y - 70, dx, y - 210);
  }
}

function draw() {}