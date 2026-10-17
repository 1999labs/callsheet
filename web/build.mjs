import { readFile, writeFile, mkdir, readdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = join(__dirname, "site");
const ASSETS = join(OUT, "assets");

async function readJson(p, fallback) {
  try {
    return JSON.parse(await readFile(resolve(ROOT, p), "utf8"));
  } catch {
    return fallback;
  }
}

function sceneMap(scenes) {
  const m = new Map();
  for (const s of scenes) m.set(s.id, s);
  return m;
}

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function specimenLabel(scene, plateNo) {
  return `
      <dl class="sheet">
        <div><dt>Specimen</dt><dd>${esc(scene.species)}</dd></div>
        <div><dt>Plate</dt><dd>No. ${plateNo}</dd></div>
        <div><dt>Collected</dt><dd>Day ${scene.day} — ${esc(scene.location)}</dd></div>
        <div><dt>Conditions</dt><dd>${esc(scene.light)}</dd></div>
        <div><dt>Field notes</dt><dd>${esc(scene.flower)}; ${esc(scene.foliage)}</dd></div>
        <div><dt>Palette</dt><dd>${esc(scene.color)}</dd></div>
      </dl>`;
}

function filmLabel(scene) {
  return `
      <dl class="sheet">
        <div><dt>Title</dt><dd>${esc(scene.title)}</dd></div>
        <div><dt>Director</dt><dd>${esc(scene.director)}, ${scene.year}</dd></div>
        <div><dt>Genre</dt><dd>${esc(scene.genre)}</dd></div>
        <div><dt>Scenes</dt><dd>${(scene.scenes || []).map(esc).join(" · ")}</dd></div>
      </dl>`;
}

function labelHtml(scene, plateNo) {
  if (!scene) return "";
  return scene.species ? specimenLabel(scene, plateNo) : filmLabel(scene);
}

async function build() {
  const scenes = await readJson("scenes/scenes.json", []);
  const films = await readJson("scenes/scripts.json", []);
  const byId = sceneMap([...scenes, ...films]);

  await mkdir(ASSETS, { recursive: true });

  // reference-pool plate grids, keyed by collection
  async function plateGrid(index) {
    const plates = await readJson(index, []);
    const cards = [];
    let n = 1;
    for (const p of plates) {
      const src = resolve(ROOT, "data/plates", p.file);
      if (!existsSync(src)) continue;
      const asset = `${index.includes("scripts") ? "sc-" : ""}${basename(p.file)}`;
      await copyFile(src, join(ASSETS, asset));
      const scene = byId.get(p.sceneId);
      cards.push(`
      <figure class="plate">
        <img src="assets/${asset}" alt="${esc(scene ? scene.species || scene.title : p.file)}" loading="lazy">
        <figcaption>
          <span class="tier">${esc(p.tier)}</span>
          ${labelHtml(scene, n)}
        </figcaption>
      </figure>`);
      n++;
    }
    return cards.join("");
  }

  // shoots (per generation root)
  async function buildShoots(genRoot, label, assetPrefix) {
    const blocks = [];
    if (!existsSync(genRoot)) return blocks;
    for (const id of (await readdir(genRoot)).sort()) {
      const mPath = join(genRoot, id, "manifest.json");
      if (!existsSync(mPath)) continue;
      const manifest = JSON.parse(await readFile(mPath, "utf8"));
      const scene = manifest.scene || byId.get(id) || {};
      const takes = [];
      for (const t of manifest.takes || []) {
        const png = join(genRoot, id, `r${t.i}.png`);
        const asset = `${assetPrefix}${id}-r${t.i}.png`;
        let img = `<div class="blank">no image</div>`;
        if (existsSync(png)) {
          await copyFile(png, join(ASSETS, asset));
          img = `<img src="assets/${asset}" alt="take ${t.i}" loading="lazy">`;
        }
        const err = (t.errors && t.errors[0]) || "";
        takes.push(`
          <figure class="take ${t.ok ? "ok" : "fail"}">
            ${img}
            <figcaption>
              <span class="badge ${t.ok ? "ok" : "fail"}">${t.ok ? "SELECTABLE" : "OUTTAKE"}</span>
              <span class="take-n">take ${t.i}${t.attemptCount ? ` · ${t.attemptCount} attempts` : ""}</span>
              ${err ? `<span class="err">${esc(err.slice(0, 90))}</span>` : ""}
            </figcaption>
          </figure>`);
      }
      const ok = (manifest.takes || []).filter((t) => t.ok).length;
      blocks.push(`
        <section class="shoot">
          <h3>${label} — ${scene.id || id} · ${esc(scene.species || scene.title || "")}</h3>
          <p class="meta">${ok}/${(manifest.takes || []).length} passed the compile gate</p>
          <div class="takes">${takes.join("")}</div>
        </section>`);
    }
    return blocks;
  }

  async function summarize(root) {
    const out = { ok: 0, total: 0 };
    if (!existsSync(root)) return out;
    for (const id of await readdir(root)) {
      const m = join(root, id, "manifest.json");
      if (!existsSync(m)) continue;
      const man = JSON.parse(await readFile(m, "utf8"));
      for (const t of man.takes || []) {
        out.total++;
        if (t.ok) out.ok++;
      }
    }
    return out;
  }

  const scriptCards = await plateGrid("data/plates/scripts.json");
  const botanicalCards = await plateGrid("data/plates/plates.json");

  const beforeBlocks = await buildShoots(resolve(ROOT, "data/generations-base"), "Untrained", "base-");
  const afterBotBlocks = await buildShoots(resolve(ROOT, "data/generations"), "Fine-tuned", "");
  const afterScriptBlocks = await buildShoots(resolve(ROOT, "data/generations-scripts"), "Fine-tuned", "sc-");
  const base = await summarize(resolve(ROOT, "data/generations-base"));
  const ftBot = await summarize(resolve(ROOT, "data/generations"));
  const ftScr = await summarize(resolve(ROOT, "data/generations-scripts"));

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>callsheet.art — invented films, painted as code</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root { --paper:#f3ecdd; --ink:#2f2a26; --faded:#8a8077; --accent:#8a4b2f; --line:#d8cdb8; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--paper); color:var(--ink); font-family:'EB Garamond', Georgia, serif; }
  header { max-width: 1280px; margin:0 auto; padding:64px 28px 20px; }
  h1 { font-size: clamp(2.4rem, 6vw, 4.4rem); font-weight:600; margin:0 0 8px; letter-spacing:-0.01em; }
  h1 .art { font-style: italic; color: var(--accent); }
  .lede { max-width: 62ch; font-size:1.2rem; line-height:1.55; color:#43403b; }
  .mono { font-family:'IBM Plex Mono', monospace; font-size:0.8rem; letter-spacing:0.02em; }
  main { max-width: 1280px; margin:0 auto; padding: 20px 28px 100px; }
  h2 { font-size:1.7rem; margin:56px 0 4px; border-top:1px solid var(--line); padding-top:28px; }
  h2 .mono { color:var(--faded); display:block; font-weight:400; margin-bottom:6px; }
  h3 { font-size:1.25rem; margin:34px 0 2px; }
  .meta { color:var(--faded); margin:0 0 18px; font-family:'IBM Plex Mono', monospace; font-size:0.78rem; }
  .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:34px; }
  .grid.wide { grid-template-columns: repeat(auto-fill, minmax(440px, 1fr)); gap:30px; }
  .plate { margin:0; background:#efe7d5; border:1px solid var(--line); padding:14px; }
  .plate img { width:100%; display:block; border:1px solid #e2d8c2; background:#fff; }
  figcaption { padding-top:12px; }
  .sheet { margin:10px 0 0; padding:0; }
  .sheet > div { display:grid; grid-template-columns:92px 1fr; gap:8px; padding:3px 0; border-bottom:1px dotted var(--line); }
  .sheet dt { font-family:'IBM Plex Mono', monospace; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--faded); }
  .sheet dd { margin:0; font-size:0.98rem; }
  .tier { display:inline-block; font-family:'IBM Plex Mono', monospace; font-size:0.62rem; text-transform:uppercase; letter-spacing:0.12em; color:#5a6b3f; border:1px solid #b9c39c; padding:2px 7px; margin-bottom:6px; }
  .takes { display:grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap:20px; }
  .take { margin:0; border:1px solid var(--line); padding:10px; background:#efe7d5; }
  .take img { width:100%; display:block; background:#fff; }
  .take .blank { aspect-ratio:1000/1400; display:flex; align-items:center; justify-content:center; color:var(--faded); border:1px dashed var(--line); font-family:'IBM Plex Mono', monospace; font-size:0.75rem; }
  .take figcaption { display:flex; flex-direction:column; gap:5px; padding-top:10px; }
  .badge { align-self:flex-start; font-family:'IBM Plex Mono', monospace; font-size:0.6rem; letter-spacing:0.1em; padding:2px 7px; }
  .badge.ok { color:#3f6b3f; border:1px solid #9cb99c; }
  .badge.fail { color:#8a3a2f; border:1px solid #c79f96; }
  .take-n { font-family:'IBM Plex Mono', monospace; font-size:0.72rem; color:var(--faded); }
  .err { font-family:'IBM Plex Mono', monospace; font-size:0.68rem; color:#8a3a2f; }
  footer { max-width:1280px; margin:0 auto; padding:40px 28px 80px; color:var(--faded); border-top:1px solid var(--line); font-size:0.95rem; }
  code { font-family:'IBM Plex Mono', monospace; font-size:0.85em; }
</style>
</head>
<body>
<header>
  <h1>callsheet<span class="art">.art</span></h1>
  <p class="lede">Invented films, painted as code. A model writes <code>p5.brush</code> JavaScript
  instead of pixels — the code is the artefact, and the artefact is the call sheet: a film that was
  never made.</p>
</header>
<main>
  <h2><span class="mono">I. Colour scripts</span>Films that were never made</h2>
  <p class="meta">One strip of panels per film, one panel per scene, mapping the mood and colour from
  first frame to last. Each is invented.</p>
  ${scriptCards ? `<div class="grid wide">${scriptCards}</div>` : `<p class="meta">No colour scripts yet.</p>`}

  <h2><span class="mono">II. Botanical plates</span>Specimens from a period film</h2>
  <p class="meta">An invented specimen on aged paper, as if from a film's herbarium.</p>
  <div class="grid">${botanicalCards}</div>

  <h2><span class="mono">III. The process</span>Before &amp; after</h2>
  <p class="meta">A small model (<code>Qwen2.5-Coder-1.5B</code>) paints each brief several ways; a take
  counts if it parses and draws. Untrained, almost nothing lands; after a LoRA fine-tune on the reference
  corpus it mostly does. Untrained <strong>${base.ok}/${base.total}</strong> · fine-tuned botanical
  <strong>${ftBot.ok}/${ftBot.total}</strong> · fine-tuned colour scripts <strong>${ftScr.ok}/${ftScr.total}</strong>.</p>
  ${beforeBlocks.join("")}
  ${afterBotBlocks.join("")}
  ${afterScriptBlocks.join("")}
</main>
<footer>
  <p class="mono">callsheet.art — generated locally with p5.brush + a local language model. Plates are code.</p>
</footer>
</body>
</html>`;

  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, "index.html"), html, "utf8");
  console.log(
    `site built -> ${join(OUT, "index.html")} (${scriptCards ? scriptCards.match(/class="plate"/g).length : 0} scripts, ` +
      `${botanicalCards.match(/class="plate"/g).length} botanical plates, ` +
      `${beforeBlocks.length + afterBotBlocks.length + afterScriptBlocks.length} shoots)`
  );
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
