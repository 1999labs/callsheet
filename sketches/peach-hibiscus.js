const STEM = [
  [30, 664],
  [20, 520],
  [52, 380],
  [34, 240],
  [66, 90],
  [48, -64],
  [80, -190],
];
const FLOWER = { x: 60, y: -360 };
const BASES = [-90, -18, 54, 126, 198];
const SCALES = [1.02, 0.97, 1.0, 1.04, 0.95];

function crPoint(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return [
    0.5 *
      (2 * p1[0] +
        (-p0[0] + p2[0]) * t +
        (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
        (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 *
      (2 * p1[1] +
        (-p0[1] + p2[1]) * t +
        (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
        (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
  ];
}

function stemAt(s) {
  const n = STEM.length;
  const f = constrain(s, 0, 1) * (n - 1);
  const i = Math.min(Math.floor(f), n - 2);
  const t = f - i;
  const p0 = STEM[Math.max(i - 1, 0)];
  const p1 = STEM[i];
  const p2 = STEM[i + 1];
  const p3 = STEM[Math.min(i + 2, n - 1)];
  const [x, y] = crPoint(p0, p1, p2, p3, t);
  const [xa, ya] = crPoint(p0, p1, p2, p3, Math.max(t - 0.004, 0));
  const [xb, yb] = crPoint(p0, p1, p2, p3, Math.min(t + 0.004, 1));
  return { x, y, ang: Math.atan2(yb - ya, xb - xa) };
}

function stemWidth(s) {
  return lerp(14.5, 6.5, s) * (1 + 0.12 * (noise(s * 7 + 3) - 0.5));
}

function tapered(at, wAt, n) {
  const left = [];
  const right = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const [x, y] = at(t);
    const [xa, ya] = at(Math.max(t - 0.004, 0));
    const [xb, yb] = at(Math.min(t + 0.004, 1));
    const ang = Math.atan2(yb - ya, xb - xa);
    const w = wAt(t) / 2;
    const jit = (noise(t * 9 + 2) - 0.5) * w * 0.25;
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    left.push([x + nx * (w + jit), y + ny * (w + jit)]);
    right.push([x - nx * (w + jit), y - ny * (w + jit)]);
  }
  return [...left, ...right.reverse()];
}

function wash(color, opacity, bleed) {
  brush.noMass();
  brush.fill(color, opacity);
  brush.fillBleed(bleed, "out");
  brush.fillTexture(0.5, 0.3, false);
}

function drawPoly(pts, curvature) {
  brush.beginShape(curvature);
  for (let i = 0; i < pts.length; i++) brush.vertex(pts[i][0], pts[i][1], 1);
  brush.endShape(true);
}

function dab(x, y, color, weight, name) {
  brush.set(name || "pen", color, weight);
  brush.line(x, y, x + 1.3, y + 0.6);
}

function drawStem() {
  const pts = tapered(
    (t) => {
      const p = stemAt(t);
      return [p.x, p.y];
    },
    stemWidth,
    60
  );
  wash("#9a7a52", 140, 0.06);
  drawPoly(pts, 0.45);

  brush.set("2B", "#6e5236", 0.55);
  for (const side of [-1, 1]) {
    const edge = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const p = stemAt(t);
      const w = stemWidth(t) / 2;
      const nx = -Math.sin(p.ang);
      const ny = Math.cos(p.ang);
      edge.push([
        p.x + nx * w * side + (noise(t * 11 + side * 5) - 0.5) * 2.2,
        p.y + ny * w * side + (noise(t * 13 + side * 9) - 0.5) * 2.2,
        1 - 0.3 * t,
      ]);
    }
    brush.spline(edge, 0.6);
  }

  brush.set("2B", "#7a5c3d", 0.4);
  for (const off of [-0.32, 0.05, 0.36]) {
    const grain = [];
    for (let i = 0; i <= 15; i++) {
      const t = 0.05 + (i / 15) * 0.92;
      const p = stemAt(t);
      const w = stemWidth(t) / 2;
      const nx = -Math.sin(p.ang);
      const ny = Math.cos(p.ang);
      const o = off * w * 2 + (noise(t * 9 + off * 17) - 0.5) * 2.4;
      grain.push([p.x + nx * o, p.y + ny * o, 0.5 + 0.4 * noise(t * 5 + off * 3)]);
    }
    brush.spline(grain, 0.55);
  }

  const b = stemAt(0);
  const nx = -Math.sin(b.ang);
  const ny = Math.cos(b.ang);
  const tx = Math.cos(b.ang);
  const ty = Math.sin(b.ang);
  const w = stemWidth(0) / 2;
  brush.set("2B", "#7d5c3c", 2.1);
  brush.line(b.x - nx * w * 1.02 + tx * 2.4, b.y - ny * w * 1.02 + ty * 2.4, b.x + nx * w * 1.02 + tx * 2.4, b.y + ny * w * 1.02 + ty * 2.4);
  brush.set("2B", "#8a6a4a", 1.2);
  brush.line(b.x - nx * w * 0.7 + tx * 3.4, b.y - ny * w * 0.7 + ty * 3.4, b.x + nx * w * 0.7 + tx * 3.4, b.y + ny * w * 0.7 + ty * 3.4);
  dab(b.x - nx * w * 0.4 + tx * 4.2, b.y - ny * w * 0.4 + ty * 4.2, "#5f4630", 2.2);
  dab(b.x + nx * w * 0.45 + tx * 4, b.y + ny * w * 0.45 + ty * 4, "#5f4630", 2);
}

function drawBranch(P, w0, w1) {
  const n = P.length;
  const at = (s) => {
    const f = constrain(s, 0, 1) * (n - 1);
    const i = Math.min(Math.floor(f), n - 2);
    const t = f - i;
    return crPoint(P[Math.max(i - 1, 0)], P[i], P[i + 1], P[Math.min(i + 2, n - 1)], t);
  };
  const pts = tapered(at, (t) => lerp(w0, w1, t), 32);
  wash("#9a7a52", 132, 0.06);
  drawPoly(pts, 0.45);

  brush.set("2B", "#6e5236", 0.5);
  for (const side of [-1, 1]) {
    const edge = [];
    for (let i = 0; i <= 10; i++) {
      const s = i / 10;
      const p = at(s);
      const q = at(Math.min(s + 0.01, 1));
      const ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
      const w = lerp(w0, w1, s) / 2;
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      edge.push([p[0] + nx * w * side, p[1] + ny * w * side, 1 - 0.25 * s]);
    }
    brush.spline(edge, 0.6);
  }
}

function drawLeaf(nodeX, nodeY, angDeg, len, wid, shade) {
  const a = (angDeg * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const bx = nodeX + ca * 16;
  const by = nodeY + sa * 16;

  brush.set("rotring", "#5c6b3d", 0.9);
  brush.line(nodeX + ca * 3, nodeY + sa * 3, bx, by);

  const bend = (noise(bx * 0.013, by * 0.013) - 0.5) * 0.7 * len;
  const qx = bx + ca * len * 0.5 - sa * bend;
  const qy = by + sa * len * 0.5 + ca * bend;
  const ex = bx + ca * len;
  const ey = by + sa * len;
  const at = (t) => {
    const u = 1 - t;
    return [u * u * bx + 2 * u * t * qx + t * t * ex, u * u * by + 2 * u * t * qy + t * t * ey];
  };
  const widAt = (t) => {
    const base = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.9)), 0.8);
    const serr = 1 + 0.06 * Math.sin(t * len * 0.42 + 1.3) + 0.05 * (noise(t * 5 + 40) - 0.5);
    return Math.max(1.4, wid * base * serr);
  };
  const normalAt = (t) => {
    const [x, y] = at(t);
    const [x2, y2] = at(Math.min(t + 0.01, 1));
    const ang = Math.atan2(y2 - y, x2 - x);
    return [-Math.sin(ang), Math.cos(ang)];
  };

  const N = 34;
  const up = [];
  const lo = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [x, y] = at(t);
    const nrm = normalAt(t);
    const w = widAt(t) / 2;
    up.push([x + nrm[0] * w, y + nrm[1] * w]);
    lo.push([x - nrm[0] * w, y - nrm[1] * w]);
  }

  wash("#7f9156", 110, 0.14);
  drawPoly([...up, ...lo.slice().reverse()], 0.5);

  const cut = Math.round(N * 0.55);
  const half = [...up.slice(0, cut + 1), ...lo.slice(0, cut + 1).reverse()];
  wash("#5a6d40", shade ? 138 : 104, 0.1);
  drawPoly(half, 0.5);

  wash("#93a56b", 70, 0.18);
  drawPoly([...up.slice(cut), ...lo.slice(cut).reverse()], 0.5);

  brush.set("rotring", "#4d6034", 0.7);
  const mid = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const [x, y] = at(t);
    mid.push([x, y, 1 - 0.55 * t]);
  }
  brush.spline(mid, 0.5);

  brush.set("rotring", "#9db072", 0.5);
  for (let k = 1; k <= 4; k++) {
    const t0 = 0.12 + 0.17 * k;
    for (const sd of [-1, 1]) {
      const p0 = at(t0);
      const p1 = at(t0 + 0.1);
      const p2 = at(t0 + 0.18);
      const n1 = normalAt(t0 + 0.1);
      const n2 = normalAt(t0 + 0.18);
      const w1v = widAt(t0 + 0.1) * 0.42 * sd;
      const w2v = widAt(t0 + 0.18) * 0.3 * sd;
      brush.spline(
        [
          [p0[0], p0[1], 1],
          [p1[0] + n1[0] * w1v, p1[1] + n1[1] * w1v, 0.8],
          [p2[0] + n2[0] * w2v, p2[1] + n2[1] * w2v, 0.6],
        ],
        0.5
      );
    }
  }

  brush.set("rotring", "#6d7f47", 0.45);
  for (const t of [0.18, 0.34]) {
    const [x, y] = at(t);
    const nrm = normalAt(t);
    const w = widAt(t) / 2;
    brush.line(x + nrm[0] * w * 0.94, y + nrm[1] * w * 0.94, x + nrm[0] * w * 0.6, y + nrm[1] * w * 0.6);
  }
}

function drawLeaves() {
  const specs = [
    [0.12, -16, 122, 40, false],
    [0.27, -21, 166, 48, false],
    [0.42, 204, 174, 52, true],
    [0.58, -26, 184, 54, true],
    [0.72, 199, 170, 50, false],
    [0.87, -31, 140, 44, false],
  ];
  for (const spec of specs) {
    const p = stemAt(spec[0]);
    drawLeaf(p.x, p.y, spec[1] + (noise(spec[0] * 17) - 0.5) * 8, spec[2], spec[3], spec[4]);
  }
}

function drawBud(bx, by, angDeg, len, r) {
  const a = (angDeg * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const bend = (noise(bx * 0.02, by * 0.02) - 0.5) * 0.6;
  const at = (t) => {
    const bow = Math.sin(Math.PI * t) * bend * r;
    return [bx + ca * len * t - sa * bow, by + sa * len * t + ca * bow];
  };
  const widAt = (t) =>
    Math.max(1.2, r * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.82)), 0.7) * (1 + 0.06 * Math.sin(t * 20 + 2)));
  const normalAt = (t) => {
    const [x, y] = at(t);
    const [x2, y2] = at(Math.min(t + 0.01, 1));
    const ang = Math.atan2(y2 - y, x2 - x);
    return [-Math.sin(ang), Math.cos(ang)];
  };
  const build = (t0, t1, scale) => {
    const up = [];
    const lo = [];
    const N = 22;
    for (let i = 0; i <= N; i++) {
      const t = t0 + (t1 - t0) * (i / N);
      const [x, y] = at(t);
      const nrm = normalAt(t);
      const w = (widAt(t) / 2) * scale;
      up.push([x + nrm[0] * w, y + nrm[1] * w]);
      lo.push([x - nrm[0] * w, y - nrm[1] * w]);
    }
    return [...up, ...lo.reverse()];
  };

  wash("#f0b98e", 150, 0.12);
  drawPoly(build(0, 1, 1), 0.5);

  wash("#e39a70", 130, 0.1);
  drawPoly(build(0.45, 1, 0.92), 0.5);

  wash("#67784a", 175, 0.1);
  drawPoly(build(0, 0.5, 1.04), 0.5);

  brush.set("rotring", "#3f4f2a", 0.55);
  for (let k = 0; k < 5; k++) {
    const nm = (k / 4 - 0.5) * r * 0.95;
    const [x0, y0] = at(0.06);
    const [xm, ym] = at(0.28);
    const [x1, y1] = at(0.46);
    brush.spline(
      [
        [x0 - sa * nm, y0 + ca * nm, 1],
        [xm - sa * nm * 1.1, ym + ca * nm * 1.1, 0.85],
        [x1 - sa * nm * 1.15, y1 + ca * nm * 1.15, 0.7],
      ],
      0.5
    );
  }

  brush.set("rotring", "#46592f", 0.5);
  const [ex, ey] = at(0.5);
  for (const sd of [-1, 1]) {
    const wm = (widAt(0.5) / 2) * 1.04 * sd;
    brush.line(ex - sa * wm, ey + ca * wm, ex - sa * wm + ca * 9, ey + ca * wm + sa * 9);
  }

  dab(at(0.16)[0], at(0.16)[1], "#54663a", 1.6);
  dab(at(0.3)[0], at(0.3)[1], "#54663a", 1.4);
}

function drawCalyxPeek() {
  const ox = 58;
  const oy = -188;
  for (const spec of [
    [70, 86],
    [93, 102],
    [118, 92],
  ]) {
    const a = (spec[0] * Math.PI) / 180;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const mx = ox + ca * spec[1] * 0.55 + sa * 2.6;
    const my = oy + sa * spec[1] * 0.55 - ca * 2.6;
    brush.set("rotring", "#647444", 1.3);
    brush.spline(
      [
        [ox, oy, 1],
        [mx, my, 0.95],
        [ox + ca * spec[1], oy + sa * spec[1], 0.5],
      ],
      0.6
    );
    brush.set("rotring", "#4a5a31", 0.45);
    brush.line(ox + ca * 8, oy + sa * 8, ox + ca * spec[1] * 0.96, oy + sa * spec[1] * 0.96);
  }
}

function drawFlower() {
  const Cx = FLOWER.x;
  const Cy = FLOWER.y;

  const petals = [];
  for (let i = 0; i < 5; i++) {
    const base = BASES[i] + random(-7, 7);
    const span = 96 + random(-6, 6);
    const R = 238 * SCALES[i] * (1 + random(-0.03, 0.03));
    const phase = random(10);
    const shapeAt = (t) => {
      const p = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.92)), 0.5);
      const frill =
        1 + 0.04 * Math.sin(t * Math.PI * 9 + phase) + 0.025 * (noise(t * 2.6 + phase * 1.7 + i * 4) - 0.5) * 2;
      return Math.max(56, R * p * frill);
    };
    const ptAt = (t) => {
      const th = ((base + (t - 0.5) * span) * Math.PI) / 180;
      const rr = shapeAt(t);
      return [Cx + Math.cos(th) * rr, Cy + Math.sin(th) * rr];
    };
    const pts = [];
    for (let k = 0; k <= 40; k++) pts.push(ptAt(k / 40));
    petals.push({ base, span, R, pts });

    const layers = [
      [1.0, "#f6c9a2", 128],
      [0.66, "#eaa077", 122],
      [0.38, "#d67f5c", 132],
    ];
    for (const layer of layers) {
      const sc = layer[0];
      wash(layer[1], layer[2], 0.14);
      const poly = sc === 1 ? pts : pts.map((p) => [Cx + (p[0] - Cx) * sc, Cy + (p[1] - Cy) * sc]);
      drawPoly(poly, 0.5);
    }
  }

  for (let i = 0; i < 5; i++) {
    const base = petals[i].base;
    const span = petals[i].span;
    const R = petals[i].R;
    brush.set("rotring", "#dda98a", 0.3);
    for (let k = 0; k < 4; k++) {
      const vAng = base + (k / 3 - 0.5) * span * 0.58 + random(-3, 3);
      const bend = random(-6, 6);
      const r0 = R * (0.4 + random(0.06));
      const r1 = R * (0.74 + random(0.08));
      const vein = [];
      for (const s of [0, 0.5, 1]) {
        const th = ((vAng + bend * Math.sin(Math.PI * s)) * Math.PI) / 180;
        const rr = lerp(r0, r1, s);
        vein.push([Cx + Math.cos(th) * rr, Cy + Math.sin(th) * rr, 1 - 0.4 * s]);
      }
      brush.spline(vein, 0.55);
    }
  }

  wash("#6e2a34", 195, 0.1);
  const eye = [];
  for (let k = 0; k < 36; k++) {
    const th = (k / 36) * Math.PI * 2;
    const rr = 48 * (1 + 0.14 * (noise(k * 0.5 + 3) - 0.5) * 2);
    eye.push([Cx + Math.cos(th) * rr, Cy + Math.sin(th) * rr]);
  }
  drawPoly(eye, 0.5);

  wash("#4a1620", 205, 0.1);
  const core = [];
  for (let k = 0; k < 28; k++) {
    const th = (k / 28) * Math.PI * 2;
    const rr = 24 * (1 + 0.16 * (noise(k * 0.7 + 11) - 0.5) * 2);
    core.push([Cx + Math.cos(th) * rr, Cy + Math.sin(th) * rr]);
  }
  drawPoly(core, 0.5);

  for (let k = 0; k < 7; k++) {
    const th = random(Math.PI * 2);
    const rr = random(50, 68);
    dab(Cx + Math.cos(th) * rr, Cy + Math.sin(th) * rr, "#a34c4e", random(1.8, 2.6));
  }

  drawCalyxPeek();

  const ax = 56;
  const ay = -352;
  const bx2 = -44;
  const by2 = -228;
  const dx = bx2 - ax;
  const dy = by2 - ay;
  const L = Math.hypot(dx, dy);
  const bnx = -dy / L;
  const bny = dx / L;
  const col = (t) => [ax + dx * t + bnx * Math.sin(Math.PI * t) * 16, ay + dy * t + bny * Math.sin(Math.PI * t) * 16];

  wash("#eab88a", 210, 0.1);
  drawPoly(tapered(col, (t) => lerp(13, 6, t), 24), 0.5);

  brush.set("rotring", "#b58058", 0.5);
  for (const sd of [-1, 1]) {
    const edge = [];
    for (let i = 0; i <= 7; i++) {
      const t = i / 7;
      const [x, y] = col(t);
      const [x2, y2] = col(Math.min(t + 0.01, 1));
      const ang = Math.atan2(y2 - y, x2 - x);
      const w = lerp(13, 6, t) / 2;
      edge.push([x - Math.sin(ang) * w * sd, y + Math.cos(ang) * w * sd, 1 - 0.3 * t]);
    }
    brush.spline(edge, 0.5);
  }

  const t0p = col(0.97);
  const t1p = col(1);
  const tipAng = Math.atan2(t1p[1] - t0p[1], t1p[0] - t0p[0]);
  brush.set("rotring", "#b8834f", 0.5);
  for (let k = -3; k <= 3; k++) {
    const fa = tipAng + ((k * 22 + random(-5, 5)) * Math.PI) / 180;
    const fl = 24 + random(13);
    const mx = t1p[0] + Math.cos(fa) * fl * 0.55;
    const my = t1p[1] + Math.sin(fa) * fl * 0.55;
    const ex2 = t1p[0] + Math.cos(fa) * fl;
    const ey2 = t1p[1] + Math.sin(fa) * fl;
    brush.spline([
      [t1p[0], t1p[1], 1],
      [mx, my, 0.8],
      [ex2, ey2, 0.5],
    ], 0.5);
    dab(ex2, ey2, "#e8c14e", 2.6);
  }

  for (const t of [0.55, 0.7, 0.85, 0.97]) {
    const [x, y] = col(t);
    const [x2, y2] = col(Math.min(t + 0.02, 1));
    const ang = Math.atan2(y2 - y, x2 - x);
    const w = lerp(13, 6, t) / 2;
    const sd = random() < 0.5 ? -1 : 1;
    dab(x - Math.sin(ang) * (w + 2.5) * sd, y + Math.cos(ang) * (w + 2.5) * sd, "#e5c464", 2);
  }

  dab(t1p[0] + 6, t1p[1] + 14, "#eecf7a", 1.5);
  dab(t1p[0] - 7, t1p[1] + 9, "#eecf7a", 1.4);

  for (let k = 0; k < 8; k++) {
    const th = (random(140, 260) * Math.PI) / 180;
    const rr = random(268, 330);
    const sx = Cx + Math.cos(th) * rr;
    const sy = Cy + Math.sin(th) * rr;
    if (random() < 0.6) dab(sx, sy, "#e7a173", random(2.4, 4.2));
    else dab(sx, sy, "#c46a4f", random(1.8, 3));
  }
}

function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(17);
  noiseSeed(17);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  brush.noHatch();
  brush.noMass();

  drawStem();

  const s1 = stemAt(0.8);
  drawBranch([[s1.x, s1.y], [s1.x - 42, s1.y - 47], [-80, -120], [-185, -148]], 9, 5);
  const s2 = stemAt(0.62);
  drawBranch([[s2.x, s2.y], [s2.x + 53, s2.y + 20], [165, 120], [200, 66]], 8.5, 5);

  drawFlower();
  drawLeaves();
  drawBud(-185, -148, -168, 54, 29);
  drawBud(200, 66, -52, 42, 23);
}

function draw() {}
