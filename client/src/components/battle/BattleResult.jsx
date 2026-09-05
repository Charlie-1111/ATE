import { motion } from 'framer-motion'
import { formatTotal } from '../../lib/scoring.js'
import { UI } from '../../lib/uiAssets.js'

export default function BattleResult({
  winner,
  myRoundWins,
  opponentRoundWins,
  myTotalScore,
  opponentTotalScore,
  myName,
  opponentName,
}) {
  const isWinner = winner === 'me'
  const isDraw = winner === 'draw'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 gap-6 bg-black min-h-screen px-4 relative overflow-hidden"
    >
      <img src={UI.washSpotlight} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />

      {!isDraw && (
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

      <motion.button
        type="button"
        className="relative z-10 ate-btn-live max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={() => { window.location.href = '/' }}
      >
        Back to Home
      </motion.button>
    </motion.div>
  )
}
