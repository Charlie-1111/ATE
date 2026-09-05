const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const { setupSocketHandlers } = require('./socket/handlers.js')
const authRoutes = require('./routes/auth.js')
const leaderboardRoutes = require('./routes/leaderboard.js')

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 10000,
  pingInterval: 5000,
})

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.use('/api/auth', authRoutes)
app.use('/api/leaderboard', leaderboardRoutes)

setupSocketHandlers(io)

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`[ATE] Server running on port ${PORT}`)
})

module.exports = { app, server, io }
