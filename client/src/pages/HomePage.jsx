import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { UI } from '../lib/uiAssets.js'
import { useUserStore } from '../hooks/useUserStore.js'
import { useCrazyGamesAuth } from '../hooks/useCrazyGamesAuth.js'
import {
  loadMuted,
  saveMuted,
  isSdkMuteAudio,
  isEffectivelyMuted,
} from '../lib/audio.js'
import { PLAY_URL } from '../lib/playUrl.js'

const BGM_VOLUME = 0.35

export default function HomePage() {
  const navigate = useNavigate()
  const isAuthed = useUserStore((s) => s.isAuthed)
  const displayName = useUserStore((s) => s.displayName)
  const authUser = useUserStore((s) => s.authUser)
  const logout = useUserStore((s) => s.logout)
  const { isCrazyGames, status: cgStatus } = useCrazyGamesAuth({ auto: false })
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(loadMuted)
  const [bgmReady, setBgmReady] = useState(false)
  const [, setSdkTick] = useState(0)

  // Re-check SDK mute periodically / on focus (settings listener also updates module flag)
  useEffect(() => {
    const id = setInterval(() => setSdkTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const sdkMuted = isSdkMuteAudio()
  const effectiveMute = sdkMuted || muted

  useEffect(() => {
    const audio = new Audio(UI.homeBgm)
    audio.loop = true
    audio.volume = BGM_VOLUME
    audio.preload = 'auto'
    audioRef.current = audio

    const tryPlay = () => {
      if (isEffectivelyMuted()) return
      audio.play().then(() => setBgmReady(true)).catch(() => {
        setBgmReady(false)
      })
    }
    tryPlay()

    const unlock = () => {
      if (!audioRef.current || isEffectivelyMuted()) return
      audioRef.current.play().then(() => setBgmReady(true)).catch(() => {})
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const off = sdkMuted || muted
    audio.muted = off
    if (!sdkMuted) saveMuted(muted)
    if (!off) {
      audio.play().then(() => setBgmReady(true)).catch(() => {})
    } else {
      audio.pause()
    }
  }, [muted, sdkMuted, effectiveMute])

  const toggleMute = () => {
    // CrazyGames SDK mute takes priority — cannot unmute against platform
    if (sdkMuted) return
    setMuted((m) => !m)
  }

  const onCg = isCrazyGames
  const linkedCg = isAuthed && authUser?.provider === 'crazygames'

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center gap-6 px-4">
      <img
        src={UI.homeArenaBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
        style={{ imageRendering: 'auto' }}
        decoding="async"
        draggable={false}
      />

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 flex-wrap justify-end">
        <button
          type="button"
          onClick={toggleMute}
          disabled={sdkMuted}
          className="font-display text-xs uppercase tracking-wider border-2 border-gray-600 text-[var(--ate-bone)] px-3 py-2 rounded-lg hover:border-[var(--ate-gold)] disabled:opacity-50"
          aria-label={effectiveMute ? 'Unmute music' : 'Mute music'}
          title={sdkMuted ? 'Muted by CrazyGames' : effectiveMute ? 'Unmute' : 'Mute'}
        >
          {sdkMuted ? 'Muted (CG)' : muted ? 'Muted' : bgmReady ? 'Music' : 'Music'}
        </button>

        {/* CrazyGames: no external login / signup / logout — auto-linked only */}
        {onCg ? (
          linkedCg || isAuthed ? (
            <span className="font-display text-sm text-[var(--ate-gold)] uppercase tracking-wider hidden sm:inline">
              {displayName}
              {linkedCg ? ' · CG' : ''}
            </span>
          ) : cgStatus === 'linking' ? (
            <span className="font-display text-xs text-[var(--ate-grey)] uppercase tracking-wider">
              Signing in…
            </span>
          ) : null
        ) : isAuthed ? (
          <>
            <span className="font-display text-sm text-[var(--ate-gold)] uppercase tracking-wider hidden sm:inline">
              {displayName}
            </span>
            <button
              type="button"
              onClick={() => logout()}
              className="font-display text-xs uppercase tracking-wider border-2 border-gray-600 text-[var(--ate-bone)] px-3 py-2 rounded-lg hover:border-[var(--ate-gold)]"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="font-display text-xs uppercase tracking-wider border-2 border-gray-600 text-[var(--ate-bone)] px-3 py-2 rounded-lg hover:border-[var(--ate-gold)]"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="font-display text-xs uppercase tracking-wider bg-[var(--ate-gold)] text-black px-3 py-2 rounded-lg border-2 border-black"
            >
              Sign up
            </Link>
          </>
        )}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md">
        <motion.img
          src={UI.logoHorizontal}
          alt="ATE"
          className="w-full max-w-sm drop-shadow-[0_6px_0_#000]"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        />

        <motion.p
          className="text-lg text-[var(--ate-bone)] font-street text-center -mt-2 drop-shadow-[0_2px_4px_#000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Text-based roast battles. Real opponents. Instant score.
        </motion.p>
        <p className="text-sm text-[var(--ate-grey)] text-center font-mono drop-shadow-[0_1px_2px_#000]">
          Drop a roast. 20 seconds. No mercy.
        </p>

        <motion.div
          className="flex flex-col gap-3 w-full max-w-xs"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button type="button" className="ate-btn-live" onClick={() => navigate('/practice')}>
            Practice vs AI
          </button>
          <button type="button" className="ate-btn-live" onClick={() => navigate('/battle')}>
            Find Match
          </button>
          <button type="button" className="ate-btn-live ate-btn-live--dark" onClick={() => navigate('/leaderboard')}>
            Leaderboard
          </button>
          <button type="button" className="ate-btn-live ate-btn-live--dark" onClick={() => navigate('/shop')}>
            Pick Character
          </button>
        </motion.div>

        <p className="text-[10px] text-[var(--ate-grey)] uppercase tracking-[0.3em] font-mono drop-shadow-[0_1px_2px_#000]">
          v0.3.0 · {PLAY_URL.replace(/^https?:\/\//, '')}
        </p>
      </div>
    </div>
  )
}
