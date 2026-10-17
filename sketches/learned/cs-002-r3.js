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
  randomSeed(84808);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#7f8f77", pet = "#8fa8c4", acc = "#6d86a3", stm = "#9a9280";
  brush.set("2B", stm, 0.9);
  brush.line(0, 640, 0, -300);
  for (let i = 0; i < 5; i++) {
    leaf(0, 520 - i * 180, (i % 2 ? 1 : -1) * 210, 500 - i * 180, 120, fol, 58);
  }
  brush.fillBleed(0.3, "out", 40);
  brush.fillTexture(0.4, 0.3);
  for (let i = 0; i < 16; i++) {
    const t = i / 15, y = -200 - t * 300, x = (1 - t) * 80 * (i % 2 ? 1 : -1) - t * 10;
    brush.fill(i > 8 ? acc : pet, 86);
    brush.circle(x, y, random(28, 38), 0.5);
  }
}

function draw() {}