# Roast judge (Gen Z) — fine-tune + Ollama

Absolute **0–10 marks** per roast for ATE. The game **sums** marks across messages (3 roasts → max 30).

## Files

| File | Purpose |
| ---- | ------- |
| `RUBRIC.md` | Scoring dimensions + labels |
| `roast_dataset.jsonl` | 150 training examples `{"roast","score"}` |
| `val_roasts.jsonl` | 20 held-out examples |
| `train_qlora.py` | Unsloth QLoRA on Llama 3.2 3B Instruct |
| `requirements.txt` | Python deps for training/eval |
| `Modelfile` | Ollama model definition |
| `build.sh` | `ollama create roast-judge` |
| `export_gguf.md` | LoRA → GGUF notes |
| `eval_judge.py` | Score histogram on val set |

## Train (GPU machine)

```bash
cd ml/roast-judge
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python train_qlora.py
# follow export_gguf.md, then:
./build.sh
```

## Eval

```bash
python eval_judge.py --model roast-judge
```

## Game integration

Set `ROAST_JUDGE_MODEL=roast-judge` (default). Server prefers that Ollama model; falls back to Llama 3.2 referee mapped to absolute marks.

Each roast awards **0–10 marks**; battle totals **sum** marks (no /10 ceiling). Timeout/blocked → 0.

## Characters

GLBs live in `client/public/characters/`. Starter **Echo** is free; progress unlocks by ranked wins; **Vanta** / **Solara** are mock-paid in the Characters shop (`/shop`).
