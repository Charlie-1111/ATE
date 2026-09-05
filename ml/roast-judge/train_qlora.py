#!/usr/bin/env python3
"""QLoRA fine-tune Llama 3.2 3B Instruct as a Gen Z roast judge (SCORE: 0-10)."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "roast_dataset.jsonl"
OUT = ROOT / "outputs" / "roast-judge-lora"

SYSTEM = (
  "You are a Gen Z roast-battle judge. Score each roast from 0 to 10. "
  "Reward originality, impact, craft, and cultural fluency. "
  "Output exactly: SCORE: N"
)


def load_jsonl(path: Path) -> list[dict]:
  rows = []
  with path.open() as f:
    for line in f:
      line = line.strip()
      if line:
        rows.append(json.loads(line))
  return rows


def format_example(roast: str, score: int) -> dict:
  user = f'Score this roast:\n"{roast}"'
  assistant = f"SCORE: {int(score)}"
  text = (
    f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{SYSTEM}"
    f"<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{user}"
    f"<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n{assistant}<|eot_id|>"
  )
  return {"text": text}


def main() -> None:
  try:
    from unsloth import FastLanguageModel
  except ImportError as e:
    raise SystemExit(
      "Unsloth is required for this script. Install on a CUDA GPU machine:\n"
      "  pip install -r requirements.txt\n"
      f"Original error: {e}"
    ) from e

  from trl import SFTTrainer
  from transformers import TrainingArguments
  from datasets import Dataset

  rows = load_jsonl(DATA)
  ds = Dataset.from_list([format_example(r["roast"], r["score"]) for r in rows])

  model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Llama-3.2-3B-Instruct",
    max_seq_length=512,
    dtype=None,
    load_in_4bit=True,
  )
  model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",
  )

  args = TrainingArguments(
    output_dir=str(OUT),
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    warmup_steps=20,
    num_train_epochs=3,
    learning_rate=2e-4,
    fp16=True,
    logging_steps=10,
    save_strategy="epoch",
    report_to="none",
  )

  trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=ds,
    dataset_text_field="text",
    max_seq_length=512,
    args=args,
  )
  trainer.train()
  model.save_pretrained(str(OUT))
  tokenizer.save_pretrained(str(OUT))
  print(f"Saved LoRA to {OUT}")
  print("Next: see export_gguf.md then ./build.sh")


if __name__ == "__main__":
  main()
