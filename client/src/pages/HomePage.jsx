import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { UI } from '../lib/uiAssets.js'
import { useUserStore } from '../hooks/useUserStore.js'

const MUTE_KEY = 'ate-home-mute'
const BGM_VOLUME = 0.35

function loadMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export default function HomePage() {
  const navigate = useNavigate()
  const isAuthed = useUserStore((s) => s.isAuthed)
  const displayName = useUserStore((s) => s.displayName)
  const logout = useUserStore((s) => s.logout)
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(loadMuted)
  const [bgmReady, setBgmReady] = useState(false)

  useEffect(() => {
    const audio = new Audio(UI.homeBgm)
    audio.loop = true
    audio.volume = BGM_VOLUME
    audio.preload = 'auto'
    audioRef.current = audio

    const tryPlay = () => {
      if (loadMuted()) return
      audio.play().then(() => setBgmReady(true)).catch(() => {
        // Autoplay blocked until user gesture
        setBgmReady(false)
      })
    }
    tryPlay()

    const unlock = () => {
      if (!audioRef.current || loadMuted()) return
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
    audio.muted = muted
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
    } catch {
      // ignore
    }
    if (!muted) {
      audio.play().then(() => setBgmReady(true)).catch(() => {})
    }
  }, [muted])

  const toggleMute = () => {
    setMuted((m) => !m)
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center gap-6 px-4">
      <img
        src={UI.homeArenaBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleMute}
          className="font-display text-xs uppercase tracking-wider border-2 border-gray-600 text-[var(--ate-bone)] px-3 py-2 rounded-lg hover:border-[var(--ate-gold)]"
          aria-label={muted ? 'Unmute music' : 'Mute music'}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? 'Muted' : bgmReady ? 'Music' : 'Music'}
        </button>
        {isAuthed ? (
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
          Real-Time 1v1 Roast Battles
        </motion.p>

        <motion.div
          className="flex flex-col gap-3 w-full max-w-xs"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button type="button" className="ate-btn-live" onClick={() => navigate('/battle')}>
            Find Match
          </button>
          <button type="button" className="ate-btn-live" onClick={() => navigate('/practice')}>
            Practice vs AI
          </button>
          <button type="button" className="ate-btn-live ate-btn-live--dark" onClick={() => navigate('/leaderboard')}>
            Leaderboard
          </button>
          <button type="button" className="ate-btn-live ate-btn-live--dark" onClick={() => navigate('/shop')}>
            Pick Character
          </button>
        </motion.div>

        <p className="text-[10px] text-[var(--ate-grey)] uppercase tracking-[0.3em] font-mono drop-shadow-[0_1px_2px_#000]">
          v0.2.0
        </p>
      </div>
    </div>
  )
}
