import { motion } from 'framer-motion'
import { formatScore, formatTotal, getScoreTier } from '../../lib/scoring.js'

export default function ScoreReveal({ result, isVisible }) {
  if (!result || !isVisible) return null

  const marks = Number(result.marks ?? result.quality ?? result.score) || 0
  const tier = getScoreTier(marks)
  const tierClass = result.isTimeout || result.blocked
    ? 'text-danger'
    : marks >= 9
      ? 'text-accent-gold'
      : marks >= 7
        ? 'text-accent-cyan'
        : marks >= 5
          ? 'text-white'
          : 'text-danger'

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex flex-col items-center gap-3 py-6"
    >
      <motion.div
        className="text-7xl font-display font-black"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <span className={tierClass}>{formatScore(marks)}/10</span>
      </motion.div>

      <p className="text-sm text-text-muted font-mono">
        total {formatTotal(result.newTotal ?? marks)}
      </p>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 400 }}
        className="text-xl font-display font-bold uppercase tracking-wider"
      >
        {result.isTimeout ? (
          <span className="text-danger">TIMEOUT</span>
        ) : result.blocked ? (
          <span className="text-danger">BLOCKED</span>
        ) : (
          <span className={tierClass}>{result.feedback || tier.label}</span>
        )}
      </motion.div>

      {result.text && !result.isTimeout && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-text text-center max-w-md italic"
        >
          "{result.text}"
        </motion.p>
      )}
    </motion.div>
  )
}
