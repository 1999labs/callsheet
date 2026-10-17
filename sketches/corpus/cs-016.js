function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(97617);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#6f8a7a", pet = "#6a6fc0", acc = "#3f448a", stm = "#7a8a6a";
  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 0, -300);
  for (let i = 0; i < 3; i++) {
    brush.set("2B", fol, 0.8);
    brush.line(-110 + i * 110, 650, -130 + i * 110, -280);
  }
  for (let i = 0; i < 3; i++) {
    const a = -HALF_PI + (i - 1) * 0.9;
    brush.fill(pet, 84);
    brush.beginShape(0.8);
    brush.vertex(0, -400, 0.5);
    brush.vertex(cos(a) * 140, -400 + sin(a) * 140, 1.0);
    brush.vertex(cos(a + 0.3) * 60, -400 + sin(a + 0.3) * 60, 0.5);
    brush.endShape(true);
  }
  for (let i = 0; i < 3; i++) {
    const a = HALF_PI + (i - 1) * 0.9;
    brush.fill(acc, 80);
    brush.beginShape(0.8);
    brush.vertex(0, -400, 0.5);
    brush.vertex(cos(a) * 120, -400 + sin(a) * 120, 1.0);
    brush.vertex(cos(a - 0.3) * 60, -400 + sin(a - 0.3) * 60, 0.5);
    brush.endShape(true);
  }
  brush.fill(acc, 120);
  brush.circle(0, -400, 24, 0.4);
}

function draw() {}
