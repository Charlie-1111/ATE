import { useEffect, useState, useCallback } from 'react'
import { useUserStore } from './useUserStore.js'
import api from '../lib/api.js'
import {
  getCrazyGamesUserToken,
  initCrazyGames,
  isCrazyGamesHost,
  promptCrazyGamesAuth,
  syncCrazyGamesMuteAudio,
} from '../lib/crazygames.js'
import { setSdkMuteAudio } from '../lib/audio.js'

/**
 * On CrazyGames: auto-link CG User → ATE backend (no external login UI).
 * Outside CG: no-op.
 *
 * @param {{ auto?: boolean }} opts
 */
export function useCrazyGamesAuth(opts = {}) {
  const auto = opts.auto !== false
  const applyAuth = useUserStore((s) => s.applyAuth)
  const isAuthed = useUserStore((s) => s.isAuthed)
  const authUser = useUserStore((s) => s.authUser)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [platform, setPlatform] = useState(() => isCrazyGamesHost())

  const linkWithToken = useCallback(async (token) => {
    const { data } = await api.post('/auth/crazygames', { token })
    if (data?.token && data?.user) {
      applyAuth(data.token, data.user)
      setStatus('linked')
      return data.user
    }
    throw new Error('No token from server')
  }, [applyAuth])

  const linkCrazyGamesUser = useCallback(async ({ promptIfNeeded = false } = {}) => {
    await initCrazyGames()
    if (!isCrazyGamesHost()) {
      setPlatform(false)
      setStatus('unavailable')
      return null
    }
    setPlatform(true)
    setStatus('linking')
    setError(null)
    try {
      let token = await getCrazyGamesUserToken()
      if (!token && promptIfNeeded) {
        await promptCrazyGamesAuth()
        token = await getCrazyGamesUserToken()
      }
      if (!token) {
        setStatus('guest')
        return null
      }
      return await linkWithToken(token)
    } catch (err) {
      console.warn('[CrazyGames] link failed', err)
      setError(err.response?.data?.error || err.message || 'Link failed')
      setStatus('error')
      return null
    }
  }, [linkWithToken])

  useEffect(() => {
    if (!auto) return undefined
    let cancelled = false
    ;(async () => {
      const sdk = await initCrazyGames()
      if (cancelled) return

      await syncCrazyGamesMuteAudio((muted) => {
        setSdkMuteAudio(muted)
      })

      if (!isCrazyGamesHost()) {
        setPlatform(false)
        setStatus('unavailable')
        return
      }
      setPlatform(true)

      // Auth change listener — re-link when user signs into CrazyGames mid-session
      try {
        sdk?.user?.addAuthListener?.(async () => {
          if (cancelled) return
          await linkCrazyGamesUser({ promptIfNeeded: false })
        })
      } catch {
        /* older SDK */
      }

      // Always attempt silent auto-login (CG requirement)
      if (!isAuthed || authUser?.provider === 'crazygames' || !authUser) {
        const user = await linkCrazyGamesUser({ promptIfNeeded: false })
        if (!cancelled && !user) setStatus('guest')
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto])

  return {
    status,
    error,
    isCrazyGames: platform || isCrazyGamesHost(),
    linkCrazyGamesUser,
  }
}
