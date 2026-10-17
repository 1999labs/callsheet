# Callsheet.art

A language model is trained to **paint with code**: it writes **`p5.brush`
JavaScript** instead of pixels, and the code is the artifact. Each piece is a
*call sheet* — a film that doesn't exist, and a visual plan that never got shot.

The domain (`callsheet.art`) shows the work; this README explains the machine
behind it.

This is a small, local re-imagining of Surya Narreddi's project
([rling-qwen-to-paint-with-code](https://surya.website/rling-qwen-to-paint-with-code)):
reinforcement learning on a creative task, where the reward is not "right or wrong"
but a matter of taste that has to be authored by hand.

---

## The loop

```
scene brief ──▶ PAINTER (LLM writes p5.brush code)
                     │
                     ▼
              SYNTAX GATE (balanced code?)
                     │
                     ▼
              RENDER (headless browser → PNG)
                     │
                     ▼
              JUDGE (vs. reference pool)  ──▶ keep winners / keep outtakes
                     │
                     ▼
              LEARN (fine-tune on winners)  ──▶ better painter
```

Every step is kept on disk, so a shoot is fully reproducible and every failure is
an *outtake* rather than a lost attempt.

## Layout

| Path | What it is |
|---|---|
| `render/` | Headless renderer: runs a sketch in a WEBGL canvas and captures a PNG (Chromium + CDP). |
| `painter/` | Turns a scene brief into a `p5.brush` sketch via a local model (Ollama), with a repair step. |
| `loop/shoot.mjs` | Best-of-N: paint → syntax-check → render → store, with repair on failure. |
| `judge/` | Compares takes against the reference pool (compile gate + optional VLM/human rating). |
| `prompts/system.md` | The botanical-painter brief: a strict, short method allowlist. |
| `prompts/colorscript.md` | The colour-script painter brief (same idea, landscape strip). |
| `scenes/scenes.json` | Botanical scene briefs. |
| `scenes/scripts.json` | Film briefs for colour scripts (title, director, scene moods). |
| `sketches/corpus/`, `sketches/scripts/` | Hand-authored seed plates (the "love tier" reference pool). |
| `data/plates/` | Rendered reference plates + `plates.json` / `scripts.json` indexes. |
| `data/generations/<id>/` | Botanical shoots: `rN.js`, `rN.png`, `rN.json`, `manifest.json`. |
| `data/generations-scripts/<id>/` | Colour-script shoots (same shape, landscape). |
| `web/` | The callsheet.art site (`build.mjs` → `web/site/`, `server.mjs`) — colour scripts, botanical plates, before/after. |
| `training/` | Fine-tuning path (MLX LoRA on Apple Silicon). |

## Requirements

- Node (via `nvm` is fine) and the repo deps: `npm install`
- Playwright's browser: `npx playwright install chromium`
- [Ollama](https://ollama.com) running locally with a coder model, e.g.
  `ollama pull qwen2.5-coder:1.5b`

## Run it

```bash
# render one hand-written sketch to a PNG
node render/render.mjs sketches/seed-01.js data/plates/seed-01.png

# paint a specimen for a scene (prints the sketch)
node painter/generate.mjs scenes/cs-001.json

# a full shoot: 3 takes, best-of-N, kept on disk
node loop/shoot.mjs scenes/cs-001.json 3

# build and view the site
node web/build.mjs
node web/server.mjs      # http://localhost:4321
```

Pick a different model with `CALLSHEET_MODEL=`:

```bash
CALLSHEET_MODEL=qwen2.5-coder:7b node loop/shoot.mjs scenes/cs-001.json 1
```

### Use the fine-tuned painter

```bash
# serve the LoRA adapter (OpenAI-compatible, always applies the adapter)
.venv/bin/python training/serve.py --port 8080

# point the painter at it
export CALLSHEET_BACKEND=openai OPENAI_BASE_URL=http://localhost:8080/v1
export CALLSHEET_MODEL=callsheet
node loop/shoot.mjs scenes/cs-001.json 5
```

### Judge the takes

The judge compares each take against the hand-rated reference pool
(`data/plates/plates.json`) and writes a verdict per take:

```bash
node judge/judge.mjs                  # judge every shoot in data/generations/ (botanical)
node judge/judge.mjs cs-001           # judge one shoot
node judge/judge.mjs cs-001 --promote # + copy winners into the corpus to retrain
COLLECTION=scripts node judge/judge.mjs sc-011   # judge a colour-script shoot
```

`COLLECTION` picks the whole context: `botanical` (default) reads
`data/plates/plates.json` and `data/generations/`, `scripts` reads
`data/plates/scripts.json` and `data/generations-scripts/`, and each uses its own
feature axes, empty/over-inked gate, ratings dir, learned dir and pairs file.

It combines the **compile gate** (from the manifest) with a **similarity score** to
the pool, calibrated so the pool's own plates define "okay" and "love". A take that
nests in the pool and passes the gate is kept; a broken or near-empty take is an
*outtake* no matter how it scores. Every take gets `data/generations/<id>/verdicts.json`,
and a `data/ratings/<id>.json` template you can edit — **a human rating always wins**,
because the aesthetic signal is authored, not discovered.

`--promote` copies the kept takes into `sketches/learned/` and appends them to
`training/pairs.json`, closing the loop: `### shoot → judge → promote → prepare_data → train`.

An optional VLM vote (pairwise, "which looks more like a plate?") is available by
setting `CALLSHEET_VLM_URL` + `CALLSHEET_VLM_MODEL` to any OpenAI-compatible vision
endpoint; with neither set, the judge runs with no model at all.

## Design notes (what we learned building this)

These mirror the findings in Surya's write-up, rediscovered the hard way:

1. **A short allowlist beats long documentation.** Handing the model a big API
   reference makes a small model invent APIs. A tight list of ~16 methods with
   concrete example calls works far better.
2. **Parameter *names* leak into the output.** Writing a signature like
   `brush.circle(x, y, radius, irregular)` makes the model pass the literal token
   `irregular`. Show *example calls with numbers* instead.
3. **The compile gate is the cheapest reward.** A parse check plus a render
   success/failure check filters most broken output for free.
4. **Aesthetic reward is the hard part.** It has to be authored, not discovered — so
   the judge anchors on a hand-rated reference pool and lets a human rating override
   the score (`judge/README.md`).

## Known constraint: local inference on this machine

Measured on an Apple M2 / 16 GB:

| Model | Speed | Notes |
|---|---|---|
| `qwen2.5-coder:7b` | ~3 tok/s | Too slow: a single take can exceed 5 min and time out. |
| `qwen2.5-coder:1.5b` | ~12 tok/s | Fast enough, but too weak to follow the constraints (0/3–1/5 valid). |

So the *untrained* small model mostly fails the gate, and the 7B is too slow to be
interactive. This is the motivating problem the training step solves: teach the small,
fast model to write valid `p5.brush` from a seed corpus. See `training/README.md`.

If you want a strong baseline **now** without training, point the painter at a hosted
model (or run the 7B overnight for a batch of takes).

## The training path (and what happened)

1. Build a seed corpus: 18 fictional species (`scenes/scenes.json`) and a compact
   `p5.brush` plate for each (`sketches/build_corpus.mjs` → `sketches/corpus/`),
   rendered to `data/plates/corpus/`.
2. Fine-tune `Qwen2.5-Coder-1.5B-Instruct` with **MLX LoRA** on the
   `(brief → sketch)` pairs (`training/train_chunked.sh`).
3. Serve the adapter and re-run the shoot (`training/serve.py` + `loop/shoot.mjs`).

### Result (this machine, M2 / 16 GB)

| | Compile-gate pass rate |
|---|---|
| Untrained `Qwen2.5-Coder-1.5B-Instruct` | **0 / 5** |
| Fine-tuned (LoRA, ~206 iters, rank 8) | **8 / 11** (cs-001 4/5, cs-002 3/3, cs-006 1/3) |

The fine-tune turns a model that mostly emits un-parseable code into one that
reliably writes the corpus's shape (a `function leaf(...)` helper, `function setup()`
with `createCanvas`/`randomSeed`, `for` loops, the allowed brush calls). Composition
is still loose — expected for a 1.5B on a 17-example corpus — so the next step is
growing the pool and iterating sample → judge → learn.

### A macOS gotcha worth knowing

MLX LoRA training on Apple Silicon can be killed by the Metal GPU watchdog
(`kIOGPUCommandBufferCallbackErrorImpactingInteractivity`) whenever the **display is
active** and a single GPU op runs too long. MLX upstream marks it *won't fix*. Two
mitigations used here: keep sequences short (the ceiling was ~1024 tokens; 1280+
crashed) and train in small chunks that **resume from the saved adapter** after a
kill (`train_chunked.sh`). For a clean run, train with the display off.

See `training/README.md`.

## Credits

Concept inspired by Surya Narreddi's RL-a-model-to-paint-with-code (with Cameron
Franz and Alex Wang). p5.brush by Alejandro Campos Uribe.
