# Public listing polish

## Live URL

**Current:** https://learners-visiting-regardless-roulette.trycloudflare.com  
*(Tunnel — ephemeral. Prefer Waifly always-on from `docs/deploy-free.md`.)*

## Fly

- App name in `fly.toml`: `ate-roast-battle`
- Not on this machine’s Fly account yet — create with `fly apps create` + `fly deploy` when billing is ready.

## Waifly / itch

1. `npm run build && node scripts/pack-waifly.mjs`
2. Upload `dist-waifly/` contents
3. Startup: `node index.js`
4. Set listing title/tagline from `docs/marketing-post-pack.md`
5. Screenshot checklist: Home, Practice countdown, Score FIRE stamp, BattleResult

## Hugging Face

Docker Spaces need PRO for this realtime app — skip unless paid. Static Space cannot run Socket.io.
