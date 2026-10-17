// Emits a compact corpus of valid p5.brush botanical plates, one per scene,
// into sketches/corpus/<id>.js, and writes training/pairs.json.
// Compact (loops + one helper) so training sequences stay short.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

const PREAMBLE = (seed) => `function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(${seed});
  background("#f3ecdd");
  brush.scaleBrushes(4);
`;

const FOOTER = `}

function draw() {}
`;

const LEAF = `function leaf(bx, by, tx, ty, s, col, al) {
  brush.fill(col, al);
  brush.fillBleed(0.4, "out", -15);
  brush.fillTexture(0.45, 0.35);
  brush.beginShape(0.6);
  brush.vertex(bx, by - s, 0.4);
  brush.vertex(tx, ty, 1.0);
  brush.vertex(bx, by + s, 0.4);
  brush.endShape(true);
}

`;

const cols = (pal) =>
  `  const fol = "${pal.foliage}", pet = "${pal.petal}", ` +
  `acc = "${pal.accent}", stm = "${pal.stem}";\n`;

const archetypes = {
  singleBloom: {
    leaf: true,
    body: (pal) => cols(pal) + `  brush.set("2B", stm, 1.0);
  brush.line(8, 620, 0, -440);
  for (let i = 0; i < 7; i++) {
    const y = 540 - i * 160, s = i % 2 ? 1 : -1;
    leaf(0, y, s * random(150, 240), y - 60, random(100, 140), fol, random(60, 84));
  }
  brush.set("rotring", stm, 0.7);
  brush.line(8, 620, 0, -440);
  brush.fillBleed(0.5, "out", 30);
  brush.fillTexture(0.5, 0.4);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TWO_PI - HALF_PI;
    brush.fill(pet, 82);
    brush.beginShape(0.8);
    brush.vertex(cos(a - 0.7) * 52, -510 + sin(a - 0.7) * 52, 1.0);
    brush.vertex(cos(a) * 155, -510 + sin(a) * 155, 0.5);
    brush.vertex(cos(a + 0.7) * 52, -510 + sin(a + 0.7) * 52, 1.0);
    brush.endShape(true);
  }
  brush.fill(acc, 120);
  brush.circle(0, -510, 30, 0.4);
  brush.fill(pet, 72);
  brush.circle(-180, -330, 48, 0.5);
  brush.circle(190, -250, 42, 0.5);`,
  },

  bells: {
    leaf: true,
    body: (pal) => cols(pal) + `  brush.set("2B", stm, 0.9);
  brush.line(0, 640, -30, -120);
  brush.line(-30, -120, -170, -430);
  brush.line(-30, -120, 140, -400);
  brush.line(-30, -120, 10, -560);
  leaf(-10, 460, -300, 340, 140, fol, 62);
  leaf(10, 320, 290, 190, 130, fol, 62);
  leaf(-5, 140, -250, 0, 120, fol, 58);
  const bells = [[-170, -490], [-170, -320], [-170, -150], [140, -460], [140, -290], [10, -600]];
  for (const [x, y] of bells) {
    brush.fill(pet, 84);
    brush.beginShape(0.8);
    brush.vertex(x, y, 0.4);
    brush.vertex(x - 60, y + 78, 1.0);
    brush.vertex(x, y + 162, 0.4);
    brush.vertex(x + 60, y + 78, 1.0);
    brush.endShape(true);
    brush.set("2H", acc, 0.5);
    brush.line(x, y + 26, x, y + 158);
  }`,
  },

  cup: {
    leaf: true,
    body: (pal) => cols(pal) + `  brush.set("2B", stm, 1.1);
  brush.line(0, 620, 0, -360);
  leaf(-10, 500, -300, 380, 150, fol, 60);
  leaf(10, 340, 290, 200, 140, fol, 58);
  brush.fillBleed(0.55, "out", 35);
  brush.fillTexture(0.5, 0.4);
  brush.fill(pet, 88);
  brush.beginShape(0.8);
  brush.vertex(-120, -290, 1.0);
  brush.vertex(0, -540, 0.5);
  brush.vertex(120, -290, 1.0);
  brush.endShape(true);
  brush.set("rotring", acc, 0.6);
  brush.line(-92, -302, 0, -526);
  brush.line(92, -302, 0, -526);`,
  },

  umbel: {
    leaf: true,
    body: (pal) => cols(pal) + `  brush.set("2B", stm, 0.9);
  brush.line(0, 640, 0, -300);
  for (let k = 0; k < 3; k++) {
    leaf(0, 440 - k * 220, (k % 2 ? 1 : -1) * 200, 390 - k * 220, 120, fol, 58);
  }
  for (let i = 0; i < 13; i++) {
    const a = PI + (i / 12) * PI, x = cos(a) * 120, y = -430 + sin(a) * 60;
    brush.set("HB", stm, 0.5);
    brush.line(0, -320, x, y);
    brush.fill(pet, random(70, 100));
    brush.circle(x, y, random(26, 36), 0.4);
  }
  brush.fill(acc, 90);
  brush.circle(0, -430, 22, 0.4);`,
  },

  fern: {
    leaf: false,
    body: (pal) => cols(pal) + `  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 0, -620);
  for (let i = 0; i < 12; i++) {
    const y = 560 - i * 105, len = 210 * (1 - i / 12) + 70, col = i < 6 ? pet : fol;
    for (const dir of [-1, 1]) {
      brush.beginShape(0.6);
      brush.vertex(0, y - 42, 0.4);
      brush.vertex(dir * len, y - 80, 1.0);
      brush.vertex(0, y + 42, 0.4);
      brush.hatchStyle("rotring", col, 0.7);
      brush.hatch(random(6, 11), random(24, 64), { rand: 0.15 });
      brush.endShape(true);
    }
  }
  brush.set("rotring", acc, 0.6);
  brush.line(0, 650, 0, -620);`,
  },

  thistle: {
    leaf: true,
    body: (pal) => cols(pal) + `  brush.wiggle(2);
  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 10, -400);
  brush.noField();
  leaf(5, 560, -300, 470, 130, fol, 60);
  leaf(5, 400, 290, 300, 120, fol, 58);
  leaf(5, 240, -280, 140, 120, fol, 58);
  leaf(5, 80, 260, -20, 110, fol, 56);
  for (let i = 0; i < 7; i++) {
    const a = PI + (i / 6) * PI, x = cos(a) * 90, y = -380 + sin(a) * 30;
    brush.set("HB", fol, 0.6);
    brush.beginShape(0.4);
    brush.vertex(0, -380, 0.6);
    brush.vertex(x, y - 60, 1.0);
    brush.vertex(x * 1.35, y - 10, 1.0);
    brush.endShape(true);
  }
  brush.mass("HB", acc, { strength: 0.85 });
  brush.circle(0, -460, 72, 0.5);
  brush.noMass();
  brush.set("2H", pet, 0.6);
  for (let i = 0; i < 10; i++) {
    brush.line(-45 + i * 9, -540, -53 + i * 9, -584);
  }`,
  },

  pods: {
    leaf: true,
    body: (pal) => cols(pal) + `  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 0, -520);
  leaf(0, 540, -300, 480, 120, fol, 62);
  leaf(0, 540, 310, 490, 120, fol, 62);
  leaf(0, 620, -200, 650, 100, fol, 58);
  leaf(0, 380, 260, 320, 110, fol, 60);
  for (let i = 0; i < 6; i++) {
    const y = -60 - i * 85, dx = (i % 2 ? 1 : -1) * 90;
    brush.set("HB", stm, 0.6);
    brush.line(0, y, dx, y - 30);
    brush.fill(pet, 84);
    brush.circle(dx, y - 44, random(34, 42), 0.5);
    if (i % 2 === 0) {
      brush.set("2H", acc, 0.5);
      brush.line(dx, y - 70, dx, y - 20);
    }
  }`,
  },

  vine: {
    leaf: true,
    body: (pal) => cols(pal) + `  const pts = [[0, 650], [90, 380], [-70, 120], [80, -140], [-50, -420]];
  brush.set("2B", stm, 1.0);
  for (let i = 0; i < pts.length - 1; i++) {
    brush.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
  }
  for (let i = 1; i < pts.length; i++) {
    const x = pts[i][0], y = pts[i][1];
    leaf(x, y, x - 160, y - 50, 120, fol, 60);
    leaf(x, y, x + 155, y - 90, 120, fol, 58);
  }
  brush.fill(acc, 74);
  brush.circle(80, -180, 40, 0.5);
  brush.circle(-50, -450, 36, 0.5);`,
  },

  grass: {
    leaf: false,
    body: (pal) => cols(pal) + `  brush.set("2B", stm, 0.8);
  for (let i = 0; i < 11; i++) {
    const x0 = -90 + i * 18;
    brush.line(x0, 640, x0 - 40 + i * 14, -560 - i * 8);
  }
  brush.set("2H", pet, 0.4);
  for (let i = 0; i < 20; i++) {
    const x = -160 + i * 16, y = -600 - (i % 5) * 16;
    brush.line(x, y, x + 6, y - 50);
  }
  brush.fill(fol, 50);
  brush.circle(-50, 640, 60, 0.6);`,
  },

  spike: {
    leaf: true,
    body: (pal) => cols(pal) + `  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 0, -180);
  for (let i = 0; i < 5; i++) {
    leaf(0, 540 - i * 170, (i % 2 ? 1 : -1) * 210, 500 - i * 170, 110, fol, 58);
  }
  for (let i = 0; i < 16; i++) {
    const t = i / 15, y = -200 - t * 300, x = (1 - t) * 80 * (i % 2 ? 1 : -1) - t * 10;
    brush.fill(i > 8 ? acc : pet, 86);
    brush.circle(x, y, random(28, 38), 0.5);
  }
  brush.set("rotring", acc, 0.5);
  brush.line(0, -180, 0, -520);`,
  },

  daisy: {
    leaf: true,
    body: (pal) => cols(pal) + `  brush.set("2B", stm, 0.9);
  brush.line(0, 640, 0, -300);
  leaf(0, 540, -290, 470, 130, fol, 60);
  leaf(0, 400, 300, 330, 130, fol, 60);
  leaf(0, 620, 230, 650, 110, fol, 56);
  brush.fillBleed(0.5, "out", 25);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TWO_PI;
    brush.fill(pet, 82);
    brush.beginShape(0.9);
    brush.vertex(cos(a - 0.22) * 66, -420 + sin(a - 0.22) * 66, 1.0);
    brush.vertex(cos(a) * 195, -420 + sin(a) * 195, 0.5);
    brush.vertex(cos(a + 0.22) * 66, -420 + sin(a + 0.22) * 66, 1.0);
    brush.endShape(true);
  }
  brush.fill(acc, 110);
  brush.circle(0, -420, 72, 0.4);`,
  },

  rose: {
    leaf: true,
    body: (pal) => cols(pal) + `  brush.set("2B", stm, 1.0);
  brush.line(0, 640, -10, -260);
  for (let i = 0; i < 5; i++) {
    leaf(0, 520 - i * 180, (i % 2 ? 1 : -1) * 230, 490 - i * 180, 120, fol, 58);
  }
  brush.fillBleed(0.3, "out", 40);
  brush.fillTexture(0.4, 0.3);
  for (let ring = 2; ring >= 1; ring--) {
    const R = 80 + ring * 46, n = 7 + ring * 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TWO_PI + ring;
      brush.fill(ring === 2 ? pet : acc, 88);
      brush.beginShape(0.9);
      brush.vertex(cos(a - 0.5) * 30 - 10, -400 + sin(a - 0.5) * 30, 1.0);
      brush.vertex(cos(a) * R * 0.85 - 10, -400 + sin(a) * R * 0.85, 0.5);
      brush.vertex(cos(a + 0.5) * 30 - 10, -400 + sin(a + 0.5) * 30, 1.0);
      brush.endShape(true);
    }
  }
  brush.fill(acc, 130);
  brush.circle(-10, -400, 30, 0.4);`,
  },

  iris: {
    leaf: false,
    body: (pal) => cols(pal) + `  brush.set("2B", stm, 1.0);
  brush.line(0, 650, 0, -300);
  for (let i = 0; i < 3; i++) {
    brush.set("2B", fol, 0.8);
    brush.line(-110 + i * 110, 650, -130 + i * 110, -280);
  }
  for (let i = 0; i < 3; i++) {
    const a = -HALF_PI + (i - 1) * 0.9;
    brush.fill(pet, 84);
    brush.beginShape(0.8);
    brush.vertex(0, -400, 0.5);
    brush.vertex(cos(a) * 140, -400 + sin(a) * 140, 1.0);
    brush.vertex(cos(a + 0.3) * 60, -400 + sin(a + 0.3) * 60, 0.5);
    brush.endShape(true);
  }
  for (let i = 0; i < 3; i++) {
    const a = HALF_PI + (i - 1) * 0.9;
    brush.fill(acc, 80);
    brush.beginShape(0.8);
    brush.vertex(0, -400, 0.5);
    brush.vertex(cos(a) * 120, -400 + sin(a) * 120, 1.0);
    brush.vertex(cos(a - 0.3) * 60, -400 + sin(a - 0.3) * 60, 0.5);
    brush.endShape(true);
  }
  brush.fill(acc, 120);
  brush.circle(0, -400, 24, 0.4);`,
  },

  poppy: {
    leaf: true,
    body: (pal) => cols(pal) + `  brush.set("2B", stm, 1.0);
  brush.line(0, 640, -20, -300);
  for (let i = 0; i < 4; i++) {
    leaf(-8, 500 - i * 190, (i % 2 ? 1 : -1) * 250, 470 - i * 190, 130, fol, 58);
  }
  brush.fillBleed(0.55, "out", 30);
  brush.fillTexture(0.5, 0.4);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TWO_PI + 0.4;
    brush.fill(pet, 70 - i * 5);
    brush.beginShape(0.9);
    brush.vertex(cos(a - 0.9) * 60 - 20, -400 + sin(a - 0.9) * 60, 1.0);
    brush.vertex(cos(a) * 170 - 20, -400 + sin(a) * 170, 0.5);
    brush.vertex(cos(a + 0.9) * 60 - 20, -400 + sin(a + 0.9) * 60, 1.0);
    brush.endShape(true);
  }
  brush.fill(acc, 130);
  brush.circle(-20, -400, 44, 0.4);`,
  },
};

function buildSketch(scene) {
  const arc = archetypes[scene.archetype] || archetypes.singleBloom;
  const seed = hash(scene.id);
  return (
    (arc.leaf ? LEAF : "") +
    PREAMBLE(seed) +
    arc.body(scene.palette || {}) +
    "\n" +
    FOOTER
  );
}

async function main() {
  const scenes = JSON.parse(await readFile(resolve(ROOT, "scenes/scenes.json"), "utf8"));
  const dir = resolve(ROOT, "sketches/corpus");
  await mkdir(dir, { recursive: true });

  const pairs = [];
  for (const scene of scenes) {
    const code = buildSketch(scene);
    const rel = `sketches/corpus/${scene.id}.js`;
    await writeFile(resolve(ROOT, rel), code, "utf8");
    pairs.push({ sceneId: scene.id, sketch: rel });
  }
  await writeFile(
    resolve(ROOT, "training/pairs.json"),
    JSON.stringify(pairs, null, 2) + "\n",
    "utf8"
  );
  console.log(`wrote ${pairs.length} sketches to ${dir} and training/pairs.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
