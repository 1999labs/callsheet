// Emits a compact corpus of valid p5.brush colour scripts, one per film, into
// sketches/scripts/<id>.js, and writes training/pairs-scripts.json.
// Deliberately terse (arrays + one small helper) so training sequences stay short.
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
  createCanvas(1440, 900, WEBGL);
  randomSeed(${seed});
  background("#f3ecdd");
  brush.scaleBrushes(4);
`;

const FOOTER = `}

function draw() {}
`;

const FORM = `function form(x, w, k, mid, acc) {
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

`;

function body(film) {
  const arr = (a) => JSON.stringify(a);
  return (
    `  const cols = ${film.cols}, pw = 1440 / cols;\n` +
    `  const base = ${arr(film.base)};\n` +
    `  const mid = ${arr(film.mid)};\n` +
    `  const acc = ${arr(film.acc)};\n` +
    `  const kind = ${arr(film.form)};\n` +
    `  for (let i = 0; i < cols; i++) {\n` +
    `    const x = -720 + i * pw + 8, w = pw - 16;\n` +
    `    brush.fill(base[i], 225);\n` +
    `    brush.fillBleed(0.4, "out", 0);\n` +
    `    brush.rect(x, -440, w, 880);\n` +
    `    form(x, w, kind[i], mid[i], acc[i]);\n` +
    `  }\n`
  );
}

async function main() {
  const films = JSON.parse(await readFile(resolve(ROOT, "scenes/scripts.json"), "utf8"));
  const dir = resolve(ROOT, "sketches/scripts");
  await mkdir(dir, { recursive: true });

  const pairs = [];
  for (const film of films) {
    const code = FORM + PREAMBLE(hash(film.id)) + body(film) + FOOTER;
    const rel = `sketches/scripts/${film.id}.js`;
    await writeFile(resolve(ROOT, rel), code, "utf8");
    pairs.push({ sceneId: film.id, sketch: rel });
  }
  await writeFile(
    resolve(ROOT, "training/pairs-scripts.json"),
    JSON.stringify(pairs, null, 2) + "\n",
    "utf8"
  );
  console.log(`wrote ${films.length} scripts to ${dir} and training/pairs-scripts.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
