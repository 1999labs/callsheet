#!/usr/bin/env python3
"""Tiny OpenAI-compatible server for the fine-tuned painter.

Unlike `mlx_lm.server`, this always applies the LoRA adapter and the chat
template, so the painter talks to it with CALLSHEET_BACKEND=openai.

  .venv/bin/python training/serve.py --port 8080
"""
import argparse
import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import mlx.core as mx
from mlx_lm import generate, load
from mlx_lm.sample_utils import make_sampler

LOCK = threading.Lock()
SERVE_MODEL = None


class Handler(BaseHTTPRequestHandler):
    def _json(self, obj, code=200):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.rstrip("/").endswith("/models"):
            self._json({"object": "list", "data": [{"id": "callsheet", "object": "model"}]})
        else:
            self._json({"status": "ok", "model": SERVE_MODEL["id"]})

    def do_POST(self):
        if not self.path.rstrip("/").endswith("/chat/completions"):
            self._json({"error": "not found"}, 404)
            return
        try:
            n = int(self.headers.get("content-length", 0))
            req = json.loads(self.rfile.read(n) or b"{}")
            model = SERVE_MODEL["model"]
            tok = SERVE_MODEL["tok"]
            messages = req.get("messages", [])
            prompt = tok.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )
            max_tokens = int(req.get("max_tokens") or 1200)
            temp = float(req.get("temperature") or 0.8)
            seed = req.get("seed")
            with LOCK:
                if seed is not None:
                    mx.random.seed(int(seed))
                sampler = make_sampler(temp=temp)
                out = generate(
                    model,
                    tok,
                    prompt=prompt,
                    max_tokens=max_tokens,
                    sampler=sampler,
                    verbose=False,
                )
            self._json(
                {
                    "id": "chatcmpl-local",
                    "object": "chat.completion",
                    "model": "callsheet",
                    "choices": [
                        {
                            "index": 0,
                            "message": {"role": "assistant", "content": out},
                            "finish_reason": "stop",
                        }
                    ],
                    "usage": {"completion_tokens": len(tok.encode(out))},
                }
            )
        except Exception as e:  # noqa: BLE001
            self._json({"error": str(e)}, 500)

    def log_message(self, *a):
        pass


def main():
    global SERVE_MODEL
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="Qwen/Qwen2.5-Coder-1.5B-Instruct")
    ap.add_argument("--adapter-path", default="training/adapters")
    ap.add_argument("--port", type=int, default=8080)
    args = ap.parse_args()

    print(f"loading {args.model} + {args.adapter_path or '(no adapter)'} ...", flush=True)
    model, tok = load(args.model, adapter_path=args.adapter_path or None)
    SERVE_MODEL = {"model": model, "tok": tok, "id": args.model}
    print(f"serving on http://127.0.0.1:{args.port}/v1", flush=True)
    HTTPServer(("127.0.0.1", args.port), Handler).serve_forever()


if __name__ == "__main__":
    main()
