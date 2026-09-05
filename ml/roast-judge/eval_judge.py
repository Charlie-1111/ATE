#!/usr/bin/env python3
"""Run val roasts against an Ollama judge; print score histogram + MAE vs labels."""

from __future__ import annotations

import argparse
import json
import re
import statistics
from collections import Counter
from pathlib import Path

try:
  import requests
except ImportError:
  raise SystemExit("pip install requests") from None

ROOT = Path(__file__).resolve().parent
SCORE_RE = re.compile(r"SCORE:\s*(-?\d+(?:\.\d+)?)", re.I)


def load_val(path: Path) -> list[dict]:
  rows = []
  with path.open() as f:
    for line in f:
      line = line.strip()
      if line:
        rows.append(json.loads(line))
  return rows


def ask(host: str, model: str, roast: str) -> float | None:
  prompt = f'Score this roast:\n"{roast}"\n\nReply with SCORE: N'
  r = requests.post(
    f"{host.rstrip('/')}/api/chat",
    json={
      "model": model,
      "stream": False,
      "messages": [{"role": "user", "content": prompt}],
      "options": {"temperature": 0.2, "num_predict": 32},
    },
    timeout=120,
  )
  r.raise_for_status()
  text = r.json().get("message", {}).get("content", "")
  m = SCORE_RE.search(text or "")
  if not m:
    return None
  return max(0.0, min(10.0, float(m.group(1))))


def main() -> None:
  p = argparse.ArgumentParser()
  p.add_argument("--model", default="roast-judge")
  p.add_argument("--host", default="http://localhost:11434")
  p.add_argument("--val", type=Path, default=ROOT / "val_roasts.jsonl")
  args = p.parse_args()

  rows = load_val(args.val)
  preds, golds, misses = [], [], 0
  for row in rows:
    pred = ask(args.host, args.model, row["roast"])
    gold = float(row["score"])
    if pred is None:
      misses += 1
      print(f"MISS  gold={gold}  {row['roast'][:60]}")
      continue
    preds.append(pred)
    golds.append(gold)
    print(f"pred={pred:4.1f}  gold={gold:4.1f}  {row['roast'][:70]}")

  if not preds:
    raise SystemExit("No successful scores")

  buckets = Counter(int(round(x)) for x in preds)
  mae = statistics.mean(abs(a - b) for a, b in zip(preds, golds))
  print("\nHistogram (rounded pred):", dict(sorted(buckets.items())))
  print(f"MAE vs labels: {mae:.3f}  parsed={len(preds)}/{len(rows)}  misses={misses}")


if __name__ == "__main__":
  main()
