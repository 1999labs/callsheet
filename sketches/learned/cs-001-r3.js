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
  randomSeed(19998);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#5f7a44", pet = "#e6c15a", acc = "#b07aa8", stm = "#8c5a34";
  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 0, -180);
  for (let i = 0; i < 12; i++) {
    leaf(0, 540 - i * 170, (i % 6 ? 1 : -1) * 10, 500 - i * 170, 110, fol, 58);
  }
  for (let i = 0; i < 6; i++) {
    const y = 350 - i * 170, dx = (i % 3 ? 1 : -1) * 10;
    brush.fill(i > 2 ? acc : pet, 88);
    brush.circle(dx, y, random(36, 60), 0.5);
  }
}

function draw() {}