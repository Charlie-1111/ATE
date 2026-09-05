import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GoldTeeth, DiamondBracelet } from '../components/decorations/index.jsx'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8 px-4">
      <GoldTeeth className="w-48 h-32" />

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display text-8xl font-black text-accent-gold mb-2 uppercase tracking-wider">
          ATE
        </h1>
        <p className="text-xl text-text-muted font-sans">Real-Time 1v1 Roast Battles</p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-4 w-full max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => navigate('/battle')}
          className="bg-bg-card hover:bg-bg-surface text-white font-display font-black text-lg py-4 w-full rounded-lg transition-all uppercase tracking-wider border-4 border-gray-700"
        >
          Find Match
        </button>

        <button
          onClick={() => navigate('/practice')}
          className="bg-accent-gold hover:bg-yellow-500 text-black font-display font-black text-lg py-4 w-full rounded-lg transition-all uppercase tracking-wider border-4 border-black"
        >
          Practice vs AI
        </button>

        <button
          onClick={() => navigate('/leaderboard')}
          className="bg-bg-card hover:bg-bg-surface text-white font-display font-black text-lg py-4 w-full rounded-lg transition-all uppercase tracking-wider border-4 border-gray-700"
        >
          Leaderboard
        </button>

        <button
          onClick={() => navigate('/shop')}
          className="bg-bg-card hover:bg-bg-surface text-white font-display font-black text-lg py-4 w-full rounded-lg transition-all uppercase tracking-wider border-4 border-gray-700"
        >
          Pick Character
        </button>
      </motion.div>

      <DiamondBracelet className="w-16 h-32 mt-4" />

      <motion.p
        className="text-xs text-text-muted mt-4 font-mono uppercase tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        v0.2.0
      </motion.p>
    </div>
  )
}
