function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(28055);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#7f995c", pet = "#e6c15a", acc = "#b07aa8", stm = "#8f5a3e";
  brush.set("2B", stm, 1.0);
  for (let i = 0; i < 11; i++) {
    const y = 650 - i * 170, dx = (i % 2 ? 1 : -1) * 400, len = 340, col = (i < 5) ? pet : acc;
    for (const dir of [-1, 1]) {
      brush.beginShape(0.6);
      brush.vertex(x - dx, y, 0.4);
      brush.vertex(x - dx + len * dir, y - 170, 1.0);
      brush.vertex(x, y - len, 0.4);
      brush.vertex(x + dx, y - 170, 1.0);
      brush.vertex(x + dx - len * dir, y, 0.4);
      brush.hatchStyle("rotring", col, 0.7);
      brush.hatch(random(6, 11), random(24, 64), { rand: 0.15 });
      brush.endShape(true);
    }
  }
  brush.set("rotring", stm, 0.6);
  brush.line(0, 540, 0, -180);
}

function draw() {}