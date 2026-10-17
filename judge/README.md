# Judge — is this take any good?

The painter can produce plausible code that still looks wrong. The judge is the
reward: it decides which takes are *plates* and which are *outtakes*, so the corpus
only ever grows with things worth imitating.

## Two signals, one verdict

1. **The compile gate** (free, objective). A take must parse, initialise, and render
   without error — read straight from the shoot's `manifest.json`. A broken or
   near-empty take is an outtake regardless of anything else.
2. **Similarity to the reference pool** (the aesthetic signal). Each rendered PNG is
   reduced to a small feature vector (ink coverage, centroid, bounding-box fill,
   colour saturation / hue concentration, edge density, symmetry); features are
   z-scored and a take scores against the hand-rated pool in `data/plates/plates.json`.

The pool defines the scale: thresholds for *okay* and *love* are percentiles of the
pool's **own** self-similarity, so "good" means "as good as the plates we already
trust", not an arbitrary number.

A take's verdict is `love`, `okay`, or `outtake`.

## The author is the final judge

Automatic scoring is a proxy. If `data/ratings/<id>.json` exists, its
`{ "r1": "love", ... }` entries **override** the computed verdict. The judge writes a
template the first time it sees a shoot; edit it and re-run.

## Usage

```bash
node judge/judge.mjs                  # every shoot in data/generations/
node judge/judge.mjs cs-001           # one shoot
node judge/judge.mjs cs-001 --promote # also feed winners back into the corpus
```

Outputs, per shoot at `data/generations/<id>/verdicts.json`:

```json
{
  "id": "cs-001",
  "counts": { "total": 5, "love": 2, "okay": 1, "outtake": 2 },
  "takes": [
    { "i": 2, "sim": 0.683, "nearest": "cs-001/love", "verdict": "love", "reasons": [] }
  ]
}
```

## Closing the loop

`--promote` copies every `love`/`okay` take into `sketches/learned/` and appends it to
`training/pairs.json`. Then:

```bash
node training/prepare_data.mjs     # rebuilds training/data/*.jsonl
caffeinate -i bash training/train_chunked.sh
```

Each round the pool and the painter both improve.

## Optional VLM

Set `CALLSHEET_VLM_URL` and `CALLSHEET_VLM_MODEL` to an OpenAI-compatible **vision**
endpoint and the judge adds a pairwise vote ("which image looks more like a finished
herbarium plate?") against the nearest pool plate. Unset, the judge needs no model.

## Why heuristics by default

There is no vision model on the machine and a small VLM is slow to run locally, so the
default judge is deliberately model-free: fast, deterministic, and reproducible. The
VLM path is a drop-in upgrade when a vision endpoint is available — it augments rather
than replaces the pool and the human.
