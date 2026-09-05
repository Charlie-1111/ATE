import { create } from 'zustand'

const USER_ID_KEY = 'ate-user-id'
const DISPLAY_NAME_KEY = 'ate-display-name'
const TOKEN_KEY = 'ate_token'
const AUTH_USER_KEY = 'ate-auth-user'

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

function loadAuth() {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const raw = localStorage.getItem(AUTH_USER_KEY)
    const user = raw ? JSON.parse(raw) : null
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

const initialAuth = typeof window !== 'undefined' ? loadAuth() : { token: null, user: null }

export const useUserStore = create((set, get) => ({
  userId: typeof window !== 'undefined'
    ? (initialAuth.user?.id || loadOrCreateUserId())
    : 'guest-ssr',
  displayName: typeof window !== 'undefined'
    ? (initialAuth.user?.username || initialAuth.user?.displayName || loadDisplayName())
    : 'You',
  token: initialAuth.token,
  authUser: initialAuth.user,
  isAuthed: !!initialAuth.token && !!initialAuth.user,

  setDisplayName: (name) => {
    const cleaned = String(name || 'You').trim().slice(0, 24) || 'You'
    try {
      localStorage.setItem(DISPLAY_NAME_KEY, cleaned)
    } catch {
      // ignore
    }
    set({ displayName: cleaned })
  },

  applyAuth: (token, user) => {
    try {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
      localStorage.setItem(USER_ID_KEY, user.id)
      localStorage.setItem(DISPLAY_NAME_KEY, user.username || user.displayName || 'You')
    } catch {
      // ignore
    }
    set({
      token,
      authUser: user,
      isAuthed: true,
      userId: user.id,
      displayName: user.username || user.displayName || 'You',
    })
  },

  logout: () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
    } catch {
      // ignore
    }
    const guestId = loadOrCreateUserId()
    set({
      token: null,
      authUser: null,
      isAuthed: false,
      userId: guestId,
      displayName: loadDisplayName(),
    })
  },

  ensureUser: () => {
    const id = get().userId || loadOrCreateUserId()
    if (id !== get().userId) set({ userId: id })
    return id
  },
}))
