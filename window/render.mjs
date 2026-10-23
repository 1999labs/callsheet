import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderSketch } from "../render/render.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const [, , scenePath, outPath, wArg, hArg] = process.argv;
if (!scenePath || !outPath) {
  console.error("usage: node window/render.mjs <scene.js> <out.png> [width] [height]");
  process.exit(1);
}

const kit = await readFile(join(__dirname, "kit.js"), "utf8");
const scene = await readFile(resolve(scenePath), "utf8");
const sketch = `${kit}\n${scene}`;

const opts = {};
if (wArg) opts.width = parseInt(wArg, 10);
if (hArg) opts.height = parseInt(hArg, 10);

const result = await renderSketch(sketch, opts);
const out = resolve(outPath);
if (result.png) {
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, result.png);
  console.log(result.ok ? `rendered -> ${out}` : `rendered with errors -> ${out}`);
} else {
  console.log("no image produced");
}
if (result.errors.length) console.error(result.errors.join("\n"));
