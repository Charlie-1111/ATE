# ATE — User Research Brief & Personas

**Date:** September 2026
**Researcher:** UX Research Team
**Product:** ATE — Real-Time 1v1 Roasting Battle Platform
**Version:** Pre-launch (v0.1)

---

## 1. Target Audience Analysis

### Demographics

| Segment | Detail |
|---------|--------|
| **Age** | 16–30 (core: 18–24) |
| **Gender** | Skews male (~60%), but roast culture is gender-neutral |
| **Location** | US, UK, Philippines, India — English-speaking, meme-literate |
| **Income** | Students and early-career; price-sensitive, value free-to-play |
| **Device** | 60% mobile, 40% desktop. Mobile-first typing is a real constraint |

### Psychographics

| Trait | Implication for ATE |
|-------|-------------------|
| **Competitive identity** | These users define themselves by rank. Leaderboard position = social currency. They'll grind for a top-10 spot. |
| **Humor as social skill** | Roasting is a love language in this cohort. They already roast friends on Discord/Twitter. ATE formalizes what they do naturally. |
| **Content creation drive** | If a battle is funny, they WILL screen-record it. The app must be shareable or it loses viral loops. |
| **Short attention loops** | Sessions are 5–15 minutes. If matchmaking takes >30s, they alt-tab. If a round feels slow, they bounce. |
| **Identity expression** | Avatar customization isn't vanity — it's how they show personality. Cosmetics are status symbols. |

### Behavior Patterns

- **Peak hours:** 7PM–1AM (post-school/work, pre-sleep scrolling)
- **Session structure:** Quick bursts. 3–5 battles per session, then they leave. Return 2–3x/day.
- **Discovery path:** TikTok clip → friend link → try it → if first battle is fun, they stay
- **Churn triggers:** Long queue times, bad AI scoring ("that was a 6??"), no one to play with, mobile typing frustration
- **Retention hooks:** Rank climbing, cosmetic unlocks, revenge rematches, daily deals

### Key Insight

> The #1 retention driver isn't the roasting itself — it's the **score reveal moment**. The 3-second pause before AI scoring creates tension. If that payoff feels fair and exciting, users return. If scoring feels arbitrary, they leave within 2 sessions.

---

## 2. User Personas

### Persona 1: Marcus — The Grinder (Primary)

| Field | Detail |
|-------|--------|
| **Age** | 21 |
| **Occupation** | College student, part-time food delivery |
| **Location** | Atlanta, GA |
| **Tech comfort** | High. Uses Discord, Reddit, plays competitive games (Valorant, League) |
| **Context of use** | Between deliveries on his phone, late-night on his laptop |

**Goals:**
- Reach top 100 on the leaderboard
- Develop a recognizable roast style that gets high scores
- Unlock legendary cosmetics to flex on opponents
- Find consistent rivals (rematch culture)

**Frustrations:**
- "If the AI gives a 7 to my best roast and an 8 to 'your mom' jokes, I'm done"
- Matchmaking that takes more than 20 seconds kills his momentum
- Mobile keyboard autocorrect changing his roast mid-send
- No way to track his score progression over time (needs a stats graph)

**Quote:** *"I don't care about the cosmetics. Okay I care a little. But I want to be NUMBER ONE. Show me my rank at all times."*

---

### Persona 2: Jess — The Social Butterfly (Secondary)

| Field | Detail |
|-------|--------|
| **Age** | 19 |
| **Occupation** | Barista, community college |
| **Location** | Portland, OR |
| **Tech comfort** | Medium-high. Heavy Instagram/TikTok user, casual gamer |
| **Context of use** | Playing with friends on a call, sharing funny moments |

**Goals:**
- Have fun with friends, not grind ranked
- Make her avatar look cute/funny
- Share hilarious battle clips on her story
- Play 2–3 games and feel good, win or lose

**Frustrations:**
- "I don't want to play random strangers, I want to invite my friend in a link"
- The dark neon aesthetic feels intimidating at first — needs a friendlier onboarding
- She doesn't know what to type under pressure. Needs roast templates or prompts
- If she loses badly, she feels embarrassed and doesn't come back

**Quote:** *"Can I just play with my friend? I don't want to talk to some random dude who's going to destroy me."*

---

### Persona 3: DJ — The Content Creator (Tertiary)

| Field | Detail |
|-------|--------|
| **Age** | 24 |
| **Occupation** | Full-time Twitch streamer, 8K followers |
| **Location** | Toronto, Canada |
| **Tech comfort** | Very high. OBS, stream overlays, multi-platform presence |
| **Context of use** | Streaming to audience, needs the game to be entertaining to WATCH |

**Goals:**
- Create entertaining content (clips, moments, reactions)
- Have a way to battle viewers (audience participation)
- Look good on stream — avatar and UI must be visually striking
- Funny AI feedback = clip-worthy moments

**Frustrations:**
- "If the UI looks generic, my audience won't click. It needs to POP on a 1080p stream"
- No spectator mode — his chat can't watch the battle live
- Can't control who he plays (needs private room / invite system)
- AI scoring delays interrupt his commentary flow if they're inconsistent

**Quote:** *"The AI saying 'SAVAGE' with a fire emoji after a roast is the clip. That's the whole content piece. Make that moment unforgettable."*

---

### Persona 4: Sam — The Accessibility-First Player (Edge)

| Field | Detail |
|-------|--------|
| **Age** | 28 |
| **Occupation** | Software developer |
| **Location** | London, UK |
| **Tech comfort** | Very high. Uses screen reader (NVDA) and voice input regularly |
| **Context of use** | Desktop with keyboard navigation, occasional voice-to-text for input |

**Goals:**
- Play competitively despite motor/visual limitations
- Have equal chance at leaderboard (accessibility ≠ lower difficulty)
- Customize avatar without needing precise mouse control
- Enjoy the same roast culture without barriers

**Frustrations:**
- "Timed inputs are ableist by default. 60 seconds isn't enough when I'm using voice-to-text and it mishears 'roast' as 'road'"
- Screen reader can't parse the battle state — who's turn is it? What's the score?
- Avatar builder uses drag-and-drop which doesn't work with keyboard
- Color-coded feedback (red/green) with no icon/text alternative

**Quote:** *"I'm not asking for a separate game. I'm asking for the same game that doesn't pretend I don't exist."*

---

## 3. User Journey Map — Marcus (Primary Persona)

### Stage 1: Discovery

| Touchpoint | Emotion | Pain Points | Delight Moments |
|------------|---------|-------------|-----------------|
| Sees TikTok clip of a savage roast battle | Excited, curious | Doesn't know the app name from the clip | The AI screaming "DESTROYED 🔥" is instantly compelling |
| Clicks link / searches app name | Hopeful | If landing page doesn't immediately explain the game, he bounces | A 5-second explainer video on the landing page |

**Action:** Clicks "Play Now"
**Critical moment:** If signup takes >30 seconds, 40% drop-off expected.

---

### Stage 2: Signup & Onboarding

| Touchpoint | Emotion | Pain Points | Delight Moments |
|------------|---------|-------------|-----------------|
| Email/password signup | Neutral (routine) | "Another account to make" fatigue | Username selection that's fun ("Enter your roast name") |
| Avatar builder | Curious, playful | 59 parts is overwhelming without guidance | Default avatar that looks cool out of the box; "randomize" button |
| Tutorial / first roast prompt | Anxious | Doesn't know the format (best of 3? timed?) | Quick 30-second animated walkthrough |

**Action:** Finishes avatar, clicks "Find Battle"
**Critical moment:** If onboarding takes >2 minutes total, he skips avatar customization and just wants to play.

---

### Stage 3: First Battle

| Touchpoint | Emotion | Pain Points | Delight Moments |
|------------|---------|-------------|-----------------|
| Matchmaking queue | Anticipatory | Waiting >15s feels like the app is dead | Queue shows position and estimated wait |
| Match found screen | Pumped | If opponent's avatar is basic, feels low-stakes | Opponent's avatar is detailed and intimidating |
| Typing first roast | Pressure (fun kind) | 60s timer anxiety; autocorrect sabotage on mobile | Typing indicator on opponent's side creates psychological tension |
| Sending roast | Vulnerable | What if it scores low? | Typing "SEND" feels committed, like dropping a mic |
| AI score reveal | Tension → payoff | Score feels wrong (7 for a mediocre roast?) | "SAVAGE" + fire animation = dopamine hit regardless of score |
| Battle result | Triumphant or determined | Losing feels bad if opponent's roasts were worse | "Rematch?" button is immediate — no friction to try again |

**Action:** Clicks "Rematch" or "Find New Battle"
**Critical moment:** The AI scoring must feel fair. A perceived bad score on a great roast is the #1 churn trigger.

---

### Stage 4: Return Visit (Day 2+)

| Touchpoint | Emotion | Pain Points | Delight Moments |
|------------|---------|-------------|-----------------|
| Opens app again | Curious if he improved | No notification that his rank changed | Push notification: "You're 3 spots from top 100!" |
| Checks leaderboard | Competitive | Can't find his name easily if rank is low | Smooth scroll-to-self with highlight animation |
| Checks shop | Aspirational | Can't afford anything yet — feels grindy | First free cosmetic unlock after 5 battles |
| Plays 3–4 battles | Flow state | Queue times at off-hours (>60s) | Winning streak with fire animations stacking |

**Action:** Plays daily for 1–2 weeks
**Critical moment:** Day 3 is the retention cliff. If he hasn't unlocked anything or climbed meaningfully by then, he stops.

---

### Stage 5: Mastery (Week 2+)

| Touchpoint | Emotion | Pain Points | Delight Moments |
|------------|---------|-------------|-----------------|
| Consistent top-500 rank | Pride | Can't share rank externally (no social proof) | Profile page shows stats, win streak, best roast |
| Cosmetic collection grows | Ownership | Some items feel overpriced for the grind required | Daily deal rotation creates FOMO urgency |
| Recognizes regular opponents | Rivalry | No way to track head-to-head record vs. specific users | "Rival" badge system (future feature opportunity) |
| Wants to teach friends | Evangelist | No easy way to explain the game to newcomers | Spectator mode would convert friends watching into players |

**Action:** Becomes an advocate, shares clips, drags friends in
**Critical moment:** If he can't bring friends in easily (private rooms, invite links), the viral loop breaks.

---

## 4. Competitive Analysis

### Direct Competitors

| App | What Works | What Doesn't | ATE Opportunity |
|-----|-----------|--------------|-----------------|
| **Roast Me (Reddit)** | Massive audience, authentic roasts, community voting | Not real-time, text-only, no gamification | ATE adds real-time pressure + AI scoring + progression |
| **Omegle/OmeTV** | Random matching thrill, video adds stakes | Toxic, no moderation, shut down | ATE's AI toxicity filter enables roast culture without abuse |
| **HateSpin** | Timed roast battles, quick sessions | No progression, no identity, ugly UI | ATE's avatar system + leaderboard adds sticky identity |
| **Ship 60 (typing game)** | Clean UI, satisfying typing feel | Single-player, no social element | ATE combines typing mechanic with social competition |

### Indirect Competitors (Mechanics Overlap)

| App | Relevant Mechanic | ATE Takeaway |
|-----|-------------------|--------------|
| **Wordle** | Daily shareable results, streak culture | ATE needs shareable battle summaries (image/card format) |
| **Duolingo** | Streaks, XP, leagues, push notifications | ATE should copy Duolingo's retention mechanics (daily streak, XP per battle, league promotion) |
| **Valorant / League** | Rank systems, match history, competitive identity | Leaderboard tiers (Bronze → Diamond → Radiant equivalent) would dramatically boost engagement |
| **Jackbox Party Pack** | Audience participation, phone-as-controller | Private rooms where spectators vote on best roast = massive party game potential |

### Gap Analysis

| Market Gap | How ATE Fills It |
|------------|-----------------|
| No real-time roast battle game exists | ATE is category-defining. First-mover advantage is massive. |
| Roast culture is unstructured (Twitter comments, Discord) | ATE structures it into a game with rules, scores, stakes |
| AI moderation is the unlock | Human moderation can't scale for roasts. Ollama's toxicity filter enables safe roast culture |
| Mobile-first competitive text games are rare | Most typing/word games are desktop. ATE can own mobile competitive text |

---

## 5. Usability Goals — Battle Screen

These targets are specifically for the `BattleRoom.jsx` + `RoastInput.jsx` + `ScoreBoard.jsx` components.

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| **Time to first roast sent** | < 15 seconds from round start | Timer from `battle_started` event to `roast_sent` event |
| **Typo/backspace rate** | < 20% of characters typed | Input event tracking (keystrokes vs. final character count) |
| **Battle completion rate** | > 92% of started battles | `battle_ended` / `battle_started` events per session |
| **Score perception alignment** | > 70% of users rate scores as "fair" in post-battle survey | In-app feedback prompt after battle |
| **Round timer expiration rate** | < 8% of rounds time out | Timer expiry events / total rounds |
| **Mobile roast send success** | > 95% of send attempts succeed on mobile | `roast_sent` success/failure tracking |
| **Page load to battle-ready** | < 2 seconds from match found to interactive battle UI | Performance timing from Socket event to React render |
| **Accessibility compliance** | WCAG 2.1 AA | Screen reader audit, keyboard nav test, color contrast check |
| **Screen reader battle state clarity** | 100% of critical state changes announced via ARIA live regions | Manual audit with NVDA/VoiceOver |
| **Error recovery** | 0 unrecoverable states during battle (disconnect = rejoin, etc.) | Socket reconnection logic testing |

---

## 6. Key Research Questions

### Validation Questions (Test Before Building)

1. **Does the 60-second timer feel right?** Test: 30s vs 45s vs 60s vs 90s. Too short = anxiety. Too long = momentum dies.
2. **Is best-of-3/5 the right default?** Or do users want best-of-1 for quick sessions?
3. **Should both players type simultaneously or sequentially?** Simultaneous = more action but harder to track. Sequential = clearer but slower.
4. **How much does AI scoring fairness matter vs. speed?** If scoring takes 5 seconds but is accurate vs. 1 second but feels random — which do users prefer?
5. **Do users want roast templates/prompts?** "Roast their avatar" / "Roast their rank" / "Free style" — does this help beginners or kill creativity?

### Post-Build Testing Questions

6. **Where do users drop off in onboarding?** Track completion rates: signup → avatar → first battle → second battle.
7. **What's the optimal cosmetics pricing?** A/B test: 100 / 500 / 1000 coins for common items. Too cheap = no aspiration. Too expensive = frustration.
8. **Does the typing indicator create fun tension or anxiety?** Watch face-cam reactions during battle.
9. **What's the ideal queue wait time before users quit?** Measure: users who leave queue vs. wait time histogram.
10. **Are users sharing battles?** Track clip/share button usage. If < 5% share, the share flow is broken.

### Strategic Questions

11. **Will users pay for cosmetics in a roast battle game?** This is uncharted territory. Rap battle + cosmetics = ???
12. **Does the leaderboard drive retention or discouragement?** If bottom-50% players never check the leaderboard, it's failing.
13. **Is Ollama's scoring model good enough?** Llama 3.2 3B may miss cultural nuance in roasts. When does the user base outgrow local LLM quality?
14. **Should we add voice roasts?** Voice = 10x entertainment value but 10x moderation complexity.
15. **Can this become a party game?** Private rooms + spectator voting could be a bigger market than 1v1 ranked.

---

## 7. Heuristic Evaluation — Nielsen's 10 Applied to ATE Battle Concept

### 1. Visibility of System Status

**Battle application:** During a roast, the user must ALWAYS know:
- How much time is left (visible countdown, not hidden)
- Whether their opponent is typing (typing indicator)
- Current score (persistent scoreboard, not buried)
- What round it is and what format (best of 3/5 — always visible)

**Risk:** The 3-second "thinking" pause after sending a roast creates ambiguity. Is it loading? Did it freeze? A loading animation + "AI is judging..." message is mandatory.

**Recommendation:** Show a persistent battle HUD: `[Round 2/3] [Timer: 47s] [You: 14 | Them: 11] [Typing indicator]`

---

### 2. Match Between System and Real World

**Battle application:** Roast culture has real-world conventions:
- "Your mom" jokes are universal — the AI must understand this
- Wordplay should score higher than insults (cultural nuance)
- Feedback language must match roast culture: "SAVAGE", "COOKING", "DESTROYED" — NOT "Good effort!" or "Nice try!"

**Risk:** Llama 3.2 3B may not understand current slang/memes. A roast about a niche TikTok reference scoring a 3 because the model doesn't get it will frustrate power users.

**Recommendation:** Maintain a curated slang dictionary that augments the scoring prompt. Test scoring consistency weekly with a benchmark set of 50 roasts.

---

### 3. User Control and Freedom

**Battle application:**
- Users must be able to LEAVE a battle mid-game (with appropriate penalty, not a ban)
- Edit their roast before sending (no "accidentally sent" disasters)
- Mute opponents who are harassing (separate from the roast mechanic)
- Undo "Find Battle" if they clicked it accidentally

**Risk:** The timer creates forced urgency. Users may feel trapped. There's no "I need a minute" option.

**Recommendation:** Allow one 15-second "timeout" per battle. Once per game — prevents abuse but gives an emergency valve.

---

### 4. Consistency and Standards

**Battle application:**
- "Send" button must always be in the same position (bottom-right on mobile, below input on desktop)
- Score display must use consistent color: gold for scores, purple for player names, cyan for actions
- Round transitions must follow the same animation pattern every time
- The back button should NOT accidentally leave a battle (confirm dialog required)

**Risk:** Framer Motion animations could become inconsistent across components if not standardized. A score popup from Round 1 should animate identically in Round 3.

**Recommendation:** Create a shared animation config: `battleAnimations.js` with standardized entrance/exit/duration for all battle elements.

---

### 5. Error Prevention

**Battle application:**
- Autocorrect must be disabled on the roast input (mobile autocorrect will mangle creative roasts)
- Character limit should be shown and enforced BEFORE sending (not after an error)
- Socket disconnect during a roast must save the draft locally
- Duplicate sends must be blocked (double-tap protection)

**Risk:** The biggest error is accidental send before finishing a roast. There's no "are you sure?" — the timer creates pressure to send quickly.

**Recommendation:** Add a 1.5-second "Undo" window after hitting send. Show "Sent!" with an "Undo" button that fades. This is standard in messaging apps and expected.

---

### 6. Recognition Rather Than Recall

**Battle application:**
- Opponent's last roast should be visible during your turn (you're roasting them, you need context)
- Score history per round should be visible (not just the total)
- Avatar customization choices should show a preview, not just names ("Gold Chain" with icon, not "gold_chain.jsx")
- Leaderboard should highlight your position without requiring a search

**Risk:** During the battle, users may forget the opponent's previous roast because the UI focuses on the input. Context is lost.

**Recommendation:** Show opponent's last roast as a faded/quoted element above the input area. "They said: 'Your avatar looks like a default NPC' — your turn to clap back."

---

### 7. Flexibility and Efficiency of Use

**Battle application:**
- Power users should be able to keyboard-shortcut everything (Tab to input, Enter to send, Escape to menu)
- Quick-roast buttons for common patterns ("Your mom" starter, self-deprecating opener) — optional, not forced
- Battle format selection (best of 1/3/5) should be a single click, not a settings page
- Rematch should be instant (one click, no re-entering a queue)

**Risk:** If keyboard shortcuts conflict with the input field (e.g., Enter sends the roast), users who type with Enter for line breaks will be frustrated.

**Recommendation:** Use Ctrl+Enter or a dedicated Send button. Never use bare Enter for sending — it's too easy to trigger accidentally.

---

### 8. Aesthetic and Minimalist Design

**Battle application:**
- The battle screen must show ONLY what's needed for the current moment
- Don't show the shop, leaderboard, or profile during a battle — full immersion
- Score reveal should be ONE number, ONE feedback word, ONE animation — not a dashboard
- The input area should be clean: text box + timer + send button. Nothing else.

**Risk:** The neon aesthetic (purple/cyan/gold on dark) could become visually noisy during battle. Multiple animated elements competing for attention reduce focus.

**Recommendation:** During active battle rounds, mute non-essential UI chrome. Dim the background. Spotlight only the input and score. Post-battle is where you go wild with effects.

---

### 9. Help Users Recognize, Diagnose, and Recover from Errors

**Battle application:**
- If Socket disconnects mid-battle: show "Reconnecting..." with a countdown, NOT a blank screen
- If AI scoring fails (Ollama timeout): show "Scoring delay — please wait" with auto-retry, NOT an error page
- If the roast is blocked by toxicity filter: explain WHY ("This roast was flagged for [reason]") — don't just score it 0 silently
- If the opponent disconnects: auto-win with a "Opponent fled" message, not a hanging battle

**Risk:** Ollama on local hardware is the single biggest reliability risk. If the model crashes or hangs, the entire battle stalls. Users will assume the app is broken.

**Recommendation:** Implement a 10-second scoring timeout with a fallback score of 5 + "AI JUDGING DELAYED" message. Show the roast text but defer scoring. Retry asynchronously and update the score retroactively.

---

### 10. Help and Documentation

**Battle application:**
- First-time users need a 15-second tutorial BEFORE their first battle, not a docs page
- AI scoring criteria should be accessible: "Roasts are scored on: Creativity, Humor, Delivery, Savageness" — shown on the queue screen
- The feedback words ("SAVAGE", "COOKING", "MID") should have a tooltip explaining what they mean
- FAQ: "Why was my roast blocked?" must be answerable in-app, not via support email

**Risk:** The game's rules are simple but the nuances (scoring criteria, toxicity filter, format options) are not obvious. Users who don't understand why they score low will blame the AI, not learn the meta.

**Recommendation:** A "How Scoring Works" modal accessible from the battle screen. Three paragraphs max. Show example roasts with their scores. Make the AI's criteria transparent so users can improve.

---

## Appendix: Research Priorities

| Priority | Research Activity | Timeline | Owner |
|----------|-------------------|----------|-------|
| **P0** | Timer duration A/B test (45s vs 60s vs 90s) | Pre-launch | UX Research |
| **P0** | AI scoring fairness audit (50-roast benchmark) | Pre-launch | Engineering + UX |
| **P0** | Mobile typing friction testing (autocorrect, send UX) | Pre-launch | QA + UX |
| **P1** | Onboarding funnel analytics setup | Launch week | Engineering |
| **P1** | Post-battle feedback collection (1-question survey) | Launch week | UX Research |
| **P1** | Accessibility audit (screen reader + keyboard nav) | Pre-launch | QA |
| **P2** | Cosmetics pricing survey | Week 2 | Product |
| **P2** | Content creator interview (5 streamers) | Week 3 | UX Research |
| **P3** | Voice roast feasibility study | Month 2 | Product + Engineering |
| **P3** | Private room / party game concept test | Month 2 | UX Research |
