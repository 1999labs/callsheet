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
  randomSeed(98861);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const cols = 6, pw = 1440 / cols;
  const base = ["#2f3a4a","#3f4e60","#5a6b7a","#23303f","#10161f","#c8b48a"];
  const mid = ["#1f2830","#26333f","#3a4a58","#161f2a","#0a0f16","#8a6b4a"];
  const acc = ["#c8d0d8","#8fa8b4","#d8e0e8","#6a8a9a","#e0d0a8","#f0c88a"];
  const kind = ["rain","sea","moon","sea","stars","horizon"];
  for (let i = 0; i < cols; i++) {
    const x = -720 + i * pw + 8, w = pw - 16;
    brush.fill(base[i], 225);
    brush.fillBleed(0.4, "out", 0);
    brush.rect(x, -440, w, 880);
    form(x, w, kind[i], mid[i], acc[i]);
  }
}

function draw() {}
