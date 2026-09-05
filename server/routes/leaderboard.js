const express = require('express')
const router = express.Router()
const { getLeaderboard } = require('../services/leaderboard.js')

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50))
    const data = await getLeaderboard(limit)
    res.json(data)
  } catch (err) {
    console.error('[API] leaderboard error:', err.message)
    res.status(500).json({ leaderboard: [], error: 'Failed to load leaderboard' })
  }
})

module.exports = router
