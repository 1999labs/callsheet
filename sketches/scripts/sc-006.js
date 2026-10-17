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
  randomSeed(66004);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const cols = 6, pw = 1440 / cols;
  const base = ["#d8e0d0","#c0d0c8","#a8c0b0","#c8b8a0","#8a9a8a","#5a6a5a"];
  const mid = ["#8aa08a","#6a8a7a","#5a7868","#8a6a4a","#4a5a4a","#2f3f2f"];
  const acc = ["#f0e8d0","#e0f0e0","#c8e8d8","#e0b080","#d0e0c0","#e0f0d0"];
  const kind = ["window","window","forest","window","window","window"];
  for (let i = 0; i < cols; i++) {
    const x = -720 + i * pw + 8, w = pw - 16;
    brush.fill(base[i], 225);
    brush.fillBleed(0.4, "out", 0);
    brush.rect(x, -440, w, 880);
    form(x, w, kind[i], mid[i], acc[i]);
  }
}

function draw() {}
