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
  randomSeed(95284);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#8a9278", pet = "#7d6fae", acc = "#4f4671", stm = "#7d8466";
  brush.wiggle(2);
  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 10, -400);
  brush.noField();
  leaf(5, 560, -300, 470, 130, fol, 60);
  leaf(5, 400, 290, 300, 120, fol, 58);
  leaf(5, 240, -280, 140, 120, fol, 58);
  leaf(5, 80, 260, -20, 110, fol, 56);
  for (let i = 0; i < 7; i++) {
    const a = PI + (i / 6) * PI, x = cos(a) * 90, y = -380 + sin(a) * 30;
    brush.set("HB", fol, 0.6);
    brush.beginShape(0.4);
    brush.vertex(0, -380, 0.6);
    brush.vertex(x, y - 60, 1.0);
    brush.vertex(x * 1.35, y - 10, 1.0);
    brush.endShape(true);
  }
  brush.mass("HB", acc, { strength: 0.85 });
  brush.circle(0, -460, 72, 0.5);
  brush.noMass();
  brush.set("2H", pet, 0.6);
  for (let i = 0; i < 10; i++) {
    brush.line(-45 + i * 9, -540, -53 + i * 9, -584);
  }
}

function draw() {}
