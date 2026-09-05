# ATE Roast Battle — Performance Audit

**Auditor:** TechnicalArtist  
**Date:** 2026-09-04  
**Target:** 60fps, <16ms frame time  
**Scope:** Client-side rendering, animations, SVG avatars, Socket.io, timers

---

## Executive Summary

The prototype has **several critical performance issues** that will prevent consistent 60fps on mid-range hardware, and one **architectural bug** (duplicate SVG filter IDs) that will cause visual corruption. The codebase is small and well-structured, which makes fixes straightforward.

**Overall Risk:** Medium-High  
**Estimated frame budget utilization:** 60–80% on desktop, 100%+ on mobile during avatar rendering.

---

## 1. Frame Time Budget Breakdown (16.67ms @ 60fps)

| Phase | Budget | Current Est. | Status |
|---|---|---|---|
| React render + reconciliation | 4ms | ~2-3ms | ✅ OK |
| SVG avatar paint (2 players) | 3ms | ~6-8ms | 🔴 OVER |
| Framer Motion compositing | 2ms | ~1-2ms | ✅ OK |
| CSS animation repaints | 1ms | ~3-4ms | 🟡 RISK |
| Socket.io event processing | 0.5ms | <0.5ms | ✅ OK |
| Timer state updates | 0.5ms | ~0.3ms | ✅ OK |
| Layout/paint | 2ms | ~1-2ms | ✅ OK |
| Idle/buffer | 3.67ms | — | — |
| **Total** | **16.67ms** | **~14-20ms** | **🟡 TIGHT** |

---

## 2. Critical Findings

### 2.1 🔴 CRITICAL: Duplicate SVG Filter/Gradient IDs

**File:** `client/src/components/avatar/AvatarRenderer.jsx:15-19`  
**Severity:** Bug — causes visual corruption

Each SVG layer (skin, hair, eyes, mouth, accessories) contains `<defs>` with identical IDs:
- `id="skinGrad"` (linearGradient)
- `id="depth"` (filter)

When nested inside a parent `<svg>`, browsers resolve IDs by document scope, not SVG scope. **Layer 2+ will reference Layer 1's filter**, causing:
- All layers sharing one shadow direction/blur
- Gradient inheritance breaking across layers
- Potential silent render failures

**Fix:** Each layer's `<defs>` must use unique IDs, or switch to inline styles for the shadow.

```jsx
// Option A: ID-suffixed defs in each layer component
<defs>
  <filter id={`depth-${layerId}`} ...>...</filter>
</defs>
<g filter={`url(#depth-${layerId})`}>...</g>

// Option B: Replace filter with CSS drop-shadow (recommended)
// On the parent <svg> or each <g>:
<g style={{ filter: 'drop-shadow(2px 4px 3px rgba(8,8,23,0.46))' }}>
```

Option B eliminates both the ID collision and the expensive SVG filter entirely.

---

### 2.2 🔴 CRITICAL: SVG Filter Complexity × Layer Count

**Files:** All 59 SVGs in `../Downloads/avatar_parts/`

Every SVG layer applies:
```xml
<filter id="depth">
  <feGaussianBlur stdDeviation="2.2" />   <!-- GPU-heavy -->
  <feOffset dx="2" dy="4" />
  <feFlood flood-opacity=".46" />
  <feComposite />
  <feMerge>×2</feMerge>
</filter>
```

A full avatar = 4–7 layers × 1 Gaussian blur each = **4–7 concurrent blur operations**.

Gaussian blur with `stdDeviation=2.2` on a 200×200 viewBox is expensive. At 96px render size, the browser rasterizes the 200×200 source, blurs it, composites it — **per layer**.

**Estimated cost per avatar:** 3–4ms paint time (desktop), 6–10ms (mobile).

**With 2 avatars on screen:** 6–8ms (desktop), 12–20ms (mobile). **Mobile will drop frames.**

**Fix:** Replace SVG `<filter>` with a single CSS `drop-shadow` on the parent `<svg>`:

```jsx
// AvatarRenderer.jsx
<svg
  viewBox="0 0 200 200"
  width={size}
  height={size}
  style={{ filter: 'drop-shadow(1px 2px 2px rgba(8,8,23,0.45))' }}
>
```

This computes one shadow for the entire composed avatar — **7x fewer blur operations**.

---

### 2.3 🟡 HIGH: Tailwind Animations Triggering Layout/Paint

**File:** `tailwind.config.js:37-68`

| Animation | Property | Composite? | Cost |
|---|---|---|---|
| `pulse-glow` | `boxShadow` | ❌ Paint | 🟡 HIGH |
| `fire-flicker` | `filter: brightness()` | ❌ Paint | 🟡 HIGH |
| `timer-urgent` | `color` + `transform` | Partial | 🟡 MEDIUM |
| `score-pop` | `transform` + `opacity` | ✅ GPU | ✅ LOW |
| `slide-up` | `transform` + `opacity` | ✅ GPU | ✅ LOW |
| `typing-dot` | `transform` | ✅ GPU | ✅ LOW |

**`pulse-glow`** (used on active player avatar) repaints `boxShadow` every frame for 2s cycles. This forces the browser to repaint the entire avatar region each frame.

**`fire-flicker`** uses `filter: brightness()` which is a full-raster effect — not GPU-composited.

**`timer-urgent`** changes `color` (cheap) but also `transform: scale()` — this is fine alone, but combined with color change it triggers a text layout recalc.

**Fixes:**

```js
// Replace pulse-glow with transform-only animation
'pulse-glow': {
  '0%, 100%': { transform: 'scale(1)', opacity: '1' },
  '50%': { transform: 'scale(1.03)', opacity: '0.92' },
},

// Replace fire-flicker with opacity-based shimmer
'fire-flicker': {
  '0%': { opacity: '1' },
  '100%': { opacity: '0.85' },
},

// timer-urgent: remove transform, keep color only (color is cheap)
'timer-urgent': {
  '0%, 100%': { color: '#ef4444' },
  '50%': { color: '#dc2626' },
},
```

---

### 2.4 🟡 HIGH: Unnecessary Re-renders from Store Spreading

**File:** `client/src/hooks/useBattle.js:7`

```js
const store = useBattleStore()
```

This subscribes to **every** field in the Zustand store. Any state change (opponentTyping, myScore, isMyTurn, etc.) triggers a re-render of the entire `useBattle` hook consumer — which is `BattlePage` → `BattleRoom` → all children.

**Impact:** On each keystroke from the opponent, `opponentTyping` toggles → `BattlePage` re-renders → `BattleRoom` re-renders → both `PlayerPanel`s, `ScoreBoard`, `TypingIndicator` all re-render.

**Fix:** Use Zustand selectors:

```js
// useBattle.js — select only what you need
const battleId = useBattleStore(s => s.battleId)
const isMyTurn = useBattleStore(s => s.isMyTurn)
const opponentTyping = useBattleStore(s => s.opponentTyping)
// ...etc, per consumer

// BattlePage.jsx — only re-render when status changes
const status = useBattleStore(s => s.status)
const battle = useBattle(user.id) // hook still spreads, but BattleRoom gets granular props
```

Alternatively, split the store into `battleState` and `battleActions` to prevent action references from causing re-renders.

---

### 2.5 🟡 MEDIUM: PlayerPanel Prop Object Recreation

**File:** `client/src/components/battle/BattleRoom.jsx:62-65, 96-100`

```jsx
<PlayerPanel
  player={{ name: myName, avatarConfig: null }}  // new object every render
  isActive={isMyTurn}
/>
```

Creates a new `player` object on every render of `BattleRoom`, defeating any `React.memo` on `PlayerPanel`. Since `PlayerPanel` isn't memoized, this is currently just wasteful — but it will become a problem when avatar rendering gets heavier.

**Fix:** Extract to `useMemo` or define outside render:

```jsx
const myPlayer = useMemo(() => ({ name: myName, avatarConfig: null }), [myName])
const opponentPlayer = useMemo(
  () => ({ name: opponent?.name || 'Opponent', avatarConfig: opponent?.avatarConfig }),
  [opponent]
)
```

---

### 2.6 🟡 MEDIUM: Socket Typing Events Lack Throttling

**File:** `client/src/hooks/useBattle.js:87-93`

```js
const startTyping = useCallback(() => {
  socket.emit('roast_typing', { battleId: store.battleId })
}, [socket, store.battleId])
```

**File:** `client/src/components/battle/RoastInput.jsx:96`

```jsx
onChange={(e) => setText(e.target.value)}
```

The textarea `onChange` fires on every keystroke. If `startTyping` is called from this handler (currently it isn't wired, but the API exists), it would emit a socket event per keystroke — **~60 events/second** for fast typers.

**Fix (when wiring up):** Throttle typing events:

```js
const startTyping = useMemo(
  () => throttle(() => {
    socket.emit('roast_typing', { battleId: store.battleId })
  }, 500),
  [socket, store.battleId]
)
```

---

### 2.7 🟢 LOW: Dynamic require() in Vite

**File:** `client/src/components/avatar/AvatarRenderer.jsx:35-71`

```js
const mod = require(`../assets/avatars/skin/${config.skin}.jsx`)
```

Webpack-style `require()` with dynamic expressions won't work with Vite's ESM-based bundler. The `assets/avatars/` directory is also **empty** — no avatar JSX components exist.

**This means avatar rendering is currently broken.** When fixed, dynamic imports should use `import()` for code-splitting:

```js
const mod = await import(`../assets/avatars/skin/${config.skin}.jsx`)
```

Or better, use a lookup map to avoid dynamic import strings (which can't be statically analyzed):

```js
const SKIN_LAYERS = {
  light: lazy(() => import('../assets/avatars/skin/light.jsx')),
  tan: lazy(() => import('../assets/avatars/skin/tan.jsx')),
  // ...
}
```

---

### 2.8 🟢 LOW: Timer Cleanup Is Correct

**File:** `client/src/components/battle/RoastInput.jsx:14-36`

The `setInterval` timer is properly cleaned up via `clearInterval(timerRef.current)` in both the `useEffect` return and before manual submit. **No memory leak.** However, `handleSubmit` is called inside `setInterval` callback, which means it runs in a stale closure if `text` changes between interval ticks.

**Minor fix:** Use a ref for the latest text:

```js
const textRef = useRef(text)
textRef.current = text

// In interval:
if (prev <= 1) {
  clearInterval(timerRef.current)
  handleSubmitRef.current() // uses ref, not closure
  return 0
}
```

---

### 2.9 🟢 LOW: Socket Context Re-renders All Children

**File:** `client/src/context/SocketContext.jsx:7-37`

`connected` state change triggers re-render of every `useSocket()` consumer. Currently only `useBattle` uses it, so impact is minimal. But as the app grows, this will cascade.

**Fix:** Split into separate contexts or use a ref for `connected`:

```jsx
const SocketContext = createContext(null)
const ConnectedContext = createContext(false)
```

---

## 3. SVG Rendering Budget

| Metric | Value |
|---|---|
| Total SVG assets | 59 (10 eyes, 8 mouths, 14 hairstyles, 5 skin tones, 22 accessories) |
| Max layers per avatar | 7 (skin + hair + eyes + mouth + 4 accessories) |
| SVG viewBox | 200×200 (all assets) |
| Render size | 96px (PlayerPanel) |
| Filter per layer | 1× feGaussianBlur (stdDev 2.2) + 4 ops |
| **Total filter ops per avatar** | **7 blurs + 28 composites** |
| **Estimated paint per avatar** | **3-4ms desktop / 6-10ms mobile** |
| **Budget for 2 avatars** | **3ms (target) → currently 6-8ms desktop** |
| Recommended: CSS drop-shadow | **1 blur total, ~0.5ms** |

**Recommendation:** Ship pre-rasterized PNGs at common sizes (96px, 128px, 192px) with `srcset` for the final composed avatar. Regenerate on cosmetics change. This eliminates SVG filter cost entirely in the hot path.

---

## 4. Socket.io Bandwidth Estimates

### Events Per Battle Session

| Event | Direction | Frequency | Payload Size | Per-Match Total |
|---|---|---|---|---|
| `join_queue` | → server | 1 | ~100B | 100B |
| `match_found` | ← server | 1 | ~500B | 500B |
| `opponent_typing` | ← server | ~30-60/match | ~60B | ~3.6KB |
| `opponent_stopped_typing` | ← server | ~15-30/match | ~40B | ~1.2KB |
| `roast_sent` | → server | 3-5 | ~600B | ~3KB |
| `roast_scored` | ← server | 3-5 | ~400B | ~2KB |
| `round_result` | ← server | 3-5 | ~300B | ~1.5KB |
| `battle_ended` | ← server | 1 | ~200B | 200B |
| `heartbeat` (engine.io) | ↔ | ~15/match | ~50B | ~1.5KB |
| **Total per match** | | | | **~14KB** |

### Bandwidth Assessment

- **Per match:** ~14KB — negligible
- **Peak rate (typing events):** ~60B × 2/s = 120B/s — negligible
- **WebSocket overhead:** ~2-4KB/s during active typing, <1KB/s idle
- **Verdict:** ✅ Socket.io is not a performance concern

**Note:** If adding spectator mode with N viewers, typing events scale linearly: N × 120B/s outbound from server. At 100 spectators = 12KB/s — still fine.

---

## 5. Animation Performance Checklist

| Check | Status | Notes |
|---|---|---|
| All animations use `transform` only | ❌ | `pulse-glow` uses `boxShadow`, `fire-flicker` uses `filter` |
| No `width`/`height`/`top`/`left` animations | ✅ | — |
| `will-change` applied to animated elements | ❌ | Missing on Framer Motion containers |
| No `layout` prop used unnecessarily | ✅ | — |
| AnimatePresence `mode="wait"` used correctly | ✅ | — |
| Spring physics don't stall (low stiffness) | ✅ | stiffness 300-500 is fine |
| Infinite animations use GPU-composited props | ⚠️ | `typing-dot` ✅, `pulse-glow` ❌ |
| No animations on elements with `overflow: hidden` | ✅ | — |
| Timer CSS transitions on `width` | ⚠️ | `transition-all` on timer bar — should be `transition-[width]` |
| Tailwind `transition-all` usage | ⚠️ | Used in RoastInput; should narrow to specific properties |

---

## 6. Optimization Priority Matrix

| Priority | Issue | Impact | Effort |
|---|---|---|---|
| **P0** | Duplicate SVG filter IDs | Visual bug | Low |
| **P0** | Empty `assets/avatars/` directory | Feature broken | Medium |
| **P1** | SVG filter perf → CSS drop-shadow | -70% avatar paint time | Low |
| **P1** | Zustand selector splitting | -50% unnecessary re-renders | Low |
| **P2** | Tailwind `pulse-glow` → transform-only | -2ms per frame when active | Low |
| **P2** | `fire-flicker` → opacity | -1ms per frame | Low |
| **P2** | `transition-all` → `transition-[width]` | Minor | Low |
| **P3** | PlayerPanel memo + useMemo props | Preventive | Low |
| **P3** | Socket typing throttle | Preventive | Low |
| **P3** | Socket context split | Preventive | Low |

---

## 7. Recommended Architecture for Avatar Rendering

Given the filter complexity and layer count, the optimal approach for production:

1. **Build time:** Render each avatar config to a static PNG at 96px, 128px, 192px using a headless browser or `resvg-js`
2. **Runtime:** Serve pre-rendered PNGs via CDN, cache by config hash
3. **Edit flow:** Use the SVG layering system only in the cosmetics editor (not in the battle hot path)
4. **Fallback:** If PNGs aren't available, use the CSS `drop-shadow` approach (eliminates SVG filters)

```jsx
// Production avatar renderer
function AvatarRenderer({ config, size = 128 }) {
  const hash = configHash(config)
  const src = `/avatars/${hash}/${size}.webp`
  return <img src={src} width={size} height={size} alt="Avatar" loading="lazy" />
}
```
