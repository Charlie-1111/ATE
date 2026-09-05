export function calculateRoundWinner(score1, score2) {
  if (score1 > score2) return 1
  if (score2 > score1) return 2
  return 0
}

export function calculateMatchWinner(roundsWon1, roundsWon2, format) {
  const winsNeeded = format === 'best_of_5' ? 3 : 2
  if (roundsWon1 >= winsNeeded) return 1
  if (roundsWon2 >= winsNeeded) return 2
  return 0
}

export function getScoreTier(score) {
  if (score >= 9) return { label: 'DESTROYED', color: 'text-fire-end', glow: true }
  if (score >= 7) return { label: 'SPICY', color: 'text-fire-start', glow: true }
  if (score >= 5) return { label: 'MID', color: 'text-accent-gold', glow: false }
  if (score >= 3) return { label: 'WEAK', color: 'text-text-muted', glow: false }
  return { label: 'TRASH', color: 'text-danger', glow: false }
}

export function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/** Format a single-roast mark (0–10). */
export function formatScore(score) {
  const n = Math.max(0, Math.min(10, Number(score) || 0))
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

/** Format an uncapped running total (sum of marks). */
export function formatTotal(score) {
  const n = Math.max(0, Number(score) || 0)
  const rounded = Math.round(n * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

/** @deprecated Prefer formatScore for marks. */
export function formatDelta(delta) {
  return formatScore(delta)
}
