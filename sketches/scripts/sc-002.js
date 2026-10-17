function form(x, w, k, mid, acc) {
  if (k === "sun" || k === "moon" || k === "fire") {
    brush.fill(acc, 210);
    brush.circle(x + w / 2, -220, 86, 0.4);
  } else if (k === "stars") {
    brush.set("2H", acc, 0.6);
    for (let j = 0; j < 10; j++) brush.line(x + random(w), -400 + random(300), x + random(w), -400 + random(300));
  } else if (k === "hills" || k === "city" || k === "forest") {
    brush.fill(mid, 200);
    brush.fillBleed(0.5, "out", 90);
    brush.beginShape(0.5);
    brush.vertex(x, 40, 1.0);
    brush.vertex(x + w * 0.25, -120, 0.8);
    brush.vertex(x + w * 0.5, 0, 1.0);
    brush.vertex(x + w * 0.75, -160, 0.8);
    brush.vertex(x + w, -30, 1.0);
    brush.endShape(true);
  } else if (k === "rain" || k === "sea" || k === "fields") {
    brush.set("2H", acc, 0.5);
    for (let j = 0; j < 10; j++) brush.line(x, -360 + j * 60, x + w, -360 + j * 60);
  } else if (k === "window") {
    brush.fill(acc, 155);
    brush.rect(x + w * 0.2, -260, w * 0.6, 300);
  } else {
    brush.set("2B", acc, 0.6);
    brush.line(x, 20, x + w, 20);
  }
}

function setup() {
  createCanvas(1440, 900, WEBGL);
  randomSeed(55528);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const cols = 6, pw = 1440 / cols;
  const base = ["#c8cdd0","#8fa0a8","#b9c6cf","#4a5a68","#232a38","#d8b48a"];
  const mid = ["#a8b2b8","#5f7078","#7d94a0","#2f3a44","#161c28","#a87a52"];
  const acc = ["#e6ddc8","#d8c8a0","#f0e0b0","#8fa8b4","#c8d0d8","#f0c88a"];
  const kind = ["horizon","sea","sun","rain","moon","horizon"];
  for (let i = 0; i < cols; i++) {
    const x = -720 + i * pw + 8, w = pw - 16;
    brush.fill(base[i], 225);
    brush.fillBleed(0.4, "out", 0);
    brush.rect(x, -440, w, 880);
    form(x, w, kind[i], mid[i], acc[i]);
  }
}

function draw() {}
