function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(28141);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#5f7a44", pet = "#7f9a5c", acc = "#3f5a30", stm = "#6b7a4a";
  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 0, -620);
  for (let i = 0; i < 12; i++) {
    const y = 560 - i * 105, len = 210 * (1 - i / 12) + 70, col = i < 6 ? pet : fol;
    for (const dir of [-1, 1]) {
      brush.beginShape(0.6);
      brush.vertex(0, y - 42, 0.4);
      brush.vertex(dir * len, y - 80, 1.0);
      brush.vertex(0, y + 42, 0.4);
      brush.hatchStyle("rotring", col, 0.7);
      brush.hatch(random(6, 11), random(24, 64), { rand: 0.15 });
      brush.endShape(true);
    }
  }
  brush.set("rotring", acc, 0.6);
  brush.line(0, 650, 0, -620);
}

function draw() {}
