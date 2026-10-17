import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateSketch, repairSketch } from "../painter/generate.mjs";
import { renderSketch } from "../render/render.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function syntaxError(code) {
  try {
    new Function(code);
    return null;
  } catch (e) {
    return String(e.message);
  }
}

async function paintOne(scene, opts) {
  const {
    seed,
    model,
    temperature = 0.85,
    numPredict = 1200,
    maxSyntaxRepairs = 2,
    maxRuntimeRepairs = 1,
    width = 1000,
    height = 1400,
    onProgress,
  } = opts;

  const attempts = [];
  const gen = await generateSketch(scene, { model, temperature, seed, numPredict });
  let code = gen.code;
  let doneReason = gen.doneReason;

  let repairs = 0;
  let syn = syntaxError(code);
  while (syn && repairs < maxSyntaxRepairs) {
    repairs++;
    onProgress?.(`  repair ${repairs} (syntax)...`);
    const r = await repairSketch(scene, code, `SyntaxError: ${syn}`, {
      model,
      temperature,
      numPredict,
      seed: seed + 100 + repairs,
    });
    attempts.push({ code, reason: `syntax: ${syn}` });
    code = r.code;
    syn = syntaxError(code);
  }
  if (syn) {
    attempts.push({ code, reason: `syntax: ${syn}` });
    return { ok: false, code, attempts, errors: [`syntax: ${syn}`], stage: "syntax", doneReason };
  }

  let rendered = await renderSketch(code, { width, height });
  if (!rendered.ok && rendered.errors.length && maxRuntimeRepairs > 0) {
    const err = rendered.errors[0];
    onProgress?.(`  repair ${++repairs} (runtime: ${err.slice(0, 50)})...`);
    const r = await repairSketch(scene, code, err, {
      model,
      temperature,
      numPredict,
      seed: seed + 200 + repairs,
    });
    const fixed = r.code;
    if (!syntaxError(fixed)) {
      attempts.push({ code, reason: `runtime: ${err}` });
      code = fixed;
      rendered = await renderSketch(code, { width, height });
    }
  }

  return {
    ok: rendered.ok,
    code,
    png: rendered.png,
    attempts,
    errors: rendered.errors,
    stage: rendered.ok ? "rendered" : "render",
    doneReason,
  };
}

export async function shoot(scene, opts = {}) {
  const { count = 3, baseSeed = 1000, model, onProgress } = opts;

  const dims = scene.kind === "colorscript" ? { width: 1440, height: 900 } : { width: 1000, height: 1400 };

  const genRoot = process.env.CALLSHEET_GEN_DIR
    ? resolve(ROOT, process.env.CALLSHEET_GEN_DIR)
    : join(ROOT, "data", "generations");
  const dir = join(genRoot, scene.id);
  await mkdir(dir, { recursive: true });

  const takes = [];
  for (let i = 1; i <= count; i++) {
    const seed = baseSeed + i;
    onProgress?.(`take ${i}/${count}: painting (${model ?? "default"}) seed ${seed}...`);

    let result;
    try {
      result = await paintOne(scene, { ...opts, ...dims, seed, onProgress });
    } catch (e) {
      result = { ok: false, code: "", attempts: [], errors: [String(e.message)], stage: "generate" };
    }

    if (result.png) await writeFile(join(dir, `r${i}.png`), result.png);
    await writeFile(join(dir, `r${i}.js`), result.code ?? "", "utf8");

    const meta = {
      i,
      seed,
      ok: result.ok,
      errors: result.errors,
      stage: result.stage,
      doneReason: result.doneReason ?? null,
      truncated: result.doneReason === "length",
      attemptCount: result.attempts?.length ?? 0,
      attempts: result.attempts,
      code: result.code,
    };
    await writeFile(join(dir, `r${i}.json`), JSON.stringify(meta, null, 2));
    takes.push(meta);
    onProgress?.(
      `take ${i}: ${result.ok ? "ok" : "FAILED"}` +
        (meta.attemptCount ? ` (${meta.attemptCount} attempts)` : "") +
        (result.errors?.length ? ` — ${result.errors[0].slice(0, 70)}` : "")
    );
  }

  const manifest = {
    scene,
    count,
    baseSeed,
    model: model ?? null,
    created: new Date().toISOString(),
    takes: takes.map(({ code, attempts, ...rest }) => ({ ...rest, attemptCount: attempts?.length ?? 0 })),
  };
  await writeFile(join(dir, "manifest.json"), JSON.stringify(manifest, null, 2));

  const okCount = takes.filter((t) => t.ok).length;
  onProgress?.(`done: ${okCount}/${count} rendered`);
  return { dir, takes, manifest };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , scenePath, countArg] = process.argv;
  if (!scenePath) {
    console.error("usage: node loop/shoot.mjs <scene.json> [count]");
    process.exit(1);
  }
  const scene = JSON.parse(await readFile(resolve(scenePath), "utf8"));
  const count = countArg ? parseInt(countArg, 10) : 3;
  await shoot(scene, { count, onProgress: (m) => console.log(m) });
}
