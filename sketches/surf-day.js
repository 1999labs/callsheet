const wash = (color, opacity, bleed, tex) => {
  brush.noMass();
  brush.noStroke();
  brush.fill(color, opacity);
  brush.fillBleed(bleed, "out");
  if (tex) brush.fillTexture(tex[0], tex[1], tex[2]);
  else brush.fillTexture(0.5, 0.3, false);
};

const drawPoly = (pts, curvature) => {
  brush.beginShape(curvature);
  for (let i = 0; i < pts.length; i++) brush.vertex(pts[i][0], pts[i][1], 1);
  brush.endShape(true);
};

const paint = (color, opacity, bleed, pts, tex) => {
  for (let r = 0; r < 2; r++) {
    wash(color, opacity, bleed, tex || [0.3, 0.2, false]);
    drawPoly(pts, 0.5);
  }
};

const dab = (x, y, color, weight, name) => {
  brush.set(name || "pen", color, weight);
  brush.line(x, y, x + 1.3, y + 0.6);
};

const lens = (cx, cy, rx, ry, n, wob, ph) => {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const th = (k / n) * Math.PI * 2;
    const rr = 1 + wob * (noise(k * 0.8 + ph) - 0.5) * 2;
    pts.push([cx + Math.cos(th) * rx * rr, cy + Math.sin(th) * ry * rr]);
  }
  return pts;
};

const band = (y0, y1, amp, ph) => {
  const pts = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push([-540 + t * 1080, y0 + (noise(ph + t * 3.3) - 0.5) * 2 * amp]);
  }
  for (let i = N; i >= 0; i--) {
    const t = i / N;
    pts.push([-540 + t * 1080, y1 + (noise(ph + 9 + t * 3.3) - 0.5) * 2 * amp]);
  }
  return pts;
};

function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(23);
  noiseSeed(23);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  brush.noHatch();
  brush.noMass();

  // dawn glass
  paint("#f2cfa8", 140, 0.22, band(-640, -360, 16, 2));
  wash("#f0b46a", 65, 0.3);
  drawPoly(lens(300, -512, 78, 60, 18, 0.14, 4), 0.5);
  wash("#f0b46a", 170, 0.24);
  drawPoly(lens(300, -512, 38, 30, 16, 0.12, 5), 0.5);
  paint("#b8cfd8", 160, 0.2, band(-505, -356, 12, 6));
  brush.set("pen", "#33404f", 3.2);
  brush.line(-140, -464, -100, -469);
  wash("#33404f", 200, 0.1);
  drawPoly(lens(-121, -477, 6.5, 5.5, 12, 0.1, 7), 0.5);
  wash("#33404f", 200, 0.1);
  drawPoly(lens(-121, -487, 3.8, 3.8, 10, 0.1, 9), 0.5);
  dab(-126, -455, "#f0c88a", 2.2);
  dab(-116, -452, "#f0c88a", 1.7);
  dab(-121, -448, "#f0c88a", 2);

  // midday glare
  paint("#f5e0b8", 140, 0.22, band(-315, -35, 16, 12));
  paint("#3fa8b8", 200, 0.2, band(-170, -33, 14, 16));
  wash("#ffffff", 200, 0.26, [0.7, 0.9, false]);
  drawPoly(lens(-60, -118, 40, 26, 16, 0.3, 18), 0.5);
  wash("#ffffff", 195, 0.26, [0.7, 0.9, false]);
  drawPoly(lens(90, -108, 46, 30, 16, 0.3, 19), 0.5);
  wash("#ffffff", 205, 0.26, [0.7, 0.9, false]);
  drawPoly(lens(210, -118, 34, 24, 16, 0.3, 20), 0.5);
  wash("#ffffff", 245, 0.24);
  drawPoly(lens(330, -225, 34, 34, 16, 0.1, 21), 0.5);
  for (let k = 0; k < 8; k++) {
    dab(330 + random(-52, 52), -225 + random(-52, 52), "#fff6dd", random(1.5, 2.6));
  }
  for (let i = 0; i < 8; i++) {
    const x = -260 + i * 72 + random(-14, 14);
    const y = -58 - i * 5 + random(-8, 8);
    wash("#ffffff", random(215, 240), 0.26, [0.8, 0.9, false]);
    drawPoly(lens(x, y, random(14, 22), random(10, 16), 12, 0.3, 26 + i), 0.5);
  }

  // onshore chop
  paint("#2e5a78", 215, 0.2, band(10, 290, 16, 32));
  for (let k = 0; k < 22; k++) {
    brush.set("pen", k % 3 ? "#cfeaf0" : "#9fd0d8", random(1.5, 3));
    const x = random(-480, 470);
    const y = random(46, 268);
    brush.line(x, y, x + random(9, 22), y + random(-3, 6));
  }
  for (let i = 0; i < 6; i++) {
    wash("#ffffff", random(210, 235), 0.26, [0.8, 0.9, false]);
    drawPoly(lens(-400 + i * 160 + random(-30, 30), random(252, 282), random(18, 30), random(12, 20), 12, 0.3, 44 + i), 0.5);
  }
  brush.set("rotring", "#a8b8c0", 0.55);
  brush.spline([[-520, 14, 1], [-180, 6, 0.9], [160, 18, 0.9], [520, 9, 1]], 0.5);

  // sunset set
  paint("#e8764a", 200, 0.22, band(335, 498, 14, 56));
  paint("#7a4a78", 170, 0.22, band(335, 432, 12, 52));
  wash("#f2b060", 60, 0.3, [0.4, 0.2, false]);
  drawPoly(lens(150, 478, 100, 45, 18, 0.16, 60), 0.5);
  wash("#f2a03c", 215, 0.22);
  drawPoly(lens(150, 478, 46, 40, 16, 0.1, 61), 0.5);
  paint("#23324e", 215, 0.2, band(470, 615, 14, 62));
  for (let k = 0; k < 14; k++) {
    const f = k / 13;
    dab(150 + random(-1, 1) * (10 + 60 * f), 492 + f * 112, f < 0.5 ? "#f2c88a" : "#e8a868", random(1.8, 3.2) + f * 1.4);
  }
  wash("#16202f", 225, 0.2);
  drawPoly(lens(-320, 578, 190, 34, 16, 0.2, 64), 0.5);
  wash("#1a2334", 220, 0.2);
  drawPoly(lens(60, 592, 240, 38, 16, 0.2, 66), 0.5);
  wash("#16202f", 225, 0.2);
  drawPoly(lens(360, 570, 150, 30, 16, 0.2, 68), 0.5);
  brush.set("pen", "#16202f", 4.5);
  brush.line(322, 556, 398, 549);
  wash("#16202f", 215, 0.1);
  drawPoly(lens(360, 538, 8.5, 7, 12, 0.1, 70), 0.5);
  wash("#16202f", 215, 0.1);
  drawPoly(lens(360, 526, 4.5, 4.5, 10, 0.1, 71), 0.5);
  brush.set("pen", "#16202f", 2.6);
  brush.line(346, 531, 374, 524);
}

function draw() {}
