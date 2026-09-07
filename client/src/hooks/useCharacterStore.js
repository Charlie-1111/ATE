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
const WINS_KEY = 'ate-ranked-wins'

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

function mergeUnlocked(wins) {
  const fromWins = unlockedFromWins(wins)
  return [...new Set([DEFAULT_CHARACTER_ID, ...fromWins])]
}

function buildState() {
  const wins = typeof window !== 'undefined' ? loadWins() : 0
  const unlockedIds = mergeUnlocked(wins)
  let characterId = typeof window !== 'undefined' ? loadId() : DEFAULT_CHARACTER_ID
  if (!unlockedIds.includes(characterId)) characterId = DEFAULT_CHARACTER_ID
  return { characterId, unlockedIds, rankedWins: wins }
}

export const useCharacterStore = create((set, get) => ({
  ...buildState(),

  selectCharacter: (id) => {
    const { rankedWins, unlockedIds } = get()
    if (!isUnlocked(id, { wins: rankedWins })) return false
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

  /** Sync ranked wins from leaderboard profile (or after a PvP win). */
  setRankedWins: (wins) => {
    const n = Math.max(0, Number(wins) || 0)
    const { characterId } = get()
    persistWins(n)
    const unlockedIds = mergeUnlocked(n)
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
