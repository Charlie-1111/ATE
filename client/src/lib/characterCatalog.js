/** Rap character pack catalog — unlock tiers + premium mock buy */

export const DEFAULT_CHARACTER_ID = 'echo'

export const CHARACTERS = [
  { id: 'echo', name: 'Echo', rarity: 'free', winsRequired: 0, price: null },
  { id: 'riff', name: 'Riff', rarity: 'progress', winsRequired: 1, price: null },
  { id: 'koko', name: 'Koko', rarity: 'progress', winsRequired: 3, price: null },
  { id: 'torque', name: 'Torque', rarity: 'progress', winsRequired: 5, price: null },
  { id: 'velvet', name: 'Velvet', rarity: 'progress', winsRequired: 8, price: null },
  { id: 'brickz', name: 'Brickz', rarity: 'progress', winsRequired: 12, price: null },
  { id: 'nyx', name: 'Nyx', rarity: 'progress', winsRequired: 18, price: null },
  { id: 'riot', name: 'Riot', rarity: 'progress', winsRequired: 25, price: null },
  { id: 'vanta', name: 'Vanta', rarity: 'premium', winsRequired: null, price: '$4.99' },
  { id: 'solara', name: 'Solara', rarity: 'premium', winsRequired: null, price: '$4.99' },
]

const BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]))

export function getCharacter(id) {
  return BY_ID[id] || BY_ID[DEFAULT_CHARACTER_ID]
}

export function characterModelUrl(id) {
  const c = getCharacter(id)
  return `/characters/${c.id}.glb`
}

/** Progress unlocks from ranked wins + always Echo; premium must be bought separately. */
export function unlockedFromWins(wins = 0) {
  const n = Math.max(0, Number(wins) || 0)
  return CHARACTERS
    .filter((c) => c.rarity !== 'premium' && (c.winsRequired || 0) <= n)
    .map((c) => c.id)
}

export function isUnlocked(id, { wins = 0, purchasedIds = [] } = {}) {
  const c = getCharacter(id)
  if (c.rarity === 'free') return true
  if (c.rarity === 'premium') return purchasedIds.includes(c.id)
  return (c.winsRequired || 0) <= wins
}

export function unlockHint(id, { wins = 0, purchasedIds = [] } = {}) {
  const c = getCharacter(id)
  if (isUnlocked(id, { wins, purchasedIds })) return null
  if (c.rarity === 'premium') return `Buy · ${c.price}`
  const need = (c.winsRequired || 0) - wins
  return need <= 1 ? 'Win 1 more ranked' : `Win ${need} more ranked`
}
