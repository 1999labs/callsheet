const PAPER = "#efe7d6";
const INK = "#2d2a25";
const OCHRE = "#dfae55";
const TERRA = "#b4613f";
const BLUE = "#2e4a5c";
const GREEN = "#6f7d4e";
const CREAM = "#f7efd9";
const RUST = "#c9773f";

function fillC(col, a) {
  const c = color(col);
  if (a !== undefined) c.setAlpha(a);
  fill(c);
}

function paper() {
  createCanvas(1000, 1250, WEBGL);
  randomSeed(window.CALLSHEET ? CALLSHEET.SEED : 1);
  pixelDensity(1);
  noStroke();
  background(PAPER);
  textAlign(CENTER, CENTER);
}

function finish() {
  const g = createImage(width, height);
  g.loadPixels();
  let s = 987654321;
  for (let i = 0; i < g.pixels.length; i += 4) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const v = 80 + ((s >>> 16) & 127);
    g.pixels[i] = v;
    g.pixels[i + 1] = v;
    g.pixels[i + 2] = v;
    g.pixels[i + 3] = 15;
  }
  g.updatePixels();
  image(g, -width / 2, -height / 2);
}

function wash(col, x, y, w, h, amp = 2) {
  fillC(col);
  beginShape();
  const step = 55;
  for (let px = x; px <= x + w; px += step) vertex(px, y + random(-amp, amp));
  for (let py = y; py <= y + h; py += step) vertex(x + w + random(-amp, amp), py);
  for (let px = x + w; px >= x; px -= step) vertex(px, y + h + random(-amp, amp));
  for (let py = y + h; py >= y; py -= step) vertex(x + random(-amp, amp), py);
  endShape(CLOSE);
}

function shape(pts, col, a) {
  fillC(col, a);
  beginShape();
  for (const p of pts) vertex(p[0], p[1]);
  endShape(CLOSE);
}

function mark(pts, col, weight = 3) {
  noFill();
  stroke(col);
  strokeWeight(weight);
  beginShape();
  for (const p of pts) vertex(p[0], p[1]);
  endShape();
  noStroke();
}

function rain(x, y, w, h, n = 18, col = "#8fa06a") {
  stroke(col);
  strokeWeight(2);
  for (let i = 0; i < n; i++) {
    const rx = x + 18 + random(w - 36);
    const ry = y + 18 + random(h - 80);
    line(rx, ry, rx - 18, ry + 44);
  }
  noStroke();
}

function shadow(x, y, w, h) {
  fillC(INK, 38);
  ellipse(x, y, w, h);
}

function figure(x, baseY, h, col, opts = {}) {
  const r = h * 0.075;
  const headY = baseY - h + r * 1.2;
  const shoulderY = headY + r * 1.5;
  const sw = r * 1.9;
  const waistY = shoulderY + h * 0.3;
  const ww = r * 1.45;
  const hem = r * 3.1;
  const hair = opts.hair || INK;

  fillC(col);
  beginShape();
  vertex(x - sw, shoulderY);
  vertex(x - ww, waistY);
  vertex(x - hem, baseY);
  vertex(x - hem * 0.82, baseY);
  vertex(x + hem * 0.82, baseY);
  vertex(x + hem, baseY);
  vertex(x + ww, waistY);
  vertex(x + sw, shoulderY);
  endShape(CLOSE);

  beginShape();
  vertex(x - sw, shoulderY);
  vertex(x - sw - r * 0.45, shoulderY + h * 0.26);
  vertex(x - sw - r * 0.1, shoulderY + h * 0.28);
  vertex(x - sw + r * 0.35, shoulderY + r * 0.4);
  endShape(CLOSE);
  beginShape();
  vertex(x + sw, shoulderY);
  vertex(x + sw + r * 0.45, shoulderY + h * 0.26);
  vertex(x + sw + r * 0.1, shoulderY + h * 0.28);
  vertex(x + sw - r * 0.35, shoulderY + r * 0.4);
  endShape(CLOSE);

  fillC(hair);
  circle(x, headY, r * 2);
  circle(x, headY - r * 1.05, r * 0.9);

  if (opts.hand) {
    fillC(opts.skin || "#c98a63");
    circle(x - sw - r * 0.25, shoulderY + h * 0.27, r * 0.55);
  }
}

function windowAt(x, y, w, h, opts = {}) {
  fillC(opts.light || CREAM);
  rect(x, y, w, h);
  if (opts.outside === "field") {
    fillC(opts.field || GREEN);
    rect(x, y + h * 0.76, w, h * 0.24);
  }
  if (opts.figures) {
    for (const f of opts.figures) figure(f.x, f.baseY, f.h, f.col || INK, f);
  }
  if (opts.rain) rain(x, y, w, h, opts.rain);
  const f = opts.frame || INK;
  const t = opts.thick || 12;
  fillC(f);
  rect(x - t / 2, y - t / 2, w + t, t);
  rect(x - t / 2, y + h - t / 2, w + t, t);
  rect(x - t / 2, y - t / 2, t, h + t);
  rect(x + w - t / 2, y - t / 2, t, h + t);
  if (opts.mullion !== false) rect(x + w / 2 - t / 2, y, t, h);
  if (opts.sill) {
    fillC(opts.sillColor || f);
    rect(x - t, y + h, w + 2 * t, t * 1.3);
  }
}

function title(label, year) {
  const g = createGraphics(width, height);
  g.pixelDensity(1);
  g.clear();
  g.fill(INK);
  g.textAlign(CENTER, CENTER);
  g.textFont("Georgia");
  g.textSize(42);
  g.text(label, width / 2, height / 2 + 505);
  g.textSize(22);
  g.text(year, width / 2, height / 2 + 552);
  image(g, -width / 2, -height / 2);
}

function draw() {}
