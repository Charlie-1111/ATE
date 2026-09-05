# Battle Room — Comprehensive Test Suite

**System under test:** ATE Battle Room (`client/src/components/battle/*`, `useBattle`, `scoring.js`, `server/socket/handlers.js`, `server/services/ollama.js`)  
**Division:** Testing (Test Automation + Evidence QA + Reality Checker)  
**Mode:** Test cases only — no production code generated  
**Framework target:** Jest/Vitest + React Testing Library + mocked Socket.IO / Ollama  
**Status (execution readiness):** **NEEDS WORK** — no test runner/scripts exist; several priority behaviors are unimplemented or broken in source. Suite below is the acceptance contract.

---

## Reality anchor (do not fantasy-pass)

| Spec / requested behavior | Actual code today |
|---------------------------|-------------------|
| Groq API scoring | **Ollama `llama3.2`** only (`server/services/ollama.js`) |
| `parseSocketMessage()` | **Does not exist** — test as future helper OR map assertions onto `useBattle` listeners |
| Live score-as-typing | **Not implemented** — scores only on `roast_scored` after send |
| API timeout >5s → fallback 5 + “Scoring delayed” UI | Catch → fallback 5 exists; **no timeout race**, **no delayed UI** |
| Reconnecting banner / 3s reconnect / message queue | Socket.IO reconnect config only; **no banner**, **no queue UI** |
| Opponent disconnect → pause 60s → forfeit | **5s** then `opponent_disconnected` → result screen shows **DEFEAT** |
| `formatTimer(60)` → `"60s"` | Actual: **`"1:00"`** (`m:ss`) |
| Urgent red at 5s | Urgent at **`<=10`** (`text-danger animate-timer-urgent`) |
| Max roast length | Client `maxLength={300}`, counter says `/500`, server max **500** |
| Min length | Client + server: **5** chars after trim |
| Typing indicator end-to-end | Server events exist; client **never emits** `roast_typing` |
| Mid-round turn handoff | Server emits `your_turn`; client **does not listen** |
| `roast_error` handling | Server emits; client **ignores** |
| Mobile stacked layout | **Horizontal only** — no `flex-col` breakpoint |
| Project tests | **Zero** battle test files; no `test` script |

**Verdict until gates run green with evidence:** suite document = COMPLETE; execution = BLOCKED on harness + implementation gaps.

---

## Test harness requirements (gates)

Before any case can be marked Pass:

1. Vitest (or Jest) + `@testing-library/react` + `jsdom` in `client/`
2. Server unit tests for `scoreRoast` / `parseScore` / `finishRound` with mocked Ollama
3. Socket.IO client mock (or `socket.io-client` fake)
4. Determinism: fake timers (`vi.useFakeTimers()`), no real network, no wall-clock sleeps
5. Console error/warning spy — fail on unexpected errors
6. Artifacts: failure screenshot (RTL not applicable; Playwright for E2E UI cases), performance metrics logged

**Pass criteria for “suite green”:** Priority tests (P0) all Pass × 10 consecutive runs, zero flakes, zero unexpected console errors.

---

## P0 — Priority gates (MUST PASS)

| ID | Case | Expected | Current risk |
|----|------|----------|--------------|
| P0-1 | Score updates live as typing | Keystroke updates live score UI | **Will fail** — not built |
| P0-2 | Turn switches correctly after roast | After score + delay, opponent’s input enabled | **Will fail** — `your_turn` ignored |
| P0-3 | Socket reconnection | Banner + auto-reconnect + no data loss | **Will fail** — no UI |
| P0-4 | AI timeout handled | Fallback score 5, game not frozen | Partial (catch only) |
| P0-5 | No console errors during happy path | Clean console | Unknown until harness |
| P0-6 | Mobile responsive | Stacked layout, touch targets ≥48px | **Will fail** — no stack |
| P0-7 | Opponent roast real-time | Opponent sees scored roast promptly | Partial via `roast_scored` |

---

# 1. UNIT TESTS

## 1.1 `scoreRoast()` — `server/services/ollama.js`

> Note: Toxicity and format parsing are prompt + `parseScore` regex. Export or test via `scoreRoast` with mocked Ollama client.

```
describe('scoreRoast')
```

| ID | `it(...)` | Arrange | Act | `expect(...)` |
|----|-----------|---------|-----|---------------|
| U-SR-01 | scores a normal roast 1–10 with feedback | Mock Ollama returns `SCORE: 8\nFEEDBACK: FIRE` | `scoreRoast("yo you're trash")` | `score` ∈ [1,10], `feedback` string non-empty; prefer `8` / `FIRE` |
| U-SR-02 | toxicity / slur → score 0 BLOCKED | Mock returns `SCORE: 0\nFEEDBACK: BLOCKED` | score slur-containing text | `{ score: 0, feedback: 'BLOCKED' }` |
| U-SR-03 | timeout / throw → fallback score 5 | Mock rejects / hangs past timeout | `scoreRoast(...)` | Handler path: `{ score: 5, feedback: 'MID' }`; game continues |
| U-SR-04 | empty input rejected | `""` | call scoring path via `roast_sent` | `roast_error` “at least 5 characters”; no Ollama call |
| U-SR-05 | very long input | 5000-char string | client + server | Client: truncated at 300; server: if >500 → `roast_error`; if ≤500 accepted and scored |
| U-SR-06 | parseScore missing SCORE line | `"FEEDBACK: MID"` only | `parseScore` | defaults `score: 5` |
| U-SR-07 | parseScore clamps out of range | `SCORE: 99` | `parseScore` | `score === 10` |
| U-SR-08 | parseScore negative | `SCORE: -3` | `parseScore` | `score === 0` |
| U-SR-09 | malformed AI prose | `"lol idk maybe 7"` | `parseScore` | `{ score: 5, feedback: 'MID' }` |
| U-SR-10 | whitespace-only roast | `"     "` | `roast_sent` | `roast_error`; not scored |

**Error handling:** verify Ollama throw never propagates uncaught to socket; battle stays `active`.

**Performance:** mocked scoring resolves in <50ms in unit tests; integration timeout budget separate (≤3s target, hard fail >5s if timeout implemented).

---

## 1.2 Socket message parsing / handling — `useBattle` listeners

> Spec name `parseSocketMessage()` does not exist. Cases target listener + store behavior as the unit under test. If a parser is added later, move pure JSON cases onto it.

```
describe('battle socket message handling')
```

| ID | `it(...)` | Arrange | Act | `expect(...)` |
|----|-----------|---------|-----|---------------|
| U-SM-01 | valid `roast_scored` updates store | Payload `{ playerId, score, feedback, text }` | emit to listener | `lastRoastResult` matches; typing cleared |
| U-SM-02 | malformed JSON at transport | Invalid payload / non-object | emit | No throw; store unchanged; error logged (once implemented) |
| U-SM-03 | missing fields | `{ score: null }` / no `feedback` | emit | UI shows pending/safe default; no crash |
| U-SM-04 | duplicate `roast_scored` same roast | Same event twice | emit ×2 | Deduped OR idempotent UI (same score, no double round advance) |
| U-SM-05 | valid `match_found` | Full match payload | emit | `status: 'active'`, opponent set, `isMyTurn` from `yourTurn` |
| U-SM-06 | `round_result` advances round cleanly | Wins + nextRound | emit | Round increments; scores for new round reset path |
| U-SM-07 | `battle_ended` | `{ winner: 'me', ... }` | emit | `winner` set; BattleResult path |
| U-SM-08 | `opponent_disconnected` | — | emit | Battle ends; result UI shown (assert copy once UX fixed) |
| U-SM-09 | unhandled `roast_error` | `{ error: '...' }` | emit | **Spec:** surface error to user; **Today:** document FAIL until listener added |
| U-SM-10 | unhandled `your_turn` | — | emit | **Spec:** `isMyTurn === true`; **Today:** FAIL |

---

## 1.3 `calculateRoundWinner()` / match winner — `client/src/lib/scoring.js`

```
describe('calculateRoundWinner')
describe('calculateMatchWinner')
```

| ID | `it(...)` | Input | `expect` |
|----|-----------|-------|----------|
| U-CW-01 | A higher avg/score wins | `calculateRoundWinner(7.2, 6.1)` → note: ints in practice | returns `1` |
| U-CW-02 | B higher | `(6, 8)` | returns `2` |
| U-CW-03 | tie | `(7, 7)` | returns `0` — **spec “first roast wins” NOT in this helper**; assert server tie policy separately (`roundWinner === -1`) |
| U-CW-04 | blocked score 0 loses | `(0, 6)` | returns `2` |
| U-CW-05 | both blocked | `(0, 0)` | returns `0` |
| U-MW-01 | best_of_3 first to 2 | wins `(2, 0)`, format `best_of_3` | returns `1` |
| U-MW-02 | best_of_5 first to 3 | `(3, 1)`, `best_of_5` | returns `1` |
| U-MW-03 | incomplete match | `(1, 1)`, `best_of_3` | returns `0` |

**Server parity:** `finishRound` uses `player1 > player2 ? 0 : player2 > player1 ? 1 : -1` (index winners). Integration cases must assert server emits correct `battle_ended.winner` for both seats.

---

## 1.4 `formatTimer()` — `client/src/lib/scoring.js`

```
describe('formatTimer')
```

| ID | `it(...)` | Input | Actual expected (code) | Spec requested |
|----|-----------|-------|------------------------|----------------|
| U-FT-01 | full minute | `60` | `"1:00"` | `"60s"` — **align product before locking** |
| U-FT-02 | mid | `45` | `"0:45"` | — |
| U-FT-03 | urgent window | `5` | `"0:05"` | `"5s"` |
| U-FT-04 | zero | `0` | `"0:00"` | timer ends |

**Component coupling (`RoastInput`):**

| ID | `it(...)` | Expect |
|----|-----------|--------|
| U-FT-05 | `timeLeft <= 10` applies danger + urgent animation class | class includes `text-danger` |
| U-FT-06 | `timeLeft <= 20` gold | `text-accent-gold` |
| U-FT-07 | timer expires with empty text | `handleSubmit` no-ops; **no** `onSend` — assert (document bug if forfeit required) |
| U-FT-08 | timer expires with valid text | `onSend` called once; `submitted` true |
| U-FT-09 | `aria-live="polite"` + `role="timer"` present | a11y attributes exist |

---

## 1.5 `getScoreTier()`

| ID | Score | Label |
|----|-------|-------|
| U-GT-01 | 9–10 | SAVAGE |
| U-GT-02 | 7–8 | FIRE |
| U-GT-03 | 5–6 | SOLID |
| U-GT-04 | 3–4 | MID |
| U-GT-05 | 0–2 | WEAK |

---

## 1.6 Pure UI unit — `ScoreReveal` / `BattleResult` / `ScoreBoard`

| ID | Case | Expect |
|----|------|--------|
| U-UI-01 | ScoreReveal shows `score/10` + feedback | Visible text |
| U-UI-02 | `isBlocked` true → blocked copy | “Roast blocked — inappropriate content” |
| U-UI-03 | `score === 0` without `isBlocked` | Still shows 0; blocked banner **absent** (gap: server never sets `isBlocked`) |
| U-UI-04 | null score / undefined result | No crash; pending/null guard |
| U-UI-05 | BattleResult `winner === 'me'` | VICTORY |
| U-UI-06 | `winner === 'draw'` | DRAW |
| U-UI-07 | `winner === 'opponent_disconnected'` | Today DEFEAT — **spec:** Waiting/forfeit messaging |
| U-UI-08 | ScoreBoard round dots vs format | best_of_3 → 2 needed visual; best_of_5 → 3 |

---

# 2. INTEGRATION TESTS

```
describe('BattleRoom integration')
```

Mock: Socket.IO + Ollama. Render via `BattlePage` or `BattleRoom` + `useBattle` with fake socket.

| ID | Flow | Steps | Expect |
|----|------|-------|--------|
| I-01 | Real-time opponent visibility | A types → emit typing; B receives `opponent_typing` | B shows TypingIndicator; latency budget <100ms in mock clock |
| I-02 | Send roast → AI score ≤3s | A sends ≥5 chars | `roast_scored` within 3s (fake); ScoreReveal visible |
| I-03 | Live score while typing | A keystrokes | **Spec:** live score UI updates each keystroke — **FAIL today** |
| I-04 | Turn switch after send | A scored → after 3s `your_turn` to B | B `isMyTurn` true, timer resets to 60 — **FAIL today** without listener |
| I-05 | Socket → UI immediate | Emit `roast_scored` | ScoreReveal within one tick; ScoreBoard updates |
| I-06 | Opponent roast while typing | A typing; B’s score arrives | A’s textarea value preserved; no wipe |
| I-07 | Best-of-3 end | Two round wins for A | `battle_ended`; BattleResult winner correct |
| I-08 | Best-of-5 end | Three wins | Same |
| I-09 | Round transition | Both players scored round 1 | `round_result`; round 2 clean; prior wins persisted |
| I-10 | `sendRoast` includes `round` | RoastInput → onSend | **Bug:** only `text` passed — expect FAIL until `currentRound` wired |
| I-11 | Char counter vs maxLength | Type 300 chars | Input stops at 300; counter must not claim 500 capacity incorrectly |
| I-12 | Enter sends; Shift+Enter newline | Key events | Correct behavior |
| I-13 | Score reveal auto-dismiss | After `lastRoastResult` | Visible 3s then dismiss; timers cleared on unmount |

---

# 3. ERROR HANDLING TESTS

## 3.1 Network disconnection

| ID | Case | Expect | Status |
|----|------|--------|--------|
| E-ND-01 | Socket drops | “Reconnecting…” banner | Spec / **missing UI** |
| E-ND-02 | Auto-reconnect ~3s | Connected restored | Partial (Socket.IO) |
| E-ND-03 | Outbound message queue survives disconnect | Queued roast sends after reconnect | Spec / **missing** |
| E-ND-04 | User notified; no silent data loss | Banner + restored battle state | Spec / **missing** |
| E-ND-05 | Listeners cleaned on unmount | No duplicate handlers after remount | Assert `socket.off` in `useBattle` |

## 3.2 API timeout / scoring failure

| ID | Case | Expect |
|----|------|--------|
| E-AT-01 | Ollama throws | Fallback `{5,'MID'}`; `roast_scored` still emitted |
| E-AT-02 | Ollama >5s | Abort → fallback; “Scoring delayed” UI — **timeout UI missing** |
| E-AT-03 | Score never arrives | Resend allowed — **missing**; assert game not frozen (input not permanently disabled without reason) |
| E-AT-04 | Scoring in flight | Optional loading state — **missing**; assert no unhandled rejection |

## 3.3 Invalid input

| ID | Case | Expect |
|----|------|--------|
| E-II-01 | Empty message | Send disabled |
| E-II-02 | `<5` chars | Send disabled; **spec tooltip** “Need 5+ characters” — **tooltip missing** |
| E-II-03 | Only emojis (≥5 graphemes if length counts) | Accepted if `trim().length >= 5` |
| E-II-04 | Only spaces | Rejected (trim empty / <5) |
| E-II-05 | Special characters | Accepted |
| E-II-06 | Server rejects <5 | `roast_error` surfaced — **client ignore = FAIL** |
| E-II-07 | Server rejects >500 | Same |

## 3.4 Opponent disconnects

| ID | Case | Expect | Actual |
|----|------|--------|--------|
| E-OD-01 | Mid-battle disconnect | Pause + “Waiting…” | Immediate end after **5s** |
| E-OD-02 | 60s auto-forfeit | Forfeit after 60s | **5s** grace |
| E-OD-03 | Leave battle CTA | Exit without crash | Only “Back to Home” on result |
| E-OD-04 | No crash | Stable unmount | Assert |

## 3.5 Corrupted data

| ID | Case | Expect |
|----|------|--------|
| E-CD-01 | Missing `avatarConfig` | Fallback avatar (BattleRoom passes `null` for self) |
| E-CD-02 | Score null/undefined | “Pending…” — **spec**; assert no NaN in UI |
| E-CD-03 | Malformed socket event | Logged + ignored; store stable |
| E-CD-04 | No unexpected console errors | Spy clean |

## 3.6 UI edge cases

| ID | Case | Expect |
|----|------|--------|
| E-UE-01 | Roast 300 chars (client max) | Wraps; no overflow of layout |
| E-UE-02 | Timer 1s + send | Score still processes |
| E-UE-03 | Rapid 5 sends / 1s | Only first accepted (`submitted` gate); server wrong-turn ignored |
| E-UE-04 | Browser back | Warning modal — **missing**; document FAIL |
| E-UE-05 | ScoreReveal + opponent typing race | No double-mount crash |

---

# 4. BUG / REGRESSION TESTS

## 4.1 Memory / cleanup

| ID | Case | Expect |
|----|------|--------|
| R-ML-01 | Mount BattleRoom → unmount | Interval cleared (`timerRef`) |
| R-ML-02 | useBattle unmount | All `socket.off` for registered events |
| R-ML-03 | ScoreReveal timeout cleared | No setState after unmount |
| R-ML-04 | Remount does not duplicate listeners | Single handler per event |

## 4.2 Race conditions

| ID | Case | Expect |
|----|------|--------|
| R-RC-01 | Own send + opponent score simultaneous | Both applied; no store corruption |
| R-RC-02 | Score before paint | No crash when result set pre-render |
| R-RC-03 | Rapid score updates | Latest score shown |
| R-RC-04 | Timer tick + submit same ms | Single `onSend` |

## 4.3 State consistency

| ID | Case | Expect |
|----|------|--------|
| R-SC-01 | After round 1 | Wins saved; round 2 timer/input fresh |
| R-SC-02 | Battle history | All roasts in `roundRoasts` server-side |
| R-SC-03 | Avatar stable | Opponent name/avatar unchanged mid-battle |
| R-SC-04 | Scores never go backwards | Monotonic display unless explicit reset on new round |

## 4.4 Known wiring bugs (regression locks)

| ID | Bug | Test locks fix |
|----|-----|----------------|
| R-BUG-01 | `onSend(text)` omits `round` | Payload includes `currentRound` |
| R-BUG-02 | Typing never emitted | `onChange` calls `startTyping` (debounced) |
| R-BUG-03 | `your_turn` ignored | Listener sets `isMyTurn` |
| R-BUG-04 | `roast_error` ignored | Error UI / re-enable send |
| R-BUG-05 | `join()` / connect never called | Socket connected before queue |
| R-BUG-06 | Counter `/500` vs `maxLength={300}` | Numbers agree |

---

# 5. PERFORMANCE TESTS

Use `performance.now()` / Vitest fake timers + Profiler where applicable. Fail if over budget.

| ID | Metric | Budget |
|----|--------|--------|
| P-01 | Keystroke → local state update | <50ms |
| P-02 | Socket message → DOM update | <100ms |
| P-03 | AI score (integration, mocked network) | <3s; hard timeout 5s |
| P-04 | Critical re-render frame | <16ms (no forced sync thrash in test env — soft gate) |
| P-05 | Avatar / PlayerPanel paint | <100ms |
| P-06 | Tab hide/show | No stuck timer; resume correctly |
| P-07 | Typing emit rate | Debounced ≤ ~2–5/s if wired (prevent 60 evt/s) |

---

# 6. CROSS-BROWSER / E2E (Playwright)

| ID | Matrix | Critical path |
|----|--------|---------------|
| X-01 | Chrome latest | Match → roast → score → turn → end |
| X-02 | Firefox latest | Same |
| X-03 | Safari latest | Same |
| X-04 | Mobile Safari | Touch send, keyboard, orientation |

Determinism: seed two users via API/socket test harness; never sleep — wait on `roast_scored` / role text.

---

# 7. MOBILE-SPECIFIC TESTS

| ID | Case | Expect | Status |
|----|------|--------|--------|
| M-01 | Vertical stacked layout | Players stacked on narrow viewport | **FAIL today** |
| M-02 | Touch targets ≥48×48 | Send button hit area | Measure |
| M-03 | Orientation change | Reflow, no clipped input | |
| M-04 | Virtual keyboard | Input remains visible / scrolled into view | |
| M-05 | Scroll vs gameplay | Scroll does not steal turn / accidental send | |

---

# 8. ACCESSIBILITY TESTS

| ID | Case | Expect |
|----|------|--------|
| A-01 | “Your turn” announced | Live region / visible text for SR |
| A-02 | Score updates announced | ScoreReveal / aria-live |
| A-03 | Errors announced | When `roast_error` UI exists |
| A-04 | Tab order | Focusable: textarea → send; Enter sends |
| A-05 | Score quality not color-only | Tier label text (SAVAGE/FIRE/…) + color |
| A-06 | Interactive aria-labels | Textarea `aria-label="Type your roast"`; timer labeled |
| A-07 | Timer `aria-live` | Present (`polite`) |
| A-08 | Reduced motion | Respect `prefers-reduced-motion` (global CSS) |

---

# 9. LOAD / STABILITY TESTS

| ID | Case | Expect |
|----|------|--------|
| L-01 | 100 sequential mocked battles | No monotonic memory growth beyond threshold |
| L-02 | Heap stable after open/close loop | Listeners/timers not retained |
| L-03 | Idle socket 1h | Connection alive or clean reconnect (env soak) |
| L-04 | Network hiccup mid-battle | Reconnect recovers battle — **needs server reconnect fix** |

---

# 10. SECURITY PASS (Testing + Security lens)

Not exploit PoCs — defensive assertions only.

| ID | Case | Expect |
|----|------|--------|
| S-01 | XSS in roast text | Rendered as text; no script execution in ScoreReveal/history |
| S-02 | XSS in feedback string | Same |
| S-03 | Oversized payload | Server rejects >500; client caps 300 |
| S-04 | Wrong-turn roast | Server ignores; no score mutation |
| S-05 | Foreign `battleId` | No score applied to other battles |
| S-06 | Toxicity path | Score 0 BLOCKED; blocked UX when `isBlocked` wired |
| S-07 | No secrets in client | No Ollama host credentials in bundle |
| S-08 | Socket event injection | Unknown events ignored |

---

# 11. EXECUTION TEMPLATE (per case)

```
describe('<area>')
  it('<behavior>')
    // Arrange: mock socket / Ollama / props
    // Act: user event or emit
    // Assert: expect(...)
    // Side checks: console.error not called; timers cleared
```

**Report fields (every run):**

| Field | Value |
|-------|-------|
| Test ID | e.g. P0-2 |
| Pass/Fail | |
| Duration | ms |
| Browser/device | unit / Chrome / iPhone… |
| Screenshot | path (UI/E2E only) |
| Error | message + stack |
| Perf metrics | if applicable |
| Notes | known gap vs spec |

---

# 12. COVERAGE MAP — critical paths

```
Matchmaking → BattleRoom mount → Turn timer → Validate input → roast_sent
  → scoreRoast (Ollama) → roast_scored → ScoreReveal → Turn handoff
  → Opponent roast → round_result → (repeat) → battle_ended → BattleResult
```

**Edge branches:** disconnect, scoring failure, blocked roast, tie round, best_of_5, empty timer expiry, rapid submit, malformed events, mobile viewport, a11y keyboard-only.

**Coverage target for “suite complete”:**

- [x] Unit: scoring helpers + timer format + tiers  
- [x] Unit: socket handler store effects (incl. missing-handler FAIL cases)  
- [x] Integration: send → score → UI  
- [x] Integration: BO3 end-to-end  
- [x] Error: disconnect / timeout / invalid / corrupt  
- [x] Regression: wiring bugs locked  
- [x] Perf budgets defined  
- [x] A11y + mobile + security pass cases defined  
- [ ] Harness installed & suite executable  
- [ ] All P0 green ×10  
- [ ] Evidence pack (screenshots + metrics) attached  

---

# 13. REALITY CHECKER — GATE STATUS

| Gate | Status |
|------|--------|
| Test plan comprehensive | **PASS** (this document) |
| Critical paths listed | **PASS** |
| Edge cases listed | **PASS** |
| Suite runs green & deterministic | **FAIL** — no runner; multiple P0 behaviors absent/broken |
| Security pass executed | **NOT RUN** |
| Production-ready certification | **NEEDS WORK** |

**Next Engineering handoff (out of scope for this Testing-only task):** install Vitest/RTL, implement missing P0 behaviors (or explicitly drop them from product), then execute this suite until P0–P0-7 are green with evidence.

---

## Traceability — requested cases → IDs

| Requested | Mapped IDs |
|-----------|------------|
| scoreRoast normal / toxicity / timeout / empty / long | U-SR-01…05 |
| parseSocketMessage | U-SM-01…10 (via listeners) |
| calculateRoundWinner | U-CW-01…05, U-MW-* |
| formatTimer | U-FT-01…09 |
| Integration 1–7 | I-01…07 |
| Error handling blocks | E-* |
| Bug/regression | R-* |
| Performance | P-01…07 |
| Cross-browser | X-01…04 |
| Mobile | M-01…05 |
| Accessibility | A-01…08 |
| Load | L-01…04 |
| Priority MUST PASS | P0-1…P0-7 |
