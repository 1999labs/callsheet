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
  randomSeed(62427);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#7f8f33", pet = "#ec8f44", acc = "#b07aa8", stm = "#8a5a34";
  const pts = [[0, 650], [90, 380], [180, 300], [270, 140], [360, 10]];
  brush.set("2B", stm, 1.1);
  for (let i = 0; i < pts.length - 1; i++) {
    const x1 = pts[i][0], y1 = pts[i][1], x2 = pts[i + 1][0], y2 = pts[i + 1][1];
    brush.line(x1, y1, x2, y2);
  }
  brush.line(0, 540, 10, -300);
  brush.line(0, 300, -10, -500);
  for (let i = 0; i < 5; i++) {
    leaf(10 + i * 170, 500 - i * 85, 10 + (i + 1) * 170, 415 - i * 85, 130, fol, 58);
  }
  for (let i = 0; i < 3; i++) {
    const x = 10 + i * 170, y = 10;
    brush.fill(i % 2 ? stm : acc, 88);
    brush.circle(x, y, random(68, 84), 0.5);
  }
  brush.fill(pet, 140);
  brush.beginShape(0.8);
  brush.vertex(10, 300);
  brush.vertex(100, 300);
  brush.vertex(10, 500);
  brush.vertex(90, 500);
  brush.vertex(10, 300);
  brush.endShape(true);
}

function draw() {}