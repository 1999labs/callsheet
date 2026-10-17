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
  randomSeed(50522);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#93a08a", pet = "#efe9da", acc = "#b9a86f", stm = "#8f9078";
  brush.set("2B", stm, 0.9);
  brush.line(0, 640, 0, -300);
  for (let k = 0; k < 3; k++) {
    leaf(0, 440 - k * 220, (k % 2 ? 1 : -1) * 200, 390 - k * 220, 120, fol, 58);
  }
  for (let i = 0; i < 13; i++) {
    const a = PI + (i / 12) * PI, x = cos(a) * 120, y = -430 + sin(a) * 60;
    brush.set("HB", stm, 0.5);
    brush.line(0, -320, x, y);
    brush.fill(pet, random(70, 100));
    brush.circle(x, y, random(26, 36), 0.4);
  }
  brush.fill(acc, 90);
  brush.circle(0, -430, 22, 0.4);
}

function draw() {}
