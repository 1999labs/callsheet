// Judge takes against the hand-rated reference pool.
//
//   node judge/judge.mjs                    # judge every shoot in the collection's gen dir
//   node judge/judge.mjs cs-001             # judge one shoot
//   node judge/judge.mjs cs-001 --promote   # also copy winners into the corpus
//   COLLECTION=scripts node judge/judge.mjs # judge the colour-script collection
//
// Reward = the compile gate (from the manifest) + similarity to the reference
// pool. A human rating file always overrides the automatic verdict — the
// aesthetic signal is authored.
//
// Optional VLM: set CALLSHEET_VLM_URL + CALLSHEET_VLM_MODEL (OpenAI-compatible,
// vision) to add a pairwise "which looks more like one of ours?" vote against
// the pool. Off by default so the judge runs with no model at all.
import { readFile, writeFile, mkdir, readdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractFeatures, FEATURE_AXES } from "./features.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const COLLECTIONS = {
  botanical: {
    refs: "data/plates/plates.json",
    gen: "data/generations",
    ratings: "data/ratings",
    learned: "sketches/learned",
    pairs: "training/pairs.json",
    axes: FEATURE_AXES,
    gate: { minCov: 0.015, maxCov: 0.65 },
    noun: "herbarium specimen",
    labelOf: (s) => s.species || "",
  },
  scripts: {
    refs: "data/plates/scripts.json",
    gen: "data/generations-scripts",
    ratings: "data/ratings-scripts",
    learned: "sketches/learned-scripts",
    pairs: "training/pairs-scripts.json",
    // colour scripts are full-bleed, so lead with colour + detail, not composition
    axes: ["satMean", "hueConc", "colorCount", "edgeDensity", "symmetry", "coverage"],
    gate: { minCov: 0.05, maxCov: 0.99 },
    noun: "film colour script",
    labelOf: (s) => s.title || "",
  },
};

const COLLECTION = process.env.COLLECTION || "botanical";
const CONF = COLLECTIONS[COLLECTION];
if (!CONF) {
  console.error(`unknown COLLECTION="${COLLECTION}" (use botanical|scripts)`);
  process.exit(1);
}
const AXES = CONF.axes;
const GEN_ROOT = resolve(ROOT, CONF.gen);
const RATINGS = resolve(ROOT, CONF.ratings);
const LEARNED = resolve(ROOT, CONF.learned);

const TIER_WEIGHT = { love: 1.0, corpus: 0.6, okay: 0.5 };

async function readJson(p, fb) {
  try {
    return JSON.parse(await readFile(p, "utf8"));
  } catch {
    return fb;
  }
}

function zStats(vectors) {
  const mean = {};
  const std = {};
  for (const ax of AXES) {
    const vals = vectors.map((v) => v[ax]);
    const m = vals.reduce((a, b) => a + b, 0) / vals.length;
    const varr = vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length;
    mean[ax] = m;
    std[ax] = Math.sqrt(varr) || 1;
  }
  return { mean, std };
}

const znorm = (v, { mean, std }) => {
  const o = {};
  for (const ax of AXES) o[ax] = (v[ax] - mean[ax]) / std[ax];
  return o;
};

const rmsDist = (a, b) => {
  let s = 0;
  for (const ax of AXES) s += (a[ax] - b[ax]) ** 2;
  return Math.sqrt(s / AXES.length);
};

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))));
  return sorted[i];
}

// --- optional VLM pairwise vote -------------------------------------------------
async function vlmVote(candidatePath, refPath) {
  const url = process.env.CALLSHEET_VLM_URL;
  const model = process.env.CALLSHEET_VLM_MODEL;
  if (!url || !model || !refPath) return null;
  const b64 = async (p) => (await readFile(p)).toString("base64");
  const [a, b] = await Promise.all([b64(candidatePath), b64(refPath)]);
  const body = {
    model,
    messages: [
      { role: "system", content: "You judge art. Reply with exactly one word: A or B." },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Image A is a candidate. Image B is a reference from a hand-rated pool. " +
              `Which looks more like a finished ${CONF.noun}? Reply A or B.`,
          },
          { type: "image_url", image_url: { url: `data:image/png;base64,${a}` } },
          { type: "image_url", image_url: { url: `data:image/png;base64,${b}` } },
        ],
      },
    ],
    max_tokens: 4,
    temperature: 0,
  };
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const t = (j.choices?.[0]?.message?.content || "").trim().toUpperCase();
    return t.startsWith("A") ? "candidate" : t.startsWith("B") ? "reference" : null;
  } catch {
    return null;
  }
}

async function loadReferences() {
  const plates = await readJson(resolve(ROOT, CONF.refs), []);
  const refs = [];
  for (const p of plates) {
    const path = resolve(ROOT, "data/plates", p.file);
    if (!existsSync(path)) continue;
    const feats = extractFeatures(await readFile(path));
    refs.push({ sceneId: p.sceneId, tier: p.tier, path, feats, weight: TIER_WEIGHT[p.tier] ?? 0.5 });
  }
  return refs;
}

async function judgeShoot(id, refs, stats, thresholds) {
  const dir = join(GEN_ROOT, id);
  const manifest = await readJson(join(dir, "manifest.json"), null);
  if (!manifest) return null;
  const scene = manifest.scene || {};
  const ratings = await readJson(join(RATINGS, `${id}.json`), {});

  const takes = [];
  for (const t of manifest.takes || []) {
    const png = join(dir, `r${t.i}.png`);
    let feats = null;
    let sim = 0;
    let nearest = null;
    if (t.ok && existsSync(png)) {
      feats = extractFeatures(await readFile(png));
      const zc = znorm(feats, stats);
      for (const r of refs) {
        const d = rmsDist(zc, znorm(r.feats, stats));
        const s = r.weight * (1 / (1 + d));
        if (s > sim) {
          sim = s;
          nearest = r;
        }
      }
    }

    const gateReasons = [];
    if (!t.ok) gateReasons.push(`gate: ${(t.errors && t.errors[0]) || "failed"}`);
    else if (!feats) gateReasons.push("no image");
    else {
      if (feats.coverage < CONF.gate.minCov) gateReasons.push("nearly empty");
      if (feats.coverage > CONF.gate.maxCov) gateReasons.push("over-inked");
    }

    const rated_ = ratings[`r${t.i}`];

    let verdict;
    if (rated_) verdict = rated_; // love | okay | outtake (authored signal wins)
    else if (gateReasons.length) verdict = "outtake";
    else if (sim >= thresholds.hi) verdict = "love";
    else if (sim >= thresholds.mid) verdict = "okay";
    else verdict = "outtake";

    const vlm = feats ? await vlmVote(png, nearest?.path) : null;

    takes.push({
      i: t.i,
      ok: !!t.ok,
      sim: Number(sim.toFixed(3)),
      nearest: nearest ? `${nearest.sceneId}/${nearest.tier}` : null,
      vlm,
      verdict,
      reasons: gateReasons,
      features: feats,
      rated: !!rated_,
    });
  }

  const summary = {
    id,
    collection: COLLECTION,
    label: CONF.labelOf(scene),
    model: manifest.model || null,
    thresholds,
    counts: {
      total: takes.length,
      love: takes.filter((t) => t.verdict === "love").length,
      okay: takes.filter((t) => t.verdict === "okay").length,
      outtake: takes.filter((t) => t.verdict === "outtake").length,
    },
    takes,
  };
  await writeFile(join(dir, "verdicts.json"), JSON.stringify(summary, null, 2));

  if (!existsSync(join(RATINGS, `${id}.json`))) {
    const template = {};
    for (const t of takes) template[`r${t.i}`] = t.verdict === "outtake" ? "" : t.verdict;
    await mkdir(RATINGS, { recursive: true });
    await writeFile(join(RATINGS, `${id}.json`), JSON.stringify(template, null, 2));
  }

  return { summary, dir, takes, scene };
}

async function promote(result) {
  await mkdir(LEARNED, { recursive: true });
  const pairsPath = resolve(ROOT, CONF.pairs);
  const pairs = await readJson(pairsPath, []);
  const existing = new Set(pairs.map((p) => p.sketch));
  const relDir = CONF.learned;
  let added = 0;
  for (const t of result.takes) {
    if (t.verdict !== "love" && t.verdict !== "okay") continue;
    const src = join(result.dir, `r${t.i}.js`);
    if (!existsSync(src)) continue;
    const rel = `${relDir}/${result.summary.id}-r${t.i}.js`;
    if (existing.has(rel)) continue;
    await copyFile(src, resolve(ROOT, rel));
    pairs.push({ sceneId: result.summary.id, sketch: rel });
    existing.add(rel);
    added++;
  }
  await writeFile(pairsPath, JSON.stringify(pairs, null, 2) + "\n");
  return added;
}

async function main() {
  const args = process.argv.slice(2);
  const promoteFlag = args.includes("--promote");
  const ids = args.filter((a) => !a.startsWith("--"));

  const refs = await loadReferences();
  if (!refs.length) {
    console.error(`no reference plates found (${CONF.refs})`);
    process.exit(1);
  }

  const targets = ids.length
    ? ids
    : existsSync(GEN_ROOT)
    ? (await readdir(GEN_ROOT)).filter((d) => existsSync(join(GEN_ROOT, d, "manifest.json")))
    : [];

  const candidateVecs = [];
  for (const id of targets) {
    const dir = join(GEN_ROOT, id);
    const manifest = await readJson(join(dir, "manifest.json"), null);
    if (!manifest) continue;
    for (const t of manifest.takes || []) {
      const png = join(dir, `r${t.i}.png`);
      if (existsSync(png)) candidateVecs.push(extractFeatures(await readFile(png)));
    }
  }

  const stats = zStats([...refs.map((r) => r.feats), ...candidateVecs]);

  // calibrate thresholds from the pool's own self-similarity
  const selfScores = [];
  for (let a = 0; a < refs.length; a++) {
    const za = znorm(refs[a].feats, stats);
    let best = 0;
    for (let b = 0; b < refs.length; b++) {
      if (a === b) continue;
      const s = refs[b].weight * (1 / (1 + rmsDist(za, znorm(refs[b].feats, stats))));
      if (s > best) best = s;
    }
    selfScores.push(best);
  }
  selfScores.sort((x, y) => x - y);
  const thresholds = {
    mid: Number(percentile(selfScores, 25).toFixed(3)),
    hi: Number(percentile(selfScores, 60).toFixed(3)),
  };

  console.log(`collection: ${COLLECTION} · reference pool: ${refs.length} plates`);
  console.log(`thresholds: okay >= ${thresholds.mid}, love >= ${thresholds.hi}\n`);

  let promoted = 0;
  for (const id of targets) {
    const result = await judgeShoot(id, refs, stats, thresholds);
    if (!result) continue;
    const c = result.summary.counts;
    console.log(
      `${id.padEnd(7)} ${result.summary.label.padEnd(20)}  love ${c.love}  okay ${c.okay}  outtake ${c.outtake}`
    );
    for (const t of result.takes) {
      console.log(
        `  r${t.i}  sim ${t.sim.toFixed(3)}  -> ${t.verdict.padEnd(7)} ` +
          `${t.nearest ? `(near ${t.nearest})` : ""} ${t.reasons.join("; ")}` +
          `${t.vlm ? ` [vlm ${t.vlm}]` : ""}`
      );
    }
    if (promoteFlag) promoted += await promote(result);
  }
  if (promoteFlag) console.log(`\npromoted ${promoted} take(s) -> ${CONF.learned}/ + ${CONF.pairs}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
