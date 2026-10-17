function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(7);
  background("#f3ecdd");
  brush.scaleBrushes(4);

  // cut stem end
  brush.set("2B", "#6b5a3e", 1.0);
  brush.line(6, 640, 4, -350);

  // leaves, alternating sides
  const leaf = (x1, y1, x2, y2, x3, y3, col) => {
    brush.fill(col, 68);
    brush.fillBleed(0.45, "out", 25);
    brush.fillTexture(0.45, 0.35);
    brush.beginShape(0.6);
    brush.vertex(x1, y1, 0.4);
    brush.vertex(x2, y2, 1.0);
    brush.vertex(x3, y3, 0.4);
    brush.endShape(true);
  };

  leaf(8, 300, -170, 220, 10, 150, "#8a9c5a");
  leaf(8, 150, 180, 70, 12, 0, "#7d9150");
  leaf(6, -20, -150, -90, 10, -160, "#94a463");
  leaf(6, -170, 170, -240, 8, -300, "#7d9150");
  leaf(5, -290, -120, -350, 6, -390, "#8a9c5a");

  // stem ink detail
  brush.set("rotring", "#5a4a34", 0.7);
  brush.line(6, 640, 4, -350);

  // flower head: five petals
  brush.fillBleed(0.5, "out", 30);
  brush.fillTexture(0.5, 0.4);
  brush.fill("#eec48a", 85);
  brush.beginShape(0.8);
  brush.vertex(0, -560, 0.5);
  brush.vertex(-95, -470, 0.9);
  brush.vertex(-40, -400, 0.5);
  brush.endShape(true);
  brush.beginShape(0.8);
  brush.vertex(0, -560, 0.5);
  brush.vertex(95, -470, 0.9);
  brush.vertex(40, -400, 0.5);
  brush.endShape(true);
  brush.beginShape(0.8);
  brush.vertex(-95, -470, 0.6);
  brush.vertex(-70, -585, 0.9);
  brush.vertex(0, -560, 0.5);
  brush.endShape(true);
  brush.beginShape(0.8);
  brush.vertex(95, -470, 0.6);
  brush.vertex(70, -585, 0.9);
  brush.vertex(0, -560, 0.5);
  brush.endShape(true);
  brush.beginShape(0.8);
  brush.vertex(0, -560, 0.5);
  brush.vertex(-55, -430, 0.8);
  brush.vertex(55, -430, 0.8);
  brush.endShape(true);

  // flower center
  brush.fill("#8a5a2b", 120);
  brush.circle(0, -480, 26, 0.4);

  // buds
  brush.fill("#d9b27e", 70);
  brush.circle(-130, -330, 34, 0.5);
  brush.circle(140, -250, 30, 0.5);
}

function draw() {}
