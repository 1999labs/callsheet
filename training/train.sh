#!/usr/bin/env bash
#
# Fine-tune the small painter with MLX LoRA on Apple Silicon.
#
# Setup (one time):
#   curl -LsSf https://astral.sh/uv/install.sh | sh
#   uv venv --python 3.12 .venv
#   uv pip install --python .venv/bin/python mlx-lm
#
# Run (keep the machine awake; short sequences only — the macOS Metal watchdog
# kills long GPU ops while the display is active):
#   caffeinate -i bash training/train.sh
#
set -euo pipefail

MODEL="${MODEL:-Qwen/Qwen2.5-Coder-1.5B-Instruct}"
MAXSEQ="${MAXSEQ:-1280}"
ITERS="${ITERS:-250}"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"

echo "==> preparing data"
node "$ROOT/training/prepare_data.mjs"

echo "==> training LoRA adapter (model: $MODEL, iters: $ITERS, max-seq: $MAXSEQ)"
"$ROOT/.venv/bin/python" -m mlx_lm.lora \
  --model "$MODEL" \
  --train \
  --data "$HERE/data" \
  --fine-tune-type lora \
  --iters "$ITERS" \
  --batch-size 1 \
  --num-layers "${NUMLAYERS:-8}" \
  --learning-rate 1e-5 \
  --max-seq-length "$MAXSEQ" \
  --steps-per-eval 50 \
  --save-every 50 \
  --adapter-path "$HERE/adapters"

cat <<'EOF'

==> done. adapter written to training/adapters

Serve it (OpenAI-compatible) and point the painter at it:

  .venv/bin/python -m mlx_lm.server --model Qwen/Qwen2.5-Coder-1.5B-Instruct \
    --adapter-path training/adapters --port 8080

  CALLSHEET_BACKEND=openai OPENAI_BASE_URL=http://localhost:8080/v1 \
    CALLSHEET_MODEL=local node loop/shoot.mjs scenes/cs-001.json 5
EOF
