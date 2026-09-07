import { useState, useEffect } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../lib/api.js'
import { useUserStore } from '../hooks/useUserStore.js'
import { UI } from '../lib/uiAssets.js'
import { initCrazyGames, isCrazyGamesHost } from '../lib/crazygames.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const applyAuth = useUserStore((s) => s.applyAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cgBlocked, setCgBlocked] = useState(false)

  useEffect(() => {
    initCrazyGames().then(() => {
      if (isCrazyGamesHost()) setCgBlocked(true)
    })
  }, [])

  if (cgBlocked) return <Navigate to="/" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      applyAuth(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-[var(--ate-bone)] flex flex-col items-center justify-center px-4 relative">
      <img src={UI.heroBackdrop} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
      <motion.form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-sm flex flex-col gap-4 ate-panel bg-[var(--ate-ink)] p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl text-[var(--ate-gold)] uppercase tracking-wider text-center">
          Log in
        </h1>
        {error && <p className="text-sm text-[var(--ate-red)] text-center">{error}</p>}
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-black border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-black border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
        />
        <button type="submit" disabled={loading} className="ate-btn-live">
          {loading ? '…' : 'Log in'}
        </button>
        <p className="text-center text-sm text-[var(--ate-grey)]">
          No account?{' '}
          <Link to="/signup" className="text-[var(--ate-gold)] underline">
            Sign up
          </Link>
        </p>
        <Link to="/" className="text-center text-xs text-[var(--ate-grey)] uppercase tracking-wider">
          Back home
        </Link>
      </motion.form>
    </div>
  )
}
