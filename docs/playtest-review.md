# Playtest Review — Roast Battle Mechanic

> Reviewer: GameDesigner
> Date: 2026-09-04
> Scope: Implementation vs. GDD spec, tuning recommendations, fun factor analysis

---

## 1. Implementation Fidelity Check

### 1.1 What Matches the GDD

| Spec Element | Status | Notes |
|---|---|---|
| Turn-based 1v1 flow | Match | Sequential turns enforced via `currentTurn` in handlers.js:47 |
| Random first turn | Match | Coin flip in `matchPlayers()` at handlers.js:139 |
| Best-of-3 / Best-of-5 format | Match | Format passed through queue into match |
| 60s turn timer | Match | `TURN_TIME = 60` in RoastInput.jsx:5 |
| Typing indicator to opponent | Match | `roast_typing` / `opponent_typing` events |
| roast_sent -> Ollama -> roast_scored | Match | Pipeline matches GDD section 2.3 |
| Round winner calculation | Match | `finishRound()` at handlers.js:176 |
| Match winner = first to N round wins | Match | `winsNeeded` correct (2 for Bo3, 3 for Bo5) |
| Score reveal animation | Match | Framer Motion spring in ScoreReveal.jsx |
| Score tier colors | Match | `getScoreTier()` in scoring.js |
| Score 1-10 range | Match | Clamped in `parseScore()` at ollama.js:60 |
| Additive scoring across rounds | Match | Round scores stored separately |
| Round result event | Match | `round_result` emitted after each round |
| Battle ended event | Match | Emitted when winsNeeded reached |
| Ollama failure fallback (5 / MID) | Match | catch block at handlers.js:58-59 |
| Parse failure fallback (5 / MID) | Match | Defaults in `parseScore()` at ollama.js:57-58 |
| 3-second score reveal pause | Match | BattleRoom.jsx:32 — 3000ms timeout |

### 1.2 What Differs from GDD

| GDD Spec | Implementation | Severity |
|---|---|---|
| Disconnect grace period (30s) | Server immediately deletes battle on disconnect — no grace period, no timer | **HIGH** |
| Server validates empty text | No server-side text validation at all | **MEDIUM** |
| Server validates max length | No server-side length check | **MEDIUM** |
| Toxic roast -> SCORE: 0, BLOCKED | Only Ollama prompt inference — no server-side regex enforcement | **HIGH** |
| Client-side toxicity pre-check | Not implemented | **MEDIUM** |
| Score reveal pause (3s) THEN turn switch | Turn switches immediately on `roast_scored` — opponent can type while score is still showing | **HIGH** |
| Inter-round pause (3s) | Not implemented — `finishRound` immediately starts next turn | **MEDIUM** |
| "Get Ready" countdown (2s) | Match starts immediately, no countdown | **LOW** |
| `roast_ack` event to sender | Not implemented | **LOW** |
| Typing re-emit every 3000ms | Only emits on first keystroke — typing indicator disappears if user pauses | **LOW** |
| Double-submit idempotency key | Not implemented — same roast can be sent twice | **MEDIUM** |
| Battle state endpoint for reconnection | No `request_battle_state` handler, no REST endpoint | **HIGH** |
| Client reconnect flow | Not implemented | **HIGH** |
| Onboarding tutorial (3-screen) | Not implemented | **LOW** |
| Max roast length 300 chars | Client allows 500 (`maxLength={500}` at RoastInput.jsx:99) | **MEDIUM** |

---

## 2. Tuning Recommendations

### 2.1 GDD [PLACEHOLDER] Values — Final Recommendations

| Parameter | GDD Default | Recommendation | Rationale |
|---|---|---|---|
| Turn timer | 60s | **60s** (keep) | Good balance. 30s too rushed for creative writing; 90s kills tension. Start here, monitor if matches feel slow. |
| Typing indicator interval | 3000ms | **3000ms** (keep, but re-emit) | Frequency is correct. Fix: client must re-emit every 3s while typing continues, not just on first keystroke. |
| Score reveal pause | 3.0s | **3.5s** (slight increase) | Current 3s works but the critical bug is the turn switches during it. After fixing that, 3.5s gives players time to read feedback + opponent roast text. |
| Inter-round pause | 3.0s | **3.0s** (keep) | Need to actually implement this. Between rounds, players need a mental reset. Show "Round N Complete" screen. |
| Ollama timeout | 15000ms | **15000ms** (keep) | llama3.2 3B local. Monitor p99 latency. If cold starts are frequent, bump to 20s. |
| "Get Ready" countdown | 2.0s | **2.0s** (keep) | Cosmetic. Implement when polishing. Low priority. |
| Reconnect grace period | 30s | **20s** (reduce) | 30s is generous. 20s keeps pressure high while being forgiving enough for flaky WiFi. |
| Timer red warning | 10s | **10s** (keep) | Already implemented correctly at RoastInput.jsx:53. |
| Timer pulse | 5s | **5s** (add animation) | GDD says "pulses red at 5s." Current impl has `animate-timer-urgent` at 10s but no pulse at 5s. Add a CSS pulse keyframe. |
| Fallback score | 5 | **5** (keep) | Safety floor. 5 is fair — punishes neither player excessively. |
| Blocked roast score | 0 | **0** (non-negotiable) | Must not be tuned. |

### 2.2 Implementation-Specific Fixes (Not in GDD)

| Issue | Location | Fix |
|---|---|---|
| **maxLength mismatch** | RoastInput.jsx:99 | Change `maxLength={500}` to `maxLength={300}`. Update char counter to show `300` cap. |
| **Min length too low** | RoastInput.jsx:112 | Raise button-disable threshold from 5 to 10 chars. Tooltip: "A real roast needs at least 10 characters." |
| **Turn switches during score reveal** | handlers.js:93-97 | Delay `your_turn` emission by 3s (after score reveal). Add a `setTimeout` or use a server-side state machine with timed transitions. |
| **No server-side text validation** | handlers.js:41-42 | Add: `if (!text || text.trim().length < 1 \|\| text.length > 300) return socket.emit('error', { message: 'invalid_roast' })` |
| **No inter-round pause** | handlers.js:210-236 | After emitting `round_result`, delay `your_turn` by 3s. Or: emit `round_result`, then after 3s emit `turn_start` separately. |
| **Disconnect instant delete** | handlers.js:111-121 | Replace immediate `activeBattles.delete()` with a 20s grace period timer. Store timer reference. On reconnect, clear timer. On expiry, then delete + forfeit. |
| **Typing indicator dies mid-sentence** | RoastInput.jsx (not shown) | Add `setInterval` in `onChange` handler that re-emits `roast_typing` every 3000ms while text is non-empty. Clear interval on send or when text becomes empty. |
| **Double-submit vulnerability** | handlers.js:41 | Add a `processedRoasts` Set per battle. Key: `${playerId}-${round}`. Check before processing, add after. |

---

## 3. Fun Factor Analysis

### 3.1 What Is Working

**The core tension loop is solid.** The `MATCH -> TYPING -> SCORING -> TURN SWITCH` sequence creates genuine anticipation. Specific wins:

- **Typing indicator as pressure tool**: The "Opponent is cooking..." message (TypingIndicator.jsx:27) with bouncing dots is the single best tension mechanic. It transforms a typing wait into a primal "something is coming at me" moment. This is the heartbeat of the game.

- **Score slam animation**: ScoreReveal.jsx uses spring physics (`stiffness: 300, damping: 20`) for the score number and a delayed spring for the feedback text. This creates a satisfying "thud" feel. A high score landing feels earned.

- **Timer pressure arc**: The color shift from cyan -> gold -> red (RoastInput.jsx:53-55) as time runs down creates natural urgency. Players will feel the "write something NOW" panic in the last 10 seconds — which produces both desperation roasts and clutch moments.

- **Additive scoring**: By making scores cumulative across rounds, every roast matters. A player down 0-1 in round wins can still make a comeback with killer roasts. This avoids the "I already lost this round" apathy.

- **Simple input -> complex output**: The player types one thing. An AI scores it. Two numbers determine everything. The simplicity of the input makes it accessible; the AI scoring makes every roast feel like it matters.

- **PlayerPanel glow on active turn**: The `bg-bg-card shadow-glow-purple border` on the active player (PlayerPanel.jsx:8) creates a clear visual "hot seat" — you know exactly whose turn it is without reading text.

### 3.2 What Needs Adjustment

**1. Turn Switch Timing is Broken (Critical)**

The biggest fun-killer right now: the opponent's input activates while the score is still showing. The GDD specifies a 3-second "absorb the damage" window where both players see the score with no interactivity. Right now, handlers.js:93-97 switches the turn immediately after scoring. This means:
- Player A gets scored, score slams in
- Player B's input immediately activates
- Player A hasn't even processed the score yet
- The emotional arc is truncated

**Fix**: Server must hold turn switch for 3 seconds after `roast_scored`. This is the single highest-impact fix.

**2. No Inter-Round Breathing Room**

When a round ends, `finishRound()` immediately emits `round_result` which sets up the next turn. The GDD calls for a 3-second inter-round pause where both players see "Round N Complete" and their updated round win tally. Without this, rounds blur together and the match feels like one long stream of roasts rather than distinct bouts.

**3. Disconnect Handling Kills Fairness**

A player refreshing their browser instantly loses the match. The GDD's 30s grace period exists because browser refreshes, network blips, and tab-switches are normal. The current implementation is hostile to real-world usage. This will be the #1 complaint.

**4. Scoring Feels Inconsistent (Potential)**

The Ollama prompt asks for "two word reaction" but the feedback word list in the prompt includes single words ("FIRE", "WEAK") and multi-word phrases ("OK I GUESS"). The `parseScore` function captures the full line after "FEEDBACK:" which means some responses will be one word, some two. This inconsistency may feel unpolished. **Recommend**: constrain the prompt to strictly enforce 1-2 words and add a post-processing step that truncates to 2 words max.

**5. Missing Feedback tiers**

The GDD spec defines specific visual treatments for feedback words (section 7.4): "FIRE" gets fire emoji and particle effects, "DESTROYED" gets cracked screen overlay, "BLOCKED" gets skull icon. The current ScoreReveal.jsx just displays the text in the tier color. None of the special effects are implemented. This removes a huge amount of personality from the AI judge.

### 3.3 What Would Make It More Fun

| Idea | Impact | Effort |
|---|---|---|
| **Opponent roast text reveal during score pause** | HIGH | LOW — just show the text in ScoreReveal after scoring |
| **"YOUR TURN" / "OPPONENT'S TURN" banners** | MEDIUM | LOW — a simple motion banner at the top of the input area |
| **Roast text display in ScoreReveal** | HIGH | LOW — the opponent's roast text should appear alongside the score so the waiting player finally sees what was said |
| **Sound effects on score tiers** | MEDIUM | MEDIUM — a "slam" sound for 8+, a "whomp" for 1-3 |
| **Live score total updating mid-round** | MEDIUM | LOW — show running total so players feel the cumulative pressure |
| **Round win celebration animation** | MEDIUM | LOW — confetti or flash when you win a round |
| **Timer urgency escalation** | LOW | LOW — screen edge vignette effect at 10s remaining |

---

## 4. Identified Issues and Bugs

### 4.1 Critical Bugs

| Bug | Location | Description |
|---|---|---|
| **Turn activates during score reveal** | handlers.js:93-97 | `your_turn` / `opponents_turn` emitted immediately after `roast_scored`. Opponent can type while score animation plays. Breaks emotional arc. |
| **No server-side input validation** | handlers.js:41-42 | Server accepts any text of any length. A malicious client can send empty strings, 10,000-char roasts, or non-text content. |
| **Disconnect = instant forfeit** | handlers.js:111-121 | No grace period. Browser refresh = automatic loss. The `activeBattles.delete()` on line 118 destroys all state. |
| **Ollama failure fallback sends wrong feedback** | handlers.js:59 | Fallback is `{ score: 5, feedback: 'MID' }` but the GDD says `{ score: 5, feedback: 'NO SIGNAL' }` for timeouts. 'MID' is the parse-fallback, not the timeout-fallback. Currently both paths use the same catch block. |

### 4.2 Medium Bugs

| Bug | Location | Description |
|---|---|---|
| **maxLength inconsistency** | RoastInput.jsx:99 | Client allows 500 chars but GDD specifies 300. Server has no max length check either. |
| **roast_scored missing text field** | handlers.js:82-91 | GDD contract says `roast_scored` includes `{ score, feedback, playerId, text }`. Implementation omits the `text` field. Opponent never sees what the roast actually said. |
| **No turn state validation** | handlers.js:41-47 | Server checks `battle.currentTurn !== player.userId` but emits no error back to the client. Out-of-turn submission is silently ignored. Client has no way to know it was rejected. |
| **Timer auto-submits on expiry** | RoastInput.jsx:28-29 | When timer hits 0, `handleSubmit()` fires. But if text is empty (nothing typed), the `handleSubmit` guard `if (!text.trim())` silently returns — the player just sits with 0:00 and no feedback that their turn ended. Server never knows the turn timed out. |
| **ScoreBoard round dots logic** | ScoreBoard.jsx:25 | The condition `i < opponentRoundWins + (totalRounds - winsNeeded)` for opponent dots is wrong. If opponent has 1 win in Bo3, it shows dots at indices beyond actual wins. |
| **Battle id stored as `battleId` not `id`** | handlers.js:153 vs useBattle.js:14 | Server creates `battle.id = battleId` (line 138), emits as `battleId` in match_found (line 161), but `activeBattles` uses the same `battleId` as the Map key. Meanwhile `battle.players[0].roundWins` is never initialized — first access at line 183 does `(battle.players[roundWinner].roundWins \|\| 0) + 1` which works but is fragile. |

### 4.3 Low-Severity Issues

| Bug | Location | Description |
|---|---|---|
| **Timer runs on re-render** | RoastInput.jsx:22-36 | `useEffect` dependencies `[isMyTurn, submitted]` can cause double interval setup if React re-renders. `clearInterval` in the return helps, but a stale closure in `handleSubmit` (called from setInterval) could reference old `text` state. |
| **`handleKeyDown` doesn't check `submitted`** | RoastInput.jsx:46-51 | Enter key can call `handleSubmit()` even after submission. The guard inside `handleSubmit` catches it, but it's a wasted call. |
| **No error feedback to client** | handlers.js:41-47 | When server rejects a roast (wrong turn, invalid text), client receives no event. UI stays in a confusing state. |
| **TypingIndicator position** | BattleRoom.jsx:82 | TypingIndicator renders inside the `!opponentTyping` conditional block on line 84 — but it actually renders at line 82 OUTSIDE that block. The `{!opponentTyping && <RoastInput>}` wraps only RoastInput. This is correct but the indentation makes it look like TypingIndicator is conditionally hidden when it isn't. |

---

## 5. Recommended Next Iterations

### Iteration 1: Fix Critical Bugs (Do First)

Priority order:

1. **Delay turn switch by 3s** — In `handlers.js`, after emitting `roast_scored`, wrap the turn-switch logic (lines 93-97) in a `setTimeout(() => { ... }, 3000)`. This preserves the score reveal emotional arc.

2. **Add server-side text validation** — Check `text.trim().length >= 1 && text.length <= 300` before processing. Emit `roast_error` event with reason on failure.

3. **Fix disconnect grace period** — Replace `activeBattles.delete()` with a 20s timer. Store `disconnectTimer` on the battle object. On socket reconnect within window, clear timer and restore state.

4. **Add `text` field to `roast_scored`** — Include the roast text in the emitted event so opponents actually see what was said.

5. **Differentiate timeout vs parse fallback** — Use `{ score: 5, feedback: 'NO SIGNAL' }` for Ollama timeout, `{ score: 5, feedback: 'MID' }` for parse failure.

### Iteration 2: Polish Core Loop

1. **Inter-round pause** — After `finishRound`, delay next turn by 3s. Show round result screen.
2. **Align maxLength to 300** — Fix client `maxLength` and add server validation.
3. **Typing re-emit on interval** — While typing, re-emit `roast_typing` every 3000ms.
4. **Double-submit protection** — Add idempotency key per battle+round+player.
5. **Score reveal shows opponent roast text** — Add `text` to ScoreReveal component.

### Iteration 3: Fun Features

1. **"YOUR TURN" / "OPPONENT'S TURN" banners** with color coding
2. **Feedback-specific visual effects** (fire particles for "FIRE", screen shake for 10s)
3. **Round win celebration** animation
4. **Timer urgency vignette** at 10s remaining
5. **"Get Ready" countdown** before match starts

### Iteration 4: Safety and Robustness

1. **Server-side toxicity regex** — Implement the GDD's slur/doxxing/family-attack filter. This is non-negotiable for launch.
2. **Reconnection flow** — Client fetches battle state on reconnect, reconstructs UI.
3. **Battle state REST endpoint** — `GET /api/battles/:id/state` for page refresh recovery.
4. **Ollama timeout enforcement** — Add 15s `AbortController` wrapper around the Ollama call.

---

*Document version: 1.0*
*Status: Ready for engineering review*
*Next action: Prioritize Iteration 1 fixes — especially turn switch delay and disconnect grace period*
