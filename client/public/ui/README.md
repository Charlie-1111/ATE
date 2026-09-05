# ATE — UI asset pack

Drop the contents of this folder into `client/public/ui/`. Every file is a standalone SVG,
transparent background, no external dependencies.

All lettering is converted to vector outlines (Anton, SIL OFL 1.1), so nothing depends on
Impact or a webfont being installed. Editing a label means editing the path — regenerate or
swap in live text if you need dynamic copy (see "Dynamic labels" below).

## Palette

Same gold/black/red as the brief, plus two working tones so shading stays flat and hard-edged.

| Token | Hex | Use |
|---|---|---|
| `--ate-black` | `#000000` | Outlines, true background |
| `--ate-ink` | `#0B0B0B` | Panel fills, dark button skin |
| `--ate-gold` | `#FFD700` | Primary accent, wins, CTA fill |
| `--ate-gold-deep` | `#B8860B` | Pressed gold, second tone on gold surfaces |
| `--ate-red` | `#C1121F` | Damage, opponent, VS, danger |
| `--ate-red-deep` | `#7A0A12` | Drop shadow behind gold type, coin back |
| `--ate-bone` | `#EDE3CF` | Off-white type on dark, tape, defeat state |
| `--ate-grey` | `#5A5A5A` | Disabled, empty states, dropped-mic grey |

Two additions to the brief, both flat: `--ate-red-deep` (offset shadow under gold type, keeps
the flyer look without glow) and `--ate-bone` (paper-white; pure `#FFF` looked digital next to
gold). Medals use `#C9C9C9` silver and `#A9682C` bronze.

## Files

### Brand
| File | Notes |
|---|---|
| `logo-ate-horizontal.svg` | 560×220. Hero + battle header. Clear space = height of one letter. |
| `logo-ate-square.svg` | 512×512. App icon, share cards, nav mark. |
| `favicon.svg` | 64×64. Simplified — no subtitle, no wear, reads at 16px. |
| `hero-backdrop.svg` | 1600×900, `preserveAspectRatio="slice"`. Safe text zone: x 200–1400, y 180–520 (already darkened in the art). |

### Buttons
| File | Notes |
|---|---|
| `btn-gold.svg` / `btn-gold-pressed.svg` | Primary — Find Match. |
| `btn-dark.svg` / `btn-dark-pressed.svg` | Secondary — Practice, Leaderboard, Characters. |

432×120 with the drop shadow baked in; pressed state drops 8px and loses the shadow. The label
is outlined in the file. For real buttons use the skin as a background and put live text on top:

```css
.ate-btn { background: url("/ui/btn-gold.svg") no-repeat center/100% 100%; }
.ate-btn:active { background-image: url("/ui/btn-gold-pressed.svg"); transform: translateY(4px); }
```
The shipped skins say FIND MATCH — strip that path out for a blank skin (last `<path>` in the file).

### Score marks
`badge-trash.svg` · `badge-weak.svg` · `badge-mid.svg` · `badge-spicy.svg` · `badge-destroyed.svg`
200×200 hex plates, escalating gold. Render at 88–120px in chat, 200px+ on the score reveal.

### Scoreboard
`pip-won-gold.svg` · `pip-won-red.svg` · `pip-empty.svg` — 64×64 diamonds. Gold = you, red = opponent.

### Coin draw
`coin-front.svg` (YOU / gold) · `coin-back.svg` (THEM / deep red) · `coin-ate-stamp.svg` (ATE face).
240×240. For the flip, rotate on Y and swap at 90°; the two faces are the same silhouette.

### Icons
`icon-mic.svg` · `icon-timer-clock.svg` · `icon-timer-flame.svg` — 48×48, thick outlines, readable at 24px.
Swap clock → flame under 10 seconds.

### Battle room
| File | Notes |
|---|---|
| `vs.svg` | 260×260, tilted −8°. Sits between the two fighter cards. |
| `turn-banner-you.svg` / `turn-banner-opponent.svg` | 720×120 strips. |
| `bubble-frame-you.svg` / `bubble-frame-them.svg` | 480×200, `preserveAspectRatio="none"` — stretches as a border-image or background. Tail bottom-left (you) / bottom-right (them). |
| `tape-strip.svg` | 160×48 sticker tape for bubble corners. |
| `stamp-timeout.svg` / `stamp-blocked.svg` | 640×260 rubber stamps, ~92% opacity, drop over the board. |
| `banner-victory.svg` / `banner-defeat.svg` | 800×320 end screens (crown + YOU ATE / L + dropped mic + GOT COOKED). |
| `motif-grill-chain.svg` | 120×620. The one brand motif — replaces GoldTeeth, DiamondBracelet and ChainVertical. Run it down a panel edge or mirror it on both sides; don't scatter it. |

### Characters / shop / leaderboard
| File | Notes |
|---|---|
| `overlay-locked.svg` | 360×480 card overlay, padlock + plaque. Plaque reads WIN 3 MORE — replace with live text if the count varies. |
| `tag-premium.svg` | 220×96 crown + BUY. Corner tag for Vanta & Solara. |
| `stamp-equipped.svg` | 140×140 corner check. |
| `medal-1.svg` / `medal-2.svg` / `medal-3.svg` | 160×200 ranks. |
| `empty-no-battles.svg` | 300×240 with copy "MIC STILL COLD". |

### Atmosphere
| File | Notes |
|---|---|
| `texture-noise.svg` | 200×200 tile. `background-image` + `background-repeat`, keep opacity ≤ 0.35. |
| `texture-scratched-metal.svg` | 400×400 tile for panels. |
| `corner-flourish.svg` | 96×96, rotate 90/180/270 for four corners. |
| `panel-frame-9slice.svg` | 400×300, use with `border-image: url(...) 60 fill stretch`. |
| `fx-hit-1..4.svg` | 200×200, four frames — play at ~60ms each on a landed roast. |
| `wash-spotlight.svg` · `wash-smoke.svg` | Low-opacity overlays (0.15–0.3), `mix-blend-mode: screen` optional. |

## Dynamic labels

Where copy changes at runtime (locked plaque, button labels, score numbers), overlay HTML text
instead of editing paths. Load Anton to match the outlines:

```
npm i @fontsource/anton
import "@fontsource/anton";
font-family: "Anton", Impact, "Arial Black", sans-serif;
```

## Not included, on purpose

Modular avatar parts (eyes / hair / mouths) — superseded by the GLBs in
`client/public/characters/`. Nothing here assumes those SVGs still exist.
