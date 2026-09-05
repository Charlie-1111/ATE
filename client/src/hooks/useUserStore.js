import { create } from 'zustand'

const USER_ID_KEY = 'ate-user-id'
const DISPLAY_NAME_KEY = 'ate-display-name'

function loadOrCreateUserId() {
  try {
    let id = localStorage.getItem(USER_ID_KEY)
    if (id && id.length >= 4) return id
    id = `guest-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`}`
    localStorage.setItem(USER_ID_KEY, id)
    return id
  } catch {
    return `guest-${Date.now()}`
  }
}

function loadDisplayName() {
  try {
    return localStorage.getItem(DISPLAY_NAME_KEY) || 'You'
  } catch {
    return 'You'
  }
}

export const useUserStore = create((set, get) => ({
  userId: typeof window !== 'undefined' ? loadOrCreateUserId() : 'guest-ssr',
  displayName: typeof window !== 'undefined' ? loadDisplayName() : 'You',

  setDisplayName: (name) => {
    const cleaned = String(name || 'You').trim().slice(0, 24) || 'You'
    try {
      localStorage.setItem(DISPLAY_NAME_KEY, cleaned)
    } catch {
      // ignore
    }
    set({ displayName: cleaned })
  },

  ensureUser: () => {
    const id = get().userId || loadOrCreateUserId()
    if (id !== get().userId) set({ userId: id })
    return id
  },
}))
