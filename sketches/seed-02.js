function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(19);
  background("#f1ead9");
  brush.scaleBrushes(4);

  // pale stem, three arching stems
  brush.set("2B", "#9a9280", 0.9);
  brush.line(0, 640, -30, -120);
  brush.line(-30, -120, -150, -430);
  brush.line(-30, -120, 120, -400);
  brush.line(-30, -120, 10, -520);

  // broad grey-green leaves near base
  brush.fillBleed(0.5, "out", 30);
  brush.fillTexture(0.5, 0.4);
  brush.fill("#7f8f77", 62);

  brush.beginShape(0.7);
  brush.vertex(-10, 420, 0.4);
  brush.vertex(-260, 300, 1.0);
  brush.vertex(-20, 210, 0.4);
  brush.endShape(true);

  brush.beginShape(0.7);
  brush.vertex(10, 300, 0.4);
  brush.vertex(250, 170, 1.0);
  brush.vertex(0, 90, 0.4);
  brush.endShape(true);

  brush.beginShape(0.7);
  brush.vertex(-5, 120, 0.4);
  brush.vertex(-210, -20, 1.0);
  brush.vertex(0, -110, 0.4);
  brush.endShape(true);

  // dusty-blue bell flowers, hanging
  brush.fillBleed(0.55, "out", 40);
  brush.fillTexture(0.55, 0.45);
  brush.fill("#8fa8c4", 78);

  const bell = (x, y) => {
    brush.beginShape(0.8);
    brush.vertex(x, y, 0.4);
    brush.vertex(x - 42, y + 60, 1.0);
    brush.vertex(x, y + 120, 0.4);
    brush.vertex(x + 42, y + 60, 1.0);
    brush.endShape(true);
    brush.set("2H", "#6d86a3", 0.5);
    brush.line(x, y + 20, x, y + 118);
  };

  bell(-150, -450);
  bell(-150, -300);
  bell(-150, -150);
  bell(120, -420);
  bell(120, -270);
  bell(10, -540);

  // stem ink detail on top
  brush.set("rotring", "#8a8270", 0.6);
  brush.line(0, 640, -30, -120);
  brush.line(-30, -120, -150, -430);
  brush.line(-30, -120, 120, -400);
}

function draw() {}
