function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(96713);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#b3a469", pet = "#d8c48a", acc = "#8a7a44", stm = "#a9995c";
  brush.set("2B", stm, 0.8);
  for (let i = 0; i < 11; i++) {
    const x0 = -90 + i * 18;
    brush.line(x0, 640, x0 - 40 + i * 14, -560 - i * 8);
  }
  brush.set("2H", pet, 0.4);
  for (let i = 0; i < 20; i++) {
    const x = -160 + i * 16, y = -600 - (i % 5) * 16;
    brush.line(x, y, x + 6, y - 50);
  }
  brush.fill(fol, 50);
  brush.circle(-50, 640, 60, 0.6);
}

function draw() {}
