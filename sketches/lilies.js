const PETAL_BASE = 34;

const PAL = {
  white: {
    layers: [
      ["#ffffff", 228, 0.14, 1.0, 0.5],
      ["#efe3cc", 85, 0.12, 0.85, 0.5],
      ["#e2e0b4", 80, 0.18, 0.52, 0.24],
    ],
    baseBlush: ["#e8b855", 70],
    stripe: null,
    vein: ["#c2c288", 0.55],
    freckle: ["#a8607a", "#9b4f36", "#cc7030"],
    nFreckle: 10,
  },
  pink: {
    layers: [
      ["#fdf3f6", 150, 0.14, 1.0, 0.5],
      ["#f2a9c8", 155, 0.12, 0.87, 0.52],
      ["#e07ba9", 130, 0.1, 0.66, 0.58],
    ],
    baseBlush: ["#e09a4e", 62],
    stripe: ["#c94f86", 115],
    vein: ["#d66a9c", 0.45],
    freckle: ["#8e3c60", "#7e3046", "#c0682e"],
    nFreckle: 5,
  },
};

const wash = (color, opacity, bleed) => {
  brush.noMass();
  brush.noStroke();
  brush.fill(color, opacity);
  brush.fillBleed(bleed, "out");
  brush.fillTexture(0.5, 0.3, false);
};

const drawPoly = (pts, curvature) => {
  brush.beginShape(curvature);
  for (let i = 0; i < pts.length; i++) brush.vertex(pts[i][0], pts[i][1], 1);
  brush.endShape(true);
};

const dab = (x, y, color, weight, name) => {
  brush.set(name || "pen", color, weight);
  brush.line(x, y, x + 1.3, y + 0.6);
};

const halfW = (Wmax, t) => {
  const s = Math.pow(Math.sin(Math.PI * Math.pow(t, 1.04)), 0.85);
  return Math.max(1.2, Wmax * s);
};

const petalGeom = (cx, cy, baseDeg, R, spanDeg, phase, curlAmp) => {
  const a = (baseDeg * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const vx = -uy;
  const vy = ux;
  const L = R - PETAL_BASE;
  const Wmax = L * Math.sin((spanDeg * Math.PI) / 360) * 0.92 * (1 + 0.06 * (noise(phase * 3.1) - 0.5) * 2);
  const at = (t) => {
    const bow = curlAmp * L * Math.pow(t, 2.1) + curlAmp * L * 0.18 * Math.sin(Math.PI * t);
    return [cx + ux * (PETAL_BASE + t * L) + vx * bow, cy + uy * (PETAL_BASE + t * L) + vy * bow];
  };
  const wAt = (t) => Math.max(0.6, halfW(Wmax, t) * (1 + 0.05 * (noise(t * 6 + phase) - 0.5) * 2) / 2);
  const fullPts = (t0) => {
    const up = [];
    const lo = [];
    const N = 30;
    for (let i = 0; i <= N; i++) {
      const t = t0 + (0.985 - t0) * (i / N);
      const [px, py] = at(t);
      const w = wAt(t);
      up.push([px + vx * w, py + vy * w]);
      lo.push([px - vx * w, py - vy * w]);
    }
    return [...up, ...lo.reverse()];
  };
  const stripePts = (centerT, lenFrac, widFrac) => {
    const [bx, by] = at(centerT);
    const pts = [];
    const N = 26;
    for (let k = 0; k < N; k++) {
      const ang = (k / N) * Math.PI * 2;
      const e = Math.cos(ang) * lenFrac * L;
      const f = Math.sin(ang) * widFrac * Wmax * (1 + 0.12 * (noise(k * 0.9 + phase) - 0.5) * 2);
      pts.push([bx + ux * e + vx * f, by + uy * e + vy * f]);
    }
    return pts;
  };
  return { at, wAt, fullPts, stripePts, Wmax, vx, vy, ux, uy, L };
};

const scaleAbout = (pts, ax, ay, s) => pts.map((p) => [ax + (p[0] - ax) * s, ay + (p[1] - ay) * s]);

const drawPetal = (cx, cy, baseDeg, R, spanDeg, phase, size, pal) => {
  const s = size || 1;
  const curl = random(-0.08, 0.08);
  const o = petalGeom(cx, cy, baseDeg, R, spanDeg, phase, curl);
  const full = o.fullPts(0.03);

  for (const layer of pal.layers) {
    const [color, opacity, bleed, sc, anchor] = layer;
    const pts = sc === 1 ? full : scaleAbout(full, ...o.at(anchor), sc);
    wash(color, opacity, bleed);
    drawPoly(pts, 0.5);
  }

  if (pal.baseBlush) {
    wash(pal.baseBlush[0], pal.baseBlush[1], 0.2);
    drawPoly(o.stripePts(0.15, 0.11, 0.22), 0.5);
  }

  if (pal.stripe) {
    wash(pal.stripe[0], pal.stripe[1], 0.18);
    drawPoly(o.stripePts(0.5, 0.34, 0.2), 0.5);
  }

  brush.set("rotring", pal.vein[0], pal.vein[1]);
  const vein = [];
  for (const t of [0.1, 0.5, 0.94]) {
    const [px, py] = o.at(t);
    vein.push([px, py, 1 - 0.5 * t]);
  }
  brush.spline(vein, 0.5);

  for (let i = 0; i < pal.nFreckle; i++) {
    const t = 0.18 + (i / Math.max(1, pal.nFreckle - 1)) * 0.62 + random(-0.03, 0.03);
    const [px, py] = o.at(t);
    const off = random(-0.34, 0.34) * o.wAt(t);
    dab(px + o.vx * off, py + o.vy * off, pal.freckle[i % pal.freckle.length], random(1.2, 2.3) * s);
  }
};

const drawLily = (cx, cy, R, rotDeg, pal) => {
  const throat = [];
  for (let k = 0; k < 20; k++) {
    const th = (k / 20) * Math.PI * 2;
    const rr = R * 0.16 * (1 + 0.2 * (noise(k * 0.7 + cx * 0.01) - 0.5) * 2);
    throat.push([cx + Math.cos(th) * rr, cy + Math.sin(th) * rr]);
  }
  wash("#e6c268", 80, 0.24);
  drawPoly(throat, 0.5);

  for (let k = 0; k < 6; k++) {
    const baseDeg = rotDeg + k * 60 + random(-4, 4);
    const span = 48 + random(-3, 3);
    const RR = R * (1 + random(-0.035, 0.035));
    drawPetal(cx, cy, baseDeg, RR, span, random(10), R / 230, pal);
  }

  for (let k = 0; k < 6; k++) {
    const fa = ((rotDeg + k * 60 + 28 + random(-5, 5)) * Math.PI) / 180;
    const r0f = 26;
    const r1f = R * (0.6 + random(0.08));
    const bow = random(-0.14, 0.14);
    const midR = (r0f + r1f) * 0.5;
    const midA = fa + bow;
    const fpts = [
      [cx + Math.cos(fa) * r0f, cy + Math.sin(fa) * r0f, 1],
      [cx + Math.cos(midA) * midR, cy + Math.sin(midA) * midR, 0.75],
      [cx + Math.cos(fa) * r1f, cy + Math.sin(fa) * r1f, 0.5],
    ];
    brush.set("rotring", "#c2bd8d", 0.55);
    brush.spline(fpts, 0.5);

    const tipX = fpts[2][0];
    const tipY = fpts[2][1];
    const dAng = Math.atan2(tipY - fpts[1][1], tipX - fpts[1][0]);
    const ax = Math.cos(dAng);
    const ay = Math.sin(dAng);
    brush.set("pen", "#8e3c22", 3.2 * (R / 230));
    brush.line(tipX - ax * 2.5, tipY - ay * 2.5, tipX + ax * 6.5, tipY + ay * 6.5);
    dab(tipX + ax * 8.5, tipY + ay * 8.5, "#5c2413", 2 * (R / 230));
    dab(tipX + ax * 4, tipY + ay * 4 + 1.5, "#b5763a", 1.3 * (R / 230));
  }

  const pa = ((rotDeg + 33) * Math.PI) / 180;
  const pr0 = 22;
  const pr1 = R * (0.56 + random(0.05));
  const ppts = [
    [cx + Math.cos(pa) * pr0, cy + Math.sin(pa) * pr0, 1],
    [cx + Math.cos(pa + 0.04) * pr1 * 0.55, cy + Math.sin(pa + 0.04) * pr1 * 0.55, 0.8],
    [cx + Math.cos(pa) * pr1, cy + Math.sin(pa) * pr1, 0.55],
  ];
  brush.set("rotring", "#a8a45f", 0.6);
  brush.spline(ppts, 0.5);
  for (const off of [-0.05, 0, 0.05]) {
    dab(cx + Math.cos(pa + off) * pr1 * 1.05, cy + Math.sin(pa + off) * pr1 * 1.05, "#8a8748", 1.7);
  }
};

function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(11);
  noiseSeed(11);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  brush.noHatch();
  brush.noMass();

  drawLily(-150, -330, 232, 6, PAL.pink);
  drawLily(180, -250, 175, -28, PAL.white);
  drawLily(-30, -55, 158, 20, PAL.pink);
  drawLily(-290, 105, 118, 42, PAL.white);
  drawLily(255, 90, 128, -50, PAL.pink);
  drawLily(60, 295, 96, 75, PAL.white);

  drawPetal(310, 420, 40, 122, 52, random(10), 0.62, PAL.pink);
  drawPetal(-320, 420, -115, 104, 52, random(10), 0.55, PAL.white);
  drawPetal(130, 560, 150, 128, 52, random(10), 0.66, PAL.pink);

  for (let k = 0; k < 10; k++) {
    const th = random(Math.PI * 2);
    const rr = random(380, 560);
    const sx = Math.cos(th) * rr;
    const sy = Math.sin(th) * rr * 0.8 + 150;
    if (random() < 0.5) dab(sx, sy, "#d98cb0", random(2.2, 3.6));
    else dab(sx, sy, "#b06a44", random(1.6, 2.6));
  }
}

function draw() {}
