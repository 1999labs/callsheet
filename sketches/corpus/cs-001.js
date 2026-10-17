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
  randomSeed(17665);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#8a9c5a", pet = "#eec48a", acc = "#8a5a2b", stm = "#6b5a3e";
  brush.set("2B", stm, 1.0);
  brush.line(8, 620, 0, -440);
  for (let i = 0; i < 7; i++) {
    const y = 540 - i * 160, s = i % 2 ? 1 : -1;
    leaf(0, y, s * random(150, 240), y - 60, random(100, 140), fol, random(60, 84));
  }
  brush.set("rotring", stm, 0.7);
  brush.line(8, 620, 0, -440);
  brush.fillBleed(0.5, "out", 30);
  brush.fillTexture(0.5, 0.4);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TWO_PI - HALF_PI;
    brush.fill(pet, 82);
    brush.beginShape(0.8);
    brush.vertex(cos(a - 0.7) * 52, -510 + sin(a - 0.7) * 52, 1.0);
    brush.vertex(cos(a) * 155, -510 + sin(a) * 155, 0.5);
    brush.vertex(cos(a + 0.7) * 52, -510 + sin(a + 0.7) * 52, 1.0);
    brush.endShape(true);
  }
  brush.fill(acc, 120);
  brush.circle(0, -510, 30, 0.4);
  brush.fill(pet, 72);
  brush.circle(-180, -330, 48, 0.5);
  brush.circle(190, -250, 42, 0.5);
}

function draw() {}
