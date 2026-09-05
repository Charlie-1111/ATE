# Deploy ATE to Hugging Face Spaces (free, no credit card)

## One-time setup

1. Open https://huggingface.co/join and create a free account (email or GitHub).
2. Open https://huggingface.co/new-space
3. Fill in:
   - **Space name:** `ATE` (or `ate-roast-battle`)
   - **License:** MIT (or any)
   - **Select the Space SDK:** **Docker**
   - **Space hardware:** CPU basic (free)
   - **Visibility:** Public
4. Click **Create Space**.

## Push this repo into the Space

In Terminal (replace `YOUR_HF_USERNAME`):

```bash
cd /Users/charlie/Desktop/ATE

# Log in once (opens browser / asks for token)
# Create a token at https://huggingface.co/settings/tokens  (write access)

git remote remove hf 2>/dev/null
git remote add hf https://huggingface.co/spaces/YOUR_HF_USERNAME/ATE

git push hf master:main
```

If Git asks for a password, paste your **HF access token** (not your account password).

## After the build

- Space URL: `https://huggingface.co/spaces/YOUR_HF_USERNAME/ATE`
- Direct app (when ready): `https://YOUR_HF_USERNAME-ATE.hf.space`

First build can take 5–10 minutes. If it fails, open the **Logs** tab on the Space page and share the error.

## Notes

- Free CPU Spaces can sleep when idle; first visit may be slow to wake.
- Scoring runs without Ollama on HF (heuristic / fallbacks) — fine for demos.
- No credit card required for free CPU hardware.
