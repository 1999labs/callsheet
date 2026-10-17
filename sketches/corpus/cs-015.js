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
  const fol = "#4f6b3f", pet = "#b03448", acc = "#6e1f2c", stm = "#7a4a3a";
  brush.set("2B", stm, 1.0);
  brush.line(0, 640, -10, -260);
  for (let i = 0; i < 5; i++) {
    leaf(0, 520 - i * 180, (i % 2 ? 1 : -1) * 230, 490 - i * 180, 120, fol, 58);
  }
  brush.fillBleed(0.3, "out", 40);
  brush.fillTexture(0.4, 0.3);
  for (let ring = 2; ring >= 1; ring--) {
    const R = 80 + ring * 46, n = 7 + ring * 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TWO_PI + ring;
      brush.fill(ring === 2 ? pet : acc, 88);
      brush.beginShape(0.9);
      brush.vertex(cos(a - 0.5) * 30 - 10, -400 + sin(a - 0.5) * 30, 1.0);
      brush.vertex(cos(a) * R * 0.85 - 10, -400 + sin(a) * R * 0.85, 0.5);
      brush.vertex(cos(a + 0.5) * 30 - 10, -400 + sin(a + 0.5) * 30, 1.0);
      brush.endShape(true);
    }
  }
  brush.fill(acc, 130);
  brush.circle(-10, -400, 30, 0.4);
}

function draw() {}
