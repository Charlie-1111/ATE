# Export LoRA → GGUF for Ollama

After `train_qlora.py` finishes (`outputs/roast-judge-lora/`):

## Option A — Unsloth save

```python
from unsloth import FastLanguageModel
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="outputs/roast-judge-lora",
    max_seq_length=512,
    load_in_4bit=True,
)
model.save_pretrained_gguf("outputs/roast-judge-gguf", tokenizer, quantization_method="q4_k_m")
```

Point the `Modelfile` `FROM` line at the resulting `.gguf`, or:

```bash
ollama create roast-judge -f Modelfile
```

## Option B — merge + llama.cpp

1. Merge LoRA into base weights with PEFT.
2. Convert with `llama.cpp` `convert_hf_to_gguf.py`.
3. Quantize (`q4_k_m` recommended for local judge latency).

Place the GGUF next to this folder or update `Modelfile`:

```
FROM ./outputs/roast-judge-gguf/unsloth.Q4_K_M.gguf
```

Until a custom GGUF exists, the ATE server falls back to the Llama 3.2 referee mapped to absolute marks.
