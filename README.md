# ATE — Real-time 1v1 roast battles

**Play now:** https://learners-visiting-regardless-roulette.trycloudflare.com  
*(Cloudflare quick tunnel — host Mac must stay online. For always-on, deploy via Waifly / Fly — see `docs/deploy-free.md`.)*

Text-based roast battles. Practice vs AI or Find Match. 20-second turns, live LLM scores, character unlocks.

**One-liner:** *Text-based roast battles. Real opponents. Instant score.*

Repo: https://github.com/Charlie-1111/ATE

## Quick start (local)

```bash
npm install
npm run dev
```

Client: http://localhost:5173 · Server: http://localhost:3001

## Free public link

```bash
npm run build
npm run share   # requires cloudflared
```

## What’s new (v0.3)

- Smoother 3D (GLB cache, pause offscreen, mobile DPR)
- Judging UI, typing indicators, round transitions, rematch
- 20s disconnect grace + battle reconnect
- Practice-first home funnel + marketing OG tags
