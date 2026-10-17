import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const OLLAMA = process.env.OLLAMA_HOST || "http://localhost:11434";
const OPENAI_BASE = process.env.OPENAI_BASE_URL || "http://localhost:8080/v1";
const BACKEND = process.env.CALLSHEET_BACKEND || "ollama";
const DEFAULT_MODEL = process.env.CALLSHEET_MODEL || "qwen2.5-coder:1.5b";

let cachedSystem = {};
async function systemPrompt(kind) {
  const file = kind === "colorscript" ? "prompts/colorscript.md" : "prompts/system.md";
  if (cachedSystem[file]) return cachedSystem[file];
  cachedSystem[file] = await readFile(resolve(ROOT, file), "utf8");
  return cachedSystem[file];
}

export function briefToUserMessage(scene) {
  if (scene.kind === "colorscript") {
    const scenes = scene.scenes || [];
    return [
      `Film brief — one colour script:`,
      ``,
      `- Working title: ${scene.title}`,
      `- Director: ${scene.director}, ${scene.year}`,
      `- Genre: ${scene.genre}`,
      `- Panels (left to right, one each): ${scenes.join(" / ")}`,
    ].join("\n");
  }
  return [
    `Scene brief for one specimen plate:`,
    ``,
    `- Species (invented): ${scene.species}`,
    `- Flower / seed head: ${scene.flower}`,
    `- Foliage & stem: ${scene.foliage}`,
    `- Color of the specimen: ${scene.color}`,
    `- Collection note: day ${scene.day}, ${scene.location}, ${scene.light}`,
    ``,
    `Paint the specimen as a single watercolor botanical plate.`,
  ].join("\n");
}

export function extractCode(text) {
  let t = String(text).trim();
  const fenced = t.match(/```(?:javascript|js)?\s*\n([\s\S]*?)(?:```|$)/i);
  if (fenced) {
    t = fenced[1];
  } else {
    t = t.replace(/^```(?:javascript|js)?\s*/i, "").replace(/```\s*$/i, "");
  }
  return t.trim();
}

async function chat(messages, opts = {}) {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.9,
    seed,
    numPredict = 1500,
    repeatPenalty = 1.3,
  } = opts;

  if (BACKEND === "openai") {
    const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        temperature,
        max_tokens: numPredict,
        ...(seed != null ? { seed } : {}),
      }),
    });
    if (!res.ok) throw new Error(`openai ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const choice = data.choices?.[0];
    return {
      raw: choice?.message?.content ?? "",
      model,
      doneReason: choice?.finish_reason ?? null,
      evalCount: data.usage?.completion_tokens ?? null,
    };
  }

  const body = {
    model,
    messages,
    stream: false,
    options: {
      temperature,
      num_predict: numPredict,
      repeat_penalty: repeatPenalty,
      ...(seed != null ? { seed } : {}),
    },
  };

  const res = await fetch(`${OLLAMA}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`ollama ${res.status}: ${await res.text()}`);

  const data = await res.json();
  return {
    raw: data.message?.content ?? "",
    model,
    doneReason: data.done_reason ?? null,
    evalCount: data.eval_count ?? null,
  };
}

export async function generateSketch(scene, opts = {}) {
  const messages = [
    { role: "system", content: await systemPrompt(scene.kind) },
    { role: "user", content: briefToUserMessage(scene) },
  ];
  const out = await chat(messages, opts);
  return { ...out, code: extractCode(out.raw) };
}

export async function repairSketch(scene, brokenCode, errorMessage, opts = {}) {
  const messages = [
    { role: "system", content: await systemPrompt(scene.kind) },
    { role: "user", content: briefToUserMessage(scene) },
    { role: "assistant", content: "```javascript\n" + brokenCode + "\n```" },
    {
      role: "user",
      content:
        `That sketch failed with this error:\n\n  ${errorMessage}\n\n` +
        `Fix ONLY the problem. Return the complete corrected sketch as a single ` +
        `\`\`\`javascript code block. Keep everything that already worked.`,
    },
  ];
  const out = await chat(messages, opts);
  return { ...out, code: extractCode(out.raw) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sceneArg = process.argv[2];
  if (!sceneArg) {
    console.error("usage: node painter/generate.mjs <scene.json>");
    process.exit(1);
  }
  const scene = JSON.parse(await readFile(resolve(sceneArg), "utf8"));
  const { code, model } = await generateSketch(scene);
  console.log(`// model: ${model}`);
  console.log(code);
}
