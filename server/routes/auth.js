const express = require('express')
const router = express.Router()

router.post('/signup', (req, res) => {
  res.status(501).json({ error: 'Auth not yet implemented in prototype' })
})

router.post('/login', (req, res) => {
  res.status(501).json({ error: 'Auth not yet implemented in prototype' })
})

router.get('/me', (req, res) => {
  res.status(501).json({ error: 'Auth not yet implemented in prototype' })
})

module.exports = router
