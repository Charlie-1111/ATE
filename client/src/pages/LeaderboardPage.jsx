import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CharacterViewer from '../components/character/CharacterViewer.jsx'
import { UI, medalForRank } from '../lib/uiAssets.js'
import api from '../lib/api.js'

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
        const { data } = await api.get('/leaderboard', { params: { limit: 50 } })
        if (cancelled) return
        setRows(data.leaderboard || [])
        setSource(data.source || '')
        setError(data.error || null)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || err.message || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen bg-black text-[var(--ate-bone)] flex flex-col">
      <header className="border-b-4 border-[var(--ate-gold)] bg-[var(--ate-ink)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={UI.logoSquare} alt="ATE" className="w-10 h-10" />
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--ate-grey)] font-mono">Ranks</p>
            <h1 className="font-display text-xl text-[var(--ate-gold)] uppercase tracking-wider">
              Leaderboard
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="font-display text-sm uppercase tracking-wider text-[var(--ate-grey)] hover:text-[var(--ate-bone)] border-2 border-gray-700 px-4 py-2 rounded-lg"
        >
          Back to Home
        </button>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-4 lg:p-8">
        {loading && (
          <p className="text-[var(--ate-grey)] font-mono text-center mt-12">Loading ranks...</p>
        )}
        {error && !loading && (
          <p className="text-[var(--ate-red)] font-mono text-center mt-12">{error}</p>
        )}
        {!loading && !error && rows.length === 0 && (
          <motion.div
            className="flex flex-col items-center gap-4 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <img src={UI.emptyBattles} alt="No battles yet" className="w-48 h-auto" />
            <p className="text-[var(--ate-grey)] font-mono text-center">
              Win a Find Match bout to show up here.
            </p>
          </motion.div>
        )}

        {rows.length > 0 && (
          <div className="flex flex-col gap-2">
            {rows.map((row) => {
              const medal = medalForRank(row.rank)
              return (
                <div
                  key={row.id}
                  className="flex items-center gap-3 bg-[var(--ate-ink)] border-2 border-gray-800 rounded-xl px-3 py-2"
                >
                  {medal ? (
                    <img src={medal} alt={`#${row.rank}`} className="w-10 h-12 object-contain flex-shrink-0" />
                  ) : (
                    <span className="font-display text-[var(--ate-gold)] w-10 text-center">
                      #{row.rank}
                    </span>
                  )}
                  <CharacterViewer
                    characterId={row.characterId || row.avatarId || 'static'}
                    size={48}
                    live={false}
                    className="rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-display uppercase tracking-wider truncate">
                      {row.displayName}
                    </p>
                    <p className="text-xs text-[var(--ate-grey)] font-mono">
                      {row.wins}W – {row.losses}L · {row.winRate}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {source && (
          <p className="text-[10px] text-[var(--ate-grey)] font-mono text-center mt-6 uppercase tracking-widest">
            Source: {source}
          </p>
        )}
      </main>
    </div>
  )
}
