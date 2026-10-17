# Training — teaching the small painter

The whole point: the small, fast model (`qwen2.5-coder:1.5b`) writes broken or weak
`p5.brush` code. We teach it from a seed corpus of good plates. On Apple Silicon this
runs locally on the M2 GPU via **MLX**.

## Why LoRA (not a full retrain)

You do not retrain the model. You train a small **adapter** — a few-MB add-on that
nudges the base model toward your taste. That is what makes it fit on a 16 GB Mac.

## Steps

### 1. Seed the corpus
Hand-author plates in `sketches/` and render them, then list each `(scene → sketch)`
pair in `training/pairs.json`:

```json
{ "sceneId": "cs-001", "sketch": "sketches/seed-01.js" }
```

Aim for 15–30 pairs. With only a handful, the adapter barely moves — volume matters.

### 2. Build the dataset

```bash
node training/prepare_data.mjs
# -> training/data/train.jsonl, valid.jsonl  (chat-format: system + brief + sketch)
```

The corpus generator writes the pairs for you:

```bash
node sketches/build_corpus.mjs     # sketches/corpus/*.js + training/pairs.json
```

### 3. Fine-tune (MLX LoRA on Apple Silicon)

Needs Python 3.10+. Without Homebrew:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python mlx-lm
```

Train. Use `train_chunked.sh`, which retries around the macOS Metal watchdog
(see below) by resuming from the saved adapter:

```bash
caffeinate -i bash training/train_chunked.sh
```

(`training/train.sh` is the plain one-shot version.)

### 4. Use it

Serve the adapter with the bundled OpenAI-compatible server (this always applies
the adapter, unlike `mlx_lm.server`):

```bash
.venv/bin/python training/serve.py --port 8080
export CALLSHEET_BACKEND=openai OPENAI_BASE_URL=http://localhost:8080/v1
export CALLSHEET_MODEL=callsheet
node loop/shoot.mjs scenes/cs-001.json 5
```

## The macOS Metal watchdog

LoRA training can die with
`kIOGPUCommandBufferCallbackErrorImpactingInteractivity` when the display is active:
macOS kills a GPU command buffer that monopolizes the GPU. MLX marks it *won't fix*.
What worked here:

- keep sequences short — ~1024 tokens survived, 1280+ crashed;
- train in small chunks (`CHUNK=12`, `SAVE_EVERY=4`) and **resume from the adapter**
  after each kill (`train_chunked.sh` does this automatically);
- for an uninterrupted run, train with the display off (`caffeinate -i` + lid closed).

## The full RL-shaped loop

Once the painter is decent, close the loop:

1. **Sample** — shoot N takes for a scene.
2. **Judge** — keep takes that pass the compile gate and win pairwise against the
   `love` pool (`data/plates/plates.json`).
3. **Learn** — append the winners to `pairs.json`, re-run `prepare_data.mjs`, re-train.
4. **Repeat** — each round the pool and the model both improve.

Surya's key lessons to keep in mind: judge by **pairwise comparison**, not a 0–10
score, and anchor "good" with a **hand-rated reference pool**. Keep the painter prompt
short — a strict allowlist, no long API docs.

## Reference pool (public domain)

To grow the pool beyond hand-authored plates, collect centuries-old botanical plates
from the **Biodiversity Heritage Library**, **Kew**, **USDA**, or **Smithsonian Open
Access** (all public domain). Rate them love / okay / nope and drop them in
`data/pool/`.
