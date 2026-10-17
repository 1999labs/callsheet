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

const along = (pts, t) => {
  const seg = Math.min(0.9999, Math.max(0, t)) * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(seg));
  const f = seg - i;
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
};

const scaleAbout = (pts, ax, ay, s) => pts.map((p) => [ax + (p[0] - ax) * s, ay + (p[1] - ay) * s]);

function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(21);
  noiseSeed(21);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  brush.noHatch();
  brush.noMass();

  brush.set("rotring", "#9fb8c8", 0.5);
  brush.spline([[-540, -330, 1], [-380, -336, 0.8], [-180, -330, 0.8], [-60, -334, 1]], 0.5);

  wash("#f2cf8e", 65, 0.3, [0.4, 0.15, false]);
  drawPoly(lens(330, -430, 95, 95, 20, 0.18, 3), 0.5);

  const ctrl = [
    [-540, 150], [-330, 0], [-90, -160], [120, -280], [250, -325],
    [340, -295], [410, -200], [470, -70], [510, 70], [540, 160],
  ];
  const top = [];
  for (let i = 0; i <= 20; i++) top.push(along(ctrl, i / 20));
  const full = [...top, [540, 480], [540, 780], [0, 780], [-540, 780]];

  paint("#2e4f6e", 205, 0.18, full);
  paint("#3f8ba8", 195, 0.16, scaleAbout(full, 60, -20, 0.72));
  paint("#58b8c8", 180, 0.16, scaleAbout(full, 170, -160, 0.45));
  paint("#7fd0d8", 165, 0.18, scaleAbout(full, 210, -220, 0.26));

  wash("#2e4f6e", 190, 0.2, [0.3, 0.2, false]);
  drawPoly(lens(-230, 150, 240, 190, 18, 0.25, 33), 0.5);
  wash("#2e4f6e", 175, 0.2, [0.3, 0.2, false]);
  drawPoly(lens(-10, -40, 190, 125, 18, 0.25, 41), 0.5);

  for (let i = 4; i <= 18; i++) {
    const p = top[i];
    const r = random(30, 66) * (i > 8 && i < 15 ? 1.22 : 1);
    paint("#ffffff", random(232, 252), 0.2, lens(p[0] + random(-8, 8), p[1] + random(2, 18), r, r * 0.78, 14, 0.3, i * 3), [0.3, 0.35, false]);
  }

  for (let k = 0; k < 36; k++) {
    const p = along(top, 0.5 + 0.46 * random());
    dab(p[0] + random(-20, 90), p[1] + random(-95, -8), k % 3 ? "#ffffff" : "#dff2f5", random(1.6, 3.8));
  }

  for (let k = 0; k < 5; k++) {
    const x = random(-380, 250);
    const y = random(630, 690);
    brush.set("pen", "#ffffff", random(2.2, 3));
    brush.line(x, y, x + random(30, 80), y + random(-6, 6));
  }

  brush.set("pen", "#1e2a3a", 6);
  brush.line(-92, 56, -6, 40);
  wash("#1e2a3a", 215, 0.1);
  drawPoly(lens(-50, 24, 13, 11, 10, 0.12, 9), 0.5);
  wash("#1e2a3a", 215, 0.1);
  drawPoly(lens(-47, -4, 6.5, 6.5, 8, 0.1, 11), 0.5);
  brush.set("pen", "#1e2a3a", 3.4);
  brush.line(-68, 12, -30, 2);
}

function draw() {}
