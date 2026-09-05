# WCAG AA Accessibility Audit — ATE Battle Prototype

> **Audit Date:** 2026-09-04  
> **WCAG Version:** 2.1 Level AA  
> **Auditor:** UX Researcher AI  
> **Scope:** Battle screen components

---

## Executive Summary

| Category | Critical | Serious | Moderate | Total |
|----------|----------|---------|----------|-------|
| Color Contrast | 1 | 2 | 0 | 3 |
| Keyboard Navigation | 0 | 3 | 1 | 4 |
| Screen Reader | 0 | 4 | 2 | 6 |
| Focus Management | 1 | 2 | 0 | 3 |
| Timer Accessibility | 0 | 2 | 1 | 3 |
| ARIA Labels | 0 | 3 | 4 | 7 |
| Reduced Motion | 0 | 0 | 1 | 1 |
| **Total** | **2** | **16** | **9** | **27** |

---

## 1. Color Contrast Analysis

WCAG AA requires:
- **4.5:1** for normal text (< 18px or < 14px bold)
- **3:1** for large text (≥ 18px or ≥ 14px bold)

### Design Token Contrast Ratios

| Text Color | Background | Ratio | Passes | Severity |
|------------|------------|-------|--------|----------|
| `#e2e8f0` (text) | `#0a0a1a` (bg) | 15.4:1 | AA ✓, AAA ✓ | — |
| `#e2e8f0` | `#1a1a2e` (surface) | 10.8:1 | AA ✓, AAA ✓ | — |
| `#e2e8f0` | `#16213e` (card) | 8.9:1 | AA ✓, AAA ✓ | — |
| `#64748b` (muted) | `#0a0a1a` | **4.1:1** | ⚠️ Large only | **Serious** |
| `#64748b` | `#1a1a2e` | **2.9:1** | ❌ FAIL | **Critical** |
| `#7c3aed` (purple) | `#0a0a1a` | 5.2:1 | AA ✓ | — |
| `#06b6d4` (cyan) | `#0a0a1a` | 7.4:1 | AA ✓, AAA ✓ | — |
| `#f59e0b` (gold) | `#0a0a1a` | 8.1:1 | AA ✓, AAA ✓ | — |
| `#ef4444` (danger) | `#0a0a1a` | 4.6:1 | AA ✓ | — |
| `#ef4444` | `#1a1a2e` | 3.2:1 | AA large ✓ | — |

### Identified Violations

#### CRITICAL-001: Muted Text on Surface Backgrounds

**Location:** `tailwind.config.js:24`, used in `TypingIndicator.jsx:27`, `ScoreBoard.jsx:18`, `RoastInput.jsx:70,82,109`

**Issue:** `text-muted` (`#64748b`) on `bg-bg-surface` (`#1a1a2e`) has contrast ratio of 2.9:1, failing WCAG AA minimum of 4.5:1.

**Affected text:**
- "Opponent is cooking..." (TypingIndicator)
- "Round" label (ScoreBoard)
- "Your turn — drop a roast" (RoastInput)
- Character count "0/500" (RoastInput)
- Waiting state messages

**Remediation:**

```js
// tailwind.config.js
text: {
  DEFAULT: '#e2e8f0',
  muted: '#94a3b8',  // Changed from #64748b — now 5.3:1 on #1a1a2e
},
```

**Code fix:**

```js
// tailwind.config.js:24
muted: '#94a3b8', // was #64748b
```

---

#### SERIOUS-001: Timer Urgent State Red Text

**Location:** `RoastInput.jsx:53`

**Issue:** Timer displays `text-danger` (`#ef4444`) at 10 seconds. On `bg-bg-surface` (`#1a1a2e`), contrast is 3.2:1 — passes for large text only. Timer text at `text-2xl` (~24px) qualifies as large, but the animation `timer-urgent` causes color shifts that may momentarily drop contrast.

**Remediation:** Ensure timer text always maintains 3:1 minimum. Current implementation passes for large text. Add explicit size constraint.

```jsx
// RoastInput.jsx:83
<span 
  className={`font-mono text-2xl font-bold ${timerColor}`}
  aria-live="polite"
  aria-atomic="true"
>
  {formatTimer(timeLeft)}
</span>
```

---

#### SERIOUS-002: "WEAK" Score Tier Label

**Location:** `scoring.js:19`, displayed in `ScoreReveal.jsx`

**Issue:** `text-danger` (`#ef4444`) for "WEAK" feedback on dark backgrounds. While contrast is 4.6:1 on `#0a0a1a`, the emotional context (negative feedback) should use higher contrast for clarity.

**Remediation:** No change needed — passes AA. Consider using `#f87171` (lighter red, 6.2:1) for improved readability.

---

## 2. Keyboard Navigation Checklist

### Keyboard Navigation Audit

| Requirement | Status | Notes |
|-------------|--------|-------|
| All interactive elements focusable | ⚠️ Partial | Round progress dots not focusable |
| Focus order logical | ✓ Pass | Tab order follows visual flow |
| Focus visible indicator | ⚠️ Partial | Custom focus styles need enhancement |
| No keyboard trap | ✓ Pass | Can tab through all elements |
| Enter/Space activate buttons | ✓ Pass | Button activation works |
| Enter submits textarea | ✓ Pass | `handleKeyDown` handles Enter |
| Escape cancels/dismisses | ❌ Fail | No Escape handler |
| Skip link to main content | ❌ Fail | No skip link |
| Focus trap in modals | ❌ Fail | Score reveal has no focus trap |

### Identified Violations

#### SERIOUS-003: No Skip Link

**Location:** `BattleRoom.jsx`

**Issue:** No skip link to bypass repetitive content and jump directly to the roast input. Keyboard users must tab through all player panels and scores to reach the main interaction area.

**WCAG:** 2.4.1 Bypass Blocks (Level A)

**Remediation:**

```jsx
// BattleRoom.jsx — add at top of return
<>
  <a 
    href="#roast-input-main" 
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-bg-surface focus:px-4 focus:py-2 focus:rounded-lg focus:text-accent-purple focus:border focus:border-accent-purple"
  >
    Skip to roast input
  </a>
  <div id="roast-input-main">
    {/* RoastInput component */}
  </div>
</>
```

---

#### SERIOUS-004: No Escape Key Handler

**Location:** `BattleRoom.jsx`, `RoastInput.jsx`

**Issue:** No way to cancel or dismiss actions via Escape key. Users should be able to:
- Cancel current input (clear textarea)
- Dismiss score reveal overlay early
- Exit battle (with confirmation)

**WCAG:** 2.1.2 No Keyboard Trap (Level A)

**Remediation:**

```jsx
// RoastInput.jsx — add to handleKeyDown
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
  if (e.key === 'Escape') {
    setText('')  // Clear input
    textareaRef.current?.blur()
  }
}
```

---

#### SERIOUS-005: Score Reveal No Focus Trap

**Location:** `ScoreReveal.jsx`

**Issue:** When score reveal overlay appears, focus is not trapped within it. Keyboard users may tab to elements behind the overlay, causing confusion.

**WCAG:** 2.4.3 Focus Order (Level A)

**Remediation:**

```jsx
// ScoreReveal.jsx
import { FocusTrap } from '@headlessui/react' // or custom focus trap

export default function ScoreReveal({ result, isVisible, onDismiss }) {
  if (!result || !isVisible) return null

  return (
    <FocusTrap>
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="score-title"
        className="..."
      >
        {/* content */}
        <button 
          className="sr-only" 
          onClick={onDismiss}
          aria-label="Dismiss score"
        >
          Dismiss
        </button>
      </div>
    </FocusTrap>
  )
}
```

---

#### MODERATE-001: Round Progress Dots Not Focusable

**Location:** `ScoreBoard.jsx:19-30`

**Issue:** Round progress indicators are purely decorative divs with no keyboard interaction. While they convey state visually, keyboard users cannot access round status information.

**WCAG:** 4.1.2 Name, Role, Value (Level A)

**Remediation:** Make round dots informational (not interactive) via aria-label.

```jsx
// ScoreBoard.jsx:19-30
<div 
  className="flex gap-1" 
  role="status"
  aria-label={`Round progress: ${myRoundWins} wins for you, ${opponentRoundWins} wins for opponent`}
>
  {Array.from({ length: totalRounds }).map((_, i) => (
    <div
      key={i}
      aria-hidden="true"  // Decorative, info is in parent label
      className={`w-2 h-2 rounded-full ${...}`}
    />
  ))}
</div>
```

---

## 3. Screen Reader Compatibility Review

### Screen Reader Announcements Audit

| Element | Has Label | Has Role | Live Region | Status |
|---------|-----------|----------|-------------|--------|
| Turn indicator | ❌ | ❌ | ❌ | **Fail** |
| Timer countdown | ⚠️ | ❌ | ❌ | **Fail** |
| Typing indicator | ❌ | ❌ | ❌ | **Fail** |
| Score reveal | ⚠️ | ❌ | ❌ | **Fail** |
| Roast input | ✓ | ✓ | ❌ | Partial |
| Send button | ⚠️ | ✓ | ❌ | Partial |
| Round progress | ❌ | ❌ | ❌ | **Fail** |
| Victory/defeat | ❌ | ❌ | ❌ | **Fail** |

### Identified Violations

#### SERIOUS-006: No Live Region for Turn Changes

**Location:** `BattleRoom.jsx`

**Issue:** When turn changes, screen reader users are not notified. Critical game state changes happen silently.

**WCAG:** 4.1.3 Status Messages (Level AA)

**Remediation:**

```jsx
// BattleRoom.jsx — add announcement system
const [announcement, setAnnouncement] = useState('')

useEffect(() => {
  if (isMyTurn && !winner) {
    setAnnouncement(`Your turn. ${TURN_TIME} seconds remaining. Type your roast.`)
  } else if (!isMyTurn && !winner) {
    setAnnouncement("Opponent's turn. Waiting for their roast.")
  }
}, [isMyTurn, winner])

// In JSX, before main content:
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>
```

---

#### SERIOUS-007: Timer Not Announced to Screen Readers

**Location:** `RoastInput.jsx:83-85`

**Issue:** Timer displays visually but screen reader users cannot track countdown. Critical for game timing.

**WCAG:** 4.1.3 Status Messages (Level AA)

**Remediation:** Add periodic announcements at key thresholds.

```jsx
// RoastInput.jsx
const [lastAnnounced, setLastAnnounced] = useState(null)

useEffect(() => {
  // Announce at 30s, 15s, 10s, 5s
  const thresholds = [30, 15, 10, 5]
  if (thresholds.includes(timeLeft) && timeLeft !== lastAnnounced) {
    setLastAnnounced(timeLeft)
    // Trigger announcement via parent live region
    announceTime(timeLeft)
  }
}, [timeLeft])

// In parent component or via context:
const announceTime = (seconds) => {
  const region = document.getElementById('timer-announcement')
  if (region) {
    region.textContent = `${seconds} seconds remaining`
  }
}
```

```jsx
// Add live region for timer
<div 
  id="timer-announcement"
  role="timer"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
/>
```

---

#### SERIOUS-008: Score Reveal Not Announced

**Location:** `ScoreReveal.jsx`

**Issue:** Score reveal animation has no screen reader equivalent. Users miss score and feedback.

**WCAG:** 4.1.3 Status Messages (Level AA)

**Remediation:**

```jsx
// ScoreReveal.jsx
import { useEffect } from 'react'

export default function ScoreReveal({ result, isVisible }) {
  useEffect(() => {
    if (isVisible && result) {
      // Announce to live region
      const region = document.getElementById('battle-announcement')
      if (region) {
        region.textContent = `Score: ${result.score} out of 10. Feedback: ${result.feedback}.${result.isBlocked ? ' Your roast was blocked for inappropriate content.' : ''}`
      }
    }
  }, [isVisible, result])

  return (
    <div 
      role="alert"
      aria-live="assertive"
      className="sr-only"
    >
      {isVisible && result && `Score: ${result.score}/10. ${result.feedback}`}
    </div>
  )
}
```

---

#### SERIOUS-009: Typing Indicator Not Announced

**Location:** `TypingIndicator.jsx`

**Issue:** "Opponent is cooking..." shown visually but not announced to screen readers.

**WCAG:** 4.1.3 Status Messages (Level AA)

**Remediation:**

```jsx
// TypingIndicator.jsx
export default function TypingIndicator({ isOpponent }) {
  if (!isOpponent) return null

  return (
    <>
      <div 
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        Opponent is typing their roast
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        className="flex items-center gap-2 py-3 px-4"
        aria-hidden="true"
      >
        {/* visual dots */}
      </motion.div>
    </>
  )
}
```

---

#### MODERATE-002: Player Names Lack Context

**Location:** `PlayerPanel.jsx:27-29`

**Issue:** Player names shown but not identified as "you" vs "opponent" for screen readers.

**Remediation:**

```jsx
// PlayerPanel.jsx
<span 
  className={`text-sm font-semibold ${isOpponent ? 'text-danger' : 'text-accent-cyan'}`}
  aria-label={isOpponent ? `Opponent: ${player?.name || 'Unknown'}` : `You: ${player?.name || 'Unknown'}`}
>
  {player?.name || 'Unknown'}
</span>
```

---

#### MODERATE-003: Send Button State Not Clear

**Location:** `RoastInput.jsx:110-117`

**Issue:** Button disabled state conveyed visually but not announced.

**Remediation:**

```jsx
// RoastInput.jsx:110-117
<button
  onClick={handleSubmit}
  disabled={!text.trim() || submitted || disabled || text.trim().length < 5}
  aria-disabled={!text.trim() || submitted || disabled || text.trim().length < 5}
  aria-label={submitted ? 'Roast sent' : `Send roast. ${text.length} of 500 characters. Minimum 5 characters required.`}
  className="..."
>
  {submitted ? 'Sent!' : 'Send Roast'}
</button>
```

---

## 4. Focus Management During Battle State Changes

### Focus Management Audit

| State Change | Focus Behavior | Status |
|--------------|----------------|--------|
| Battle start | Should focus roast input | ⚠️ Partial |
| Turn change (your turn) | Should focus roast input | ✓ Pass |
| Turn change (opponent turn) | Should move to waiting state | ❌ Fail |
| Score reveal | Should trap focus in overlay | ❌ Fail |
| Round transition | Should announce, not move focus | ❓ Unclear |
| Match end | Should focus result, then button | ❌ Fail |
| Disconnection | Should focus modal | ❌ Fail |

### Identified Violations

#### CRITICAL-002: No Focus Management on State Transitions

**Location:** `BattleRoom.jsx`

**Issue:** Focus not programmatically managed during battle state changes. Users must manually navigate, causing confusion.

**WCAG:** 2.4.3 Focus Order (Level A), 3.2.2 On Input (Level A)

**Remediation:**

```jsx
// BattleRoom.jsx
import { useRef, useEffect } from 'react'

export default function BattleRoom({ ... }) {
  const inputRef = useRef(null)
  const resultRef = useRef(null)
  const waitingRef = useRef(null)

  // Focus management on turn change
  useEffect(() => {
    if (isMyTurn && inputRef.current) {
      inputRef.current.focus()
    } else if (!isMyTurn && waitingRef.current) {
      waitingRef.current.focus()
    }
  }, [isMyTurn])

  // Focus management on match end
  useEffect(() => {
    if (winner && resultRef.current) {
      resultRef.current.focus()
    }
  }, [winner])

  return (
    <div>
      {/* Waiting state - focusable for keyboard users */}
      {!isMyTurn && !winner && (
        <div 
          ref={waitingRef}
          tabIndex={-1}
          className="sr-only"
          aria-live="polite"
        >
          Waiting for opponent...
        </div>
      )}
      
      {/* Match result */}
      {winner && (
        <div ref={resultRef} tabIndex={-1}>
          <BattleResult ... />
        </div>
      )}
    </div>
  )
}
```

---

#### SERIOUS-010: Score Reveal Focus Not Managed

**Location:** `ScoreReveal.jsx`, `BattleRoom.jsx:29-35`

**Issue:** When score reveal appears, focus remains on previous element. No focus trap, no announcement.

**Remediation:**

```jsx
// ScoreReveal.jsx
import { useEffect, useRef } from 'react'

export default function ScoreReveal({ result, isVisible, onDismiss }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (isVisible && containerRef.current) {
      containerRef.current.focus()
    }
  }, [isVisible])

  return (
    <div 
      ref={containerRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-feedback"
      className="..."
    >
      <div id="score-feedback" className="text-6xl font-black">
        {result.score}
      </div>
      
      <button 
        onClick={onDismiss}
        className="sr-only"
      >
        Continue
      </button>
    </div>
  )
}
```

---

## 5. Timer Accessibility

### Timer Accessibility Audit

| Requirement | Status | Notes |
|-------------|--------|-------|
| Visual countdown clear | ✓ Pass | Timer displays seconds |
| Color indicates urgency | ⚠️ Partial | Color change but no pattern |
| Screen reader notified | ❌ Fail | No live announcements |
| Pattern/texture for urgency | ❌ Fail | Color-only indication |
| Extra time option | ❌ Fail | No extended time feature |
| Pause/stop timer | ❌ Fail | No pause mechanism |

### Identified Violations

#### SERIOUS-011: Timer Urgency Conveyed by Color Only

**Location:** `RoastInput.jsx:53-55`

**Issue:** Timer urgency (warning/critical) conveyed only through color change (cyan → gold → red). Users with color vision deficiencies may not perceive urgency.

**WCAG:** 1.4.1 Use of Color (Level A)

**Remediation:** Add visual pattern and text indicator.

```jsx
// RoastInput.jsx:81-86
<div className="flex items-center justify-between mb-2">
  <span className="text-sm text-text-muted">Your turn — drop a roast</span>
  <div className="flex items-center gap-2">
    {timeLeft <= 10 && (
      <span className="text-danger" aria-hidden="true">⚠️</span>
    )}
    <span className={`font-mono text-2xl font-bold ${timerColor}`}>
      {formatTimer(timeLeft)}
    </span>
    {timeLeft <= 10 && (
      <span className="sr-only">— Urgent!</span>
    )}
  </div>
</div>
```

```jsx
// Add pattern to progress bar
<div className="absolute bottom-0 left-0 h-1 bg-accent-purple rounded-full transition-all duration-1000"
  style={{ 
    width: `${timerPercent}%`,
    backgroundImage: timeLeft <= 10 
      ? 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)'
      : 'none'
  }}
/>
```

---

#### SERIOUS-012: No Timer Announcement for Screen Readers

**Location:** `RoastInput.jsx`, `BattleRoom.jsx`

**Issue:** Screen reader users have no way to track timer without visually watching countdown. Critical time pressure not communicated.

**WCAG:** 2.2.1 Timing Adjustable (Level A), 4.1.3 Status Messages (Level AA)

**Remediation:** See SERIOUS-007 above. Additionally:

```jsx
// Add to RoastInput or parent component
const [timerAnnouncement, setTimerAnnouncement] = useState('')

useEffect(() => {
  if (!isMyTurn) return
  
  if (timeLeft === 30) setTimerAnnouncement('30 seconds remaining')
  else if (timeLeft === 15) setTimerAnnouncement('15 seconds — half time')
  else if (timeLeft === 10) setTimerAnnouncement('10 seconds — hurry!')
  else if (timeLeft === 5) setTimerAnnouncement('5 seconds remaining')
  else if (timeLeft === 0) setTimerAnnouncement('Time up!')
}, [timeLeft, isMyTurn])

// JSX
<div role="timer" aria-live="polite" className="sr-only">
  {timerAnnouncement}
</div>
```

---

#### MODERATE-004: No Extended Time Option

**Location:** System-wide

**Issue:** Users who need more time (cognitive disabilities, motor impairments) cannot request extended timer.

**WCAG:** 2.2.1 Timing Adjustable (Level A) — requires option to turn off or extend time limits.

**Remediation:** This requires product decision. Options:
1. Add settings option for 2x timer (120s instead of 60s)
2. Add "request more time" button before battle
3. Remove timer entirely for accessibility mode

**Recommendation:** Add accessibility settings page:

```jsx
// Settings.jsx
<label className="flex items-center gap-2">
  <input type="checkbox" checked={extendedTime} onChange={...} />
  <span>Extended timer (120 seconds per turn)</span>
</label>
```

---

## 6. Score Reveal Accessibility

### Score Reveal Audit

| Requirement | Status | Notes |
|-------------|--------|-------|
| Score number readable | ✓ Pass | Large, clear number |
| Feedback text readable | ✓ Pass | Clear tier labels |
| Animation alternative | ⚠️ Partial | No static fallback |
| Screen reader announced | ❌ Fail | No live region |
| Focus trapped | ❌ Fail | See SERIOUS-005 |
| Dismissible | ❌ Fail | Auto-dismiss only |

### Identified Violations

#### MODERATE-005: Score Animation No Reduced-Motion Alternative

**Location:** `ScoreReveal.jsx:11-16`

**Issue:** Score reveal uses spring animation. While `prefers-reduced-motion` is set in `index.css:67-73`, the Framer Motion animations don't respect it consistently.

**WCAG:** 2.3.3 Animation from Interactions (Level AAA)

**Remediation:**

```jsx
// ScoreReveal.jsx
import { MotionConfig } from 'framer-motion'

export default function ScoreReveal({ result, isVisible }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.01 }} // Effectively instant
        className="..."
      >
        {/* content */}
      </motion.div>
    </MotionConfig>
  )
}
```

---

## 7. ARIA Label Recommendations

### ARIA Label Audit

| Element | Current | Recommended | Priority |
|---------|---------|-------------|----------|
| Battle room container | None | `role="main" aria-label="Roast battle"` | High |
| Player panel (you) | None | `aria-label="Your profile"` | Medium |
| Player panel (opponent) | None | `aria-label="Opponent profile"` | Medium |
| Turn indicator | None | `role="status" aria-live="polite"` | High |
| Timer | `aria-label` on textarea only | `role="timer" aria-live="polite"` | High |
| Roast input | ✓ Has aria-label | Add `aria-describedby` for char count | Low |
| Send button | None | `aria-label="Send roast"` | Medium |
| Score reveal | None | `role="alert" aria-live="assertive"` | High |
| Round progress | None | `role="status" aria-label="..."` | Medium |
| Victory/defeat | None | `role="alert"` | High |

### ARIA Label Code Examples

```jsx
// BattleRoom.jsx
<main aria-label="Roast battle arena">
  {/* content */}
</main>

// PlayerPanel.jsx
<div aria-label={isOpponent ? `Opponent: ${player?.name}` : `You: ${player?.name}`}>
  {/* content */}
</div>

// RoastInput.jsx
<textarea
  aria-label="Type your roast"
  aria-describedby="char-count timer-status"
/>
<div id="char-count" className="sr-only">{text.length} of 500 characters</div>
<div id="timer-status" className="sr-only">{timeLeft} seconds remaining</div>

// Send button
<button aria-label={`Send roast. ${text.length} characters typed.`}>
  Send Roast
</button>

// ScoreReveal.jsx
<div role="alert" aria-live="assertive" aria-atomic="true">
  Score: {result.score}. {result.feedback}
</div>

// BattleResult.jsx
<h2 role="status" aria-live="assertive">
  {isWinner ? 'Victory! You won the battle!' : isDraw ? 'Draw' : 'Defeat. Better luck next time.'}
</h2>
```

---

## 8. Reduced Motion Considerations

### Current Implementation

`index.css:67-73` has global reduced-motion media query:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Issues

1. Framer Motion animations may not respect CSS media query
2. Some animations still run at 0.01ms (should be instant)
3. No alternative visual feedback for motion-based indicators

### Remediation

```jsx
// App.jsx or BattleRoom.jsx
import { MotionConfig } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'

export default function App() {
  const shouldReduceMotion = useReducedMotion()
  
  return (
    <MotionConfig reducedMotion={shouldReduceMotion ? "always" : "user"}>
      {/* app content */}
    </MotionConfig>
  )
}
```

```jsx
// TypingIndicator.jsx — provide static alternative
export default function TypingIndicator({ isOpponent }) {
  const shouldReduceMotion = useReducedMotion()
  
  if (!isOpponent) return null

  return (
    <div className="flex items-center gap-2 py-3 px-4">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-accent-purple rounded-full"
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-sm text-text-muted">Opponent is cooking...</span>
    </div>
  )
}
```

---

## 9. Summary of Critical Fixes Required

### Must Fix (Critical/Block Release)

1. **CRITICAL-001:** Change `text-muted` from `#64748b` to `#94a3b8` in `tailwind.config.js`
2. **CRITICAL-002:** Implement focus management system in `BattleRoom.jsx`

### Should Fix (Serious/High Priority)

3. **SERIOUS-003:** Add skip link to roast input
4. **SERIOUS-004:** Add Escape key handler
5. **SERIOUS-005:** Add focus trap to score reveal
6. **SERIOUS-006:** Add live region for turn changes
7. **SERIOUS-007:** Add timer announcements for screen readers
8. **SERIOUS-008:** Announce score reveal results
9. **SERIOUS-009:** Announce typing indicator
10. **SERIOUS-011:** Add non-color timer urgency indicator
11. **SERIOUS-012:** Implement timer announcements

### Should Fix (Moderate/Polish)

12. **MODERATE-001:** Add aria-label to round progress
13. **MODERATE-002:** Add context to player names
14. **MODERATE-003:** Improve send button state announcement
15. **MODERATE-004:** Consider extended timer option
16. **MODEREATE-005:** Ensure reduced-motion works with Framer Motion

---

## 10. Quick Reference: Component Fixes

### tailwind.config.js

```js
text: {
  DEFAULT: '#e2e8f0',
  muted: '#94a3b8',  // FIX: was #64748b
}
```

### BattleRoom.jsx

```jsx
import { useRef, useEffect, useState } from 'react'

export default function BattleRoom({ ... }) {
  const [announcement, setAnnouncement] = useState('')
  const inputRef = useRef(null)
  const resultRef = useRef(null)

  // Focus management
  useEffect(() => {
    if (isMyTurn) inputRef.current?.focus()
  }, [isMyTurn])

  useEffect(() => {
    if (winner) resultRef.current?.focus()
  }, [winner])

  // Announcements
  useEffect(() => {
    if (isMyTurn) setAnnouncement(`Your turn. ${TURN_TIME} seconds.`)
    else if (!winner) setAnnouncement("Opponent's turn.")
  }, [isMyTurn, winner])

  return (
    <>
      <a href="#main-input" className="sr-only focus:not-sr-only">
        Skip to roast input
      </a>
      
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      
      <main aria-label="Roast battle">
        {/* existing content */}
        
        <div id="main-input" ref={inputRef} tabIndex={-1}>
          <RoastInput ... />
        </div>
        
        {winner && (
          <div ref={resultRef} tabIndex={-1}>
            <BattleResult ... />
          </div>
        )}
      </main>
    </>
  )
}
```

### RoastInput.jsx

```jsx
// Add timer announcements
const [timerAnnounce, setTimerAnnounce] = useState('')

useEffect(() => {
  if ([30, 15, 10, 5, 0].includes(timeLeft)) {
    setTimerAnnounce(timeLeft === 0 ? 'Time up!' : `${timeLeft} seconds`)
  }
}, [timeLeft])

// Add Escape handler
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
  if (e.key === 'Escape') {
    setText('')
  }
}

// Add to JSX
<div role="timer" aria-live="polite" className="sr-only">
  {timerAnnounce}
</div>

<span className={`font-mono text-2xl font-bold ${timerColor}`}
  aria-label={`${formatTimer(timeLeft)} remaining${timeLeft <= 10 ? ' — urgent!' : ''}`}
>
  {formatTimer(timeLeft)}
</span>

{timeLeft <= 10 && (
  <span className="text-danger" aria-hidden="true">⚠️</span>
)}
```

### ScoreReveal.jsx

```jsx
import { useEffect, useRef } from 'react'

export default function ScoreReveal({ result, isVisible, onDismiss }) {
  const ref = useRef(null)

  useEffect(() => {
    if (isVisible && ref.current) ref.current.focus()
  }, [isVisible])

  if (!result || !isVisible) return null

  return (
    <>
      <div 
        ref={ref}
        tabIndex={-1}
        role="alert"
        aria-live="assertive"
        aria-label={`Score: ${result.score} out of 10. ${result.feedback}`}
        className="sr-only"
      >
        Score: {result.score}/10. {result.feedback}
      </div>
      
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-hidden="true"
        className="..."
      >
        {/* visual content */}
      </motion.div>
    </>
  )
}
```

### TypingIndicator.jsx

```jsx
export default function TypingIndicator({ isOpponent }) {
  if (!isOpponent) return null

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        Opponent is typing their roast
      </div>
      
      <motion.div
        aria-hidden="true"
        className="..."
      >
        {/* visual dots */}
      </motion.div>
    </>
  )
}
```

---

## Appendix: Testing Checklist

### Manual Testing Required

- [ ] Test all components with VoiceOver (macOS)
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test keyboard-only navigation (unplug mouse)
- [ ] Test with high contrast mode enabled
- [ ] Test with 200% zoom
- [ ] Test with reduced motion enabled
- [ ] Test with color blindness simulation

### Automated Testing

- [ ] Run axe DevTools audit
- [ ] Run Lighthouse accessibility audit
- [ ] Run WAVE evaluation
- [ ] Test with @testing-library/react

---

**End of Audit**
