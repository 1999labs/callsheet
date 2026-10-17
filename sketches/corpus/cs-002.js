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
  randomSeed(84808);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#7f8f77", pet = "#8fa8c4", acc = "#6d86a3", stm = "#9a9280";
  brush.set("2B", stm, 0.9);
  brush.line(0, 640, -30, -120);
  brush.line(-30, -120, -170, -430);
  brush.line(-30, -120, 140, -400);
  brush.line(-30, -120, 10, -560);
  leaf(-10, 460, -300, 340, 140, fol, 62);
  leaf(10, 320, 290, 190, 130, fol, 62);
  leaf(-5, 140, -250, 0, 120, fol, 58);
  const bells = [[-170, -490], [-170, -320], [-170, -150], [140, -460], [140, -290], [10, -600]];
  for (const [x, y] of bells) {
    brush.fill(pet, 84);
    brush.beginShape(0.8);
    brush.vertex(x, y, 0.4);
    brush.vertex(x - 60, y + 78, 1.0);
    brush.vertex(x, y + 162, 0.4);
    brush.vertex(x + 60, y + 78, 1.0);
    brush.endShape(true);
    brush.set("2H", acc, 0.5);
    brush.line(x, y + 26, x, y + 158);
  }
}

function draw() {}
