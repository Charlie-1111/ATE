const express = require('express')
const http = require('http')
const path = require('path')
const fs = require('fs')
const { Server } = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const { setupSocketHandlers } = require('./socket/handlers.js')
const authRoutes = require('./routes/auth.js')
const leaderboardRoutes = require('./routes/leaderboard.js')
const { warmUp } = require('./services/ollama.js')

const app = express()
const server = http.createServer(app)

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const isProd = process.env.NODE_ENV === 'production'

const io = new Server(server, {
  cors: {
    origin: isProd ? true : CLIENT_URL,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 10000,
  pingInterval: 5000,
})

app.use(cors({
  origin: isProd ? true : CLIENT_URL,
  credentials: true,
}))

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.use('/api/auth', authRoutes)
app.use('/api/leaderboard', leaderboardRoutes)

setupSocketHandlers(io)

// Production: serve Vite build from the same origin (one public URL)
const distPath = path.join(__dirname, '../client/dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { index: false, maxAge: isProd ? '1h' : 0 }))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next()
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next()
    })
  })
}

const PORT = process.env.PORT || 3001
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ATE] Server running on port ${PORT}`)
  warmUp().catch(() => {})
})

module.exports = { app, server, io }
