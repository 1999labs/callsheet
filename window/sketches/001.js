function figure(cx, baseY, h, col, hair) {
  const headR = h * 0.105;
  const headY = baseY - h + headR;
  brush.fill(col, 242);
  brush.fillTexture(0.45, 0.35);
  brush.fillBleed(0.25, "out", 0);
  brush.beginShape(0.55);
  brush.vertex(cx - h * 0.155, baseY, 1.0);
  brush.vertex(cx - h * 0.105, headY + headR * 1.5, 0.75);
  brush.vertex(cx, headY + headR * 1.1, 0.65);
  brush.vertex(cx + h * 0.105, headY + headR * 1.5, 0.75);
  brush.vertex(cx + h * 0.155, baseY, 1.0);
  brush.endShape(true);
  brush.fill(col, 250);
  brush.circle(cx, headY, headR * 2, 0.45);
  brush.fill(hair, 245);
  brush.circle(cx - headR * 0.55, headY - headR * 0.55, headR * 0.95, 0.35);
}

function setup() {
  createCanvas(1000, 1250, WEBGL);
  randomSeed(101);
  pixelDensity(1);
  background("#efe7d6");
  brush.scaleBrushes(4);
  brush.noHatch();
  brush.noStroke();

  const wall = "#d9a54e";
  const floor = "#a85a3d";
  const floorDark = "#8f4a33";
  const light = "#f7efd9";
  const frame = "#3a3128";
  const dress = "#2f4858";
  const hair = "#232a33";
  const field = "#6f7d4e";
  const rain = "#e8ddc4";

  brush.fill(wall, 236);
  brush.fillTexture(0.5, 0.35);
  brush.fillBleed(0.3, "out", 0);
  brush.rect(-440, -560, 880, 760);

  brush.fill(floor, 238);
  brush.fillTexture(0.5, 0.4);
  brush.rect(-440, 200, 880, 360);
  brush.set("2B", floorDark, 1.1);
  brush.line(-440, 200, 440, 200);

  brush.fill(light, 246);
  brush.fillTexture(0.28, 0.25);
  brush.rect(-170, -430, 380, 400);

  brush.fill(field, 225);
  brush.fillTexture(0.55, 0.4);
  brush.rect(-170, -95, 380, 65);

  brush.set("2H", rain, 0.8);
  for (let i = 0; i < 28; i++) {
    const x = -160 + random(360);
    const y = -420 + random(320);
    brush.line(x, y, x - 20, y + 46);
  }

  brush.set("2B", frame, 1.5);
  brush.line(-170, -230, 210, -230);
  brush.line(20, -430, 20, -30);

  brush.set("2B", frame, 2.2);
  brush.line(-170, -430, 210, -430);
  brush.line(-170, -30, 210, -30);
  brush.line(-170, -430, -170, -30);
  brush.line(210, -430, 210, -30);

  brush.fill("#6b3626", 80);
  brush.fillTexture(0.6, 0.5);
  brush.beginShape(0.35);
  for (let a = 0; a < TWO_PI; a += 0.25) {
    brush.vertex(-250 + cos(a) * 95, 212 + sin(a) * 17, 1.0);
  }
  brush.endShape(true);

  figure(-250, 200, 505, dress, hair);

  brush.set("2B", "#efe7d6", 0.9);
  brush.line(-244, -300, -212, -190);
}

function draw() {}
