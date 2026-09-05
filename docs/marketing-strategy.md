# ATE Marketing Strategy — Get People Playing

## Positioning

**ATE** is a real-time 1v1 roast battle arena: drop bars under a 20s clock, get scored live, climb the leaderboard, unlock characters.

One-liner: *“Text-based roast battles. Real opponents. Instant score.”*

Differentiators vs chat games / AI wrappers:
- Synchronous PvP (Find Match), not turn-based DMs
- Practice vs AI for zero-friction first session
- Visible marks + feedback labels (SPICY / MID / WACK) — shareable moments
- Character vanity (progress unlocks + premium)

## Beachhead audiences (first 90 days)

1. **Short-form creators** who already post roasts, “rate my roast,” or battle-rap skits (TikTok / Reels / Shorts).
2. **Discord / Reddit roast communities** (r/roastme adjacent, gaming + meme servers).
3. **Campus / friend-group challenges** — “ATE my roommate” as a social ritual.
4. **Streamer side content** — 10-minute “caller vs chat champ” segments.

Ignore broad “everyone who likes games” until matchmaking fill rate and clip share rate are healthy.

## Growth loop

```
Clip / challenge post
    → Land on home (arena + music)
    → Practice vs AI (first roast in <60s)
    → Find Match (real opponent)
    → Win → leaderboard + character unlock
    → Share score / character → new clip
```

Optimize for: **time-to-first-roast** and **% of Practice players who tap Find Match within 24h**.

## This week — start getting people playing (do these first)

1. **Ship a 15s clip today:** home arena + BGM → Practice → type a roast → score stamp. Post to TikTok/Reels/Shorts with link in bio.
2. **Pin Practice, not Find Match:** cold traffic should hit AI practice so the first roast is instant; CTA to Find Match after one win/loss.
3. **Run a 1-hour “ATE hour”:** Discord/IG story — two people queue freestyle Bo3 at the same time; host spectates and clips the best bars.
4. **Daily topic prompt:** post one roast topic each morning; ask followers to reply with their bar, then show the in-game score.
5. **Roommate / campus challenge:** “ATE my friend” — first 20 pairs that finish a real match get a shoutout + free premium char code when Stripe is live.

Full playbook: see launch week table and metrics below.

| Day | Action |
|-----|--------|
| −3 | Seed 5–10 creator accounts with early access + premium chars; brief: “film 15s of countdown + roast + score stamp” |
| 0 | Soft launch post: trailer (home arena BGM under VO) + link |
| 1–2 | Daily “Topic of the Day” prompt; pin Practice link |
| 3 | Host a 1-hour Discord find-match hour (pair strangers live) |
| 4–5 | User clip montage (#ATEbattle); spotlight leaderboard #1–3 |
| 6–7 | Referral push: “ATE my friend” — both unlock a cosmetic flair when both finish one PvP |

Content formats that convert:
- Side-by-side: typed roast → score badge smash cut
- Fail compilations (TIMEOUT / WACK) — comedy beats virality
- Character unlock flex (“3 wins unlock Street”)

## Channels & tactics

- **Organic short video:** 3 posts/week minimum from brand; UGC reposts daily.
- **Discord:** one server with Looking-for-Match voice + ranked roles mirrored from leaderboard.
- **Reddit:** value-first — post funny battle logs, not bare links; follow sub rules.
- **Campus ambassadors:** free premium char for organizers of 8-person bracket nights.
- **Paid (optional, small):** $50–150 tests on TikTok Spark Ads to top-performing organic roast clips; kill losers in 48h.

## Product hooks for growth (already or near-ready)

- Home arena art + BGM → brand recall before first click
- Practice vs AI → no waiting for a human
- Find Match → core social proof when filled
- Leaderboard → status; characters → collection vanity
- Auth + Stripe premium → monetize whales without gating play

## Ops note: Supabase / storage

ATE persists ranks via **Postgres** (`DATABASE_URL` / Supabase DB). There is **no** Supabase object Storage dependency — character GLBs ship with the client. Free-tier DB disk is enough for `profiles` + `match_results` at early scale. When deploying production: set `DATABASE_URL`, run Knex migrations (`002_leaderboard_profiles`), and confirm `GET /api/leaderboard` returns `source: "db"`. Locally without `.env`, leaderboard uses in-memory storage (fine for demos; resets on restart).

## Metrics that matter

| Metric | Target (first 30 days) |
|--------|-------------------------|
| Time to first roast | < 60s median |
| Practice → Find Match (D1) | ≥ 25% |
| PvP match success (2 in queue, same mode/format) | ≥ 95% within 10s |
| D1 / D7 return | ≥ 30% / ≥ 10% |
| Share rate (clip or link after battle) | ≥ 8% of completers |
| Paid conversion (premium char) | Track; no hard gate |

## Budget-light vs paid

**$0–200 / month:** organic clips, Discord events, campus brackets, creator barter (chars for posts).

**$200–1k:** Spark/Boost on 2–3 winning creatives; one micro-influencer (10–50k) battle night.

Do not spend on brand awareness until PvP queue fill is reliable in your peak hour.

## Messaging bank

- “Drop a roast. 20 seconds. No mercy.”
- “Practice on AI. Prove it on a real opponent.”
- “Your bars. Their tears. The leaderboard remembers.”
- “ATE — real-time 1v1 roast battles.”
