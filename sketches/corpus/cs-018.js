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
  randomSeed(31903);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#8a9a78", pet = "#c8342a", acc = "#3a2a2a", stm = "#7a8a66";
  brush.set("2B", stm, 1.0);
  brush.line(0, 640, -20, -300);
  for (let i = 0; i < 4; i++) {
    leaf(-8, 500 - i * 190, (i % 2 ? 1 : -1) * 250, 470 - i * 190, 130, fol, 58);
  }
  brush.fillBleed(0.55, "out", 30);
  brush.fillTexture(0.5, 0.4);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TWO_PI + 0.4;
    brush.fill(pet, 70 - i * 5);
    brush.beginShape(0.9);
    brush.vertex(cos(a - 0.9) * 60 - 20, -400 + sin(a - 0.9) * 60, 1.0);
    brush.vertex(cos(a) * 170 - 20, -400 + sin(a) * 170, 0.5);
    brush.vertex(cos(a + 0.9) * 60 - 20, -400 + sin(a + 0.9) * 60, 1.0);
    brush.endShape(true);
  }
  brush.fill(acc, 130);
  brush.circle(-20, -400, 44, 0.4);
}

function draw() {}
