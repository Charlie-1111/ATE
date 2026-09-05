# ATE Scoring Economy — Full Specification

> Version: 1.0
> Author: EconomyDesigner
> Status: Pre-launch design spec

---

## 1. Score Distribution Model

### 1.1 Baseline Distribution

The AI (Ollama/llama3.2) scores every roast 1–10. Realistic distribution assumes most players produce average roasts under time pressure, with outliers at both ends.

| Score | Tier        | Expected % | Description                          |
|-------|-------------|------------|--------------------------------------|
| 1     | Garbage     | 2%         | Empty, gibberish, or offensive       |
| 2     | Terrible    | 3%         | No effort, barely a roast            |
| 3     | Bad         | 7%         | Tried but unfunny/weak               |
| 4     | Below Avg   | 12%        | Okay delivery, weak punchline        |
| 5     | Average     | 20%        | Decent roast, nothing special        |
| 6     | Good        | 22%        | Solid, got a laugh                   |
| 7     | Great       | 18%        | Sharp, creative, memorable           |
| 8     | Excellent   | 9%         | Crowd-pleaser, hard to top           |
| 9     | Legendary   | 5%         | Near-perfect delivery                |
| 10    | Godlike     | 2%         | Historic, once-in-a-session          |

**Mean: ~5.8 | Median: 6 | Std Dev: ~1.9**

### 1.2 Distribution Rationale

- **Centered at 5–6**: Under 60-second time pressure, most roasts land in "decent but not amazing." Centering the mean here prevents score inflation.
- **Negative skew allowed**: A 10 should feel special. Only 2% of roasts hitting it keeps the reward meaningful.
- **Tail weights**: Scores 1–3 total 12%, scores 8–10 total 16%. The slight right tilt rewards skill without making everyone feel like they scored well.
- **AI calibration**: llama3.2 temperature 0.7 introduces variance. With temperature tuning, we can shift the curve center ±1 point.

### 1.3 Distribution Guardrails

If live telemetry shows:
- **Mean > 6.5 for 7 days** → AI prompt is too generous. Increase difficulty instructions.
- **Mean < 4.5 for 7 days** → AI prompt is too harsh. Loosen scoring criteria.
- **Std Dev < 1.2** → AI is clustering. Add variance instructions to prompt.
- **Std Dev > 2.5** → AI is polarizing. Tighten scoring rubric.

---

## 2. Round Score Calculation

### 2.1 Single Roast Score

Each roast receives an integer score 1–10 from Ollama.

```
roast_score = clamp(ollama_response.score, 1, 10)
```

**Fallback on failure:**
- If Ollama returns non-numeric or times out (5s limit): `roast_score = 5`
- If Ollama returns outside 1–10: clamp to nearest bound
- Fallback score gets feedback word: `"MID"`

### 2.2 Round Score

A round has two roasts (one from each player). The round score is the sum of both players' individual roast scores.

```
round_score_total = player1_roast_score + player2_roast_score
```

**Range: 2–20 per round.**

### 2.3 Round Winner Determination

```
IF player1_roast_score > player2_roast_score:
    round_winner = player1
    round_points = { player1: +1, player2: 0 }

IF player1_roast_score < player2_roast_score:
    round_winner = player2
    round_points = { player1: 0, player2: +1 }

IF player1_roast_score == player2_roast_score:
    round_winner = TIE
    round_points = { player1: +0.5, player2: +0.5 }
```

**Why 0.5 for ties instead of 1 each:**
- Using +1 each rewards ties the same as wins, which removes incentive to outperform.
- Using +0.5 each keeps ties beneficial but less valuable than a win.
- This means a player who ties all rounds (3 ties in Bo3) gets 1.5 points — less than 2 wins needed to win, creating urgency.

### 2.4 Round Tie on Equal Scores — Deep Tiebreaker

When individual scores are equal, the round is a tie (no further tiebreaker). This is deliberate:
- Both players delivered equivalent quality. Rewarding both equally is fair.
- The match-level tiebreaker (Section 3) handles overall match ties.
- Avoiding subjective tiebreakers keeps the system transparent.

---

## 3. Match Score Calculation

### 3.1 Best of 3 (Bo3)

**Rounds played:** Up to 3 rounds.
**Win condition:** First player to win 2 rounds takes the match.

```
match_points = { player1: 0, player2: 0 }

FOR round in rounds:
    match_points[round_winner] += 1

IF match_points.player1 >= 2:
    match_winner = player1
    early_exit = True  # round 3 skipped if someone leads 2-0
ELSE IF match_points.player2 >= 2:
    match_winner = player2
    early_exit = True
ELSE:
    # All 3 rounds played, no one reached 2
    # Use total cumulative score as tiebreaker
```

**Bo3 Possible Outcomes:**

| Rounds Played | P1 Wins | P2 Wins | Result |
|---------------|---------|---------|--------|
| 2             | 2       | 0       | P1 wins |
| 2             | 0       | 2       | P2 wins |
| 3             | 2       | 1       | P1 wins |
| 3             | 1       | 2       | P2 wins |
| 3             | 1       | 1       | TIE → see 3.3 |
| 3             | 3       | 0       | Impossible (match ends at 2) |
| 3             | 0       | 3       | Impossible (match ends at 2) |

**Wait — 1-1 after 3 rounds is impossible in Bo3.** Let me correct:

In Bo3, you play until someone reaches 2 round-wins or all 3 rounds are complete. If all 3 rounds complete:
- One player has 2 wins, other has 1 (player wins)
- OR both players have 1.5 points (all 3 rounds were ties) → **match tie**

**Match tie scenario (Bo3):** All 3 rounds tied = 1.5–1.5. Use cumulative score tiebreaker (Section 3.3).

### 3.2 Best of 5 (Bo5)

**Rounds played:** Up to 5 rounds.
**Win condition:** First player to win 3 rounds takes the match.

```
IF match_points.player1 >= 3:
    match_winner = player1
ELSE IF match_points.player2 >= 3:
    match_winner = player2
ELSE:
    # All 5 rounds played, no one reached 3
    # Use total cumulative score tiebreaker
```

### 3.3 Match Tie — Cumulative Score Tiebreaker

If all rounds are complete and round-wins are tied (rare — only if all rounds are draws):

```
IF player1_total_roast_score > player2_total_roast_score:
    match_winner = player1
ELSE IF player2_total_roast_score > player1_total_roast_score:
    match_winner = player2
ELSE:
    match_winner = DRAW
```

**Probability of a match draw:** ~0.001% (requires all rounds to be exact ties). Acceptable edge case.

### 3.4 Cumulative Score Calculation (Display Only)

Total cumulative score tracks the sum of all individual roast scores across the match. This is **not used for win determination** except as the final tiebreaker. It serves as:
- The primary display metric during the match ("Current Score: 47–42")
- A "style points" feeling for winning by a large margin
- The tiebreaker when round-wins are even

```
player1_cumulative = SUM(player1_roast_score for each round)
player2_cumulative = SUM(player2_roast_score for each round)
```

---

## 4. Scoring Tiers & Feedback Mapping

### 4.1 Score-to-Feedback Mapping

| Score | Tier          | Feedback Word    | UI Treatment                    | Audio Cue    |
|-------|---------------|------------------|---------------------------------|--------------|
| 1     | Garbage       | WEAK             | Gray text, no animation         | Sad trombone |
| 2     | Terrible      | WEAK             | Gray text, slight shake         | Sad trombone |
| 3     | Bad           | WEAK             | Gray text, slight shake         | Sad trombone |
| 4     | Below Average | MID              | Yellow text, small pop          | Meh sound    |
| 5     | Average       | MID              | Yellow text, small pop          | Meh sound    |
| 6     | Good          | COOKING          | Orange text, fire sparks        | Sizzle       |
| 7     | Great         | FIRE 🔥          | Orange text, fire animation     | Fire whoosh  |
| 8     | Excellent     | SAVAGE           | Red text, screen shake          | Crowd ooh    |
| 9     | Legendary     | CREATIVE         | Purple text, heavy particles    | Explosion    |
| 10    | Godlike       | DESTROYED        | Full screen flash, confetti     | Air horn     |

### 4.2 Special Feedback Words

| Word       | Trigger                              | Notes                              |
|------------|--------------------------------------|------------------------------------|
| BLOCKED    | Toxicity detected (slurs, doxxing)   | Score forced to 0, shown to both   |
| SAVAGE     | Score 8                              | Reserved for very strong roasts    |
| FIRE 🔥    | Score 7                              | The iconic ATE feedback            |
| COOKING    | Score 6                              | "Getting there" encouragement      |
| CREATIVE   | Score 9                              | Emphasizes originality at top tier |
| DESTROYED  | Score 10                             | Peak roast — the ultimate flex     |
| WEAK       | Score 1–3                            | Negative but not mean              |
| MID        | Score 4–5                            | Neutral, middle-of-the-road        |

### 4.3 Override: Blocked Content

When the AI detects toxic content (slurs, personal attacks, doxxing info):

```
score = 0
feedback = "BLOCKED"
```

The player sees: **"BLOCKED — Toxic roast. Score: 0."**
The opponent sees: **"Opponent's roast was blocked."** (no toxic text shown)

This acts as a **strong sink** — submitting toxic content costs the player a full roast score with no upside.

---

## 5. Tuning Knobs

### 5.1 Timer Duration

| Parameter         | Default | Range     | Rationale                                    |
|-------------------|---------|-----------|----------------------------------------------|
| Roast timer       | 60s     | 30–120s   | 60s balances urgency with craft time         |
| Thinking pause    | 3s      | 2–5s      | Dramatic beat between scores; too long = boring |
| Post-round delay  | 5s      | 3–8s      | Score animation + scoreboard update          |

**Why 60 seconds?**
- Under 30s: Too chaotic, quality drops, average scores shift left (mean < 5).
- At 60s: Enough time to think of something decent but creates real pressure. Sweet spot for both casual and competitive players.
- Over 90s: Pressure drops, players overthink, pace drags.
- Telemetry target: 40–50% of players use 40–55 seconds (indicating thoughtful-but-decisive play).

### 5.2 Score Range

| Parameter         | Default | Range    | Rationale                                    |
|-------------------|---------|----------|----------------------------------------------|
| Min score         | 1       | 0–1      | 0 reserved for blocked; 1 is floor           |
| Max score         | 10      | 7–15     | 10 is intuitive, fits mental model           |

**Why 1–10 and not 1–5 or 1–100?**
- 1–5: Too compressed. Difficult to distinguish "good" from "great."
- 1–10: Universal mental model. Easy to understand "7 out of 10." Sufficient granularity for meaningful differences.
- 1–100: Too granular. Players can't distinguish 72 from 78. Overstates AI precision.

### 5.3 Round Count

| Parameter         | Default | Options    | Rationale                                    |
|-------------------|---------|------------|----------------------------------------------|
| Bo3 rounds        | 3       | 2–5        | Standard competitive format, ~5 min matches  |
| Bo5 rounds        | 5       | 3–7        | Longer format for ranked/tournament play     |
| Default format    | Bo3     | —          | Casual queue uses Bo3 for faster matches     |

**Why Bo3 for casual?**
- Average Bo3 match: 3–5 minutes (3 rounds with alternation).
- Average Bo5 match: 5–8 minutes.
- Bo3 keeps session energy high. Players can "find another match" quickly.
- Bo5 reserved for ranked mode where depth matters more than pace.

### 5.4 Tie-Breaking Rules

| Tie Level        | Resolution                                      | Priority |
|------------------|------------------------------------------------|----------|
| Round tie        | Both players get +0.5 round-wins               | 1        |
| Match tie        | Higher cumulative roast score wins              | 2        |
| Cumulative tie   | DRAW — both get draw result in stats            | 3        |
| Scoreboard tie   | Display both scores; no "winner" badge          | N/A      |

**Why +0.5 for ties instead of other options?**
- **+1 each (both win):** Makes ties equal to wins. Removes all incentive to outscore opponent. Bad.
- **+0 each (no one wins):** Punishes both players equally. Feels bad when you scored well.
- **+0.5 each:** Best compromise. Ties help but don't equal wins. Encourages aggression.

### 5.5 Comeback Mechanics

| Mechanic                 | Default | Rationale                                    |
|--------------------------|---------|----------------------------------------------|
| Trailing player bonus    | NONE    | Skill-based game — no rubber-banding          |
| Momentum bonus           | NONE    | Would over-complicate scoring                 |
| Last round multiplier    | NONE    | Would make earlier rounds meaningless         |

**Why no comeback mechanics?**
- ATE is a skill-based competitive game. Comeback mechanics artificially inflate losing players' scores and punish winners.
- The round-by-round format already provides natural comebacks: winning round 1 means nothing if you lose rounds 2 and 3.
- Adding comeback mechanics would confuse the scoring model and make telemetry harder to interpret.
- **Future consideration:** If retention data shows losing players churn heavily, consider a "moral victory" bonus for individual high scores even in a loss (display-only, no effect on match result).

---

## 6. Balance Spreadsheet — 5 Hypothetical Matches

### Match 1: Blowout (Pro vs. Newbie) — Bo3

| Round | Player A Score | Player B Score | Round Winner | Round Points (A/B) | Cumulative (A/B) |
|-------|----------------|----------------|--------------|---------------------|-------------------|
| 1     | 8              | 3              | A            | 1 / 0               | 8 / 3             |
| 2     | 7              | 4              | A            | 2 / 0               | 15 / 7            |
| —     | —              | —              | **A wins**   | **2–0**             | **15–7**          |

**Result:** Player A wins 2-0. Match ends after 2 rounds. A's cumulative 15 vs B's 7 shows dominance.

---

### Match 2: Close Battle (Even Skills) — Bo3

| Round | Player A Score | Player B Score | Round Winner | Round Points (A/B) | Cumulative (A/B) |
|-------|----------------|----------------|--------------|---------------------|-------------------|
| 1     | 6              | 7              | B            | 0 / 1               | 6 / 7             |
| 2     | 8              | 5              | A            | 1 / 1               | 14 / 12           |
| 3     | 7              | 9              | B            | 1 / 2               | 21 / 21           |

**Result:** Round wins are 1-2, Player B wins. Cumulative is 21-21 but irrelevant since B has more round wins.

---

### Match 3: Nail-Biter with Tie — Bo3

| Round | Player A Score | Player B Score | Round Winner | Round Points (A/B) | Cumulative (A/B) |
|-------|----------------|----------------|--------------|---------------------|-------------------|
| 1     | 6              | 6              | TIE         | 0.5 / 0.5           | 6 / 6             |
| 2     | 5              | 5              | TIE         | 1.0 / 1.0           | 11 / 11           |
| 3     | 8              | 8              | TIE         | 1.5 / 1.5           | 19 / 19           |

**Result:** Round wins 1.5–1.5. Cumulative 19–19. **DRAW.** Both players get draw result. Extremely rare (~0.001% probability).

---

### Match 4: Comeback That Matters — Bo5

| Round | Player A Score | Player B Score | Round Winner | Round Points (A/B) | Cumulative (A/B) |
|-------|----------------|----------------|--------------|---------------------|-------------------|
| 1     | 9              | 4              | A            | 1 / 0               | 9 / 4             |
| 2     | 7              | 6              | A            | 2 / 0               | 16 / 10           |
| 3     | 4              | 8              | B            | 2 / 1               | 20 / 18           |
| 4     | 3              | 9              | B            | 2 / 2               | 23 / 27           |
| 5     | 6              | 7              | B            | 2 / 3               | 29 / 34           |

**Result:** Player B wins 3-2 after trailing 0-2. Natural comeback through skill, no rubber-banding needed. B's late-round performance (8, 9, 7) vs A's collapse (4, 3, 6) tells the story.

---

### Match 5: Newbie vs. Newbie — Bo3

| Round | Player A Score | Player B Score | Round Winner | Round Points (A/B) | Cumulative (A/B) |
|-------|----------------|----------------|--------------|---------------------|-------------------|
| 1     | 4              | 3              | A            | 1 / 0               | 4 / 3             |
| 2     | 3              | 5              | B            | 1 / 1               | 7 / 8             |
| 3     | 5              | 4              | A            | 2 / 1               | 12 / 12           |

**Result:** Player A wins 2-1 on round wins. Cumulative tied at 12–12, but round-win tiebreaker gives it to A. This demonstrates that cumulative score is display-only; round-wins determine the match.

---

## 7. Anti-Abuse Rules

### 7.1 Empty / Short Submission Protection

| Abuse Type               | Detection                                  | Penalty                                     |
|--------------------------|--------------------------------------------|---------------------------------------------|
| Empty string             | `text.trim().length === 0`                 | Auto-score = 1, feedback = "WEAK"           |
| Single character         | `text.trim().length <= 2`                  | Auto-score = 1, feedback = "WEAK"           |
| Whitespace spam          | `text.replace(/\s/g,'').length <= 2`       | Auto-score = 1, feedback = "WEAK"           |
| Below 5 characters       | `text.trim().length < 5`                   | Auto-score = 2, feedback = "WEAK"           |
| Valid roast              | `text.trim().length >= 5`                  | Normal AI scoring path                      |

**Rationale:** Minimum 5 characters to reach AI scoring. Anything less is clearly not a roast. Auto-score 1–2 still penalizes the player without wasting an Ollama call.

### 7.2 Duplicate Roast Detection

| Abuse Type               | Detection                                  | Penalty                                     |
|--------------------------|--------------------------------------------|---------------------------------------------|
| Exact duplicate in match | `text === previous_roast_text` (same player) | Score = 1, feedback = "WEAK"             |
| Near-duplicate (>80% similarity) | Levenshtein distance / longest common substring | Score capped at 3                    |
| Repeated across matches | Not penalized — opponents change, reusing jokes is valid | None |

**Rationale:** Copy-pasting the same roast within a match is lazy and exploitative. Across matches, reusing a good roast against a different opponent is legitimate strategy (like a signature move).

### 7.3 Spam / Rapid-Fire Protection

| Abuse Type               | Detection                                  | Penalty                                     |
|--------------------------|--------------------------------------------|---------------------------------------------|
| Submit before timer starts | Server-side timer validation             | Reject submission, ignore                    |
| Submit after timer expires | `now > round_start + 60s`                 | Auto-score = 0, feedback = "TIMED OUT"      |
| Multiple submits (race condition) | Server accepts only first valid submission per round | Second+ ignored         |

### 7.4 Content Safety

| Abuse Type               | Detection                                  | Penalty                                     |
|--------------------------|--------------------------------------------|---------------------------------------------|
| Slurs / hate speech      | AI toxicity check in prompt                 | Score = 0, feedback = "BLOCKED"             |
| Doxxing info (names, addresses) | AI toxicity check + regex patterns    | Score = 0, feedback = "BLOCKED"             |
| Excessive caps (>80% caps) | Character analysis                        | Score capped at 3 (discourages shouting)    |
| URLs / links             | Regex detection                            | Score capped at 3 (anti-spam)               |

### 7.5 Rate Limiting

| Limit                    | Value     | Window    | Action                                     |
|--------------------------|-----------|-----------|--------------------------------------------|
| Matches per player       | 20        | 1 hour    | Queue locked, "Cool down" message          |
| Messages per socket      | 5         | 10 seconds| Throttle, ignore excess                    |
| Ollama calls per server  | 100       | 1 minute  | Queue submissions, increase latency warning |

---

## 8. Progression Impact

### 8.1 Player Stats Schema

```sql
-- From PLAN.md users table
avg_score      DECIMAL(3,1)  -- running average of all roast scores given
total_battles  INT           -- total matches played
wins           INT           -- matches won
losses         INT           -- matches lost
```

### 8.2 Stat Update Formulas

After each match completes:

```sql
-- Win/Loss/Tie update
IF match_winner == player_id:
    wins += 1
ELSE IF match_winner == DRAW:
    -- no change to wins or losses
ELSE:
    losses += 1

total_battles += 1

-- Average score update (EWA — Running Average)
-- Player's avg_score = mean of all their individual roast scores across all battles
new_avg_score = (
    (old_avg_score * old_total_roasts) + (sum of this match's roast scores)
) / (old_total_roasts + roasts_in_this_match)

-- Where old_total_roasts = total_battles * roasts_per_battle (variable due to early exits)
```

### 8.3 Win Rate Calculation

```
win_rate = wins / (wins + losses) * 100
```

Note: Draws are excluded from win rate calculation (they don't count as wins or losses).

### 8.4 Leaderboard Ranking

Primary sort: **Win rate** (descending)
Secondary sort: **Avg score** (descending)
Tertiary sort: **Total battles** (descending — breaks ties in favor of experienced players)

```sql
SELECT user_id, 
       wins::float / NULLIF(wins + losses, 0) AS win_rate,
       avg_score,
       total_battles
FROM users
WHERE total_battles >= 5  -- minimum matches for ranking
ORDER BY win_rate DESC, avg_score DESC, total_battles DESC;
```

### 8.5 Stat Milestones (Display-Only Achievements)

| Milestone              | Threshold          | Display Badge          |
|------------------------|--------------------|------------------------|
| First Blood            | 1 battle played    | "Rookie"                |
| Battle Hardened        | 50 battles         | "Veteran"              |
| Century Club           | 100 battles        | "Centurion"            |
| Perfect Average        | avg_score ≥ 8.0    | "Roast God"            |
| High Roller            | avg_score ≥ 7.0    | "Sharpshooter"         |
| Win Streak 5           | 5 consecutive wins | "On Fire 🔥"            |
| Win Streak 10          | 10 consecutive wins| "Unstoppable"          |
| Unbeatable             | 20+ battles, 0 losses | "Undefeated"        |

These are **display-only** — no gameplay impact, no currency reward. Purely social signaling.

### 8.6 Progression Impact on Matchmaking

| Factor              | Weight   | Notes                                    |
|---------------------|----------|------------------------------------------|
| Win rate            | 60%      | Primary skill indicator                  |
| Avg score           | 25%      | Individual performance metric            |
| Total battles       | 15%      | Experience factor — veteran edge         |

Matchmaking formula (simplified):
```
player_skill_rating = (win_rate * 0.6) + (avg_score / 10 * 100 * 0.25) + (min(total_battles, 100) / 100 * 100 * 0.15)
```

Target: Match players within ±15% of each other's skill rating.

---

## 9. Scoring Economy Health Targets

| Metric                        | Target              | Alert Threshold      |
|-------------------------------|---------------------|----------------------|
| Mean roast score              | 5.5–6.0            | < 4.5 or > 6.5       |
| Score std deviation           | 1.5–2.2            | < 1.0 or > 2.8       |
| % scores 8–10                 | 12–18%             | < 8% or > 25%        |
| % scores 1–3                  | 8–15%              | < 5% or > 20%        |
| Match completion rate         | > 95%              | < 90%                |
| Avg match duration (Bo3)      | 3–5 minutes        | < 2 min or > 8 min   |
| Blocked roast rate            | < 2%               | > 5%                 |
| Empty/short submission rate   | < 5%               | > 10%                |
| Duplicate roast rate          | < 3%               | > 8%                 |
| Win rate distribution         | Near 50/50         | > 60/40 split        |

---

## 10. Implementation Checklist

### Server-Side (server/services/ollama.js + socket/handlers.js)

- [ ] Score validation: clamp to 1–10, fallback to 5 on error
- [ ] Round winner calculation with +0.5 tie handling
- [ ] Match winner: first to 2 (Bo3) or 3 (Bo5) round-wins
- [ ] Cumulative score tracking per match
- [ ] Empty/short text auto-score (5-char minimum)
- [ ] Duplicate roast detection within match
- [ ] Timer enforcement (server-side authoritative)
- [ ] Blocked content handling (score = 0)
- [ ] Player stats update after match
- [ ] Rate limiting (20 matches/hour)

### Client-Side (client/src/lib/scoring.js)

- [ ] Score display formatting (clamp display to 1–10)
- [ ] Feedback word rendering with animations
- [ ] Round-wins and cumulative score display
- [ ] Match timer (client display, server authoritative)
- [ ] Battle result calculation mirror (for optimistic UI)

### Database (server/migrations/)

- [ ] `avg_score` column on users table (DECIMAL(3,1))
- [ ] `total_battles` column (INT, default 0)
- [ ] `wins` column (INT, default 0)
- [ ] `losses` column (INT, default 0)
- [ ] `roasts.ai_score` column (INT, 1-10)
- [ ] `roasts.ai_feedback` column (VARCHAR(50))

---

## Appendix A: Ollama Prompt Template

```
You are a roast battle judge. Score this roast response on a 1-10 scale.

EVALUATION CRITERIA (weighted equally):
- Creativity: Original angle, clever wordplay, unexpected twist
- Humor: Did it make you laugh? Would a crowd react?
- Delivery: Flow, timing, punchline structure
- Savageness: How devastating was it? How hard to recover from?

SCORING RUBRIC:
1-3: Weak, lazy, no effort, or offensive without being funny
4-5: Average, predictable, "meh" reaction expected
6-7: Good roast, got a genuine reaction, solid technique
8-9: Excellent, crowd-pleaser, opponent will feel this
10: Historic. Once-in-a-session. Top 2% of roasts ever.

TOXICITY CHECK:
If the roast contains: slurs, personal threats, doxxing info, or family attacks →
Return EXACTLY: "SCORE: 0\nFEEDBACK: BLOCKED"

OUTPUT FORMAT (mandatory, no other text):
SCORE: [1-10]
FEEDBACK: [one word from: WEAK, MID, COOKING, FIRE, SAVAGE, CREATIVE, DESTROYED]

ROAST TO SCORE:
"{roast_text}"
```

## Appendix B: Score Decay Prevention

To prevent score inflation over time:

1. **Monthly calibration**: If global mean drifts > 0.5 from 5.75, adjust prompt rubric.
2. **Hard ceiling enforcement**: No roast can score above 10 regardless of prompt drift.
3. **Relative adjustment**: If AI consistently scores 7+, increase rubric difficulty instructions.
4. **Seasonal resets**: Every 90 days, review and adjust the scoring prompt. Log version number.

---

*Document version: 1.0 | Next review: Post-launch telemetry check at Day 14*
