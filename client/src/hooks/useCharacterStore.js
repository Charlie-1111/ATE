import { create } from 'zustand'
import {
  CHARACTERS,
  DEFAULT_CHARACTER_ID,
  getCharacter,
  isUnlocked,
  unlockedFromWins,
} from '../lib/characterCatalog.js'

const ID_KEY = 'ate-character-id'
const UNLOCKED_KEY = 'ate-unlocked-characters'
const PURCHASED_KEY = 'ate-purchased-characters'
const WINS_KEY = 'ate-ranked-wins'

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function loadId() {
  try {
    const id = localStorage.getItem(ID_KEY)
    if (id && getCharacter(id)?.id === id) return id
  } catch {
    // ignore
  }
  return DEFAULT_CHARACTER_ID
}

function loadWins() {
  try {
    const n = Number(localStorage.getItem(WINS_KEY))
    return Number.isFinite(n) && n > 0 ? n : 0
  } catch {
    return 0
  }
}

function persistId(id) {
  try {
    localStorage.setItem(ID_KEY, id)
  } catch {
    // ignore
  }
}

function persistList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify([...new Set(list)]))
  } catch {
    // ignore
  }
}

function persistWins(wins) {
  try {
    localStorage.setItem(WINS_KEY, String(wins))
  } catch {
    // ignore
  }
}

function mergeUnlocked(wins, purchased) {
  const fromWins = unlockedFromWins(wins)
  return [...new Set([DEFAULT_CHARACTER_ID, ...fromWins, ...purchased])]
}

function buildState() {
  const wins = typeof window !== 'undefined' ? loadWins() : 0
  const purchased = typeof window !== 'undefined' ? loadJson(PURCHASED_KEY, []) : []
  const unlockedIds = mergeUnlocked(wins, purchased)
  let characterId = typeof window !== 'undefined' ? loadId() : DEFAULT_CHARACTER_ID
  if (!unlockedIds.includes(characterId)) characterId = DEFAULT_CHARACTER_ID
  return { characterId, unlockedIds, purchasedIds: purchased, rankedWins: wins }
}

export const useCharacterStore = create((set, get) => ({
  ...buildState(),

  selectCharacter: (id) => {
    const { rankedWins, purchasedIds, unlockedIds } = get()
    if (!isUnlocked(id, { wins: rankedWins, purchasedIds })) return false
    const next = getCharacter(id).id
    persistId(next)
    if (!unlockedIds.includes(next)) {
      const unlocked = [...unlockedIds, next]
      persistList(UNLOCKED_KEY, unlocked)
      set({ characterId: next, unlockedIds: unlocked })
    } else {
      set({ characterId: next })
    }
    return true
  },

  unlockPremium: (id) => {
    const c = getCharacter(id)
    if (c.rarity !== 'premium') return false
    const { purchasedIds, rankedWins } = get()
    // Unlock only — shop requires tick/confirm to equip
    if (purchasedIds.includes(c.id)) return true
    const purchased = [...purchasedIds, c.id]
    const unlockedIds = mergeUnlocked(rankedWins, purchased)
    persistList(PURCHASED_KEY, purchased)
    persistList(UNLOCKED_KEY, unlockedIds)
    set({ purchasedIds: purchased, unlockedIds })
    return true
  },

  /** Merge server purchase list (after login / Stripe return). */
  syncPurchases: (ids) => {
    const list = Array.isArray(ids) ? ids : []
    const { purchasedIds, rankedWins } = get()
    const purchased = [...new Set([...purchasedIds, ...list])]
    const unlockedIds = mergeUnlocked(rankedWins, purchased)
    persistList(PURCHASED_KEY, purchased)
    persistList(UNLOCKED_KEY, unlockedIds)
    set({ purchasedIds: purchased, unlockedIds })
  },

  /** Sync ranked wins from leaderboard profile (or after a PvP win). */
  setRankedWins: (wins) => {
    const n = Math.max(0, Number(wins) || 0)
    const { purchasedIds, characterId } = get()
    persistWins(n)
    const unlockedIds = mergeUnlocked(n, purchasedIds)
    persistList(UNLOCKED_KEY, unlockedIds)
    const stillOk = unlockedIds.includes(characterId)
    const nextId = stillOk ? characterId : DEFAULT_CHARACTER_ID
    if (!stillOk) persistId(nextId)
    set({ rankedWins: n, unlockedIds, characterId: nextId })
  },

  resetCharacter: () => {
    persistId(DEFAULT_CHARACTER_ID)
    set({ characterId: DEFAULT_CHARACTER_ID })
  },
}))

export { CHARACTERS, DEFAULT_CHARACTER_ID }
