#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
echo "Creating Ollama model roast-judge from Modelfile..."
ollama create roast-judge -f Modelfile
echo "Done. Test: ollama run roast-judge 'Score this roast: \"your WiFi personality drops packets\"'"
