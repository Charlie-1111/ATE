import { motion } from 'framer-motion'
import { formatScore, formatTotal, getScoreTier } from '../../lib/scoring.js'
import { badgeForFeedback, UI } from '../../lib/uiAssets.js'

export default function ScoreReveal({ result, isVisible }) {
  if (!result || !isVisible) return null

  const marks = Number(result.marks ?? result.quality ?? result.score) || 0
  const tier = getScoreTier(marks)
  const feedback = String(result.feedback || tier.label || 'MID').toUpperCase()
  const stamp = result.isTimeout
    ? UI.stampTimeout
    : result.blocked
      ? UI.stampBlocked
      : badgeForFeedback(feedback, marks)

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex flex-col items-center gap-3 py-6 px-4"
    >
      <motion.p
        className="font-display text-5xl md:text-6xl text-[var(--ate-gold)] uppercase tracking-wider drop-shadow-[4px_4px_0_#000]"
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {feedback}
      </motion.p>

      <motion.img
        src={stamp}
        alt={feedback}
        className="w-40 h-auto drop-shadow-[4px_4px_0_#000]"
        initial={{ rotate: -12, scale: 0.6 }}
        animate={{ rotate: -4, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260 }}
      />

      <p className="font-display text-4xl text-[var(--ate-bone)] uppercase tracking-wider">
        {formatScore(marks)}/10
      </p>

      <p className="text-sm text-[var(--ate-grey)] font-mono">
        total {formatTotal(result.newTotal ?? marks)}
        {result.scoredBy === 'heuristic' ? ' · quick judge' : ''}
      </p>

      {result.text && !result.isTimeout && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-[var(--ate-bone)] text-center max-w-md italic"
        >
          "{result.text}"
        </motion.p>
      )}
    </motion.div>
  )
}
