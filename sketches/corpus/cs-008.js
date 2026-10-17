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
  randomSeed(19094);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#4f6b3f", pet = "#8fa06a", acc = "#2f4a28", stm = "#6b5a3e";
  const pts = [[0, 650], [90, 380], [-70, 120], [80, -140], [-50, -420]];
  brush.set("2B", stm, 1.0);
  for (let i = 0; i < pts.length - 1; i++) {
    brush.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
  }
  for (let i = 1; i < pts.length; i++) {
    const x = pts[i][0], y = pts[i][1];
    leaf(x, y, x - 160, y - 50, 120, fol, 60);
    leaf(x, y, x + 155, y - 90, 120, fol, 58);
  }
  brush.fill(acc, 74);
  brush.circle(80, -180, 40, 0.5);
  brush.circle(-50, -450, 36, 0.5);
}

function draw() {}
