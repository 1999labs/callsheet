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
  const fol = "#7f8f77", pet = "#8fa8c4", acc = "#8fa8c4", stm = "#7a8a6a";
  const cv = "#8fa8c4", vt = "#b17a5a", th = "#7a5a30", a = "#6a3010";
  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 0, -520);
  leaf(0, 540, -300, 480, 120, fol, 60);
  leaf(0, 540, 310, 490, 120, fol, 60);
  leaf(0, 620, -200, 650, 100, fol, 58);
  leaf(0, 380, 260, 320, 110, fol, 62);
  leaf(0, 300, -90, 240, 106, fol, 60);
  leaf(0, 0, 120, -140, 120, fol, 60);
  for (let i = 0; i < 7; i++) {
    const x = (i % 2 ? 1 : -1) * 90;
    brush.set("2H", x, 0.6);
    brush.line(0,CV, x, -CV);
  }
  brush.fillBleed(0.5, "out", 45);
  brush.fillTexture(0.5, 0.5);
  brush.fill(a, 74);
  brush.circle(0, 0, 66, 0.5);
}

function draw() {}