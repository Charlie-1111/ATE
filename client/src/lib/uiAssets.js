/** Paths into /public/ui — Claude ATE asset pack */

export const UI = {
  logoHorizontal: '/ui/logo-ate-horizontal.svg',
  logoSquare: '/ui/logo-ate-square.svg',
  favicon: '/ui/favicon.svg',
  heroBackdrop: '/ui/hero-backdrop.svg',
  homeArenaBg: '/ui/home-arena-bg.svg',
  homeBgm: '/audio/arena-pressure.m4a',
  btnGold: '/ui/btn-gold.svg',
  btnGoldPressed: '/ui/btn-gold-pressed.svg',
  btnDark: '/ui/btn-dark.svg',
  btnDarkPressed: '/ui/btn-dark-pressed.svg',
  motifGrill: '/ui/motif-grill-chain.svg',
  vs: '/ui/vs.svg',
  turnYou: '/ui/turn-banner-you.svg',
  turnOpponent: '/ui/turn-banner-opponent.svg',
  bubbleYou: '/ui/bubble-frame-you.svg',
  bubbleThem: '/ui/bubble-frame-them.svg',
  tape: '/ui/tape-strip.svg',
  stampTimeout: '/ui/stamp-timeout.svg',
  stampBlocked: '/ui/stamp-blocked.svg',
  stampEquipped: '/ui/stamp-equipped.svg',
  bannerVictory: '/ui/banner-victory.svg',
  bannerDefeat: '/ui/banner-defeat.svg',
  coinFront: '/ui/coin-front.svg',
  coinBack: '/ui/coin-back.svg',
  coinAte: '/ui/coin-ate-stamp.svg',
  mic: '/ui/icon-mic.svg',
  timerClock: '/ui/icon-timer-clock.svg',
  timerFlame: '/ui/icon-timer-flame.svg',
  pipGold: '/ui/pip-won-gold.svg',
  pipRed: '/ui/pip-won-red.svg',
  pipEmpty: '/ui/pip-empty.svg',
  overlayLocked: '/ui/overlay-locked.svg',
  tagPremium: '/ui/tag-premium.svg',
  emptyBattles: '/ui/empty-no-battles.svg',
  medal1: '/ui/medal-1.svg',
  medal2: '/ui/medal-2.svg',
  medal3: '/ui/medal-3.svg',
  washSpotlight: '/ui/wash-spotlight.svg',
  washSmoke: '/ui/wash-smoke.svg',
}

const BADGE_BY_LABEL = {
  DESTROYED: '/ui/badge-destroyed.svg',
  SAVAGE: '/ui/badge-destroyed.svg',
  SPICY: '/ui/badge-spicy.svg',
  FIRE: '/ui/badge-spicy.svg',
  COOKING: '/ui/badge-spicy.svg',
  BRUTAL: '/ui/badge-spicy.svg',
  MID: '/ui/badge-mid.svg',
  CREATIVE: '/ui/badge-mid.svg',
  WEAK: '/ui/badge-weak.svg',
  WACK: '/ui/badge-weak.svg',
  LAZY: '/ui/badge-weak.svg',
  TRASH: '/ui/badge-trash.svg',
  TIMEOUT: '/ui/stamp-timeout.svg',
  BLOCKED: '/ui/stamp-blocked.svg',
}

export function badgeForFeedback(feedback, marks) {
  const key = String(feedback || '').toUpperCase()
  if (BADGE_BY_LABEL[key]) return BADGE_BY_LABEL[key]
  const n = Number(marks) || 0
  if (n >= 9) return BADGE_BY_LABEL.DESTROYED
  if (n >= 7) return BADGE_BY_LABEL.SPICY
  if (n >= 5) return BADGE_BY_LABEL.MID
  if (n >= 3) return BADGE_BY_LABEL.WEAK
  return BADGE_BY_LABEL.TRASH
}

export function medalForRank(rank) {
  if (rank === 1) return UI.medal1
  if (rank === 2) return UI.medal2
  if (rank === 3) return UI.medal3
  return null
}
