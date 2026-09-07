import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { formatTotal } from '../../lib/scoring.js'
import { UI } from '../../lib/uiAssets.js'
import { playSfx } from '../../lib/audio.js'
import { PLAY_URL } from '../../lib/playUrl.js'

export default function BattleResult({
  winner,
  myRoundWins,
  opponentRoundWins,
  myTotalScore,
  opponentTotalScore,
  myName,
  opponentName,
  messages = [],
  onRematch,
  onPracticeAgain,
  isPractice = false,
}) {
  const isWinner = winner === 'me'
  const isDraw = winner === 'draw'
  const disconnected = winner === 'opponent_disconnected'

  const bestRoast = useMemo(() => {
    const mine = (messages || []).filter((m) => m.isMe && m.text && !m.isTimeout)
    if (!mine.length) return null
    return mine.reduce((a, b) => ((b.marks ?? 0) >= (a.marks ?? 0) ? b : a))
  }, [messages])

  useEffect(() => {
    if (isWinner) playSfx('win')
    else if (!isDraw) playSfx('lose')
  }, [isWinner, isDraw])

  const shareText = encodeURIComponent(
    `I just ${isWinner ? 'won' : 'battled'} on ATE — ${formatTotal(myTotalScore ?? 0)} marks. ${PLAY_URL}`,
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 gap-6 bg-black min-h-screen px-4 relative overflow-hidden"
    >
      <img src={UI.washSpotlight} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />

      {disconnected && (
        <h2 className="relative z-10 font-display text-4xl text-[var(--ate-gold)] uppercase tracking-wider text-center">
          Opponent disconnected
        </h2>
      )}

      {!isDraw && !disconnected && (
        <motion.img
          src={isWinner ? UI.bannerVictory : UI.bannerDefeat}
          alt={isWinner ? 'Victory' : 'Defeat'}
          className="relative z-10 w-full max-w-lg drop-shadow-[6px_6px_0_#000]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring' }}
        />
      )}

      {isDraw && (
        <h2 className="relative z-10 font-display text-6xl text-[var(--ate-grey)] uppercase tracking-wider">
          DRAW
        </h2>
      )}

      <motion.div
        className="relative z-10 flex items-center gap-8 bg-[var(--ate-ink)] border-4 border-[var(--ate-gold)] rounded-xl p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <div className="text-center">
          <p className="font-display text-[var(--ate-gold)] text-lg uppercase tracking-wider">{myName}</p>
          <p className="font-display text-5xl text-[var(--ate-bone)] mt-2">{formatTotal(myTotalScore ?? 0)}</p>
          <p className="text-[var(--ate-grey)] text-sm mt-1">{myRoundWins} round wins</p>
        </div>

        <img src={UI.vs} alt="VS" className="w-14 h-14" />

        <div className="text-center">
          <p className="font-display text-[var(--ate-red)] text-lg uppercase tracking-wider">{opponentName}</p>
          <p className="font-display text-5xl text-[var(--ate-bone)] mt-2">{formatTotal(opponentTotalScore ?? 0)}</p>
          <p className="text-[var(--ate-grey)] text-sm mt-1">{opponentRoundWins} round wins</p>
        </div>
      </motion.div>

      {bestRoast && (
        <p className="relative z-10 text-center max-w-md text-[var(--ate-bone)] italic text-sm">
          Best bar: “{bestRoast.text}” · {bestRoast.marks}/10
        </p>
      )}

      <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <motion.button
          type="button"
          className="ate-btn-live flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => (isPractice ? onPracticeAgain?.() : onRematch?.())}
        >
          {isPractice ? 'Practice again' : 'Rematch'}
        </motion.button>
        {!isPractice && onPracticeAgain && (
          <motion.button
            type="button"
            className="flex-1 bg-[var(--ate-ink)] border-4 border-[var(--ate-gold)] text-[var(--ate-gold)] font-display uppercase tracking-wider py-3 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            onClick={() => onPracticeAgain?.()}
          >
            Vs AI
          </motion.button>
        )}
      </div>

      <a
        className="relative z-10 text-sm text-[var(--ate-grey)] hover:text-[var(--ate-gold)] font-mono underline"
        href={`https://twitter.com/intent/tweet?text=${shareText}`}
        target="_blank"
        rel="noreferrer"
      >
        Share result
      </a>

      <motion.button
        type="button"
        className="relative z-10 text-[var(--ate-grey)] font-display uppercase tracking-wider text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={() => { window.location.href = '/' }}
      >
        Back to Home
      </motion.button>
    </motion.div>
  )
}
