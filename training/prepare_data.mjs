import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { briefToUserMessage } from "../painter/generate.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// COLLECTION=botanical (default) | scripts
const COLLECTION = process.env.COLLECTION || "botanical";

const CONF = {
  botanical: {
    system: "prompts/system.md",
    scenes: "scenes/scenes.json",
    pairs: "training/pairs.json",
    data: "training/data",
  },
  scripts: {
    system: "prompts/colorscript.md",
    scenes: "scenes/scripts.json",
    pairs: "training/pairs-scripts.json",
    data: "training/data-scripts",
  },
};

async function main() {
  const conf = CONF[COLLECTION];
  if (!conf) {
    console.error(`unknown COLLECTION="${COLLECTION}" (use botanical|scripts)`);
    process.exit(1);
  }
  const DATA = resolve(ROOT, conf.data);

  const system = await readFile(resolve(ROOT, conf.system), "utf8");
  const scenes = JSON.parse(await readFile(resolve(ROOT, conf.scenes), "utf8"));
  const byId = new Map(scenes.map((s) => [s.id, s]));
  const pairs = JSON.parse(await readFile(resolve(ROOT, conf.pairs), "utf8"));

  const rows = [];
  for (const p of pairs) {
    const scene = byId.get(p.sceneId);
    if (!scene) {
      console.warn(`skip ${p.sceneId}: no scene`);
      continue;
    }
    const sketch = (await readFile(resolve(ROOT, p.sketch), "utf8")).trim();
    rows.push(
      JSON.stringify({
        messages: [
          { role: "system", content: system },
          { role: "user", content: briefToUserMessage(scene) },
          { role: "assistant", content: "```javascript\n" + sketch + "\n```" },
        ],
      })
    );
  }

  if (rows.length < 2) {
    console.error(
      `Only ${rows.length} training pair(s). Hand-author more plates in sketches/ and add them to pairs.json.`
    );
  }

  await mkdir(DATA, { recursive: true });
  // tiny corpus: last row becomes the validation holdout
  const train = rows.slice(0, Math.max(1, rows.length - 1));
  const valid = rows.slice(Math.max(1, rows.length - 1));
  await writeFile(join(DATA, "train.jsonl"), train.join("\n") + "\n", "utf8");
  await writeFile(join(DATA, "valid.jsonl"), (valid.length ? valid : train).join("\n") + "\n", "utf8");
  console.log(`[${COLLECTION}] wrote ${train.length} train / ${valid.length} valid examples to ${DATA}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
