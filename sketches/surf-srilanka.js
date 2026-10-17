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

const scaleAbout = (pts, ax, ay, s) => pts.map((p) => [ax + (p[0] - ax) * s, ay + (p[1] - ay) * s]);

const ell = (cx, cy, rx, ry, angDeg, n, ph) => {
  const a = (angDeg * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const pts = [];
  for (let k = 0; k < n; k++) {
    const th = (k / n) * Math.PI * 2;
    const rr = 1 + 0.15 * (noise(k * 0.8 + ph) - 0.5) * 2;
    const e = Math.cos(th) * rx * rr;
    const f = Math.sin(th) * ry * rr;
    pts.push([cx + ca * e - sa * f, cy + sa * e + ca * f]);
  }
  return pts;
};

function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(24);
  noiseSeed(24);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  brush.noHatch();
  brush.noMass();

  // sky
  paint("#e8764a", 205, 0.22, band(-740, -140, 10, 2));
  paint("#7a4a78", 180, 0.22, band(-740, -420, 12, 4));

  // sun setting
  wash("#f2b060", 60, 0.3);
  drawPoly(lens(60, -150, 210, 160, 20, 0.16, 6), 0.5);
  wash("#f2a848", 215, 0.22);
  drawPoly(lens(60, -140, 95, 82, 18, 0.1, 7), 0.5);

  // sea
  paint("#26355a", 215, 0.2, band(-150, 190, 14, 8));
  paint("#1f2b45", 215, 0.2, band(150, 330, 14, 10));

  // light path
  for (let k = 0; k < 16; k++) {
    const f = k / 15;
    dab(60 + random(-1, 1) * (8 + 55 * f), -110 + f * 340, f < 0.55 ? "#f2c88a" : "#e8a868", random(2, 3.4) + f * 1.5);
  }

  // swells
  wash("#1a2334", 225, 0.2);
  drawPoly(lens(-180, 120, 190, 34, 16, 0.2, 12), 0.5);
  wash("#16202f", 225, 0.2);
  drawPoly(lens(140, 165, 240, 40, 16, 0.2, 14), 0.5);
  wash("#1a2334", 225, 0.2);
  drawPoly(lens(350, 120, 160, 30, 16, 0.2, 16), 0.5);

  // standing surfer on middle swell
  brush.set("pen", "#16202f", 5);
  brush.line(100, 132, 185, 126);
  wash("#16202f", 215, 0.1);
  drawPoly(lens(140, 118, 9, 7.5, 12, 0.1, 18), 0.5);
  wash("#16202f", 215, 0.1);
  drawPoly(lens(140, 104, 5, 5, 10, 0.1, 19), 0.5);
  brush.set("pen", "#16202f", 2.6);
  brush.line(124, 108, 152, 101);

  // paddler on far swell
  brush.set("pen", "#16202f", 5.5);
  brush.line(-260, 108, -190, 112);
  wash("#16202f", 215, 0.1);
  drawPoly(lens(-225, 102, 16, 7, 12, 0.1, 21), 0.5);
  wash("#16202f", 215, 0.1);
  drawPoly(lens(-246, 98, 4.5, 4.5, 10, 0.1, 22), 0.5);
  brush.set("pen", "#16202f", 2.4);
  brush.line(-238, 104, -218, 96);
  brush.line(-206, 104, -186, 97);

  // floating board
  brush.set("pen", "#16202f", 5);
  brush.line(-350, 210, -270, 205);
  dab(-340, 213, "#16202f", 2.2);

  // beach
  paint("#dcb488", 185, 0.22, band(300, 760, 16, 12));
  paint("#c6a078", 190, 0.2, band(302, 368, 12, 14));
  dab(96, 322, "#f2c88a", 2.4);
  dab(130, 336, "#f2c88a", 2);
  dab(60, 348, "#f2c88a", 2.2);
  dab(168, 318, "#f2c88a", 1.8);

  // flag pole
  brush.set("rotring", "#4a4438", 2.5);
  brush.line(330, 640, 330, 336);

  // flag
  const flag = [
    [332, 338], [400, 326], [470, 338], [510, 330], [516, 392],
    [508, 438], [470, 452], [400, 446], [332, 444],
  ];
  wash("#e8a83c", 215, 0.14);
  drawPoly(flag, 0.35);
  wash("#7a2a30", 228, 0.16);
  drawPoly(scaleAbout(flag, 424, 390, 0.87), 0.35);
  brush.set("pen", "#2e6b3a", 9);
  brush.line(349, 333, 349, 449);
  brush.set("pen", "#e87a2a", 9);
  brush.line(363, 332, 363, 448);
  wash("#e8a83c", 235, 0.1);
  drawPoly(lens(445, 380, 9, 8, 10, 0.1, 24), 0.5);
  wash("#e8a83c", 235, 0.1);
  drawPoly(lens(438, 366, 4.5, 4.5, 8, 0.1, 25), 0.5);
  brush.set("rotring", "#e8a83c", 1.3);
  brush.line(444, 356, 456, 344);
  dab(355, 348, "#e8a83c", 2.5);
  dab(492, 344, "#e8a83c", 2.5);
  dab(357, 432, "#e8a83c", 2.5);
  dab(494, 428, "#e8a83c", 2.5);

  // palm
  brush.set("rotring", "#2e3a26", 1.4);
  brush.spline([[-434, 604, 1], [-416, 500, 0.9], [-398, 420, 0.7], [-380, 362, 0.55]], 0.5);
  const fr = [
    [-448, 292, 84, 14, 41],
    [-414, 258, 86, 13, 68],
    [-362, 240, 88, 13, 100],
    [-306, 264, 86, 13, 131],
    [-256, 310, 84, 14, 158],
    [-254, 370, 88, 14, 12],
    [-302, 404, 84, 13, 38],
  ];
  for (const f of fr) {
    wash("#2b3620", 215, 0.16);
    drawPoly(ell(f[0], f[1], f[2], f[3], f[4], 12, f[0] * 0.1), 0.5);
  }
  wash("#2b3620", 220, 0.14);
  drawPoly(lens(-380, 352, 13, 11, 10, 0.15, 27), 0.5);
  wash("#c8a078", 170, 0.2);
  drawPoly(lens(-436, 606, 30, 12, 12, 0.3, 31), 0.5);

  // spray
  for (let k = 0; k < 8; k++) {
    dab(random(-200, 420), random(60, 210), "#dfeaf0", random(1.5, 2.6));
  }
}

function draw() {}
