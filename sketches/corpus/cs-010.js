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
  randomSeed(52855);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#5c7a72", pet = "#3f5a9c", acc = "#28386b", stm = "#6b7a5a";
  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 0, -180);
  for (let i = 0; i < 5; i++) {
    leaf(0, 540 - i * 170, (i % 2 ? 1 : -1) * 210, 500 - i * 170, 110, fol, 58);
  }
  for (let i = 0; i < 16; i++) {
    const t = i / 15, y = -200 - t * 300, x = (1 - t) * 80 * (i % 2 ? 1 : -1) - t * 10;
    brush.fill(i > 8 ? acc : pet, 86);
    brush.circle(x, y, random(28, 38), 0.5);
  }
  brush.set("rotring", acc, 0.5);
  brush.line(0, -180, 0, -520);
}

function draw() {}
