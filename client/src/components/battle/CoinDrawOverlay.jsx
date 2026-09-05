import { motion } from 'framer-motion'
import { UI } from '../../lib/uiAssets.js'

/**
 * Full-screen coin flip revealing who starts the battle.
 */
export default function CoinDrawOverlay({ youGoFirst, opponentName = 'Opponent' }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--ate-grey)] font-mono">
        Drawing who starts
      </p>

      <div className="relative w-36 h-36" style={{ perspective: 800 }}>
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 720 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        >
          <img
            src={youGoFirst ? UI.coinFront : UI.coinBack}
            alt=""
            className="absolute inset-0 w-full h-full drop-shadow-[0_0_24px_rgba(255,215,0,0.35)]"
          />
          <img
            src={UI.coinAte}
            alt=""
            className="absolute inset-[18%] w-[64%] h-[64%] opacity-90 pointer-events-none"
          />
        </motion.div>
      </div>

      <motion.p
        className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-center px-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        {youGoFirst ? (
          <span className="text-[var(--ate-gold)]">You go first</span>
        ) : (
          <span className="text-[var(--ate-red)]">{opponentName} goes first</span>
        )}
      </motion.p>
    </motion.div>
  )
}
