import { motion } from 'framer-motion'
import CharacterViewer from '../character/CharacterViewer.jsx'
import { DEFAULT_CHARACTER_ID } from '../../lib/characterCatalog.js'

export default function PlayerPanel({ player, isActive, isOpponent, animation = 'idle' }) {
  const characterId = player?.characterId || DEFAULT_CHARACTER_ID

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
        isActive
          ? `bg-bg-card border-4 ${isOpponent ? 'border-danger' : 'border-accent-gold'}`
          : 'bg-bg-surface border-2 border-gray-800'
      }`}
      initial={false}
      animate={isActive ? { scale: 1.02 } : { scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        <CharacterViewer
          characterId={characterId}
          animation={animation}
          size={88}
          className="rounded-xl"
        />
        {isActive && (
          <motion.div
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-display font-black px-2 py-0.5 rounded
              ${isOpponent ? 'bg-danger text-white' : 'bg-accent-gold text-black'}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            YOUR TURN
          </motion.div>
        )}
      </div>

      <span className={`font-display text-sm font-black uppercase tracking-wider ${
        isOpponent ? 'text-danger' : 'text-accent-gold'
      }`}>
        {player?.name || 'Unknown'}
      </span>
    </motion.div>
  )
}
