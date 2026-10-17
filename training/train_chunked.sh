#!/usr/bin/env bash
#
# Robust LoRA training for macOS: the Metal watchdog can kill a long training
# run when the display is active. Train in small chunks, resume from the saved
# adapter after any crash, and retry until TARGET iterations are done.
#
#   caffeinate -i bash training/train_chunked.sh
#
set -uo pipefail

MODEL="${MODEL:-Qwen/Qwen2.5-Coder-1.5B-Instruct}"
MAXSEQ="${MAXSEQ:-1280}"
TARGET="${TARGET:-240}"
CHUNK="${CHUNK:-30}"
SAVE_EVERY="${SAVE_EVERY:-10}"
COLLECTION="${COLLECTION:-botanical}"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
PY="$ROOT/.venv/bin/python"
DATA="${DATA_DIR:-$HERE/data}"
ADIR="${ADAPTER_DIR:-$HERE/adapters}"

mkdir -p "$ADIR"
done=0
attempt=0

echo "==> preparing data ($COLLECTION)"
COLLECTION="$COLLECTION" node "$ROOT/training/prepare_data.mjs"

while [ "$done" -lt "$TARGET" ]; do
  resume=""
  [ -f "$ADIR/adapters.safetensors" ] && resume="--resume-adapter-file=$ADIR/adapters.safetensors"
  echo "=== chunk: done=$done/$TARGET resume=${resume:-none} ==="
  if "$PY" -m mlx_lm.lora \
      --model "$MODEL" \
      --train \
      --data "$DATA" \
      --fine-tune-type lora \
      --iters "$CHUNK" \
      --batch-size 1 \
      --num-layers 8 \
      --learning-rate 1e-5 \
      --max-seq-length "$MAXSEQ" \
      --steps-per-eval "$CHUNK" \
      --save-every "$SAVE_EVERY" \
      --adapter-path "$ADIR" \
      $resume; then
    done=$((done + CHUNK))
    attempt=0
    echo "=== chunk ok: $done/$TARGET ==="
  else
    attempt=$((attempt + 1))
    echo "!!! chunk crashed (attempt $attempt) — resuming from last save"
    sleep 5
    if [ "$attempt" -ge 8 ]; then
      echo "!!! too many consecutive failures, stopping"
      exit 1
    fi
  fi
done

echo "==> training complete: $done iterations -> $ADIR"
