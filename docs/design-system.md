# ATE Design System

> **Comprehensive visual design specifications for the ATE battle platform.**
> All values reference the Tailwind config at `client/tailwind.config.js` and CSS utilities at `client/src/index.css`.

---

## Table of Contents

1. [Color Palette](#1-color-palette)
2. [Typography Scale](#2-typography-scale)
3. [Spacing Scale](#3-spacing-scale)
4. [Shadow & Elevation System](#4-shadow--elevation-system)
5. [Border Radius Scale](#5-border-radius-scale)
6. [Animation & Transition System](#6-animation--transition-system)
7. [Component Specifications](#7-component-specifications)
8. [Icon Guidelines](#8-icon-guidelines)
9. [Accessibility](#9-accessibility)
10. [Dark Theme Considerations](#10-dark-theme-considerations)

---

## 1. Color Palette

### Core Background Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `bg` | `#0a0a1a` | `bg-bg` | Page background, body fill |
| `bg-surface` | `#1a1a2e` | `bg-bg-surface` | Elevated surfaces, form inputs, hover states |
| `bg-card` | `#16213e` | `bg-bg-card` | Cards, panels, containers with borders |

**Usage rules:**
- `bg` is the deepest layer. All content sits on this.
- `bg-surface` is for interactive elements (inputs, list items) and surfaces that need subtle elevation.
- `bg-card` is for structural containers (player panels, score boards, modals). Use with `border-gray-800` or `border-bg-surface/50` border.

### Accent Colors

| Token | Hex | Tailwind Class | Usage | Contrast on `#0a0a1a` |
|-------|-----|----------------|-------|------------------------|
| `accent-purple` | `#7c3aed` | `text-accent-purple` / `bg-accent-purple` | Primary brand. Active turn glow, primary buttons, focus rings | 5.2:1 (AA) |
| `accent-purple-light` | `#a78bfa` | — | Hover state for purple, lighter accents | 8.4:1 (AAA) |
| `accent-purple-dark` | `#5b21b6` | — | Pressed state for purple buttons | 3.2:1 (large text only) |
| `accent-cyan` | `#06b6d4` | `text-accent-cyan` / `bg-accent-cyan` | Local player identity, "your" indicators | 7.4:1 (AAA) |
| `accent-cyan-light` | `#22d3ee` | — | Hover state for cyan | 9.7:1 (AAA) |
| `accent-gold` | `#f59e0b` | `text-accent-gold` / `bg-accent-gold` | Score numbers, gold shimmer, timer warning | 8.1:1 (AAA) |
| `accent-gold-light` | `#fbbf24` | — | Shimmer animation keyframe, hover state | 10.2:1 (AAA) |

### Semantic Colors

| Token | Hex | Tailwind Class | Usage | Contrast on `#0a0a1a` |
|-------|-----|----------------|-------|------------------------|
| `danger` | `#ef4444` | `text-danger` / `bg-danger` | Errors, timer critical, opponent identity, "defeat" | 4.6:1 (AA) |
| `success` | `#22c55e` | `text-success` / `bg-success` | Reconnected toast, positive indicators | 6.5:1 (AAA) |

### Fire Gradient

Used for high-score feedback text ("FIRE", "SAVAGE") and decorative effects.

| Token | Hex | Tailwind Class |
|-------|-----|----------------|
| `fire-start` | `#f97316` | `text-fire-start` |
| `fire-mid` | `#ef4444` | `text-fire-mid` |
| `fire-end` | `#dc2626` | `text-fire-end` |

**CSS class:** `.fire-gradient` applies `linear-gradient(180deg, #f97316 0%, #ef4444 50%, #dc2626 100%)`.

### Text Colors

| Token | Hex | Tailwind Class | Usage | Contrast on `#0a0a1a` | Contrast on `#1a1a2e` |
|-------|-----|----------------|-------|------------------------|------------------------|
| `text` | `#e2e8f0` | `text-text` | Primary body text, labels, scores | 15.4:1 (AAA) | 10.8:1 (AAA) |
| `text-muted` | `#64748b` → `#94a3b8` | `text-text-muted` | Secondary text, placeholders, captions | 4.1:1 → 5.3:1 | 2.9:1 → 3.8:1 |

**Critical fix from UX spec:** Current config has `text-muted: #64748b` which fails WCAG AA on `#1a1a2e` (2.9:1). Must be updated to `#94a3b8` (5.3:1 on `#1a1a2e`). See `battle-screen-ux.md:897`.

### Player Identity Mapping

| Player | Color | Classes |
|--------|-------|---------|
| Local player ("You") | Cyan `#06b6d4` | `text-accent-cyan` |
| Opponent | Red `#ef4444` | `text-danger` |

Consistent across `PlayerPanel.jsx:27`, `ScoreBoard.jsx:51`, and `BattleResult.jsx:31`.

---

## 2. Typography Scale

### Font Families

| Token | Fonts | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `sans` | Inter, system-ui, sans-serif | `font-sans` | All body text (default) |
| `mono` | JetBrains Mono, monospace | `font-mono` | Timer display, character count |

### Type Scale

| Name | Size | Line Height | Weight | Tailwind Class | Usage |
|------|------|-------------|--------|----------------|-------|
| `battle-xs` | 0.75rem (12px) | 1rem (16px) | 400 | `text-battle-xs` | Match progress dots, tiny labels |
| `battle-sm` | 0.875rem (14px) | 1.25rem (20px) | 400 | `text-battle-sm` | Scores, labels, character count |
| `battle-base` | 1rem (16px) | 1.5rem (24px) | 400 | `text-battle-base` | Body text, input text |
| `battle-lg` | 1.125rem (18px) | 1.75rem (28px) | 600 | `text-battle-lg` | Player names, section headings |
| `battle-xl` | 1.5rem (24px) | 2rem (32px) | 700 | `text-battle-xl` | Round text, sub-headings |
| `battle-2xl` | 2rem (32px) | 2.5rem (40px) | 800 | `text-battle-2xl` | Score reveal feedback text |
| `battle-3xl` | 2.5rem (40px) | 3rem (48px) | 900 | `text-battle-3xl` | "ROUND N" transition text |
| `battle-score` | 3.5rem (56px) | 1 (56px) | 800 | `text-battle-score` | Score number in reveal |

**Note:** These tokens are defined in the UX spec but NOT yet in the live `tailwind.config.js`.

### Font Weight Usage

| Weight | Tailwind | Usage |
|--------|----------|-------|
| 400 (Regular) | `font-normal` | Body text, descriptions, placeholders |
| 600 (Semibold) | `font-semibold` | Player names, labels, button text |
| 700 (Bold) | `font-bold` | Round headings, score labels |
| 800 (Extra Bold) | `font-extrabold` | Score numbers (large), cumulative totals |
| 900 (Black) | `font-black` | Score reveal, "VICTORY"/"DEFEAT", "ROUND N" |

### Text Transform & Tracking

| Context | Transform | Tracking | Tailwind |
|---------|-----------|----------|----------|
| Match format label | `uppercase` | `tracking-widest` | `text-xs uppercase tracking-widest` |
| AI feedback text | `uppercase` | `tracking-wider` | `text-xl font-bold uppercase tracking-wider` |
| Round label | `uppercase` | `tracking-wider` | `text-xs uppercase tracking-wider` |
| "VICTORY"/"DEFEAT" | `uppercase` | `tracking-wider` | `text-5xl font-black uppercase tracking-wider` |

---

## 3. Spacing Scale

**Base unit:** 4px. All spacing values are multiples of 4px.

### Base Spacing (Tailwind defaults)

| Value | Pixels | Tailwind Class | Usage |
|-------|--------|----------------|-------|
| `0.5` | 2px | `gap-0.5` / `p-0.5` | Micro gaps (score dot spacing) |
| `1` | 4px | `gap-1` / `p-1` | Tight gaps between inline elements |
| `1.5` | 6px | `gap-1.5` | Small internal spacing |
| `2` | 8px | `gap-2` / `p-2` | Standard small gap (player panel internal) |
| `3` | 12px | `gap-3` / `p-3` | Standard gap (score reveal elements) |
| `4` | 16px | `gap-4` / `p-4` | Section gap, card padding |
| `6` | 24px | `gap-6` / `p-6` | Large section spacing |
| `8` | 32px | `gap-8` / `p-8` | Battle result score columns |

### Custom Spacing (Battle-specific)

| Token | Pixels | Tailwind Class | Usage |
|-------|--------|----------------|-------|
| `arena` | 100% | `w-arena` | Arena width |
| `arena-max` | 480px | `max-w-arena-max` | Arena max-width on desktop |
| `panel` | 192px | `w-panel` | Player panel width |
| `panel-gap` | 32px | `gap-panel-gap` | Gap between panel and arena |
| `timer-size` | 64px | `w-timer-size h-timer-size` | Timer ring diameter (desktop) |
| `timer-size-mobile` | 48px | `w-timer-size-mobile h-timer-size-mobile` | Timer ring diameter (mobile) |
| `avatar-sm` | 72px | `w-avatar-sm h-avatar-sm` | Avatar (xs breakpoint) |
| `avatar-md` | 96px | `w-avatar-md h-avatar-md` | Avatar (sm-md breakpoints) |
| `avatar-lg` | 128px | `w-avatar-lg h-avatar-lg` | Avatar (lg, default) |
| `avatar-xl` | 144px | `w-avatar-xl h-avatar-xl` | Avatar (2xl breakpoint) |

### Component Spacing Reference

| Component | Padding | Gap | Notes |
|-----------|---------|-----|-------|
| PlayerPanel | `p-4` (16px) | `gap-2` (8px) | Vertical flex column |
| ScoreReveal | `py-6` (24px) | `gap-3` (12px) | Centered column |
| RoastInput container | none | `gap-2` (8px) | Vertical stack |
| TypingIndicator | `py-3 px-4` (12px 16px) | `gap-2` (8px) | Horizontal row |
| ScoreBoard | `px-4` (16px) | `gap-1` (4px) dots | Horizontal row |
| BattleRoom | `py-4 px-4` (16px) | `gap-4` (16px) | Main layout column |
| Toast | — | — | `px-4 py-3` standard |

### Layout Spacing

| Context | Spacing |
|---------|---------|
| Page padding (all breakpoints) | `px-4` (16px) |
| Column gap (panels <-> arena) | `gap-4` (16px) |
| Arena internal padding | `py-4` (24px vertical) |
| Bottom safe area (mobile) | `env(safe-area-inset-bottom)` |

---

## 4. Shadow & Elevation System

### Glow Shadows

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `glow-purple` | `0 0 15px rgba(124, 58, 237, 0.4)` | `shadow-glow-purple` | Active turn glow, primary button hover |
| `glow-purple-lg` | `0 0 40px rgba(124, 58, 237, 0.4)` | `shadow-glow-purple-lg` | Winner avatar pulse, emphasis glow |
| `glow-cyan` | `0 0 15px rgba(6, 182, 212, 0.4)` | `shadow-glow-cyan` | Local player hover states |
| `glow-gold` | `0 0 15px rgba(245, 158, 11, 0.4)` | `shadow-glow-gold` | Score highlights, gold effects |
| `glow-gold-lg` | `0 0 40px rgba(245, 158, 11, 0.5)` | `shadow-glow-gold-lg` | Winner indicator on match end |
| `glow-red` | `0 0 20px rgba(239, 68, 68, 0.4)` | `shadow-glow-red` | Timer critical state, danger emphasis |
| `glow-fire` | `0 0 30px rgba(249, 115, 22, 0.4)` | `shadow-glow-fire` | Fire effects, high-score celebration |

**Note:** `glow-purple-lg`, `glow-gold-lg`, `glow-red`, `glow-fire` are in the UX spec but NOT yet live in `tailwind.config.js`.

### Elevation Levels

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 (flat) | none | Default background elements |
| 1 (subtle) | `shadow-sm` or `shadow-glow-purple` (low opacity) | Hover states, subtle lift |
| 2 (raised) | `shadow-glow-purple` | Active turn panel, focused elements |
| 3 (prominent) | `shadow-glow-purple-lg` or `shadow-glow-gold-lg` | Winner states, overlays |
| 4 (overlay) | backdrop blur + shadow | Score reveal, round transition, modal |

### Dynamic Glow (Animated)

```css
.active-turn-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(124, 58, 237, 0.5); }
  50% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.8); }
}
```

Used in `PlayerPanel.jsx:14` via `animate-pulse-glow`.

---

## 5. Border Radius Scale

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `dot` | 50% | `rounded-dot` | Score indicator dots, progress dots |
| `toast` | 8px | `rounded-toast` | Toast notifications |
| `button` | 10px | `rounded-button` | Buttons (proposed) |
| `input` | 12px | `rounded-input` | Input fields (proposed) |
| `panel` | 12px | `rounded-panel` | Player panels, cards (proposed) |
| `arena` | 16px | `rounded-arena` | Battle arena container (proposed) |
| `xl` | 12px | `rounded-xl` | Cards, panels (live) |
| `lg` | 8px | `rounded-lg` | Buttons, inputs (live) |
| `full` | 9999px | `rounded-full` | Badges, pills, "YOUR TURN" tag |

### Component Radius Reference

| Component | Current Class | Spec Token |
|-----------|---------------|------------|
| PlayerPanel | `rounded-xl` | `panel` |
| RoastInput textarea | `rounded-lg` | `input` |
| Send button | `rounded-lg` | `button` |
| "YOUR TURN" badge | `rounded-full` | `full` |
| Score dots | `rounded-full` | `dot` |
| Toast notifications | `rounded-lg` | `toast` |

---

## 6. Animation & Transition System

### Timing Functions

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `ease-bounce` | Overshoot entrances (score pop) |
| `smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | `ease-smooth` | General smooth transitions |
| `ease-in` | `ease-in` | `ease-in` | Element exits (sliding out) |
| `ease-out` | `ease-out` | `ease-out` | Element entrances (sliding in) |
| `ease-in-out` | `ease-in-out` | `ease-in-out` | Bidirectional transitions |
| `linear` | `linear` | `ease-linear` | Timer ring stroke, shimmer |

### Duration Scale

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `fast` | 150ms | `duration-fast` | Micro-interactions (hover, focus) |
| `normal` | 300ms | `duration-normal` | Standard transitions (panel glow, fade) |
| `slow` | 500ms | `duration-slow` | Complex transitions (avatar entrance) |
| `reveal` | 3000ms | `duration-reveal` | Score reveal auto-dismiss |
| `round-transition` | 2500ms | `duration-round-transition` | Round transition auto-dismiss |
| `opponent-found` | 3000ms | `duration-opponent-found` | Opponent found reveal |

### CSS Keyframe Animations

| Animation | Class | Duration | Behavior |
|-----------|-------|----------|----------|
| `pulse-glow` | `animate-pulse-glow` | 2s infinite | Box-shadow pulses purple (active turn) |
| `fire-flicker` | `animate-fire-flicker` | 0.3s alternate infinite | Brightness oscillation (fire effects) |
| `timer-urgent` | `animate-timer-urgent` | 0.5s infinite | Red color + scale pulse (critical timer) |
| `score-pop` | `animate-score-pop` | 0.4s | Scale 0.5→1 with bounce (score reveal) |
| `slide-up` | `animate-slide-up` | 0.3s | Translate Y 10→0 + opacity (entrance) |
| `typing-dot` | `animate-typing-dot` | 1.4s infinite | Y oscillation -4px (typing indicator) |

### Framer Motion Presets (from UX spec)

| Preset | Properties | Usage |
|--------|------------|-------|
| **Score reveal overlay** | opacity `[0,1]`, 300ms, easeOut | Overlay backdrop fade |
| **Feedback text spring** | scale `[0, 1.2, 1]`, 500ms, backOut, 200ms delay | "FIRE" text pop-in |
| **Score count-up** | number interpolation, 800ms, easeOut, 400ms delay | Score number animation |
| **Score pop** | scale `[1, 1.5, 1]`, 300ms, 1200ms delay | Final score emphasis |
| **Turn slide in** | y `[40, 0]`, opacity `[0, 1]`, 400ms, easeOut | "YOUR TURN" entrance |
| **Turn slide out** | y `[0, -40]`, opacity `[1, 0]`, 300ms, easeIn | Previous turn exit |
| **Underline grow** | scaleX `[0, 1]`, 300ms, 200ms delay | Turn indicator underline |
| **Round text spring** | scale `[0.3, 1]`, stiffness 200, damping 15, 600ms | "ROUND N" pop-in |
| **Typing dots bounce** | y `[0, -8, 0]`, 600ms each, 150ms stagger, infinite | Typing indicator |
| **Avatar slide-in** | x `[-60, 0]` / `[60, 0]`, 500ms | Avatar entrance from sides |
| **VS text pop** | scale `[0, 1.3, 1]`, spring, 400ms, 300ms delay | "VS" text entrance |

### Reduced Motion

When `prefers-reduced-motion: reduce` is active (already in `index.css:67-72`):

| Animation | Reduced Alternative |
|-----------|-------------------|
| Count-up number | Instant display |
| Turn slide | Instant swap |
| Round scale-in | Instant fade (100ms max) |
| Typing bounce | Static dots |
| Timer pulse | Static color only |
| Avatar entrance | Instant appear (100ms opacity) |
| Confetti/particles | Hidden entirely |

Framer Motion respects this via `<MotionConfig reducedMotion="user">`.

---

## 7. Component Specifications

### 7.1 Button

#### Primary Button

**CSS class:** `.btn-primary` (`index.css:42`)

```css
bg-accent-purple hover:bg-purple-600 text-white font-semibold
py-2 px-4 rounded-lg transition-all duration-200
hover:shadow-glow-purple
```

| Property | Value |
|----------|-------|
| Background | `#7c3aed` (accent-purple) |
| Text | `#ffffff` white, font-semibold (600) |
| Padding | `8px 16px` (`py-2 px-4`) |
| Border radius | `8px` (`rounded-lg`) |
| Transition | `all 200ms` |

**States:**

| State | Styles |
|-------|--------|
| Default | `bg-accent-purple` (#7c3aed) |
| Hover | `bg-purple-600` (#9333ea) + `shadow-glow-purple` |
| Focus | `focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-bg` |
| Active/Pressed | `accent-purple-dark` (#5b21b6) |
| Disabled | `opacity-40 cursor-not-allowed` |
| Loading | `opacity-70 cursor-wait` + spinner |

**Usage in codebase:** `RoastInput.jsx:113` (Send Roast), `BattleResult.jsx:43` ("Back to Home").

#### Secondary Button

**CSS class:** `.btn-secondary` (`index.css:46`)

```css
bg-bg-card hover:bg-bg-surface text-text border border-gray-700
font-semibold py-2 px-4 rounded-lg transition-all duration-200
```

| State | Styles |
|-------|--------|
| Default | `bg-bg-card` (#16213e) |
| Hover | `bg-bg-surface` (#1a1a2e) |
| Focus | `focus:ring-2 focus:ring-accent-purple focus:ring-offset-2` |
| Disabled | `opacity-40 cursor-not-allowed` |

#### Danger Button (proposed)

```css
bg-danger hover:bg-red-600 text-white font-semibold
py-2 px-4 rounded-lg transition-all duration-200
hover:shadow-glow-red
```

| State | Styles |
|-------|--------|
| Default | `bg-danger` (#ef4444) |
| Hover | `bg-red-600` (#dc2626) + `shadow-glow-red` |
| Focus | `focus:ring-2 focus:ring-danger focus:ring-offset-2` |
| Disabled | `opacity-40 cursor-not-allowed` |

**Usage:** "Return to Lobby" in `DisconnectionModal`, forfeit actions.

#### Button Sizes

| Size | Padding | Font Size | Border Radius | Usage |
|------|---------|-----------|---------------|-------|
| `sm` | `py-1 px-3` (4px 12px) | `text-xs` (12px) | `rounded-md` (6px) | Inline actions, compact UI |
| `md` | `py-2 px-4` (8px 16px) | `text-sm` (14px) | `rounded-lg` (8px) | Default button |
| `lg` | `py-3 px-6` (12px 24px) | `text-lg` (18px) | `rounded-lg` (8px) | Primary CTA, "Send Roast" |

**Touch target minimum:** 44x44px on mobile (< 768px). All buttons must meet this.

---

### 7.2 Input Fields

#### Default Input

**CSS class:** `.input-field` (`index.css:54`)

```css
bg-bg-surface border border-gray-700 rounded-lg px-4 py-2
text-text placeholder-text-muted
focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple
transition-all
```

| Property | Value |
|----------|-------|
| Background | `#1a1a2e` (bg-surface) |
| Border | `1px solid #374151` (gray-700) |
| Text | `#e2e8f0` (text) |
| Placeholder | `#64748b` (text-muted) |
| Padding | `8px 16px` (`py-2 px-4`) |
| Border radius | `8px` (`rounded-lg`) |

**States:**

| State | Border | Ring | Background | Opacity |
|-------|--------|------|------------|---------|
| Default | `border-gray-700` (#374151) | none | `bg-bg-surface` | 1 |
| Focus | `border-accent-purple` (#7c3aed) | `ring-1 ring-accent-purple` | `bg-bg-surface` | 1 |
| Error | `border-danger` (#ef4444) | `ring-1 ring-danger` | `bg-bg-surface` | 1 |
| Disabled | `border-gray-700` | none | `bg-bg-surface` | `opacity-50` |
| Read-only | `border-gray-800` | none | `bg-bg-card` | 1 |

#### RoastInput Textarea (Battle-specific)

From `RoastInput.jsx:93-106`:

```css
w-full bg-bg-surface border border-gray-700 rounded-lg px-4 py-3
text-text placeholder-text-muted
focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple
transition-all resize-none disabled:opacity-50
```

| Property | Value |
|----------|-------|
| Min rows | 3 |
| Max chars | 500 |
| Resize | `none` (auto-resize via JS) |
| Padding | `12px 16px` (`py-3 px-4`) |
| Timer bar | `h-1 bg-accent-purple rounded-full` at bottom, width = `timeLeft / 60 * 100%` |

---

### 7.3 Cards

#### Default Card

**CSS class:** `.card` (`index.css:50`)

```css
bg-bg-card rounded-xl border border-gray-800 p-4
```

| Property | Value |
|----------|-------|
| Background | `#16213e` (bg-card) |
| Border | `1px solid #1f2937` (gray-800) |
| Border radius | `12px` (`rounded-xl`) |
| Padding | `16px` (`p-4`) |

#### Card with Glow

Used for active player panels (`PlayerPanel.jsx:8`):

```css
bg-bg-card shadow-glow-purple border border-accent-purple/30 rounded-xl
```

| Property | Value |
|----------|-------|
| Shadow | `0 0 15px rgba(124, 58, 237, 0.4)` |
| Border | `1px solid rgba(124, 58, 237, 0.3)` |
| Animated | Yes — `animate-pulse-glow` for dynamic shadow |

#### Card with Gradient Border

Used for the arena container:

```css
border border-bg-surface/50 rounded-arena
background: linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.05) 50%, rgba(245,158,11,0.1) 100%)
```

#### Card with Fire Glow

For score reveals with high scores:

```css
shadow-glow-fire  /* 0 0 30px rgba(249, 115, 22, 0.4) */
border border-fire-start/30
```

---

### 7.4 Score Badges

#### Score Tier Colors

From `scoring.js:14-19`:

| Tier | Score Range | Color | Tailwind Class | Glow | Label |
|------|-------------|-------|----------------|------|-------|
| SAVAGE | 9-10 | `#dc2626` (fire-end) | `text-fire-end` | Yes | "SAVAGE" |
| FIRE | 7-8 | `#f97316` (fire-start) | `text-fire-start` | Yes | "FIRE" |
| SOLID | 5-6 | `#f59e0b` (accent-gold) | `text-accent-gold` | No | "SOLID" |
| MID | 3-4 | `#64748b` (text-muted) | `text-text-muted` | No | "MID" |
| WEAK | 1-2 | `#ef4444` (danger) | `text-danger` | No | "WEAK" |

#### Score Badge Component

**CSS class:** `.score-badge` (`index.css:58`)

```css
inline-flex items-center justify-center font-bold rounded-full
```

| Size | Padding | Font Size | Min Width | Min Height |
|------|---------|-----------|-----------|------------|
| `sm` | `px-2 py-0.5` | `text-xs` (12px) | 24px | 20px |
| `md` | `px-3 py-1` | `text-sm` (14px) | 32px | 24px |
| `lg` | `px-4 py-1.5` | `text-base` (16px) | 40px | 28px |
| `xl` | `px-5 py-2` | `text-lg` (18px) | 48px | 32px |

**Background colors by tier:**

| Tier | Background | Text |
|------|------------|------|
| SAVAGE | `bg-fire-end/20` | `text-fire-end` |
| FIRE | `bg-fire-start/20` | `text-fire-start` |
| SOLID | `bg-accent-gold/20` | `text-accent-gold` |
| MID | `bg-text-muted/20` | `text-text-muted` |
| WEAK | `bg-danger/20` | `text-danger` |

---

### 7.5 Timer States

#### Timer Component Visual Spec

The timer is a circular SVG ring. From `RoastInput.jsx:53-57`:

```jsx
const timerColor = timeLeft <= 10 ? 'text-danger animate-timer-urgent'
  : timeLeft <= 20 ? 'text-accent-gold'
  : 'text-accent-cyan'
```

#### Timer State Matrix

| State | Time Range | Color | Animation | Ring Stroke | Size |
|-------|-----------|-------|-----------|-------------|------|
| **Normal** | 16-60s | `#06b6d4` (accent-cyan) | None | Full sweep, smooth | 64px desktop / 48px mobile |
| **Warning** | 15-6s | `#f59e0b` (accent-gold) | `scale [1, 1.03, 1]` 1s infinite | Amber ring | 64px / 48px |
| **Critical** | 5-1s | `#ef4444` (danger) | `scale [1, 1.08, 1]` 0.5s infinite | Red ring | 64px / 48px |
| **Shake** | 3-1s | `#ef4444` (danger) | `translateX [-2, 2]` 0.2s infinite | Red ring + shake | 64px / 48px |
| **Expired** | 0s | `#ef4444` (danger) | `scale [1, 1.3, 0.9, 1]` 0.4s once | Red, depleted | 64px / 48px |
| **Paused** | any | `#4b5563` (gray-600) | None | Gray ring | 64px / 48px |

#### Timer Ring SVG Properties

| Property | Normal | Warning | Critical |
|----------|--------|---------|----------|
| Stroke color | `#06b6d4` | `#f59e0b` | `#ef4444` |
| Stroke width | 4px | 4px | 5px |
| Stroke linecap | round | round | round |
| Fill | none | none | none |
| Transition | `stroke-dashoffset 1s linear, stroke 0.3s ease` | same | same |

#### Timer Text Display

From `RoastInput.jsx:83`:

| Property | Value |
|----------|-------|
| Font | JetBrains Mono (`font-mono`) |
| Size | `1.5rem` (24px, `text-2xl`) |
| Weight | Bold (700) |
| Format | `M:SS` (e.g., "0:45") |
| Color | See state matrix above |

---

### 7.6 Player Panel

From `PlayerPanel.jsx`:

| Property | Active (your turn) | Inactive |
|----------|-------------------|----------|
| Background | `bg-bg-card` | `bg-bg-surface` |
| Border | `border-accent-purple/30` | none |
| Shadow | `shadow-glow-purple` (animated) | none |
| Scale | `1.02` | `1` |
| Avatar size | 96px (current), varies by breakpoint | 96px |
| Name color | `text-accent-cyan` (local) / `text-danger` (opponent) | same |
| Badge | "YOUR TURN" pill at bottom | none |

**Breakpoint avatar sizes:**
- `< 640px`: 72px
- `640-767px`: 80px
- `768-1023px`: 96px
- `1024-1279px`: 128px
- `1280-1535px`: 128px
- `1536px+`: 144px

---

### 7.7 Score Reveal Overlay

From `ScoreReveal.jsx` and UX spec:

| Layer | z-index | Content |
|-------|---------|---------|
| Backdrop | 40 | `fixed inset-0 bg-black/60 backdrop-blur-sm` |
| Container | 41 | Centered card, spring entrance |

**Score number:**
- Size: `text-6xl` (60px) with `font-black` (900)
- Color: Tier-based (see Score Badge section)
- Suffix: `/10` in `text-text-muted text-2xl`

**Feedback text:**
- Size: `text-xl` (20px) with `font-bold` uppercase tracking-wider
- Color: Tier-based
- Glow: `drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]` for FIRE/SAVAGE tiers

---

### 7.8 Connection Toast

From UX spec (`battle-screen-ux.md:1345-1370`):

| Type | Background | Border | Text | Icon |
|------|------------|--------|------|------|
| `reconnecting` | `bg-accent-gold/10` | `border-accent-gold/50` | `text-accent-gold` | ⚡ |
| `reconnected` | `bg-success/10` | `border-success/50` | `text-success` | ✓ |
| `opponent_reconnecting` | `bg-accent-cyan/10` | `border-accent-cyan/50` | `text-accent-cyan` | ⏳ |
| `offline` | `bg-danger/10` | `border-danger/50` | `text-danger` | ✕ |

| Property | Value |
|----------|-------|
| Position | `fixed top-4 right-4` (z: 100) |
| Padding | `px-4 py-3` |
| Border radius | `rounded-lg` |
| Auto-dismiss | 4 seconds |
| Animation | `animate-slide-up` on enter, fade out on exit |

---

### 7.9 Disconnection Modal

| Property | Value |
|----------|-------|
| z-index | 200 (highest) |
| Backdrop | `bg-black/80 backdrop-blur-md` |
| Container | `bg-bg-card rounded-2xl p-8 max-w-md mx-auto` |
| Title | `text-2xl font-bold text-text` |
| Message | `text-text-muted` |
| Buttons | Primary ("Return to Lobby") + Secondary ("Retry") |
| Focus trap | Yes — Tab cycles within modal only |
| Close | Only via action buttons (no X) |

---

### 7.10 Match Progress Bar

From UX spec:

| Property | Value |
|----------|-------|
| Position | `sticky top-0` z: 60 |
| Height | `h-12` (48px) |
| Background | `bg-bg-surface/80 backdrop-blur-sm` |
| Dot size | `w-3 h-3` (12px) |
| Dot border radius | `rounded-full` |
| Local won | `bg-accent-cyan` |
| Remote won | `bg-danger` |
| Pending | `border-2 border-gray-600` (outline only) |
| Active round | `scale(1.15)` + `bg-accent-purple` |
| Label | "Best of 3" / "Best of 5" — `text-xs uppercase tracking-widest text-text-muted` |

---

## 8. Icon Guidelines

### Current Icon Usage

The codebase uses Unicode/emoji characters for icons:

| Context | Character | Usage |
|---------|-----------|-------|
| Score feedback | 🔥 | "FIRE" tier indicator |
| Send button | — | Text-only ("Send Roast") |
| Timer warning | ⚡ | Connection toast |
| Reconnected | ✓ | Toast success |
| Waiting | ⏳ | Opponent reconnecting toast |
| Error | ✕ | Offline toast |
| Fire effects | 🔥 | BattleResult, ScoreReveal |

### Recommended Icon System

**Lucide React** (consistent stroke weight, dark-theme optimized):

| Context | Icon | Size | Color |
|---------|------|------|-------|
| Send roast | `Send` or `Flame` | 16-20px | white (on purple bg) |
| Timer | `Clock` | 16px | cyan/gold/red per state |
| Reconnecting | `Loader2` (spinning) | 16px | accent-gold |
| Reconnected | `CheckCircle2` | 16px | success |
| Opponent typing | `MessageSquare` | 16px | accent-purple |
| Error | `AlertTriangle` | 20px | danger |
| Disconnected | `WifiOff` | 24px | danger |
| Return to lobby | `Home` | 18px | text |
| Close modal | `X` | 20px | text-muted |

### Icon Sizing Rules

| Context | Size | Touch Target |
|---------|------|-------------|
| Inline with text | 16px | N/A |
| Button icon | 18-20px | Part of button's 44px target |
| Toast icon | 16-20px | N/A |
| Modal icon | 24-32px | N/A |
| Decorative/fire | 48-64px | N/A |

---

## 9. Accessibility

### Color Contrast Requirements

All text must meet **WCAG 2.1 AA** (4.5:1 normal text, 3:1 large text >= 18px bold or >= 24px).

| Combination | Ratio | Status |
|-------------|-------|--------|
| `#e2e8f0` on `#0a0a1a` | 15.4:1 | AAA |
| `#e2e8f0` on `#1a1a2e` | 10.8:1 | AAA |
| `#e2e8f0` on `#16213e` | 8.9:1 | AAA |
| `#64748b` on `#0a0a1a` | 4.1:1 | AA large only |
| `#64748b` on `#1a1a2e` | 2.9:1 | **FAIL** |
| `#94a3b8` on `#0a0a1a` | 5.3:1 | AA |
| `#94a3b8` on `#1a1a2e` | 3.8:1 | AA large |
| `#7c3aed` on `#0a0a1a` | 5.2:1 | AA |
| `#06b6d4` on `#0a0a1a` | 7.4:1 | AAA |
| `#f59e0b` on `#0a0a1a` | 8.1:1 | AAA |
| `#f59e0b` on `#1a1a2e` | 5.7:1 | AA |
| `#ef4444` on `#0a0a1a` | 4.6:1 | AA |
| `#22c55e` on `#0a0a1a` | 6.5:1 | AAA |
| `#ffffff` on `#7c3aed` | 4.6:1 | AA |
| `#ffffff` on `#ef4444` | 4.0:1 | AA large only |

**Action required:** Bump `text-muted` from `#64748b` to `#94a3b8` in `tailwind.config.js:24`.

### Focus Indicators

All interactive elements must have visible focus:

```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-accent-purple
         focus:ring-offset-2 focus:ring-offset-bg;
}
```

| Element | Focus Style |
|---------|-------------|
| Buttons | `ring-2 ring-accent-purple ring-offset-2 ring-offset-bg` |
| Input fields | `border-accent-purple ring-1 ring-accent-purple` (current) |
| Links | `ring-2 ring-accent-purple ring-offset-1` |
| Score dots | N/A (non-interactive) |

### Touch Targets

All interactive elements on mobile (< 768px) must be minimum **44x44px**:
- Buttons: ensured via `py-2 px-4` minimum
- Score dots: decorative, non-interactive
- Avatar panels: clickable areas extend to full panel width

### Screen Reader Support

| Requirement | Implementation |
|-------------|---------------|
| Live region | `<div aria-live="assertive" aria-atomic="true" className="sr-only">` |
| Avatar alt text | `role="img" aria-label="Player avatar"` on SVG |
| Input labels | `aria-label="Type your roast"` on textarea |
| Score announcements | `aria-live="polite"` on score display |
| Timer announcements | `aria-live="assertive"` when <= 5s |
| Focus management | See UX spec section 8 for full focus flow |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Next interactive element |
| `Shift+Tab` | Previous element |
| `Enter` | Submit roast (when input focused) |
| `Space` | Activate send button |
| `Escape` | Cancel action / close overlay |
| `ArrowLeft/Right` | Navigate ScoreBoard rounds (mobile) |

### Skip Links

```html
<a href="#roast-input" class="sr-only focus:not-sr-only focus:absolute focus:z-[300] ...">
  Skip to roast input
</a>
```

---

## 10. Dark Theme Considerations

### Color Elevation Strategy

ATE uses a **dark-only** theme. Elevation is communicated through:

1. **Lighter backgrounds** = higher elevation: `#0a0a1a` -> `#1a1a2e` -> `#16213e`
2. **Glow shadows** = active/focused state
3. **Borders** = structural separation (never decorative)

**Note:** Unlike light themes where cards are lighter than background, in this dark theme, card color (`#16213e`) is *lighter* than surface (`#1a1a2e`) which is lighter than background (`#0a0a1a`). This creates a natural "raised" appearance.

### Text on Dark Backgrounds

| Rule | Detail |
|------|--------|
| Primary text | Use `text-text` (#e2e8f0) — never pure white (#fff) |
| Muted text | Use `text-text-muted` (#94a3b8) — never #64748b on surfaces darker than #1a1a2e |
| Disabled text | `opacity-40` on primary text color |
| Emphasis | Use color + weight, not size alone |

### Border Usage

| Surface | Border Color | Opacity |
|---------|-------------|---------|
| On `bg` | `border-gray-800` (#1f2937) | 100% |
| On `bg-surface` | `border-gray-700` (#374151) | 100% |
| On `bg-card` | `border-accent-purple/30` | 30% |
| Decorative | `border-bg-surface/50` | 50% |

**Never** use `border-white` or `border-gray-300` — too high contrast on dark backgrounds.

### Background Patterns & Textures

The arena uses subtle gradient overlays:

```css
.arena-border {
  background: linear-gradient(
    135deg,
    rgba(124, 58, 237, 0.1) 0%,
    rgba(6, 182, 212, 0.05) 50%,
    rgba(245, 158, 11, 0.1) 100%
  );
}
```

**Rule:** Gradient opacity must stay <= 10% to avoid interfering with content readability.

### Scrollbar Styling

From `index.css:24-39`:

| Element | Color |
|---------|-------|
| Track | `#0a0a1a` (matches bg) |
| Thumb | `#1a1a2e` (matches surface) |
| Thumb hover | `#7c3aed` (accent-purple) |
| Width | 6px |
| Border radius | 3px |

### Overlay Backdrops

| Context | Backdrop |
|---------|----------|
| Score reveal | `bg-black/60 backdrop-blur-sm` |
| Round transition | `bg-black/70 backdrop-blur-sm` |
| Disconnection modal | `bg-black/80 backdrop-blur-md` |
| Offline overlay | `bg-black/90 backdrop-blur-md` |

**Rule:** Progressive blur/darkening for higher z-index overlays.

---

## Appendix A: Tailwind Config Migration Checklist

Tokens from this design system that are in the UX spec but NOT in the live `tailwind.config.js`:

### Colors to Add

```js
accent: {
  purple: '#7c3aed',
  'purple-light': '#a78bfa',   // NEW
  'purple-dark': '#5b21b6',    // NEW
  cyan: '#06b6d4',
  'cyan-light': '#22d3ee',     // NEW
  'cyan-dark': '#0891b2',      // NEW
  gold: '#f59e0b',
  'gold-light': '#fbbf24',     // NEW
  'gold-dark': '#d97706',      // NEW
},
text: {
  DEFAULT: '#e2e8f0',
  muted: '#94a3b8',            // FIX: was #64748b
  dim: '#64748b',              // NEW: for safe surfaces only
},
```

### Font Sizes to Add

```js
fontSize: {
  'battle-xs': ['0.75rem', { lineHeight: '1rem' }],
  'battle-sm': ['0.875rem', { lineHeight: '1.25rem' }],
  'battle-base': ['1rem', { lineHeight: '1.5rem' }],
  'battle-lg': ['1.125rem', { lineHeight: '1.75rem' }],
  'battle-xl': ['1.5rem', { lineHeight: '2rem' }],
  'battle-2xl': ['2rem', { lineHeight: '2.5rem' }],
  'battle-3xl': ['2.5rem', { lineHeight: '3rem' }],
  'battle-score': ['3.5rem', { lineHeight: '1', fontWeight: '800' }],
},
```

### Shadows to Add

```js
boxShadow: {
  'glow-purple-lg': '0 0 40px rgba(124, 58, 237, 0.4)',
  'glow-gold-lg': '0 0 40px rgba(245, 158, 11, 0.5)',
  'glow-red': '0 0 20px rgba(239, 68, 68, 0.4)',
  'glow-fire': '0 0 30px rgba(249, 115, 22, 0.4)',
},
```

### Border Radii to Add

```js
borderRadius: {
  'arena': '16px',
  'panel': '12px',
  'input': '12px',
  'button': '10px',
  'toast': '8px',
  'dot': '50%',
},
```

### Spacing to Add

```js
spacing: {
  'arena': '100%',
  'arena-max': '480px',
  'panel': '192px',
  'panel-gap': '32px',
  'timer-size': '64px',
  'timer-size-mobile': '48px',
  'avatar-sm': '72px',
  'avatar-md': '96px',
  'avatar-lg': '128px',
  'avatar-xl': '144px',
},
```

### Transition Durations to Add

```js
transitionDuration: {
  'fast': '150ms',
  'normal': '300ms',
  'slow': '500ms',
  'reveal': '3000ms',
  'round-transition': '2500ms',
  'opponent-found': '3000ms',
},
```

### Z-Index to Add

```js
zIndex: {
  'arena': '10',
  'turn-indicator': '20',
  'input': '30',
  'score-reveal': '40',
  'round-transition': '50',
  'progress': '60',
  'toast': '100',
  'modal': '200',
},
```

### Keyframes & Animations to Add

```js
keyframes: {
  'pulse-warning': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.03)' },
  },
  'pulse-critical': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.08)' },
  },
  'shake': {
    '0%, 100%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(-2px)' },
    '75%': { transform: 'translateX(2px)' },
  },
  'dot-bounce': {
    '0%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
    '50%': { transform: 'translateY(-8px)', opacity: '1' },
  },
  'shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
},

animation: {
  'pulse-warning': 'pulse-warning 1s ease-in-out infinite',
  'pulse-critical': 'pulse-critical 0.5s ease-in-out infinite',
  'shake': 'shake 0.2s ease-in-out infinite',
  'dot-bounce-1': 'dot-bounce 0.6s ease-in-out infinite',
  'dot-bounce-2': 'dot-bounce 0.6s ease-in-out 0.15s infinite',
  'dot-bounce-3': 'dot-bounce 0.6s ease-in-out 0.3s infinite',
},
```

### Timing Functions to Add

```js
transitionTimingFunction: {
  'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
},
```

---

## Appendix B: CSS Utility Classes to Add

```css
/* Score reveal overlay backdrop */
.score-reveal-backdrop {
  @apply fixed inset-0 bg-black/60 backdrop-blur-sm;
}

/* Score gold shimmer */
.score-shimmer {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 25%, #f59e0b 50%, #fbbf24 75%, #f59e0b 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 2s linear infinite;
}

/* Focus ring utility */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-accent-purple
         focus:ring-offset-2 focus:ring-offset-bg;
}

/* Disabled state utility */
.disabled-state {
  @apply opacity-40 pointer-events-none cursor-not-allowed;
}
```

---

## Appendix C: Component <-> Token Mapping

| Component | Background | Border | Text | Radius | Shadow |
|-----------|------------|--------|------|--------|--------|
| `PlayerPanel` (active) | `bg-card` | `accent-purple/30` | `text` + identity color | `xl` | `glow-purple` (animated) |
| `PlayerPanel` (inactive) | `bg-surface` | none | `text` + identity color | `xl` | none |
| `RoastInput` textarea | `bg-surface` | `gray-700` / `accent-purple` (focus) | `text` | `lg` | none |
| `Send` button (enabled) | `accent-purple` | none | `white` | `lg` | `glow-purple` (hover) |
| `Send` button (disabled) | `accent-purple` | none | `white` | `lg` | none, `opacity-40` |
| `ScoreReveal` card | `bg-card` | none | `text` + tier color | `arena` | `glow-fire` (high scores) |
| `ScoreBoard` | transparent | none | `text` | -- | none |
| `MatchProgress` bar | `bg-surface/80` | none | `text-muted` | -- | none |
| `ConnectionToast` | variant bg | variant border | variant text | `lg` | none |
| `DisconnectionModal` | `bg-card` | none | `text` | `2xl` | none |
