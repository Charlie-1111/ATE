import { motion } from 'framer-motion'
import CharacterViewer from '../character/CharacterViewer.jsx'
import { DEFAULT_CHARACTER_ID } from '../../lib/characterCatalog.js'
import { UI } from '../../lib/uiAssets.js'

export default function PlayerPanel({ player, isActive, isOpponent, animation = 'idle' }) {
  const characterId = player?.characterId || DEFAULT_CHARACTER_ID

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-all relative ${
        isActive
          ? `bg-[var(--ate-ink)] border-4 ${isOpponent ? 'border-[var(--ate-red)]' : 'border-[var(--ate-gold)]'}`
          : 'bg-bg-surface border-2 border-gray-800'
      }`}
      initial={false}
      animate={isActive ? { scale: 1.02 } : { scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <CharacterViewer
        characterId={characterId}
        animation={animation}
        size={120}
        live
        className="rounded-xl"
      />

      {isActive && (
        <img
          src={isOpponent ? UI.turnOpponent : UI.turnYou}
          alt={isOpponent ? 'Opponent turn' : 'Your turn'}
          className="w-full max-w-[140px] -mt-1"
        />
      )}

      <span
        className={`font-display text-sm uppercase tracking-wider ${
          isOpponent ? 'text-[var(--ate-red)]' : 'text-[var(--ate-gold)]'
        }`}
      >
        {player?.name || 'Unknown'}
      </span>
    </motion.div>
  )
}
