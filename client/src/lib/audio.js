const MUTE_KEY = 'ate-mute'

/** CrazyGames SDK mute — overrides local preference when true */
let sdkMuteAudio = false

export function setSdkMuteAudio(muted) {
  sdkMuteAudio = !!muted
}

export function isSdkMuteAudio() {
  return sdkMuteAudio
}

export function loadMuted() {
  try {
    const legacy = localStorage.getItem('ate-home-mute')
    const v = localStorage.getItem(MUTE_KEY) ?? legacy
    return v === '1'
  } catch {
    return false
  }
}

export function saveMuted(muted) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
    localStorage.setItem('ate-home-mute', muted ? '1' : '0')
  } catch {
    /* ignore */
  }
}

/** Effective mute: SDK mute wins over in-game toggle */
export function isEffectivelyMuted() {
  return sdkMuteAudio || loadMuted()
}

let ctx = null

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

/** Short procedural SFX — no asset files required */
export function playSfx(kind) {
  if (isEffectivelyMuted()) return
  const ac = getCtx()
  if (!ac) return
  if (ac.state === 'suspended') ac.resume().catch(() => {})

  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)

  const presets = {
    tick: { type: 'square', f0: 880, f1: 660, dur: 0.06, vol: 0.08 },
    send: { type: 'triangle', f0: 220, f1: 440, dur: 0.12, vol: 0.12 },
    score: { type: 'sawtooth', f0: 180, f1: 520, dur: 0.18, vol: 0.1 },
    round: { type: 'square', f0: 330, f1: 660, dur: 0.22, vol: 0.1 },
    win: { type: 'triangle', f0: 392, f1: 784, dur: 0.4, vol: 0.12 },
    lose: { type: 'sawtooth', f0: 220, f1: 110, dur: 0.35, vol: 0.1 },
  }
  const p = presets[kind] || presets.tick
  osc.type = p.type
  osc.frequency.setValueAtTime(p.f0, now)
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, p.f1), now + p.dur)
  gain.gain.setValueAtTime(p.vol, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + p.dur)
  osc.start(now)
  osc.stop(now + p.dur + 0.02)
}

export function vibrate(pattern = 12) {
  try {
    if (isEffectivelyMuted()) return
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
  } catch {
    /* ignore */
  }
}
