# Battle Screen UX Architecture

> **ATE — Real-Time 1v1 Roasting Battle Platform**
> Version: 1.0 | Date: 2026-09-04

---

## Table of Contents

1. [Information Architecture](#1-information-architecture)
2. [Layout Spec](#2-layout-spec)
3. [Responsive Breakpoints](#3-responsive-breakpoints)
4. [Component Architecture](#4-component-architecture)
5. [Interaction Flow](#5-interaction-flow)
6. [Animation Spec](#6-animation-spec)
7. [Visual Hierarchy](#7-visual-hierarchy)
8. [Accessibility Requirements](#8-accessibility-requirements)
9. [CSS Design Token Spec](#9-css-design-token-spec)
10. [Error States](#10-error-states)

---

## 1. Information Architecture

### Component Hierarchy & Z-Index Layering

```
z-index scale:
  0   — base content (avatars, names, scores)
  10  — arena background elements
  20  — turn indicator, typing indicator
  30  — roast input area
  40  — score reveal overlay
  50  — round transition overlay
  60  — match progress (sticky top)
  100 — error/connection toast
  200 — disconnection modal (full screen)

BattleRoom (z: 0, relative)
├── MatchProgress (z: 60, sticky top)
├── PlayerPanel[LEFT] (z: 0) — opponent
│   ├── AvatarRenderer (z: 0)
│   ├── PlayerName (z: 0)
│   └── ScoreDisplay (z: 0)
├── BattleArena (z: 10, center)
│   ├── ArenaBackground (z: 0, decorative grid/particles)
│   ├── TurnIndicator (z: 20)
│   ├── TypingIndicator (z: 20)
│   ├── RoastInput (z: 30)
│   ├── ScoreReveal (z: 40, modal-like within arena)
│   └── RoundTransition (z: 50, full-arena overlay)
├── PlayerPanel[RIGHT] (z: 0) — local player
│   ├── AvatarRenderer (z: 0)
│   ├── PlayerName (z: 0)
│   └── ScoreDisplay (z: 0)
└── Overlays
    ├── ConnectionToast (z: 100, top-right)
    └── DisconnectionModal (z: 200, center)
```

### Visual Weight Priority (by battle stage)

| Stage | Primary Focus | Secondary | Tertiary |
|-------|--------------|-----------|----------|
| Opponent Found | Both avatars | Opponent name | Round info |
| Active Typing (You) | RoastInput + Timer | Your avatar | Opponent avatar |
| Active Typing (Opponent) | TypingIndicator | Opponent avatar | Timer (frozen) |
| Score Reveal | Score + Feedback | Both scores | Input area (disabled) |
| Round Transition | Round number | Current scores | Avatars |
| Match End | Winner avatar + score | Loser avatar | Stats |

---

## 2. Layout Spec

### Desktop Layout (1024px+)

```
┌─────────────────────────────────────────────────────────────────────┐
│ MATCH PROGRESS: ● ● ○ ○ ○                          Best of 5     │ ← sticky top, h:48px
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐                              ┌──────────┐            │
│  │  AVATAR  │      ROUND 2/5               │  AVATAR  │            │
│  │  128×128 │                              │  128×128 │            │
│  └──────────┘                              └──────────┘            │
│                                                                     │
│  "xXRoastKingXx"              ╱╲              "BurnMaster99"       │
│  Score: 7                     ╱  ╲             Score: 5            │
│  ─────────────────────────────────────────────────                  │
│                                                                     │
│              ┌─────────────────────────────┐                        │
│              │                             │                        │
│              │     YOUR TURN               │  ← TurnIndicator      │
│              │                             │                        │
│              │  ┌─────────────────────┐    │                        │
│              │  │  Type your roast... │    │  ← RoastInput         │
│              │  │                     │    │     (textarea)         │
│              │  │  ┌───────────────┐  │    │                        │
│              │  │  │ 0:45 ──────── │  │    │  ← Timer              │
│              │  │  └───────────────┘  │    │                        │
│              │  └─────────────────────┘    │                        │
│              │                             │                        │
│              │      [ SEND ROAST 🔥 ]      │  ← SendButton         │
│              │                             │                        │
│              └─────────────────────────────┘                        │
│                                                                     │
│  ┌─────────────────────────────────────────────────────┐           │
│  │ Round 1 Result: YOU 8 ─── FIRE 🔥 ─── THEM 6       │  ← ScoreBoard │
│  └─────────────────────────────────────────────────────┘           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Desktop Arena Detail (with Score Reveal overlay)

```
              ┌─────────────────────────────┐
              │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
              │░░░░░░░░ SCORE REVEAL ░░░░░░░│  ← z:40 overlay
              │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
              │░░                          ░░│
              │░░   "FIRE 🔥"              ░░│  ← AI feedback
              │░░                          ░░│
              │░░     +8                   ░░│  ← score number (animated)
              │░░                          ░░│
              │░░  ── vs 6 ──             ░░│  ← opponent score
              │░░                          ░░│
              │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
              └─────────────────────────────┘
```

### Mobile Layout (< 768px)

```
┌───────────────────────────────┐
│ ● ● ○ ○ ○         R2/5  🏳  │ ← MatchProgress (compact)
├───────────────────────────────┤
│                               │
│  ┌────────┐    ┌────────┐    │
│  │ AVATAR │    │ AVATAR │    │  ← 96×96 on mobile
│  │  96×96 │    │  96×96 │    │
│  └────────┘    └────────┘    │
│  "RoastKing"  VS  "BurnMstr" │  ← truncated names (max 10 chars)
│   [7]                [5]     │  ← compact scores
│                               │
│  ─────────────────────────── │
│                               │
│      YOUR TURN                │ ← TurnIndicator
│                               │
│  ┌─────────────────────────┐ │
│  │                         │ │
│  │  Type your roast...     │ │ ← RoastInput (60% height)
│  │                         │ │
│  └─────────────────────────┘ │
│                               │
│  ┌───────┐ ┌──────────────┐  │
│  │ 0:45  │ │ SEND ROAST 🔥│  │ ← Timer + Send inline
│  └───────┘ └──────────────┘  │
│                               │
│  ┌─────────────────────────┐ │
│  │ R1: YOU 8 ─ 🔥 ─ THEM 6│ │ ← ScoreBoard (compact)
│  └─────────────────────────┘ │
│                               │
└───────────────────────────────┘
```

### Mobile Layout with Score Reveal

```
┌───────────────────────────────┐
│ ● ● ○ ○ ○         R2/5      │
├───────────────────────────────┤
│                               │
│  ┌────────┐    ┌────────┐    │
│  │ AVATAR │    │ AVATAR │    │
│  └────────┘    └────────┘    │
│  "RoastKing"  VS  "BurnMstr" │
│                               │
│  ┌─────────────────────────┐ │
│  │                         │ │
│  │      "FIRE 🔥"          │ │  ← AI feedback (large)
│  │                         │ │
│  │        +8               │ │  ← animated score
│  │                         │ │
│  │    ── vs 6 ──          │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                               │
│  ┌─────────────────────────┐ │
│  │ R1: YOU 8 ─ 🔥 ─ THEM 6│ │
│  └─────────────────────────┘ │
│                               │
└───────────────────────────────┘
```

---

## 3. Responsive Breakpoints

| Token | Min-Width | Layout | Avatar Size | Input Height | Font Scale |
|-------|-----------|--------|-------------|--------------|------------|
| `xs` | 0px | Mobile stacked | 72px | 100px | 0.875rem base |
| `sm` | 640px | Mobile+ | 80px | 120px | 0.875rem base |
| `md` | 768px | Tablet | 96px | 140px | 1rem base |
| `lg` | 1024px | Desktop | 128px | 180px | 1rem base |
| `xl` | 1280px | Desktop wide | 128px | 200px | 1.125rem base |
| `2xl` | 1536px | Desktop ultra | 144px | 220px | 1.125rem base |

### Breakpoint Behavior Rules

- **< 640px (xs):** Names truncate at 10 chars with ellipsis. Scores inline. Timer and send button on same row. Avatar names hidden if vertical space < 600px.
- **640-767px (sm):** Names show up to 14 chars. Full layout but condensed padding.
- **768-1023px (md):** Two-column layout emerges. Player panels move to sides. Arena centers.
- **1024px+ (lg):** Full desktop layout. Player panels on edges. Arena centered with max-width.
- **Touch targets:** All interactive elements minimum 44×44px on < 768px.
- **Safe area:** Account for notch/home indicator on mobile with `env(safe-area-inset-*)`.

---

## 4. Component Architecture

### BattleRoom

```tsx
// Container component. Owns battle state machine.
// Connects to SocketContext and manages all battle lifecycle.

interface BattleRoomProps {
  battleId: string;
}

// State it manages (via useBattle hook):
// - battleState: BattleState
// - currentRound: number
// - totalRounds: number (3 or 5)
// - localPlayer: Player
// - remotePlayer: Player
// - scores: Score[]
// - timerSeconds: number
// - lastScoreReveal: ScoreReveal | null
```

### PlayerPanel

```tsx
interface PlayerPanelProps {
  player: Player;           // { id, username, avatarConfig }
  score: number;            // cumulative score
  roundScore?: number;      // current round score (shown after reveal)
  isLocal: boolean;         // true = right side desktop, left side mobile
  isActive: boolean;        // true = it's this player's turn
  isTyping: boolean;        // true = show typing indicator on avatar
  showScoreReveal?: boolean; // animate score popup
  revealScore?: number;
  revealFeedback?: string;
  isWinner?: boolean;       // glow effect on match end
}
```

### TurnIndicator

```tsx
interface TurnIndicatorProps {
  whoseTurn: 'local' | 'remote' | null;
  phase: 'typing' | 'revealing' | 'transitioning';
  timeRemaining: number;   // seconds
}

// Renders:
// - "YOUR TURN" / "OPPONENT'S TURN" text
// - Animated underline (purple for local, cyan for remote)
// - Phase-appropriate styling
```

### TypingIndicator

```tsx
interface TypingIndicatorProps {
  isVisible: boolean;
  playerName: string;
  position: 'left' | 'right' | 'center'; // adapts to layout
}

// Three animated dots in a speech bubble shape
// Position shifts based on who is typing
// Always appears near the opponent's avatar area
```

### RoastInput

```tsx
interface RoastInputProps {
  disabled: boolean;
  maxLength: number;          // 280 characters
  timeRemaining: number;      // 0-60
  isSubmitting: boolean;
  onTyping: () => void;       // emits socket event
  onSubmit: (text: string) => void;
  placeholder?: string;
}

// Contains:
// - Textarea (auto-resize, 1-4 lines)
// - Character count (280 max)
// - Timer ring (circular countdown)
// - Send button (disabled when empty or time=0)
// - Auto-submit when timer hits 0 (sends current text)
```

### Timer

```tsx
interface TimerProps {
  seconds: number;            // 0-60
  maxSeconds: number;         // 60
  urgencyThresholds: {
    warning: number;          // 15 — amber
    critical: number;         // 5 — red + pulse
  };
  isPaused: boolean;
}

// Circular ring SVG:
// - Green: 60-16s
// - Amber (warning): 15-6s
// - Red + pulse (critical): 5-0s
// - Gray when paused
```

### ScoreReveal

```tsx
interface ScoreRevealProps {
  score: number;              // 1-10
  feedback: string;           // "FIRE 🔥", "SAVAGE", etc.
  playerScore: number;        // this player's cumulative after reveal
  opponentScore: number;
  isLocal: boolean;           // whose score is being revealed
  isVisible: boolean;
  onDismiss: () => void;     // after animation completes (auto 3s)
}

// Full arena overlay with:
// - Feedback text (large, animated)
// - Score number (count-up animation)
// - Running total update
// - Auto-dismiss after 3000ms
```

### RoundTransition

```tsx
interface RoundTransitionProps {
  round: number;
  totalRounds: number;
  localScore: number;
  remoteScore: number;
  isVisible: boolean;
}

// Full-screen overlay between rounds:
// - "ROUND 2" (large, centered)
// - Current match score
// - Auto-dismiss after 2500ms
```

### MatchProgress

```tsx
interface MatchProgressProps {
  totalRounds: number;        // 3 or 5
  completedRounds: number;
  roundResults: ('local' | 'remote' | 'tie')[];
  format: 'best_of_3' | 'best_of_5';
}

// Horizontal bar at top:
// - Dots for each round (filled = completed, outlined = upcoming)
// - Color: purple dot = local won, cyan dot = remote won, gray = pending
// - "Best of 3" or "Best of 5" label
```

### ScoreBoard

```tsx
interface ScoreBoardProps {
  rounds: RoundScore[];
  localTotal: number;
  remoteTotal: number;
  localName: string;
  remoteName: string;
}

interface RoundScore {
  round: number;
  localScore: number;
  remoteScore: number;
  localFeedback: string;
  remoteFeedback: string;
}

// Compact horizontal strip below arena:
// - Each round as a mini-column
// - Current round highlighted
// - Cumulative total on ends
// - Scrolls horizontally on mobile if needed
```

### ConnectionToast

```tsx
interface ConnectionToastProps {
  type: 'reconnecting' | 'reconnected' | 'opponent_reconnecting';
  isVisible: boolean;
}

// Top-right toast notification:
// - Yellow border for reconnecting
// - Green border for reconnected
// - Auto-dismiss after 4s
```

### DisconnectionModal

```tsx
interface DisconnectionModalProps {
  reason: 'opponent_left' | 'network_lost' | 'server_error';
  isVisible: boolean;
  onReturnToLobby: () => void;
  onReconnect?: () => void;
}

// Full-screen overlay:
// - Reason message
// - Return to lobby button
// - Reconnect button (if applicable)
```

---

## 5. Interaction Flow

### Battle Screen State Machine

```
                    ┌──────────────────┐
                    │   MATCHMAKING    │ ← from lobby
                    └────────┬─────────┘
                             │ socket: match_found
                             ▼
                    ┌──────────────────┐
                    │  OPPONENT_FOUND  │ ← show opponent, 3s reveal
                    └────────┬─────────┘
                             │ timeout 3000ms OR socket: battle_started
                             ▼
                    ┌──────────────────┐
                    │   ROUND_START    │ ← show "ROUND 1" overlay 2.5s
                    └────────┬─────────┘
                             │ timeout 2500ms
                             ▼
              ┌──────────────────────────────┐
              │                              │
              │      TURN_ACTIVE             │◄─────────────────┐
              │   (whose turn it is)         │                  │
              │   Timer: 60s countdown       │                  │
              │   Input: enabled/disabled    │                  │
              └───────┬──────────┬───────────┘                  │
                      │          │                              │
           timer=0 OR │          │ socket: roast_sent            │
           send btn   │          │ (local player sends)         │
                      ▼          ▼                              │
              ┌──────────────────┐                              │
              │   ROAST_SENT     │ ← input disabled,            │
              │   "Processing..."│   waiting for Ollama          │
              └────────┬─────────┘                              │
                       │ socket: roast_scored                   │
                       ▼                                        │
              ┌──────────────────┐                              │
              │  SCORE_REVEAL    │ ← 3s overlay showing         │
              │  (Player A)      │   score + feedback            │
              └────────┬─────────┘                              │
                       │ timeout 3000ms                         │
                       ▼                                        │
              ┌──────────────────┐                              │
              │  TURN_SWITCH     │ ← brief transition 500ms     │
              └────────┬─────────┘                              │
                       │                                        │
                       ▼                                        │
         ┌─────────────────────────┐                            │
         │   Is round complete?    │                            │
         │  (both players typed?)  │                            │
         └─────┬───────────┬───────┘                            │
               │YES        │NO                                  │
               ▼           └────────────────────────────────────┘
    ┌──────────────────┐
    │  ROUND_END       │ ← show round result 2s
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Is match over?   │
    │ (best of N won?) │
    └───┬──────────┬───┘
        │YES       │NO
        ▼          ▼
  ┌──────────┐  ┌──────────────────┐
  │ MATCH_END│  │  NEXT_ROUND      │
  │ → Result │  │  → ROUND_START   │
  │   Screen │  │    (next round)  │
  └──────────┘  └──────────────────┘
```

### State Definitions

```typescript
type BattleState =
  | 'matchmaking'
  | 'opponent_found'
  | 'round_start'
  | 'turn_active'
  | 'roast_sent'
  | 'score_reveal'
  | 'turn_switch'
  | 'round_end'
  | 'match_end'
  | 'error'
  | 'disconnected';

interface BattleStateMachine {
  state: BattleState;
  round: number;              // 1-indexed
  turnInRound: number;        // 1 or 2 (who goes first)
  whoseTurn: 'local' | 'remote';
  timer: number;              // seconds remaining
  scores: {
    local: number[];          // per-round scores
    remote: number[];
    localTotal: number;
    remoteTotal: number;
  };
  roundResults: ('local' | 'remote' | 'tie')[];
}
```

### Transition Triggers

| From | To | Trigger | Effect |
|------|----|---------|--------|
| `matchmaking` | `opponent_found` | `socket: match_found` | Show opponent avatar + name |
| `opponent_found` | `round_start` | 3000ms timeout | Show "ROUND N" overlay |
| `round_start` | `turn_active` | 2500ms timeout | Enable/disable input based on whose turn |
| `turn_active` | `roast_sent` | `send` button click OR `timer = 0` | Disable input, emit `roast_sent` |
| `turn_active` | `roast_sent` | `socket: roast_sent` (remote) | Disable input, show "Processing..." |
| `roast_sent` | `score_reveal` | `socket: roast_scored` | Show score overlay 3000ms |
| `score_reveal` | `turn_switch` | 3000ms timeout | Brief transition animation |
| `turn_switch` | `turn_active` | 500ms timeout | Other player's turn begins |
| `score_reveal` | `round_end` | Round complete (both typed) | Show round result |
| `round_end` | `round_start` | 2000ms timeout | Next round, or match_end |
| `round_end` | `match_end` | Match winner decided | Show final result |
| `*` | `disconnected` | `socket: disconnect` | Show disconnect modal |
| `disconnected` | `turn_active` | `socket: reconnect` + rejoin | Resume battle |
| `disconnected` | `matchmaking` | User clicks "Return to Lobby" | Leave battle |

### Socket Event → State Mapping

```
CLIENT EMITS:
  roast_typing       → turn_active (local), debounced 300ms
  roast_sent         → turn_active → roast_sent
  ready_next_round   → round_end → round_start

CLIENT RECEIVES:
  opponent_typing    → turn_active (remote), shows TypingIndicator
  roast_scored       → roast_sent → score_reveal
  round_result       → score_reveal → round_end
  battle_ended       → round_end → match_end
  opponent_disconnected → any → disconnected
```

---

## 6. Animation Spec

### All animations use Framer Motion. Specs below.

### Score Reveal

```tsx
// Overlay fade in
{ opacity: [0, 1], duration: 300ms, ease: "easeOut" }

// Feedback text ("FIRE 🔥") scales in
{
  scale: [0, 1.2, 1],
  opacity: [0, 1],
  duration: 500ms,
  delay: 200ms,
  ease: "backOut"
}

// Score number count-up (1 → 8)
{
  // Use useMotionValue + useTransform for number interpolation
  from: 0, to: score,
  duration: 800ms,
  delay: 400ms,
  ease: "easeOut"
}

// Score number pop at end
{
  scale: [1, 1.5, 1],
  duration: 300ms,
  delay: 1200ms,
}

// Running total slide up
{
  y: [20, 0],
  opacity: [0, 1],
  duration: 400ms,
  delay: 1400ms
}

// Auto-dismiss fade out
{ opacity: [1, 0], duration: 300ms, delay: 2700ms }
// Total visible time: ~3000ms
```

### Turn Transition

```tsx
// "YOUR TURN" slides in from bottom
{
  y: [40, 0],
  opacity: [0, 1],
  scale: [0.9, 1],
  duration: 400ms,
  ease: "easeOut"
}

// Underline grows from center
{
  scaleX: [0, 1],
  duration: 300ms,
  delay: 200ms,
  ease: "easeOut"
}

// Previous turn indicator slides out upward
{
  y: [0, -40],
  opacity: [1, 0],
  duration: 300ms,
  ease: "easeIn"
}
```

### Round Transition

```tsx
// Full-screen overlay fade in
{ opacity: [0, 1], duration: 400ms, ease: "easeOut" }

// "ROUND 2" text spring in
{
  scale: [0.3, 1],
  opacity: [0, 1],
  duration: 600ms,
  delay: 200ms,
  type: "spring",
  stiffness: 200,
  damping: 15
}

// Score summary fade in below
{
  y: [30, 0],
  opacity: [0, 1],
  duration: 500ms,
  delay: 600ms
}

// Auto-dismiss
{ opacity: [1, 0], duration: 400ms, delay: 2100ms }
// Total: ~2500ms
```

### Typing Indicator

```tsx
// Three dots with staggered bounce
// Each dot:
{
  y: [0, -8, 0],
  opacity: [0.4, 1, 0.4],
  duration: 600ms,
  repeat: Infinity,
  repeatType: "loop",
  ease: "easeInOut"
}

// Stagger: each dot delayed by 150ms
// Dot 1: delay 0ms
// Dot 2: delay 150ms
// Dot 3: delay 300ms

// Container entrance
{
  scale: [0.8, 1],
  opacity: [0, 1],
  duration: 250ms,
  ease: "easeOut"
}
```

### Timer Urgency States

```tsx
// Normal (16-60s): No animation, static ring

// Warning (15-6s): Amber color, subtle pulse
{
  scale: [1, 1.03, 1],
  duration: 1000ms,
  repeat: Infinity,
  ease: "easeInOut"
}
// Ring color transitions: cyan → amber (#f59e0b)

// Critical (5-0s): Red, fast pulse + shake
{
  scale: [1, 1.08, 1],
  duration: 500ms,
  repeat: Infinity,
}

// Shake (at 3s remaining):
{
  x: [-2, 2, -2, 2, 0],
  duration: 200ms,
  repeat: Infinity,
}
// Ring color: red (#ef4444)

// Timer hit 0:
{
  scale: [1, 1.3, 0.9, 1],
  opacity: [1, 0.8, 1],
  duration: 400ms
}
```

### Avatar Entrance

```tsx
// On opponent_found, both avatars scale in
// Local player (right): slide from right
{
  x: [60, 0],
  opacity: [0, 1],
  duration: 500ms,
  ease: "easeOut"
}

// Remote player (left): slide from left
{
  x: [-60, 0],
  opacity: [0, 1],
  duration: 500ms,
  ease: "easeOut"
}

// VS text pops in center
{
  scale: [0, 1.3, 1],
  opacity: [0, 1],
  duration: 400ms,
  delay: 300ms,
  type: "spring"
}
```

### Round End Celebration (winner of round)

```tsx
// Winner avatar glow pulse
{
  boxShadow: [
    "0 0 0px rgba(124, 58, 237, 0)",
    "0 0 30px rgba(124, 58, 237, 0.6)",
    "0 0 0px rgba(124, 58, 237, 0)"
  ],
  duration: 1200ms,
  repeat: 2
}

// Loser avatar slight dim
{
  opacity: [1, 0.6, 1],
  duration: 1500ms
}

// Confetti particles for round winner (if score > 7)
// Use Framer Motion's AnimatePresence with exit animations
```

### Match End Celebration

```tsx
// Winner screen entrance
{
  opacity: [0, 1],
  duration: 500ms
}

// Winner avatar scale up
{
  scale: [0.5, 1.1, 1],
  duration: 800ms,
  delay: 300ms,
  type: "spring"
}

// "WINNER" text with golden glow
{
  y: [30, 0],
  opacity: [0, 1],
  scale: [0.8, 1],
  duration: 600ms,
  delay: 600ms,
}

// Score summary stagger in
// Each round result slides in with 150ms stagger
```

---

## 7. Visual Hierarchy

### Stage-by-Stage Eye Flow

**Stage: Active Typing (Your Turn)**
```
Priority 1: ████████ RoastInput textarea (bright border, centered)
Priority 2: ██████ Timer ring (pulsing when urgent)
Priority 3: ████ Your avatar + name
Priority 4: ███ Opponent avatar + typing area
Priority 5: ██ Score display
Priority 6: █ Match progress dots
```

**Stage: Score Reveal**
```
Priority 1: ████████ AI Feedback text ("FIRE 🔥") — largest, most contrast
Priority 2: ██████ Score number — gold (#f59e0b), large
Priority 3: ████ Running total — updated scores
Priority 4: ███ Both avatars — dimmed behind overlay
Priority 5: █ Everything else
```

**Stage: Round Transition**
```
Priority 1: ████████ "ROUND N" text — centered, large
Priority 2: ██████ Current match score
Priority 3: ███ Avatars (dimmed)
Priority 4: █ Everything else
```

### Visual Weight Techniques

| Element | Technique | Value |
|---------|-----------|-------|
| Active turn player's panel | Border glow | `box-shadow: 0 0 20px rgba(124,58,237,0.3)` |
| RoastInput focus | Border color + glow | `border: 2px solid #7c3aed; box-shadow: 0 0 15px rgba(124,58,237,0.25)` |
| Score number | Font weight + color | `font-weight: 800; color: #f59e0b` |
| AI feedback | Largest text + animation | `font-size: 2rem; font-weight: 900` |
| Timer warning | Color shift + pulse | `color: #f59e0b → #ef4444; scale animation` |
| Disabled state | Opacity reduction | `opacity: 0.4; pointer-events: none` |
| Winner indicator | Golden glow | `box-shadow: 0 0 30px rgba(245,158,11,0.5)` |
| Match progress active | Filled + slight scale | `transform: scale(1.15); background: #7c3aed` |

---

## 8. Accessibility Requirements

### Color Contrast Ratios (WCAG AA requires 4.5:1 for normal text, 3:1 for large text)

| Text | Background | Ratio | Passes |
|------|-----------|-------|--------|
| `#e2e8f0` (text) on `#0a0a1a` (bg) | 15.4:1 | AA ✓, AAA ✓ |
| `#e2e8f0` on `#1a1a2e` (surface) | 10.8:1 | AA ✓, AAA ✓ |
| `#e2e8f0` on `#16213e` (card) | 8.9:1 | AA ✓, AAA ✓ |
| `#64748b` (muted) on `#0a0a1a` | 4.1:1 | AA large only |
| `#64748b` on `#1a1a2e` | 2.9:1 | FAIL — use `#94a3b8` (5.3:1) instead |
| `#7c3aed` (purple) on `#0a0a1a` | 5.2:1 | AA ✓ |
| `#06b6d4` (cyan) on `#0a0a1a` | 7.4:1 | AA ✓, AAA ✓ |
| `#f59e0b` (gold) on `#0a0a1a` | 8.1:1 | AA ✓, AAA ✓ |
| `#f59e0b` on `#1a1a2e` | 5.7:1 | AA ✓ |
| `#ef4444` (red) on `#0a0a1a` | 4.6:1 | AA ✓ |
| `#22c55e` (green) on `#0a0a1a` | 6.5:1 | AA ✓ |

**Fix required:** Muted text `#64748b` must be bumped to `#94a3b8` on surfaces darker than `#1a1a2e`.

### Focus Management

```
1. On battle start:
   - Focus moves to RoastInput if it's local player's turn
   - Focus trap: Tab cycles within battle room (no escape to page)
   - Skip link: "Skip to roast input" (visible on Tab)

2. On turn change (local player's turn):
   - Focus immediately moves to RoastInput
   - announce("Your turn! Type your roast.") via live region

3. On turn change (opponent's turn):
   - Focus moves to a visually hidden "waiting" element
   - announce("Opponent's turn. Waiting for their roast.")

4. On score reveal:
   - Focus moves to score reveal overlay
   - Trap focus within overlay for 3 seconds

5. On round transition:
   - Focus moves to round transition overlay
   - Auto-release after 2.5 seconds

6. On match end:
   - Focus moves to result screen
   - First focusable element: "Return to Lobby" button
```

### Screen Reader Announcements (ARIA live regions)

```tsx
// Battle announcements container (visually hidden)
<div aria-live="assertive" aria-atomic="true" className="sr-only">
  {announcement}
</div>

// Announcements to make:
"Round 1 of 3. Your turn. Type your roast."
"Your roast sent. Waiting for AI score."
"Score revealed: 8 out of 10. Feedback: FIRE. Your total: 8, opponent's total: 6."
"Opponent is typing their roast."
"Round 2. Your turn."
"Round 1 winner: You. Score 8 to 6."
"Match over. You win! Final score: 24 to 18."
"Connection lost. Attempting to reconnect."
"Opponent disconnected. Match abandoned."
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus between interactive elements (input, send button, progress dots) |
| `Shift+Tab` | Reverse focus order |
| `Enter` | Submit roast (when input focused) |
| `Escape` | Cancel current action (if applicable), or open disconnect menu |
| `Space` | Activate send button |
| `ArrowLeft/Right` | Navigate between ScoreBoard rounds (on mobile) |

### Reduced Motion

```css
/* In tailwind.config.js */
prefersReducedMotion: 'reduce'

/* Animation alternatives when prefers-reduced-motion: reduce */
```

| Animation | Reduced Motion Alternative |
|-----------|--------------------------|
| Score reveal count-up | Instant display of final number |
| Turn transition slide | Instant swap, no motion |
| Round transition scale-in | Instant fade (200ms max) |
| Typing indicator bounce | Static dots (no animation) |
| Timer pulse | Static color, no scale |
| Avatar entrance | Instant appear (100ms opacity only) |
| Score reveal overlay | Instant appear, instant disappear (100ms) |
| Confetti/particles | Hidden entirely |
| Fire effects | Hidden entirely |

```tsx
// Framer Motion global setting
import { MotionConfig } from 'framer-motion';

<MotionConfig reducedMotion="user">
  {/* all motion components respect prefers-reduced-motion */}
</MotionConfig>
```

---

## 9. CSS Design Token Spec

### Tailwind Config Extension

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // Core palette
        bg: {
          DEFAULT: '#0a0a1a',    // main background
          surface: '#1a1a2e',    // elevated surfaces
          card: '#16213e',       // cards, panels
        },
        accent: {
          purple: '#7c3aed',
          'purple-light': '#a78bfa',
          'purple-dark': '#5b21b6',
          cyan: '#06b6d4',
          'cyan-light': '#22d3ee',
          'cyan-dark': '#0891b2',
          gold: '#f59e0b',
          'gold-light': '#fbbf24',
          'gold-dark': '#d97706',
        },
        danger: '#ef4444',
        success: '#22c55e',
        text: {
          DEFAULT: '#e2e8f0',
          muted: '#94a3b8',    // fixed from #64748b for contrast
          dim: '#64748b',      // use only on surfaces > #1a1a2e
        },
        fire: {
          from: '#f97316',
          via: '#ef4444',
          to: '#dc2626',
        },
      },

      // Typography
      fontSize: {
        'battle-xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px — match progress
        'battle-sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px — scores, labels
        'battle-base': ['1rem', { lineHeight: '1.5rem' }],     // 16px — body, input
        'battle-lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px — names
        'battle-xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px — round text
        'battle-2xl': ['2rem', { lineHeight: '2.5rem' }],      // 32px — score reveal
        'battle-3xl': ['2.5rem', { lineHeight: '3rem' }],      // 40px — "ROUND N"
        'battle-score': ['3.5rem', { lineHeight: '1', fontWeight: '800' }], // 56px — score number
      },

      // Spacing
      spacing: {
        'arena': '100%',           // arena width
        'arena-max': '480px',      // arena max-width on desktop
        'panel': '192px',          // player panel width
        'panel-gap': '32px',       // gap between panel and arena
        'timer-size': '64px',      // timer ring diameter
        'timer-size-mobile': '48px',
        'avatar-sm': '72px',
        'avatar-md': '96px',
        'avatar-lg': '128px',
        'avatar-xl': '144px',
      },

      // Shadows
      boxShadow: {
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.3)',
        'glow-purple-lg': '0 0 40px rgba(124, 58, 237, 0.4)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-gold-lg': '0 0 40px rgba(245, 158, 11, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.4)',
        'glow-fire': '0 0 30px rgba(249, 115, 22, 0.4)',
      },

      // Border radius
      borderRadius: {
        'arena': '16px',
        'panel': '12px',
        'input': '12px',
        'button': '10px',
        'toast': '8px',
        'dot': '50%',
      },

      // Transitions
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
        'reveal': '3000ms',       // score reveal duration
        'round-transition': '2500ms',
        'opponent-found': '3000ms',
      },

      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // Z-index scale
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

      // Keyframes for non-Framer Motion elements
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
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      animation: {
        'pulse-warning': 'pulse-warning 1s ease-in-out infinite',
        'pulse-critical': 'pulse-critical 0.5s ease-in-out infinite',
        'shake': 'shake 0.2s ease-in-out infinite',
        'dot-bounce-1': 'dot-bounce 0.6s ease-in-out infinite',
        'dot-bounce-2': 'dot-bounce 0.6s ease-in-out 0.15s infinite',
        'dot-bounce-3': 'dot-bounce 0.6s ease-in-out 0.3s infinite',
        'slide-up': 'slide-up 0.4s ease-out',
      },
    },
  },
};
```

### Utility Classes to Create

```css
/* index.css additions */

/* Score reveal overlay backdrop */
.score-reveal-backdrop {
  @apply fixed inset-0 bg-black/60 backdrop-blur-sm;
}

/* Active turn glow */
.active-turn-glow {
  @apply shadow-glow-purple;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.2); }
  50% { box-shadow: 0 0 30px rgba(124, 58, 237, 0.4); }
}

/* Timer ring */
.timer-ring {
  @apply relative;
}

.timer-ring svg circle {
  transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
}

/* Arena border */
.arena-border {
  @apply border border-bg-surface/50 rounded-arena;
  background: linear-gradient(
    135deg,
    rgba(124, 58, 237, 0.1) 0%,
    rgba(6, 182, 212, 0.05) 50%,
    rgba(245, 158, 11, 0.1) 100%
  );
}

/* Fire effect gradient */
.fire-gradient {
  background: linear-gradient(
    180deg,
    #f97316 0%,
    #ef4444 50%,
    #dc2626 100%
  );
}

/* Score gold shimmer */
.score-shimmer {
  background: linear-gradient(
    90deg,
    #f59e0b 0%,
    #fbbf24 25%,
    #f59e0b 50%,
    #fbbf24 75%,
    #f59e0b 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 10. Error States

### Disconnection Handling

```typescript
interface DisconnectionState {
  reason: 'opponent_left' | 'network_lost' | 'server_error' | 'timeout';
  canReconnect: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number; // 5
  reconnectDelay: number;       // exponential: 1s, 2s, 4s, 8s, 16s
}
```

| Error | Display | Action | Auto-recovery |
|-------|---------|--------|---------------|
| Socket disconnect | Toast: "Connection lost. Reconnecting..." | Auto-reconnect (exponential backoff) | Yes, up to 5 attempts |
| Reconnected | Toast: "Reconnected!" (green, 3s) | Resume battle state | N/A |
| Opponent disconnect | Toast: "Opponent disconnected. Waiting..." | Wait 15s for reconnection | N/A |
| Opponent timeout (15s) | Modal: "Opponent left the battle." | "Return to Lobby" button | No — match voided |
| Server error (500) | Modal: "Something went wrong." | "Return to Lobby" + "Retry" | No |
| Ollama failure | Toast: "AI scoring delayed..." | Wait up to 10s, then fallback score (5) | Partial |
| Network offline | Full-screen overlay: "No internet connection." | "Retry" button | Detects `navigator.onLine` |
| Battle state desync | Auto-refresh from server via REST | `GET /api/battles/:id` on reconnect | Yes |

### Disconnection Flow

```
Socket disconnect detected
  │
  ├── Attempt reconnect (attempt 1)
  │   ├── Success → fetch battle state via REST → resume
  │   └── Fail → wait 1s → attempt 2
  │
  ├── Attempt 2 (wait 2s)
  │   ├── Success → fetch battle state → resume
  │   └── Fail → wait 4s → attempt 3
  │
  ├── Attempt 3 (wait 4s)
  │   ├── Success → fetch battle state → resume
  │   └── Fail → wait 8s → attempt 4
  │
  ├── Attempt 4 (wait 8s)
  │   ├── Success → fetch battle state → resume
  │   └── Fail → wait 16s → attempt 5
  │
  └── Attempt 5 (wait 16s) — FINAL
      ├── Success → fetch battle state → resume
      └── Fail → show DisconnectionModal
                 └── "Return to Lobby" button
                 └── Match status set to "abandoned"
```

### Ollama Failure Handling

```
roast_sent → server calls Ollama
  │
  ├── Ollama responds (1-5s)
  │   └── Normal flow: roast_scored event
  │
  ├── Ollama timeout (10s)
  │   ├── Server retry once (model restart?)
  │   │   ├── Success → normal flow
  │   │   └── Fail → server assigns fallback
  │   │       ├── Score: 5 (middle)
  │   │       ├── Feedback: "MID"
  │   │       └── Client shows: "AI scoring unavailable — default score"
  │   │
  │   └── Client shows toast: "AI scoring delayed..."
  │       └── After 10s: toast updates: "Default score applied"
  │
  └── Ollama crash (connection refused)
      └── Server emits: roast_scored with fallback score
      └── Client: normal flow (score 5, "MID")
```

### Network Offline Detection

```tsx
// In BattleRoom component
useEffect(() => {
  const handleOnline = () => {
    setShowOfflineOverlay(false);
    socket.connect();
  };
  const handleOffline = () => {
    setShowOfflineOverlay(true);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

### Error Toast Styling

```tsx
// ConnectionToast variants
const toastStyles = {
  reconnecting: {
    bg: 'bg-accent-gold/10',
    border: 'border-accent-gold/50',
    text: 'text-accent-gold',
    icon: '⚡',
  },
  reconnected: {
    bg: 'bg-success/10',
    border: 'border-success/50',
    text: 'text-success',
    icon: '✓',
  },
  opponent_reconnecting: {
    bg: 'bg-accent-cyan/10',
    border: 'border-accent-cyan/50',
    text: 'text-accent-cyan',
    icon: '⏳',
  },
  offline: {
    bg: 'bg-danger/10',
    border: 'border-danger/50',
    text: 'text-danger',
    icon: '✕',
  },
};
```

### Battle State Recovery

```typescript
// On reconnect, client fetches authoritative state from server
async function recoverBattleState(battleId: string): Promise<BattleState> {
  const response = await api.get(`/battles/${battleId}/state`);
  const { battle, currentRound, whoseTurn, scores } = response.data;

  // Reconstruct client state from server truth
  return {
    state: 'turn_active', // or appropriate state
    round: currentRound,
    whoseTurn,
    scores,
    timer: calculateRemainingTime(battle.last_action_at),
  };
}

// Timer recovery: server sends last_action_at timestamp
// Client calculates: remaining = 60 - (now - lastActionAt) / 1000
// If remaining < 0, timer shows 0 and auto-submits empty
```

---

## Appendix: Component File Structure

```
client/src/components/battle/
├── BattleRoom.jsx          # Main container, state machine
├── BattleRoom.test.jsx
├── PlayerPanel.jsx         # Avatar + name + score
├── PlayerPanel.test.jsx
├── TurnIndicator.jsx       # "YOUR TURN" / "OPPONENT'S TURN"
├── TypingIndicator.jsx     # Three animated dots
├── RoastInput.jsx          # Textarea + character count
├── RoastInput.test.jsx
├── Timer.jsx               # Circular countdown ring
├── Timer.test.jsx
├── ScoreReveal.jsx         # AI score + feedback overlay
├── ScoreReveal.test.jsx
├── RoundTransition.jsx     # "ROUND N" overlay
├── MatchProgress.jsx       # Round dots at top
├── ScoreBoard.jsx          # Round-by-round scores
├── ConnectionToast.jsx     # Reconnection notifications
├── DisconnectionModal.jsx  # Full-screen error
└── ScoreDisplay.jsx        # Shared score number component
```

---

## Appendix: Socket Event Payloads (Client-Ready)

```typescript
// All event types for battle screen socket handling

interface SocketEvents {
  // Client → Server
  'roast_typing': { battleId: string };
  'roast_sent': { battleId: string; text: string; round: number };
  'ready_next_round': { battleId: string };

  // Server → Client
  'opponent_typing': { battleId: string };
  'roast_scored': {
    battleId: string;
    round: number;
    playerId: string;
    score: number;          // 1-10
    feedback: string;       // "FIRE 🔥", etc.
    playerTotal: number;
    opponentTotal: number;
  };
  'round_result': {
    battleId: string;
    round: number;
    winner: string;         // player ID or 'tie'
    localScore: number;
    remoteScore: number;
  };
  'battle_ended': {
    battleId: string;
    winnerId: string;
    finalScores: { local: number; remote: number };
    stats: {
      rounds: number;
      avgScore: { local: number; remote: number };
      bestRoast: { text: string; score: number; playerId: string };
    };
  };
  'opponent_disconnected': { battleId: string; reason: string };
  'opponent_reconnected': { battleId: string };
  'battle_state_sync': {
    battleId: string;
    state: BattleState;
    round: number;
    whoseTurn: string;
    scores: ScoreState;
    timer: number;
  };
}
```
