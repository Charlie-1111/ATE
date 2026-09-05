# Free hosting (no credit card)

Cloud hosts that still offer **always-on Node without a card** are rare in 2026.

| Option | Card? | Notes |
|--------|-------|--------|
| **Cloudflare tunnel** (`npm run share`) | No | Works now. Mac must stay on. |
| **Waifly** free Node | No | Always-on, 300 MB RAM — best free cloud pick |
| **Bonto** | No | Free monthly hours; apps sleep |
| Hugging Face Docker Spaces | **Yes (PRO)** | Only Static Spaces free — can't run our Socket server |
| Fly / Render | **Yes** | Blocked without billing |

---

## A. Share link right now (0 signup)

```bash
cd /Users/charlie/Desktop/ATE
npm run share
```

Copy the `https://….trycloudflare.com` URL from the terminal.

---

## B. Waifly (free always-on — recommended)

1. Sign up: https://dash.waifly.com (no card).
2. **Servers → Create** → egg **NodeJS** → free plan → FR1 or FR2.
3. On your Mac, build a slim upload bundle:

```bash
cd /Users/charlie/Desktop/ATE
npm run build
node scripts/pack-waifly.mjs
# creates dist-waifly/ — upload THAT folder's contents
```

4. In Waifly file manager: upload everything inside `dist-waifly/` to the server root (not nested in an extra folder).
5. **Startup** command: `node index.js`  
   Bind to the panel’s `PORT` / `SERVER_PORT` env (our app already uses `process.env.PORT`).
6. Start the server → open the allocated hostname/IP:port (or attach a free subdomain if offered).

Limits: ~300 MB RAM. Do **not** run `npm run build` on Waifly — only upload the prebuilt bundle.

---

## C. Bonto (free hours)

1. https://bonto.dev → **Start Building Free**
2. Import / paste the project or connect GitHub
3. Live URL like `yourapp.bonto.run`

Good for demos; free tier uses monthly runtime hours.

---

## Hugging Face update

As of now, **Docker / Gradio Spaces require Hugging Face PRO** on free accounts. Only **Static** Spaces stay free — not enough for ATE’s realtime server. Skip HF for this app unless you pay PRO.
