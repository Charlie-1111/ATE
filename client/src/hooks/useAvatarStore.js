import { create } from 'zustand'
import {
  AVATAR_PRESETS,
  DEFAULT_AVATAR_ID,
  getPreset,
  getPresetConfig,
} from '../lib/avatarPresets.js'

const STORAGE_KEY = 'ate-avatar-id'
const LEGACY_KEY = 'ate-avatar-config'

function loadAvatarId() {
  try {
    const id = localStorage.getItem(STORAGE_KEY)
    if (id && getPreset(id)?.id === id) return id
    // Ignore legacy part-config saves; start at default
    if (localStorage.getItem(LEGACY_KEY)) {
      localStorage.removeItem(LEGACY_KEY)
    }
  } catch {
    // ignore
  }
  return DEFAULT_AVATAR_ID
}

function persist(avatarId) {
  try {
    localStorage.setItem(STORAGE_KEY, avatarId)
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // ignore quota / private mode
  }
}

function stateFor(avatarId) {
  const id = getPreset(avatarId).id
  return {
    avatarId: id,
    config: getPresetConfig(id),
  }
}

export const useAvatarStore = create((set) => ({
  ...stateFor(typeof window !== 'undefined' ? loadAvatarId() : DEFAULT_AVATAR_ID),

  selectAvatar: (id) => {
    const next = stateFor(id)
    persist(next.avatarId)
    set(next)
  },

  resetAvatar: () => {
    const next = stateFor(DEFAULT_AVATAR_ID)
    persist(next.avatarId)
    set(next)
  },
}))

export { AVATAR_PRESETS, DEFAULT_AVATAR_ID }
