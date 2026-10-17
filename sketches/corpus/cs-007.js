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
  randomSeed(72903);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#6f8a4e", pet = "#a9bd7f", acc = "#4f6a34", stm = "#7a8a56";
  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 0, -520);
  leaf(0, 540, -300, 480, 120, fol, 62);
  leaf(0, 540, 310, 490, 120, fol, 62);
  leaf(0, 620, -200, 650, 100, fol, 58);
  leaf(0, 380, 260, 320, 110, fol, 60);
  for (let i = 0; i < 6; i++) {
    const y = -60 - i * 85, dx = (i % 2 ? 1 : -1) * 90;
    brush.set("HB", stm, 0.6);
    brush.line(0, y, dx, y - 30);
    brush.fill(pet, 84);
    brush.circle(dx, y - 44, random(34, 42), 0.5);
    if (i % 2 === 0) {
      brush.set("2H", acc, 0.5);
      brush.line(dx, y - 70, dx, y - 20);
    }
  }
}

function draw() {}
