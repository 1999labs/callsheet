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

const scaleAbout = (pts, ax, ay, s) => pts.map((p) => [ax + (p[0] - ax) * s, ay + (p[1] - ay) * s]);

const drawBoard = (cx, cy, ang, len, wid, base, inner, finc) => {
  const a = (ang * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const vx = -uy;
  const vy = ux;
  const W = wid / 2;
  const wAt = (t) => {
    const base01 = 0.7 + 0.3 * Math.sin(Math.PI * Math.pow(Math.max(0, t), 0.8));
    const taper = Math.pow(Math.max(0.0001, 1 - Math.pow(Math.max(0, t), 3.2)), 0.5);
    return Math.max(4, W * base01 * taper);
  };
  const at = (t) => [cx + ux * (t - 0.5) * len, cy + uy * (t - 0.5) * len];

  const up = [];
  const lo = [];
  const N = 34;
  for (let i = 0; i <= N; i++) {
    const t = 0.015 + 0.97 * (i / N);
    const [px, py] = at(t);
    const w = wAt(t);
    up.push([px + vx * w, py + vy * w]);
    lo.push([px - vx * w, py - vy * w]);
  }
  const body = [...up, ...lo.reverse()];

  const f1 = at(0.14);
  const f2 = at(0.04);
  const fin = [
    [f1[0] - vx * (wAt(0.14) - 8), f1[1] - vy * (wAt(0.14) - 8)],
    [f1[0] - vx * (wAt(0.14) + 36), f1[1] - vy * (wAt(0.14) + 36)],
    [f2[0] - vx * (wAt(0.04) + 4), f2[1] - vy * (wAt(0.04) + 4)],
  ];
  wash(finc, 190, 0.16);
  drawPoly(fin, 0.12);

  paint(base, 195, 0.16, body);

  const nose = at(0.76);
  wash(inner, 175, 0.18);
  drawPoly(scaleAbout(body, nose[0], nose[1], 0.52), 0.5);

  const tail = at(0.2);
  wash(inner, 135, 0.2);
  drawPoly(scaleAbout(body, tail[0], tail[1], 0.5), 0.5);

  for (let i = 0; i < 3; i++) {
    const t = random(0.82, 0.95);
    const [px, py] = at(t);
    const off = random(-0.5, 0.5) * wAt(t);
    dab(px + vx * off, py + vy * off, "#a8846a", random(1.5, 2.4));
  }
};

function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(22);
  noiseSeed(22);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  brush.noHatch();
  brush.noMass();

  drawBoard(-190, -400, -58, 600, 158, "#5fb0c0", "#a8dde0", "#3f8898");
  drawBoard(150, -60, -50, 560, 148, "#e8a08a", "#f4cdb8", "#c07a68");
  drawBoard(-80, 380, -64, 640, 168, "#8fa8d0", "#c8d6ec", "#6a80a8");

  const cols = ["#5fb0c0", "#e8a08a", "#8fa8d0", "#ffffff"];
  for (let k = 0; k < 14; k++) {
    dab(random(-430, 430), random(-620, 620), cols[k % 4], random(1.8, 3.6));
  }
}

function draw() {}
