import { motion } from 'framer-motion'

export default function TypingIndicator({ isOpponent }) {
  if (!isOpponent) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="flex items-center gap-2 py-2 px-4"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-accent-gold rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span className="text-sm text-accent-gold font-display uppercase tracking-wider">Opponent is cooking...</span>
    </motion.div>
  )
}
