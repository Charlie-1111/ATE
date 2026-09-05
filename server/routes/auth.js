/**
 * Auth — email/password with JWT. Uses Postgres when DATABASE_URL is set,
 * otherwise an in-memory store for local prototype.
 */
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const authMiddleware = require('../middleware/auth.js')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

const memoryUsers = new Map() // email -> user

function getKnex() {
  if (!process.env.DATABASE_URL) return null
  try {
    const Knex = require('knex')
    const config = require('../knexfile.js')
    const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
    return Knex(config[env])
  } catch {
    return null
  }
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: '30d' },
  )
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.username,
  }
}

router.post('/signup', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const username = String(req.body.username || email.split('@')[0] || 'player')
      .trim()
      .slice(0, 30)

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const hash = await bcrypt.hash(password, 10)
    const db = getKnex()

    if (db) {
      const existing = await db('users').where({ email }).first()
      if (existing) return res.status(409).json({ error: 'Email already registered' })
      const [user] = await db('users')
        .insert({
          email,
          username,
          password_hash: hash,
        })
        .returning(['id', 'email', 'username'])
      const token = signToken(user)
      return res.status(201).json({ token, user: publicUser(user) })
    }

    if (memoryUsers.has(email)) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    const user = { id: uuidv4(), email, username, password_hash: hash }
    memoryUsers.set(email, user)
    const token = signToken(user)
    return res.status(201).json({ token, user: publicUser(user) })
  } catch (err) {
    console.error('[Auth] signup', err.message)
    return res.status(500).json({ error: 'Signup failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const db = getKnex()
    let user
    if (db) {
      user = await db('users').where({ email }).first()
    } else {
      user = memoryUsers.get(email)
    }

    if (!user) return res.status(401).json({ error: 'Invalid email or password' })
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

    const token = signToken(user)
    return res.json({ token, user: publicUser(user) })
  } catch (err) {
    console.error('[Auth] login', err.message)
    return res.status(500).json({ error: 'Login failed' })
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const db = getKnex()
    let user
    if (db) {
      user = await db('users').where({ id: req.user.id }).first()
    } else {
      user = [...memoryUsers.values()].find((u) => u.id === req.user.id)
    }
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json({ user: publicUser(user) })
  } catch (err) {
    console.error('[Auth] me', err.message)
    return res.status(500).json({ error: 'Failed to load profile' })
  }
})

module.exports = router
