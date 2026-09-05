import { motion } from 'framer-motion'
import { formatScore } from '../../lib/scoring.js'

export default function BattleResult({ winner, myRoundWins, opponentRoundWins, myTotalScore, opponentTotalScore, myName, opponentName }) {
  const isWinner = winner === 'me'
  const isDraw = winner === 'draw'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 gap-6 bg-black min-h-screen"
    >
      <motion.h2
        className={`font-display text-6xl font-black uppercase tracking-wider ${
          isWinner ? 'text-accent-gold' : isDraw ? 'text-text-muted' : 'text-danger'
        }`}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        {isWinner ? 'VICTORY' : isDraw ? 'DRAW' : 'DEFEAT'}
      </motion.h2>

      <motion.div
        className="flex items-center gap-8 bg-bg-card border-4 border-accent-gold rounded-xl p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center">
          <p className="font-display text-accent-gold text-lg uppercase tracking-wider">{myName}</p>
          <p className="font-display text-5xl font-black text-white mt-2">{formatScore(myTotalScore ?? 0)}/10</p>
          <p className="text-text-muted text-sm mt-1">{myRoundWins} round wins</p>
        </div>

        <span className="font-display text-3xl text-text-muted">VS</span>

        <div className="text-center">
          <p className="font-display text-danger text-lg uppercase tracking-wider">{opponentName}</p>
          <p className="font-display text-5xl font-black text-white mt-2">{formatScore(opponentTotalScore ?? 0)}/10</p>
          <p className="text-text-muted text-sm mt-1">{opponentRoundWins} round wins</p>
        </div>
      </motion.div>

      <motion.button
        className="bg-accent-gold text-black font-display font-black text-lg uppercase tracking-wider py-3 px-10 rounded-lg border-4 border-black mt-4 hover:bg-yellow-500 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={() => window.location.href = '/'}
      >
        Back to Home
      </motion.button>
    </motion.div>
  )
}
