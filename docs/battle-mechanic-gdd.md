# Battle Mechanic — Game Design Document

> ATE Real-Time 1v1 Roast Battle Platform
> Scope: Core roast battle mechanic only. No cosmetics, avatars, leaderboards, or auth.

---

## 1. Core Loop

The moment-to-moment experience every player has:

```
MATCH → TENSION (opponent typing) → RELEASE (roast lands) → SCORE DROP → TURN SWITCH → REPEAT → MATCH RESULT
```

**What the active player sees and feels:**
- Their roast input field pulses with a border glow. Timer counts down from 60s.
- As they type, a typing indicator fires to the opponent — creating social pressure.
- On send, a 2-second loading animation plays ("Scoring your roast...").
- Score + feedback appear with a slam animation. A high score feels earned. A low score stings.

**What the waiting player sees and feels:**
- A pulsing "typing indicator" dot cluster near the opponent's avatar — the opponent is cooking.
- They cannot interact. This idle tension is intentional: they're anticipating what's coming.
- When the opponent's roast is scored, they see the score + feedback.
- After a 3s pause, their own input activates — now it's their turn to respond.

**Emotional arc per round:**
- Phase 1 (Opponent's turn): Anticipation + anxiety
- Phase 2 (Score reveal): Reaction + comparison
- Phase 3 (Your turn): Pressure + creative focus
- Phase 4 (Your score reveal): Payoff + rivalry

---

## 2. Mechanic Specification

### 2.1 Inputs

| Input | Source | Format | Constraints |
|-------|--------|--------|-------------|
| Roast text | Player (keyboard) | String | 1-300 characters, no leading/trailing whitespace, trimmed before submission |
| Send action | Player (button click or Enter key) | Event | Only enabled when: turn is active, timer > 0, text length > 0 |
| Format preference | Player (pre-match lobby) | `best_of_3` or `best_of_5` | Selected before matchmaking, cannot change mid-match |

### 2.2 Outputs

| Output | Destination | Format | Timing |
|--------|-------------|--------|--------|
| Typing indicator | Opponent client | Socket event `opponent_typing` | Fires on first keystroke, re-fires every [PLACEHOLDER: 3000ms] while typing continues |
| Roast submitted | Server | Socket event `roast_sent` with `{ battleId, text, round }` | On send click / Enter key |
| Score result | Both clients | Socket event `roast_scored` with `{ score, feedback, playerId, round }` | After Ollama response |
| Round result | Both clients | Socket event `round_result` with `{ round, winner, scores }` | After both players have been scored in the round |
| Match result | Both clients | Socket event `battle_ended` with `{ winnerId, finalScores, stats }` | After final round winner determined |

### 2.3 Server-Side Processing Pipeline

```
roast_sent received
  → Validate: battle exists, sender is participant, it's sender's turn, text length 1-300
  → Toxicity pre-check (client-side regex + server-side regex)
  → Store roast in DB (status: "pending")
  → Emit roast_ack to sender (confirms receipt)
  → Send text to Ollama scoring service
  → Parse Ollama response (score: 1-10, feedback: string)
  → If parse fails: default to score 5, feedback "MID"
  → Update roast record in DB with score + feedback
  → Emit roast_scored to both clients
  → Switch active turn to opponent
  → If both players scored in this round: emit round_result
  → If match decided: emit battle_ended
```

---

## 3. Turn Flow — Exact Event Sequence

### 3.1 Match Initialization

```
T+0.0s   Server matches two players
         → Creates battle record (status: "active", current_round: 1)
         → Server decides turn order: random coin flip
         → Emits match_found to both clients with { opponent, firstTurn }
         → Clients transition to BattleRoom screen
         → 2-second "Get Ready..." countdown animation
T+2.0s   First player's turn begins
```

### 3.2 Single Turn Sequence

```
T+0.0s   Turn starts
         → Server emits turn_start to active player: { turnTimer: 60 }
         → Server emits opponent_typing_wait to waiting player
         → Active player's input field focuses
         → 60-second countdown timer begins (client-side, server validates)

T+0.0s   Active player begins typing
         → Client emits roast_typing on first keystroke
         → Client re-emits roast_typing every [PLACEHOLDER: 3000ms] if still typing
         → Waiting player sees animated typing dots near opponent avatar

T+X.Xs   Active player sends roast (before timer expires)
         → Client disables input field
         → Client emits roast_sent: { battleId, text, round }
         → Client shows "Scoring..." loading state

T+X.Xs   Server receives roast_sent
         → Validates (see §2.3)
         → Calls Ollama scoring service
         → [Ollama latency: typically 2-5s, timeout at [PLACEHOLDER: 15000ms]]

T+Y.Ys   Server receives Ollama score
         → Emits roast_scored to BOTH clients: { score, feedback, playerId, text }
         → Both clients display score with animation

T+Y.Ys+3.0s   Result pause
         → 3-second cooldown — both players see the score, absorb it
         → No input is active during this window
         → Screen shows opponent's roast text (finally revealed)

T+Y.Ys+3.0s   Turn switches
         → If both players have been scored this round: emit round_result
         → Otherwise: next player's turn begins (new T+0.0s)
```

### 3.3 Round Sequence

```
Round N begins:
  → Server emits round_start: { round: N, totalRounds: 3|5 }
  → Player A's turn (60s timer)
  → Score reveal + 3s pause
  → Player B's turn (60s timer)
  → Score reveal + 3s pause
  → Server calculates round winner
  → Server emits round_result: { round: N, player1RoundScore, player2RoundScore, roundWinner }
  → 3-second inter-round pause (both players see "Round N Complete")
  → If match not over: next round begins
  → If match over: battle_ended emitted
```

### 3.4 Timing Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| Turn timer | [PLACEHOLDER: 60s] | Long enough for thoughtful roasts, short enough to maintain pace. 30s feels rushed for creative output; 90s kills momentum. |
| Typing indicator interval | [PLACEHOLDER: 3000ms] | Frequent enough to feel alive, not so frequent it floods the socket. |
| Score reveal pause | [PLACEHOLDER: 3.0s] | Enough time to read score + feedback + opponent's roast text. Less feels abrupt; more kills momentum. |
| Inter-round pause | [PLACEHOLDER: 3.0s] | Consistent with score reveal. Lets players reset mentally. |
| Ollama timeout | [PLACEHOLDER: 15000ms] | llama3.2 3B runs locally — typically responds in 2-5s. 15s covers worst-case cold start + long roast. |
| "Get Ready" countdown | [PLACEHOLDER: 2.0s] | Just long enough to register the match, see opponent avatar, not so long it bores. |
| Reconnect grace period | [PLACEHOLDER: 30s] | Player can reconnect within 30s without forfeit. |
| Empty input submission | Blocked client-side | Zero-length string cannot be sent. |

---

## 4. Scoring Rules

### 4.1 Score Calculation

- Each roast receives a score of **1-10** from Ollama.
- Scores are **additive** across all rounds. No multipliers, no diminishing returns.
- **Total match score** = sum of all individual roast scores for that player.

### 4.2 Round Winner Determination

```
Round winner = player with higher combined score from their roast + opponent's roast
  - Player A's round score = score Player A received for their roast
  - Player B's round score = score Player B received for their roast
  - Higher round score wins the round
  - If tied: round is a draw, neither player earns a round win
```

### 4.3 Match Winner Determination

| Format | Win condition |
|--------|---------------|
| Best of 3 | First to 2 round wins. If 1-1 after 2 rounds, round 3 is decisive. |
| Best of 5 | First to 3 round wins. If 2-2 after 4 rounds, round 5 is decisive. |

**Overall match score** (displayed for stats) = sum of all roast scores across all rounds.

### 4.4 Tie-Breaking

| Scenario | Resolution |
|----------|------------|
| Round tie (equal scores) | Round is a draw. No round win awarded to either player. |
| Match tie (e.g., 1-1 in Bo3 after all rounds) | **Sudden death round**: one additional round, first to score higher wins. |
| Sudden death tie | Repeat sudden death until a round is won. |
| Player disconnects mid-round | See §5.1 |

### 4.5 Toxic Roast Handling

- Toxicity detected by **server-side regex** (slurs, doxxing patterns, family-attack phrases).
- If toxic: roast is scored **SCORE: 0**, **FEEDBACK: BLOCKED**.
- The roast text is **NOT revealed** to the opponent (replaced with "[BLOCKED — Toxic content]").
- The toxic roast still counts as the player's turn — they cannot re-attempt.
- A player who receives 2 BLOCKED roasts in a single match triggers a **warning**.
- A player who receives 3+ BLOCKED roasts in a match: server force-ends the match, flags the account.

---

## 5. Edge Cases

### 5.1 Player Disconnects Mid-Round

```
Disconnect detected via Socket.io disconnect event:
  → Server starts 30s grace period timer
  → Opponent sees: "Opponent disconnected. Waiting [30s countdown]..."
  → If reconnects within 30s:
      → Rejoin battle, turn resumes where it left off (timer paused during disconnect)
      → Emit battle_resumed to both
  → If 30s elapses with no reconnect:
      → Server marks battle status = "abandoned"
      → Disconnected player = forfeit (loses the round)
      → Remaining player wins the match by default
      → Emit battle_ended: { winner, reason: "opponent_disconnected" }
```

**Sub-cases:**

| Disconnect timing | Action |
|-------------------|--------|
| During active player's turn | Timer pauses. On reconnect, timer resumes from remaining time. |
| During waiting player's turn | No impact — waiting player's timer hasn't started. |
| During score reveal pause | Pause continues. Reconnecting player catches up on result display. |
| During inter-round pause | Pause continues normally. |
| Both players disconnect simultaneously | Both get 30s. If both fail to reconnect: match is voided, no stats recorded. |

### 5.2 Both Players Type Simultaneously

**This cannot happen by design.** Turns are strictly sequential. Only one player's input is active at a time. The waiting player's input field is disabled and visually locked.

If a client-side bug sends `roast_sent` out of turn:
- Server rejects: `{ error: "not_your_turn" }`
- Client receives rejection and re-enables correct state

### 5.3 Ollama Times Out

```
If Ollama does not respond within [PLACEHOLDER: 15000ms]:
  → Server emits roast_scored with fallback:
      score: 5
      feedback: "NO SIGNAL"
  → Roast text is still displayed to opponent
  → This roast still counts — player gets 5 points as a safety floor
  → Server logs timeout for Ollama health monitoring
```

### 5.4 Ollama Returns Malformed Response

```
If parseScore() fails to extract SCORE or FEEDBACK from Ollama output:
  → Default: score = 5, feedback = "MID"
  → Server logs the raw response for debugging
  → No retry — keep the game moving
```

### 5.5 Player Submits Empty Text

**Blocked client-side:**
- Send button is disabled when input length === 0.
- Enter key does not trigger send when input is empty.
- Client never emits `roast_sent` with empty text.

**If it somehow reaches server:**
- Server validates `text.trim().length > 0`
- Rejects with `{ error: "empty_roast" }`

### 5.6 Player Submits Toxic Text

**Two layers of defense:**

1. **Client-side pre-check** (optional, for faster UX): regex filter on key submit. Shows warning: "This roast may be blocked. Are you sure?" with Confirm/Cancel. If confirmed, sends anyway.

2. **Server-side enforcement** (authoritative): regex checks against slur list + doxxing patterns + family attack phrases. If flagged:
   - Roast is stored with `toxic: true` flag
   - Score = 0, feedback = "BLOCKED"
   - Roast text is replaced with "[BLOCKED]" in opponent view
   - Turn advances normally — no re-attempt

### 5.7 Network Lag / Packet Loss

```
Scenario: Client sends roast_sent, server never receives it
  → Client shows "Scoring..." indefinitely
  → After [PLACEHOLDER: 20000ms] with no roast_scored response:
      → Client shows "Connection issue. Retrying..."
      → Client re-emits roast_sent with same text
      → If server already processed it (idempotency via battleId + round + playerId):
          → Server re-emits roast_scored (no duplicate processing)
      → If server never received first attempt:
          → Server processes normally

Scenario: Server emits roast_scored, client never receives it
  → Client is stuck on "Scoring..."
  → After timeout: client emits request_score: { battleId, round }
  → Server re-emits latest score state for that round
```

### 5.8 Player Refreshes Browser Mid-Match

```
  → Socket.io connection drops → triggers disconnect flow (§5.1)
  → Client fetches battle state from server on reload: GET /api/battles/:id/state
  → Server returns: { round, turn, scores, status, roasts[] }
  → Client reconstructs BattleRoom state from server response
  → If within grace period: rejoin seamlessly
  → If past grace period: match already forfeited
```

---

## 6. Failure States

| Failure | Detection | Response | Player-facing message |
|---------|-----------|----------|----------------------|
| Ollama timeout | 15s no response | Fallback score 5 | "NO SIGNAL" feedback |
| Ollama parse error | Regex fails | Fallback score 5 | "MID" feedback |
| Socket disconnect | `disconnect` event | 30s grace period | "Opponent disconnected. Waiting..." |
| Grace period expired | 30s timer | Forfeit | "Opponent left. You win!" |
| Out-of-turn submission | Server validation | Reject event | Client re-syncs state |
| Empty roast | Client + server validation | Reject event | Send button stays disabled |
| Toxic roast | Server regex | Score 0 | "BLOCKED" feedback |
| DB write failure | Catch on INSERT | Log + retry once | Roast accepted client-side, retried server-side |
| Battle state desync | Client state ≠ server state | Client fetches authoritative state | Silent re-sync, no visible glitch |
| Double-submit | Client debounce + idempotency key | Server deduplicates | No visible issue |
| Player A submits, Player B disconnects before seeing it | Disconnect event | Score is stored; B sees it on reconnect | B sees score on rejoin |
| Both players disconnect | Both disconnect events | Both get 30s grace | "Connection lost. Reconnecting..." |
| Server crashes mid-battle | Process exit | Battle status stuck at "active" on restart | On next login, client sees "Match ended" (server reconciles stale battles on boot) |

---

## 7. Player Affordances — UI Elements

### 7.1 Battle Room Layout

```
┌─────────────────────────────────────────────┐
│  ROUND 2 / 5          BO3          SCORES   │
│                                              │
│  ┌──────────┐              ┌──────────┐     │
│  │ PLAYER A │              │ PLAYER B │     │
│  │  AVATAR   │              │  AVATAR   │     │
│  │           │              │           │     │
│  │ Score: 14 │   VS         │ Score: 11 │     │
│  │ Rounds: 1 │              │ Rounds: 0 │     │
│  └──────────┘              └──────────┘     │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │                                         │ │
│  │  [Opponent's roast text — revealed       │ │
│  │   after scoring, or "???" if hidden]     │ │
│  │                                         │ │
│  │  SCORE: 8  FEEDBACK: "SAVAGE"           │ │
│  │                                         │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │  "Your turn to roast!"                  │ │
│  │  ┌─────────────────────────────────┐    │ │
│  │  │ Type your roast here...         │    │ │
│  │  │                                 │    │ │
│  │  └─────────────────────────────────┘    │ │
│  │  [Send Roast]              0:42 left    │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │  ⠋ Opponent is typing...               │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 7.2 UI Element Specification

| Element | Behavior | Visual |
|---------|----------|--------|
| **Round indicator** | Shows "ROUND N / TOTAL" | Text at top, bold, amber color |
| **Format badge** | Shows "BO3" or "BO5" | Small pill badge, top bar |
| **Score displays** | Live-updating per player | Large number, animated on change (Framer Motion scale bounce) |
| **Round wins** | Checkmarks or filled dots per player | Row of dots, filled = round won |
| **Opponent avatar** | Static, decorative | SVG stack, opponent's config |
| **Your avatar** | Static, decorative | SVG stack, your config |
| **Roast text area** | Input field, 1-300 chars | Dark card with purple border, glowing when active |
| **Send button** | Disabled when: empty, not your turn, or timer expired | Purple gradient, opacity shift when disabled |
| **Timer** | Countdown from 60, visual ring + number | Circular progress ring, turns red at [PLACEHOLDER: 10s], pulses red at [PLACEHOLDER: 5s] |
| **Typing indicator** | Shows when opponent is typing | 3 animated bouncing dots near opponent avatar |
| **Score result card** | Slides in from top after Ollama response | Large score number + feedback text, background color by score tier |
| **"Scoring..." state** | Shown after sending, before score reveal | Spinning loader + "Judging your roast..." |
| **Turn indicator** | "YOUR TURN" / "OPPONENT'S TURN" | Bold banner, green for you, red for opponent |

### 7.3 Score Tier Visuals

| Score | Color | Animation |
|-------|-------|-----------|
| 1-3 | `#ef4444` (red) | Subtle shake |
| 4-5 | `#64748b` (gray) | No special animation |
| 6-7 | `#f59e0b` (amber) | Gentle pulse |
| 8-9 | `#f97316` (orange) | Fire particles at edges |
| 10 | `#dc2626` (deep red) | Full screen fire effect, screen shake |

### 7.4 Feedback Badge Styles

| Feedback text | Display |
|---------------|---------|
| "FIRE 🔥" | Orange badge, fire emoji, particle effect |
| "SAVAGE" | Red badge, bold uppercase |
| "DESTROYED" | Deep red badge, cracked screen overlay flash |
| "COOKING" | Amber badge, subtle steam effect |
| "CREATIVE" | Purple badge, sparkle effect |
| "MID" | Gray badge, flat |
| "WEAK" | Red badge, drooping animation |
| "BLOCKED" | Black badge with red border, skull icon |

---

## 8. Fun Factors — What Makes This Exciting

### 8.1 Information Asymmetry (Tension Engine)

The core tension loop is built on **delayed revelation**:
- The waiting player sees their opponent is typing but has **zero visibility** into what's coming.
- The typing indicator creates a primal "something is being aimed at me" feeling.
- When the roast is revealed and scored simultaneously, the payoff hits harder.

**Design principle:** Never show roast text before scoring. The surprise is the fun.

### 8.2 Score Revelation Drama

- Scores don't just appear — they **slam** in. A 9 or 10 hits the screen with screen shake and particles.
- The 3-second pause after scoring is a **micro-drama window**: both players absorb the score, compare it to their own, and feel the pressure shift.
- Feedback words ("SAVAGE", "DESTROYED") add **flavor commentary** that makes the AI feel like a hyped audience.

### 8.3 Comeback Mechanics

- Scores are additive, not percentage-based. This means a player can be **significantly behind** and still catch up with 2-3 great roasts.
- In a Bo5, being down 0-2 doesn't mean elimination — you can win rounds 3, 4, 5 and take the match.
- Sudden death tiebreaker creates maximum tension — one roast decides everything.

### 8.4 Pressure Escalation

- As the timer ticks down, the player feels increasing pressure to deliver.
- The visual timer turns red at [PLACEHOLDER: 10s], creating a "hurry" moment.
- Knowing your opponent is watching the typing indicator adds social pressure — they're waiting for your best shot.

### 8.5 The "Blocked" Roast

- Toxic roasts being blocked and scored at 0 creates a **moral consequence**: try to be edgy, and you're guaranteed to lose that round.
- The "BLOCKED" feedback is the game's voice saying "not here."
- This is a fun deterrent — players see other players get BLOCKED and learn the boundary without being punished themselves.

### 8.6 Round-by-Round Stakes

- In Bo3, every round matters. A 1-1 split means round 3 is winner-take-all.
- In Bo5, the format allows for more dramatic shifts — a player can be "down bad" and stage a comeback.
- Round win indicators (dots) make the progression visual and tangible.

### 8.7 The AI Judge as Character

- The feedback words give Ollama **personality**. It's not just scoring — it's reacting.
- Different feedback for different score tiers makes the AI feel like a hype crowd.
- Players will chase the dopamine of seeing "DESTROYED" or "FIRE 🔥" on their roast.

---

## 9. Onboarding — Learn in <60 Seconds

### 9.1 Pre-Match Tutorial Flow

When a player clicks "Find Battle" for the first time, they see a **3-screen micro-tutorial** before entering the queue:

**Screen 1: "How It Works" (5s auto-advance)**
```
🏆 You'll face off in a roast battle.
📝 You take turns writing roasts.
🤖 An AI judge scores each roast 1-10.
```

**Screen 2: "Your Turn" (5s auto-advance)**
```
⏱ You have 60 seconds to write your roast.
📱 Your opponent sees "typing..." but not your text.
✅ Hit Send when ready — no edits after sending.
```

**Screen 3: "Winning" (5s auto-advance)**
```
🔥 Highest total score wins.
🏆 Best of 3 or 5 rounds — you choose.
💀 Keep it clean — toxic roasts score 0.
```

**Total onboarding time: 15 seconds.** Then the player enters the queue. They learn the rest by doing.

### 9.2 In-Match Guidance (First Battle Only)

- Round 1: A subtle tooltip points to the input: "Type your roast here (1-300 chars)"
- Round 1: After first score reveal: tooltip explains "This score is added to your total"
- Round 1: If player tries to send empty text: tooltip says "Write something first!"

### 9.3 No Tutorial Required

The mechanic is **simple enough to learn by playing**:
1. See "YOUR TURN" → type something → hit Send
2. See score → wait → watch opponent's turn
3. Repeat until someone wins

If a player loses their first match 0-2, they still understand the mechanic perfectly — they just wrote bad roasts. The system is transparent.

---

## 10. Tunable Values — [PLACEHOLDER] Registry

Every value marked `[PLACEHOLDER]` in this document is intended for post-launch balancing. This table centralizes them for easy reference:

| Parameter | Default Value | Location | Tuning Notes |
|-----------|---------------|----------|--------------|
| Turn timer | 60s | Client + Server validation | Lower = faster matches, higher = more creative output. 30s minimum floor. 120s maximum ceiling. |
| Typing indicator interval | 3000ms | Client emit frequency | Lower = more responsive feel, higher = less socket traffic. |
| Score reveal pause | 3.0s | Server-orchestrated | Lower = faster pace, higher = more drama. |
| Inter-round pause | 3.0s | Server-orchestrated | Same tradeoffs as score reveal pause. |
| Ollama timeout | 15000ms | Server-side | Must exceed worst-case Ollama response time. Monitor p99 latency to tune. |
| "Get Ready" countdown | 2.0s | Client animation | Cosmetic, low priority to tune. |
| Reconnect grace period | 30s | Server timer | Lower = less waiting for opponent, higher = more forgiving for flaky connections. |
| Min roast length | 1 char | Server validation | 1 ensures even short "roasts" count. Could raise to 10 to prevent low-effort. |
| Max roast length | 300 chars | Server validation | 300 ≈ 2-3 sentences. Shorter forces punchiness. Longer allows setups. |
| Timer red warning | 10s remaining | Client visual | When the timer bar turns red. |
| Timer pulse | 5s remaining | Client animation | When the timer starts pulsing. |
| Fallback score (Ollama failure) | 5 | Server fallback | Safety floor. Setting too high punishes the opponent; too low punishes the active player. |
| Blocked roast score | 0 | Server enforcement | Non-negotiable — should not be tuned. |
| Warning threshold (blocked roasts) | 2 per match | Server tracking | Warning sent to player after 2 blocked roasts. |
| Account flag threshold | 3+ per match | Server enforcement | Triggers account review. |
| Max roster per player per match | N/A (1 per turn) | Architectural | Not tunable — one roast per turn by design. |
| Sudden death rounds | Unlimited | Server logic | No cap — play until someone wins a round. |

---

## Appendix A: Socket.io Event Contract

For engineers implementing the battle mechanic:

### Client → Server

```typescript
// Player joins matchmaking
join_queue: { userId: string, format: 'best_of_3' | 'best_of_5' }

// Player exits matchmaking
leave_queue: { userId: string }

// Player is typing (repeated while active)
roast_typing: { battleId: string }

// Player sends roast
roast_sent: { battleId: string, text: string, round: number }

// Player requests current battle state (reconnection)
request_battle_state: { battleId: string }
```

### Server → Client

```typescript
// Match found
match_found: {
  battle: { id: string, format: 'best_of_3' | 'best_of_5', firstTurn: string },
  opponent: { id: string, username: string, avatar: object }
}

// Battle begins (after match_found + countdown)
battle_started: {
  battle: { id: string, format: string, currentRound: number },
  yourTurn: boolean
}

// Opponent is typing
opponent_typing: {}

// Turn begins for you
turn_start: { round: number, turnTimer: number }

// Roast scored (emitted to both)
roast_scored: {
  playerId: string,
  score: number,       // 0-10
  feedback: string,    // e.g. "FIRE 🔥"
  text: string,        // roast text (or "[BLOCKED]")
  round: number,
  totalScores: { player1: number, player2: number }
}

// Round complete
round_result: {
  round: number,
  player1RoundScore: number,
  player2RoundScore: number,
  roundWinner: string | null,  // null = tie
  matchScore: { player1RoundWins: number, player2RoundWins: number }
}

// Battle complete
battle_ended: {
  winnerId: string,
  finalScores: { player1: number, player2: number },
  roundWins: { player1: number, player2: number },
  stats: { totalRoasts: number, avgScore: number, highestRoast: object }
}

// Opponent disconnected
opponent_disconnected: { gracePeriod: number }  // seconds remaining

// Opponent reconnected
opponent_reconnected: {}

// Battle state (for reconnection)
battle_state: {
  battle: object,
  round: number,
  turn: 'player1' | 'player2',
  scores: object,
  roasts: array,
  timer: number
}
```

---

## Appendix B: Scoring Algorithm — Ollama Prompt

````
Score this roast battle response on a scale of 1-10.
Evaluate: creativity, humor, punchline delivery, and savageness.

Return ONLY two lines in this exact format:
SCORE: [number 1-10]
FEEDBACK: [two-word reaction]

Example feedback words:
- 1-3: "WEAK", "TRY HARD", "CRINGE", "WHIFFED"
- 4-5: "MID", "OK I GUESS", "MEDIOCRE"
- 6-7: "CREATIVE", "CLEAN", "COOKING", "FIRE"
- 8-9: "SAVAGE", "DESTROYED", "NO CHILL"
- 10: "LEGENDARY", "GODLIKE", "ABSOLUTE"

Toxicity check: If the roast contains slurs, doxxing, personal attacks about family members,
or threats, return:
SCORE: 0
FEEDBACK: BLOCKED

Do not rate toxic content highly. Humor should be clever, not harmful.

Roast: "${roastText}"
````

---

*Document version: 1.0*
*Last updated: 2026-09-04*
*Author: GameDesigner*
*Status: Ready for engineering review*
