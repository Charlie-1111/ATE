import { motion } from 'framer-motion'

/**
 * Full-screen coin flip revealing who starts the battle.
 */
export default function CoinDrawOverlay({ youGoFirst, opponentName = 'Opponent', onDone }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        // Safety: parent also times dismissal
      }}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-text-muted font-mono">Drawing who starts</p>

      <motion.div
        className="w-28 h-28 rounded-full border-4 border-accent-gold bg-bg-card flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.35)]"
        initial={{ rotateY: 0, scale: 0.6 }}
        animate={{ rotateY: 720, scale: 1 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <span className="font-display text-3xl font-black text-accent-gold">ATE</span>
      </motion.div>

      <motion.p
        className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wider text-center px-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        {youGoFirst ? (
          <span className="text-accent-gold">You go first</span>
        ) : (
          <span className="text-danger">{opponentName} goes first</span>
        )}
      </motion.p>

      {typeof onDone === 'function' && (
        <button type="button" className="sr-only" onClick={onDone} tabIndex={-1} aria-hidden>
          Continue
        </button>
      )}
    </motion.div>
  )
}
