# Visual QA Report — ATE Battle Screen Prototype

> **Reviewer:** UI Designer  
> **Date:** 2026-09-04  
> **Scope:** All battle components vs. design system (`design-system.md`) and UX spec (`battle-screen-ux.md`)  
> **Verdict:** **FAIL — 14 issues require fixes before ship**

---

## 1. Component-by-Component Review

### 1.1 BattleRoom.jsx — FAIL

| Check | Status | Detail |
|-------|--------|--------|
| Layout matches spec | **FAIL** | Left panel shows **local player**; spec says left = opponent, right = local. The player panel positions are swapped vs. the UX spec wireframe (`battle-screen-ux.md:88-89`). |
| Avatar responsive sizing | **FAIL** | No responsive avatar size. AvatarRenderer receives hardcoded `size={96}`. Spec requires 72→80→96→128→144px across breakpoints. |
| Typography tokens | **FAIL** | Uses `text-xs`, `text-lg` instead of `text-battle-xs`, `text-battle-lg`. |
| Format label tracking | **FAIL** | Uses `tracking-widest` (spec: correct), but `text-xs` should be `text-battle-xs`. |
| Sticky match progress bar | **FAIL** | Not implemented. Spec requires `sticky top-0 z-60 h-12 bg-bg-surface/80 backdrop-blur-sm` with round dots. |
| Skip link | **FAIL** | Not implemented. Spec requires `<a href="#roast-input" class="sr-only focus:not-sr-only ...">`. |
| ARIA live region | **FAIL** | No `<div aria-live="assertive">` for screen reader announcements. |
| Safe area insets | **FAIL** | No `env(safe-area-inset-bottom)` on mobile. |
| Spacing tokens | **PASS** | `gap-4`, `px-4`, `py-4` match spec. |

**Fixes required:**
1. Swap panel positions: opponent on left, local on right (lines 62-100)
2. Pass responsive avatar size via `useMediaQuery` or Tailwind responsive classes
3. Replace `text-xs` → `text-battle-xs`, `text-lg` → `text-battle-lg`
4. Add sticky MatchProgress bar component at top
5. Add skip link
6. Add ARIA live region container
7. Add safe area padding to bottom of container

---

### 1.2 PlayerPanel.jsx — FAIL

| Check | Status | Detail |
|-------|--------|--------|
| Background (active) | **PASS** | `bg-bg-card shadow-glow-purple border border-accent-purple/30` matches spec. |
| Background (inactive) | **FAIL** | Uses `bg-bg-surface`. Spec says inactive should also be `bg-bg-surface` — **PASS**. |
| Avatar size responsive | **FAIL** | Hardcoded `size={96}`. Should be `xs:72, sm:80, md:96, lg:128, 2xl:144`. |
| Player name typography | **FAIL** | Uses `text-sm`. Spec requires `text-battle-lg` (18px, weight 600). |
| Glow animation | **PASS** | `animate-pulse-glow` correctly implemented. |
| Scale animation | **PASS** | `scale: 1.02` for active panel. |
| "YOUR TURN" badge | **WARN** | No explicit z-index. Should be `z-10` relative to avatar. |
| Transition duration | **WARN** | Uses `duration: 0.2` (200ms). Spec says `duration-normal` (300ms). |
| Border radius | **PASS** | `rounded-xl` matches spec token. |
| Identity colors | **PASS** | `text-accent-cyan` (local), `text-danger` (opponent). |

**Fixes required:**
1. Make avatar size responsive
2. Change `text-sm` → `text-battle-lg font-semibold` for player name
3. Add `z-10` to "YOUR TURN" badge container
4. Change transition duration from 0.2 to 0.3

---

### 1.3 ScoreBoard.jsx — FAIL

| Check | Status | Detail |
|-------|--------|--------|
| Score number typography | **FAIL** | Uses `text-3xl font-black`. Spec requires `text-battle-score` (56px, weight 800). |
| Score name color | **PASS** | `text-accent-cyan` / `text-danger`. |
| Round dots | **FAIL** | Uses `w-2 h-2` (8px). Spec requires `w-3 h-3` (12px) for MatchProgress, `w-2 h-2` for ScoreBoard dots — **needs confirmation**. Current `w-2 h-2` is acceptable for ScoreBoard but should be `rounded-full` (already is). |
| Win indicator shape | **FAIL** | Uses `w-3 h-1 rounded-full` (pill). Spec says dots should be `rounded-full` circles. Should be `w-3 h-3 rounded-full`. |
| "Round" label tracking | **FAIL** | Uses `tracking-wider`. Spec says `tracking-widest` for format labels. |
| Score animation | **PASS** | Spring scale animation on score change works. |
| Spacing | **PASS** | `gap-1` dots, `gap-1` between name/score/dots. |

**Fixes required:**
1. Change score number to `text-battle-score` or define explicit `text-4xl` → `text-[3.5rem]`
2. Change win indicators from `w-3 h-1` to `w-3 h-3` (dots, not pills)
3. Change "Round" label to `tracking-widest`
4. Consider using `text-battle-sm` for player names

---

### 1.4 RoastInput.jsx — FAIL

| Check | Status | Detail |
|-------|--------|--------|
| Textarea styles | **PASS** | `bg-bg-surface border-gray-700 rounded-lg px-4 py-3` matches spec. |
| Focus states | **PASS** | `focus:border-accent-purple focus:ring-1 focus:ring-accent-purple`. |
| Timer color states | **WARN** | Threshold at 10s for danger (spec: 5s). Should be `<=5` for danger, `<=15` for gold. |
| Timer bar color | **PASS** | `bg-accent-purple` bar on `bg-bg-surface` track. |
| Send button focus ring | **FAIL** | No `focus:ring-2 focus:ring-accent-purple focus:ring-offset-2` on button. |
| Send button hover glow | **PASS** | `hover:shadow-glow-purple`. |
| Send button touch target | **WARN** | `py-2 px-6` = 40px height. Should be at least 44px on mobile (`py-3`). |
| Character limit | **FAIL** | `maxLength={500}`. UX spec says 280 characters. |
| Placeholder text | **PASS** | `placeholder-text-muted`. |
| Character count display | **PASS** | `{text.length}/500` with `text-text-muted`. |
| Timer display font | **PASS** | `font-mono text-2xl font-bold`. |
| ARIA timer | **PASS** | `role="timer" aria-live="polite"`. |
| Timer urgent escalation | **FAIL** | `aria-live="polite"` should escalate to `aria-live="assertive"` when `<=5s`. |

**Fixes required:**
1. Add `focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-bg` to send button
2. Change `maxLength` to 280 and update character count display
3. Fix timer danger threshold: `timeLeft <= 5` not `timeLeft <= 10`
4. Add `aria-live="assertive"` when `timeLeft <= 5`
5. Increase send button min height to 44px on mobile: add `min-h-[44px] md:min-h-0` or use `py-3 md:py-2`

---

### 1.5 TypingIndicator.jsx — WARN

| Check | Status | Detail |
|-------|--------|--------|
| Dot size | **PASS** | `w-2 h-2` acceptable. |
| Dot color | **PASS** | `bg-accent-purple`. |
| Bounce distance | **WARN** | `y: [0, -4, 0]` — spec says `-8px`. 4px is too subtle. |
| Stagger timing | **PASS** | `delay: i * 0.15` matches spec (150ms). |
| Duration | **PASS** | 0.6s per dot matches spec. |
| Container padding | **PASS** | `py-3 px-4`. |
| Label text | **PASS** | `text-sm text-text-muted`. |
| Reduced motion | **FAIL** | No fallback for `prefers-reduced-motion`. Should show static dots. |

**Fixes required:**
1. Change bounce from `-4` to `-8` for more visible animation
2. Add `prefers-reduced-motion` check: if reduced, render static dots (no animation)

---

### 1.6 ScoreReveal.jsx — FAIL

| Check | Status | Detail |
|-------|--------|--------|
| Backdrop overlay | **FAIL** | No backdrop. Spec requires `fixed inset-0 bg-black/60 backdrop-blur-sm` at z-40. |
| Score number size | **FAIL** | Uses `text-6xl` (60px). Spec says `text-battle-score` (56px) with `font-black`. Close but should use token. |
| Feedback text size | **PASS** | `text-xl font-bold uppercase tracking-wider` matches spec. |
| Tier glow effect | **WARN** | Glow hardcoded to `rgba(249,115,22,0.5)` (fire/orange). For SAVAGE tier should be red-tinted. |
| Gold shimmer | **FAIL** | Not applied for SOLID tier. Should use `.score-shimmer` class. |
| Score count-up animation | **FAIL** | Score appears instantly. Spec requires interpolated count-up (1→N over 800ms). |
| Score pop at end | **FAIL** | No final `scale: [1, 1.5, 1]` pop animation at 1200ms. |
| Running total | **FAIL** | No running total display after score. Spec shows cumulative score update. |
| Auto-dismiss | **PASS** | Handled by parent `BattleRoom` (3000ms timeout). |
| z-index | **FAIL** | No z-index specified. Should be `z-40` within arena. |

**Fixes required:**
1. Add backdrop: wrap in a `motion.div` with `fixed inset-0 bg-black/60 backdrop-blur-sm z-40`
2. Add running total display (local vs opponent cumulative)
3. Implement count-up animation using `useMotionValue` + `useTransform`
4. Add score pop animation at 1200ms delay
5. Apply tier-specific glow (red for SAVAGE, orange for FIRE)
6. Apply `.score-shimmer` class for SOLID tier
7. Add `z-40` to overlay

---

### 1.7 BattleResult.jsx — FAIL

| Check | Status | Detail |
|-------|--------|--------|
| "VICTORY" text | **PASS** | `text-5xl font-black uppercase tracking-wider` matches spec. |
| Victory color | **PASS** | `text-accent-gold neon-text` for winner. |
| Defeat color | **PASS** | `text-danger` for loser. |
| Draw color | **PASS** | `text-text-muted`. |
| Score columns | **PASS** | `gap-8` between columns, `text-4xl font-black`. |
| Identity colors | **PASS** | `text-accent-cyan` (local), `text-danger` (opponent). |
| Button styling | **PASS** | `btn-primary text-lg`. |
| Button focus ring | **FAIL** | `btn-primary` class uses `hover:shadow-glow-purple` but no explicit `focus:ring` defined in CSS. |
| Missing: winner avatar | **FAIL** | Spec requires winner avatar with glow pulse. Not shown. |
| Missing: "WINNER" label | **FAIL** | Spec says "WINNER" above the winner's name. Not implemented. |
| Missing: round results | **FAIL** | Spec shows per-round score summary staggered in. Not implemented. |
| Background | **FAIL** | No background overlay. Should have `bg-bg` full-screen background. |
| Missing: fire particles | **FAIL** | Confetti/particles for high-score wins not implemented. |

**Fixes required:**
1. Add `focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-bg` to button
2. Show winner avatar with `shadow-glow-gold-lg` pulse animation
3. Add "WINNER" label above winner name
4. Add per-round result summary
5. Add full-screen background overlay

---

## 2. Consistency Issues

### 2.1 Typography Token Mismatches

All components use raw Tailwind sizes instead of battle-specific tokens from the spec:

| Component | Current | Should Be |
|-----------|---------|-----------|
| BattleRoom format label | `text-xs` | `text-battle-xs` |
| BattleRoom round heading | `text-lg` | `text-battle-lg` |
| PlayerPanel name | `text-sm` | `text-battle-lg` |
| ScoreBoard player name | `text-sm` | `text-battle-sm` |
| ScoreBoard score | `text-3xl` | `text-battle-score` |
| ScoreReveal score | `text-6xl` | `text-battle-score` |
| ScoreReveal feedback | `text-xl` | `text-battle-xl` (conceptual, size matches) |
| RoastInput hint | `text-sm` | `text-battle-sm` |
| TypingIndicator label | `text-sm` | `text-battle-sm` |
| BattleResult names | `text-lg` | `text-battle-lg` |
| BattleResult scores | `text-4xl` | `text-battle-2xl` |

### 2.2 Tailwind Config Missing Tokens

The following tokens from the design system are NOT in `tailwind.config.js`:

**Colors (missing):**
- `accent.purple-light`, `accent.purple-dark`
- `accent.cyan-light`, `accent.cyan-dark`
- `accent.gold-light`, `accent.gold-dark`
- `text.dim` (#64748b)

**Typography (missing entire battle scale):**
- `battle-xs` through `battle-score` (8 tokens)

**Shadows (missing):**
- `glow-purple-lg`, `glow-gold-lg`, `glow-red`, `glow-fire`

**Border radii (missing):**
- `arena`, `panel`, `input`, `button`, `toast`, `dot`

**Spacing (missing):**
- `arena`, `arena-max`, `panel`, `panel-gap`, `timer-size`, `timer-size-mobile`, `avatar-sm/md/lg/xl`

**Z-index scale (missing entire):**
- `arena` (10), `turn-indicator` (20), `input` (30), `score-reveal` (40), `round-transition` (50), `progress` (60), `toast` (100), `modal` (200)

**Keyframes (missing):**
- `pulse-warning`, `pulse-critical`, `shake`, `dot-bounce`, `slide-up` (extended version)

**Timing functions (missing):**
- `bounce` (cubic-bezier), `smooth` (cubic-bezier)

### 2.3 Color Mapping Inconsistencies

| Issue | Location | Detail |
|-------|----------|--------|
| ScoreBoard dots | ScoreBoard:23 | Round win dots use `w-2 h-2` but MatchProgress spec says `w-3 h-3`. ScoreBoard should use `w-2 h-2` but the **win indicators below scores** use `w-3 h-1` which should be dots. |
| Timer threshold | RoastInput:53 | Danger at `<=10` but spec says `<=5`. Gold at `<=20` but spec says `<=15`. |
| Score tier glow | ScoreReveal:33 | Glow always orange (`rgba(249,115,22)`). SAVAGE tier should use red. |

---

## 3. Accessibility Contrast Issues

### 3.1 Passing (No Changes Needed)

| Text | Background | Ratio | Status |
|------|-----------|-------|--------|
| `#e2e8f0` on `#0a0a1a` | 15.4:1 | AAA |
| `#e2e8f0` on `#1a1a2e` | 10.8:1 | AAA |
| `#e2e8f0` on `#16213e` | 8.9:1 | AAA |
| `#7c3aed` on `#0a0a1a` | 5.2:1 | AA |
| `#06b6d4` on `#0a0a1a` | 7.4:1 | AAA |
| `#f59e0b` on `#0a0a1a` | 8.1:1 | AAA |
| `#ef4444` on `#0a0a1a` | 4.6:1 | AA |
| `#22c55e` on `#0a0a1a` | 6.5:1 | AAA |
| `#94a3b8` on `#0a0a1a` | 5.3:1 | AA |

### 3.2 Failing / Borderline

| Issue | Location | Detail |
|-------|----------|--------|
| `#64748b` on `#1a1a2e` | Potential misuse | `text-muted` is correctly set to `#94a3b8` in config, but if any component uses hardcoded `text-slate-500` or similar, it would fail. **Current code appears safe.** |
| White on red button | RoastInput send | `text-white` on `bg-danger` would be 4.0:1 (large text only). Send button uses `bg-accent-purple` which is 4.6:1 — **AA pass**. |
| Timer ring stroke | RoastInput SVG | Timer ring SVG stroke uses text color classes. Verify SVG stroke color meets contrast against `bg-bg-surface`. |

### 3.3 Missing Focus Indicators

| Element | Issue | Severity |
|---------|-------|----------|
| Send button (RoastInput) | No `focus:ring` styles | **HIGH** |
| Player panels | No keyboard focus indicator | **MEDIUM** |
| Score dots | Non-interactive, acceptable | LOW |

---

## 4. Animation Quality Assessment

### 4.1 Implemented Animations

| Animation | Component | Quality | Spec Match |
|-----------|-----------|---------|------------|
| Pulse glow | PlayerPanel | **Good** | Matches spec keyframes |
| Typing dots bounce | TypingIndicator | **Weak** | 4px instead of 8px — too subtle |
| Score reveal entrance | ScoreReveal | **Good** | Spring animation with scale |
| Score number pop | ScoreReveal | **Missing** | No final pop animation |
| Turn slide | RoastInput | **Good** | Framer Motion slide-in |
| VICTORY/DEFEAT entrance | BattleResult | **Good** | Spring + delay |

### 4.2 Missing Animations (from UX spec)

| Animation | Spec Reference | Priority |
|-----------|---------------|----------|
| Score count-up (number interpolation) | `battle-screen-ux.md:601-609` | **HIGH** |
| Score pop at 1200ms delay | `battle-screen-ux.md:612-615` | **HIGH** |
| Running total slide-up | `battle-screen-ux.md:618-623` | **HIGH** |
| Turn indicator underline grow | `battle-screen-ux.md:643-649` | **MEDIUM** |
| "ROUND N" transition overlay | `battle-screen-ux.md:662-688` | **MEDIUM** |
| Avatar slide-in from sides | `battle-screen-ux.md:758-773` | **MEDIUM** |
| "VS" text pop | `battle-screen-ux.md:775-783` | **LOW** |
| Timer warning pulse (scale 1.03) | `battle-screen-ux.md:725-729` | **HIGH** |
| Timer critical pulse (scale 1.08) | `battle-screen-ux.md:732-737` | **HIGH** |
| Timer shake at 3s | `battle-screen-ux.md:740-744` | **MEDIUM** |
| Winner avatar glow pulse | `battle-screen-ux.md:789-797` | **MEDIUM** |
| Confetti/particles | `battle-screen-ux.md:805-807` | **LOW** |

### 4.3 Reduced Motion Support

| Issue | Detail |
|-------|--------|
| TypingIndicator | No `prefers-reduced-motion` check. Framer Motion's `motion.span` will animate regardless. Need conditional static dots. |
| pulse-glow animation | CSS `@media (prefers-reduced-motion: reduce)` in `index.css:67-72` sets `animation-duration: 0.01ms` globally — **covers this**. |
| Timer urgent | Same global rule covers `animate-timer-urgent`. |
| Framer Motion | `<MotionConfig reducedMotion="user">` not wrapped around app. Components use raw `motion.*` which won't auto-respect reduced motion without this wrapper. |

**CRITICAL:** The app must wrap its component tree in `<MotionConfig reducedMotion="user">` for Framer Motion animations to respect `prefers-reduced-motion`.

---

## 5. Mobile Responsiveness Concerns

### 5.1 Layout Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| No mobile layout branch | **HIGH** | `BattleRoom` always renders a 3-column horizontal layout (`flex items-start justify-between`). On mobile (<768px), panels + arena side-by-side overflows. Spec requires stacked layout on mobile. |
| Avatar hard 96px | **HIGH** | 96px avatar + 192px panel + 480px arena = 768px minimum. This overflows on phones (375px). |
| Max width too wide | **MEDIUM** | `max-w-4xl` (896px) is correct for desktop but the inner layout assumes desktop widths. |
| Timer + Send button row | **MEDIUM** | Spec says timer and send button should be on same row on mobile. Currently timer is inline with textarea label and send button is below textarea. |
| Textarea height | **MEDIUM** | Hardcoded `rows={3}`. Spec says 100px on xs, 120px on sm, 140px on md, 180px on lg. |

### 5.2 Touch Target Issues

| Element | Current Size | Required | Status |
|---------|-------------|----------|--------|
| Send button | ~40px height | 44px min | **FAIL** on mobile |
| Timer ring | 48px (if mobile class applied) | 44px min | Not implemented |
| Player panel | N/A (tap target) | 44px min | **PASS** (panel is large) |
| Score dots | Decorative | N/A | N/A |

### 5.3 Name Truncation

Player names have no truncation logic. On mobile, long names like "xXRoastKingXx" will overflow the panel. Spec says truncate at 10 chars on xs, 14 chars on sm.

---

## 6. Sign-Off Checklist

| Component | Colors | Typography | Spacing | Shadows | Animation | Accessibility | Mobile | Verdict |
|-----------|--------|-----------|---------|---------|-----------|---------------|--------|---------|
| BattleRoom | PASS | FAIL | PASS | N/A | PASS | FAIL | FAIL | **FAIL** |
| PlayerPanel | PASS | FAIL | PASS | PASS | PASS | WARN | FAIL | **FAIL** |
| ScoreBoard | PASS | FAIL | PASS | N/A | PASS | PASS | WARN | **FAIL** |
| RoastInput | PASS | WARN | PASS | PASS | WARN | FAIL | FAIL | **FAIL** |
| TypingIndicator | PASS | PASS | PASS | N/A | WARN | FAIL | PASS | **WARN** |
| ScoreReveal | WARN | FAIL | PASS | N/A | FAIL | FAIL | PASS | **FAIL** |
| BattleResult | PASS | FAIL | PASS | N/A | WARN | FAIL | WARN | **FAIL** |

---

## 7. Recommended Final Polish Changes

### Priority 1 — Critical (Must fix before ship)

1. **`tailwind.config.js`**: Add missing tokens — battle typography scale, z-index scale, missing shadows (`glow-purple-lg`, `glow-gold-lg`, `glow-red`, `glow-fire`), missing border radii, timing functions, and animation keyframes (`pulse-warning`, `pulse-critical`, `shake`, `dot-bounce`).

2. **`BattleRoom.jsx:62-100`**: Swap panel positions — opponent on left, local on right.

3. **`BattleRoom.jsx:50`**: Add sticky `MatchProgress` bar at top with `sticky top-0 z-60`.

4. **`PlayerPanel.jsx:15`**: Make avatar size responsive using Tailwind breakpoints (`w-18 h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 2xl:w-36 2xl:h-36`).

5. **`ScoreReveal.jsx`**: Add backdrop overlay (`fixed inset-0 bg-black/60 backdrop-blur-sm z-40`) and implement count-up animation + score pop.

6. **`RoastInput.jsx:115-118`**: Add focus ring to send button: `focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-bg`.

7. **`RoastInput.jsx:102`**: Change `maxLength` from 500 to 280 and update character count display.

8. **App root**: Wrap component tree in `<MotionConfig reducedMotion="user">` from framer-motion.

### Priority 2 — High (Should fix before ship)

9. **All components**: Replace raw Tailwind typography with battle tokens (`text-battle-xs`, `text-battle-lg`, etc.) once tokens are added to config.

10. **`RoastInput.jsx:53`**: Fix timer thresholds — danger at `<=5`, gold at `<=15` (currently `<=10` and `<=20`).

11. **`ScoreBoard.jsx:67`**: Change win indicators from `w-3 h-1` (pill) to `w-3 h-3` (dot).

12. **`BattleResult.jsx`**: Add winner avatar display, "WINNER" label, and per-round results summary.

13. **`ScoreReveal.jsx:33`**: Make glow color tier-dependent — red for SAVAGE, orange for FIRE.

14. **`BattleRoom.jsx`**: Add ARIA live region container for screen reader announcements.

### Priority 3 — Medium (Polish)

15. **`TypingIndicator.jsx:18`**: Increase bounce from `-4` to `-8` pixels.

16. **`PlayerPanel.jsx`**: Add responsive name truncation (10 chars on mobile, 14 on tablet).

17. **Mobile layout**: Implement stacked layout for `< 768px` — panels above arena, arena fills width.

18. **`index.css`**: Add `.score-shimmer` class and apply to SOLID tier in ScoreReveal.

19. **`BattleRoom.jsx`**: Add skip link for keyboard users.

20. **Timer ring**: Implement warning pulse (`scale 1.03`) and critical pulse (`scale 1.08`) CSS animations.

---

*End of report. 14 critical/high issues, 6 medium issues identified. Recommend addressing all Priority 1 and 2 items before user testing.*
