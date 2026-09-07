/**
 * CrazyGames HTML5 SDK v3 helpers.
 * Safe no-ops when not embedded on CrazyGames.
 */

let initPromise = null
/** Set after init — true only when CG account system is available */
let accountAvailable = false

export function isCrazyGamesHost() {
  try {
    if (typeof window === 'undefined') return false
    if (accountAvailable) return true
    const host = window.location?.hostname || ''
    if (/crazygames\.com$/i.test(host) || host.includes('crazygames')) return true
    // SDK script is always loaded; availability is only true on CG
    return !!window.CrazyGames?.SDK?.user?.isUserAccountAvailable
  } catch {
    return false
  }
}

export function isCrazyGamesAccountAvailable() {
  return accountAvailable || !!window.CrazyGames?.SDK?.user?.isUserAccountAvailable
}

export async function initCrazyGames() {
  if (typeof window === 'undefined' || !window.CrazyGames?.SDK) return null
  if (!initPromise) {
    initPromise = (async () => {
      const sdk = window.CrazyGames.SDK
      try {
        sdk.game?.sdkGameLoadingStart?.()
      } catch {
        /* ignore */
      }
      await sdk.init()
      accountAvailable = !!sdk.user?.isUserAccountAvailable
      try {
        sdk.game?.sdkGameLoadingStop?.()
      } catch {
        /* ignore */
      }
      return sdk
    })().catch((err) => {
      console.warn('[CrazyGames] init failed', err)
      initPromise = null
      accountAvailable = false
      return null
    })
  }
  return initPromise
}

export async function getCrazyGamesUser() {
  const sdk = await initCrazyGames()
  if (!sdk?.user?.isUserAccountAvailable) return null
  try {
    return await sdk.user.getUser()
  } catch {
    return null
  }
}

/** Always call when you need a token — do not cache (1h lifetime, SDK refreshes). */
export async function getCrazyGamesUserToken() {
  const sdk = await initCrazyGames()
  if (!sdk?.user?.isUserAccountAvailable) return null
  try {
    return await sdk.user.getUserToken()
  } catch (err) {
    console.warn('[CrazyGames] getUserToken', err?.message || err)
    return null
  }
}

export async function promptCrazyGamesAuth() {
  const sdk = await initCrazyGames()
  if (!sdk?.user?.showAuthPrompt) return null
  try {
    return await sdk.user.showAuthPrompt()
  } catch {
    return null
  }
}

/**
 * Read muteAudio from SDK settings (takes priority over in-game mute).
 * Call after init. Also registers change listener once.
 */
export async function syncCrazyGamesMuteAudio(onChange) {
  const sdk = await initCrazyGames()
  if (!sdk?.game) return false

  const apply = (settings) => {
    const muted = !!(settings?.muteAudio)
    onChange?.(muted)
    return muted
  }

  try {
    apply(sdk.game.settings)
  } catch {
    /* ignore */
  }

  try {
    const listener = (settings) => apply(settings)
    sdk.game.addSettingsChangeListener?.(listener)
  } catch {
    /* ignore */
  }

  return !!(sdk.game.settings?.muteAudio)
}

export function gameplayStart() {
  try {
    window.CrazyGames?.SDK?.game?.gameplayStart?.()
  } catch {
    /* ignore */
  }
}

export function gameplayStop() {
  try {
    window.CrazyGames?.SDK?.game?.gameplayStop?.()
  } catch {
    /* ignore */
  }
}
