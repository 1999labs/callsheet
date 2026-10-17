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
  randomSeed(75236);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#4f6b3f", pet = "#e6ddc8", acc = "#c99a34", stm = "#6b7a4a";
  brush.set("2B", stm, 0.9);
  brush.line(0, 640, 0, -300);
  leaf(0, 540, -290, 470, 130, fol, 60);
  leaf(0, 400, 300, 330, 130, fol, 60);
  leaf(0, 620, 230, 650, 110, fol, 56);
  brush.fillBleed(0.5, "out", 25);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TWO_PI;
    brush.fill(pet, 82);
    brush.beginShape(0.9);
    brush.vertex(cos(a - 0.22) * 66, -420 + sin(a - 0.22) * 66, 1.0);
    brush.vertex(cos(a) * 195, -420 + sin(a) * 195, 0.5);
    brush.vertex(cos(a + 0.22) * 66, -420 + sin(a + 0.22) * 66, 1.0);
    brush.endShape(true);
  }
  brush.fill(acc, 110);
  brush.circle(0, -420, 72, 0.4);
}

function draw() {}
