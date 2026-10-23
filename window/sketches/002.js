const W = 1000, H = 1250;

function paperGrain() {
  const g = createImage(W, H);
  g.loadPixels();
  let s = 1234567;
  for (let i = 0; i < g.pixels.length; i += 4) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const v = 90 + ((s >> 16) % 120);
    g.pixels[i] = v;
    g.pixels[i + 1] = v;
    g.pixels[i + 2] = v;
    g.pixels[i + 3] = 22;
  }
  g.updatePixels();
  image(g, -W / 2, -H / 2);
}

function woman(cx, baseY, h, dress, hair) {
  const r = h * 0.075;
  const headY = baseY - h + r * 1.15;
  const shoulderY = headY + r * 1.35;
  const sw = r * 1.75;
  const hem = r * 3.7;

  noStroke();
  fill(dress);
  beginShape();
  vertex(cx - sw, shoulderY);
  vertex(cx + sw, shoulderY);
  vertex(cx + hem, baseY);
  vertex(cx + hem * 0.86, baseY);
  vertex(cx - hem * 0.86, baseY);
  vertex(cx - hem, baseY);
  endShape(CLOSE);

  beginShape();
  vertex(cx - sw, shoulderY);
  vertex(cx - sw - r * 0.55, shoulderY + r * 3.4);
  vertex(cx - sw + r * 0.15, shoulderY + r * 3.4);
  vertex(cx - sw + r * 0.5, shoulderY + r * 0.5);
  endShape(CLOSE);

  beginShape();
  vertex(cx + sw, shoulderY);
  vertex(cx + sw + r * 0.55, shoulderY + r * 3.4);
  vertex(cx + sw - r * 0.15, shoulderY + r * 3.4);
  vertex(cx + sw - r * 0.5, shoulderY + r * 0.5);
  endShape(CLOSE);

  fill(hair);
  circle(cx, headY, r * 2.05);
  circle(cx, headY - r * 1.15, r * 0.95);
}

function setup() {
  createCanvas(W, H, WEBGL);
  randomSeed(101);
  pixelDensity(1);
  noStroke();

  const paper = "#efe7d6";
  const wall = "#e0b25a";
  const wallLow = "#d6a34d";
  const floor = "#b4613f";
  const floorLow = "#a2543a";
  const light = "#f7efd9";
  const frame = "#3b3a33";
  const dress = "#2e4a5c";
  const hair = "#2a2622";
  const skin = "#c98a63";
  const field = "#6f7d4e";
  const curtain = "#c9773f";

  background(paper);

  fill(wall);
  rect(-460, -585, 920, 775);
  fill(wallLow);
  rect(-460, 110, 920, 80);
  fill(floor);
  rect(-460, 190, 920, 400);
  fill(floorLow);
  rect(-460, 525, 920, 60);

  fill(light);
  rect(60, -420, 360, 460);

  fill(field);
  rect(60, 10, 360, 42);

  stroke("#8fa06a");
  strokeWeight(2);
  for (let i = 0; i < 22; i++) {
    const x = 80 + random(340);
    const y = -420 + random(400);
    line(x, y, x - 16, y + 38);
  }
  noStroke();

  fill(curtain);
  rect(-432, -435, 78, 500);
  fill("#b96a38");
  rect(-422, -435, 10, 500);

  fill(frame);
  rect(58, -422, 364, 14);
  rect(58, 26, 364, 14);
  rect(58, -422, 14, 460);
  rect(406, -422, 14, 460);
  rect(234, -422, 12, 460);

  fill("#6b3626");
  beginShape();
  vertex(-128, 190);
  vertex(-252, 190);
  vertex(-200, 206);
  vertex(-150, 206);
  endShape(CLOSE);

  woman(-190, 190, 500, dress, hair);

  paperGrain();
}

function draw() {}
