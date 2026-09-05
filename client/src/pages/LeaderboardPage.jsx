import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CharacterViewer from '../components/character/CharacterViewer.jsx'
import { GoldTeeth } from '../components/decorations/index.jsx'

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/leaderboard?limit=50')
        const data = await res.json()
        if (cancelled) return
        setRows(data.leaderboard || [])
        setSource(data.source || '')
        setError(data.error || null)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b-4 border-accent-gold bg-bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GoldTeeth className="w-12 h-8" />
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted font-mono">Ranks</p>
            <h1 className="font-display text-xl font-black text-accent-gold uppercase tracking-wider">
              Leaderboard
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="font-display text-sm uppercase tracking-wider text-text-muted hover:text-white border-2 border-gray-700 px-4 py-2 rounded-lg"
        >
          Back to Home
        </button>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-4 lg:p-8">
        {loading && (
          <p className="text-text-muted font-mono text-center mt-12">Loading ranks...</p>
        )}
        {error && !loading && (
          <p className="text-danger font-mono text-center mt-12">{error}</p>
        )}
        {!loading && !error && rows.length === 0 && (
          <motion.p
            className="text-text-muted font-mono text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No ranked PvP matches yet. Win a Find Match bout to show up here.
          </motion.p>
        )}

        {rows.length > 0 && (
          <div className="flex flex-col gap-2">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex items-center gap-3 bg-bg-card border-2 border-gray-800 rounded-xl px-3 py-2"
              >
                <span className="font-display font-black text-accent-gold w-8 text-center">
                  #{row.rank}
                </span>
                <CharacterViewer
                  characterId={row.characterId || row.avatarId || 'echo'}
                  size={48}
                  className="rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-black uppercase tracking-wider truncate">
                    {row.displayName}
                  </p>
                  <p className="text-xs text-text-muted font-mono">
                    {row.wins}W – {row.losses}L · {row.winRate}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {source && (
          <p className="text-[10px] text-text-muted font-mono text-center mt-6 uppercase tracking-widest">
            Source: {source}
          </p>
        )}
      </main>
    </div>
  )
}
