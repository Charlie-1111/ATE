/** Rap roster catalog — street / drip / icon unlock tiers */

export const DEFAULT_CHARACTER_ID = 'static'

export const CHARACTERS = [
  { id: 'static', name: 'Static', rarity: 'free', winsRequired: 0, price: null },
  { id: 'lil_grid', name: 'Lil Grid', rarity: 'progress', winsRequired: 1, price: null },
  { id: 'young_vector', name: 'Young Vector', rarity: 'progress', winsRequired: 3, price: null },
  { id: 'poly_flow', name: 'Poly Flow', rarity: 'progress', winsRequired: 5, price: null },
  { id: 'static_drip', name: 'Static Drip', rarity: 'progress', winsRequired: 8, price: null },
  { id: 'grid_drip', name: 'Lil Grid Drip', rarity: 'progress', winsRequired: 12, price: null },
  { id: 'vector_drip', name: 'Young Vector Drip', rarity: 'progress', winsRequired: 18, price: null },
  { id: 'poly_drip', name: 'Poly Flow Drip', rarity: 'progress', winsRequired: 25, price: null },
  { id: 'king_octane', name: 'King Octane', rarity: 'progress', winsRequired: 40, price: null },
  { id: 'nova_scott', name: 'Nova Scott', rarity: 'progress', winsRequired: 55, price: null },
]

const BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]))

export function getCharacter(id) {
  return BY_ID[id] || BY_ID[DEFAULT_CHARACTER_ID]
}

export function characterModelUrl(id) {
  const c = getCharacter(id)
  return `/characters/${c.id}.glb`
}

/** Map battle animation intents → clips shipped in the roster GLBs. */
export function resolveClipName(want, available = {}) {
  const w = (want || 'idle').toLowerCase()
  const aliases = {
    idle: ['idle'],
    roast: ['rap_verse', 'roast', 'idle'],
    hit: ['dance', 'hit', 'idle'],
    victory: ['dance', 'victory', 'idle'],
    dance: ['dance', 'idle'],
    rap_verse: ['rap_verse', 'idle'],
  }
  for (const name of aliases[w] || [w, 'idle']) {
    if (available[name]) return name
  }
  return Object.keys(available)[0] || null
}

/** Progress unlocks from ranked wins + always Static. */
export function unlockedFromWins(wins = 0) {
  const n = Math.max(0, Number(wins) || 0)
  return CHARACTERS
    .filter((c) => (c.winsRequired || 0) <= n)
    .map((c) => c.id)
}

export function isUnlocked(id, { wins = 0 } = {}) {
  const c = getCharacter(id)
  return (c.winsRequired || 0) <= wins
}

export function unlockHint(id, { wins = 0 } = {}) {
  const c = getCharacter(id)
  if (isUnlocked(id, { wins })) return null
  const need = (c.winsRequired || 0) - wins
  return need <= 1 ? 'Win 1 more ranked' : `Win ${need} more ranked`
}
