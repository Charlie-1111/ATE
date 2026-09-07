/**
 * Auth — email/password + CrazyGames User linking.
 * Postgres when DATABASE_URL is set; otherwise in-memory.
 */
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const authMiddleware = require('../middleware/auth.js')
const { verifyCrazyGamesToken, ateUserIdFromCg } = require('../services/crazygames.js')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

const memoryUsers = new Map() // email -> user
const memoryById = new Map() // id -> user
const memoryByCgId = new Map() // crazygames_id -> user

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
    {
      id: user.id,
      email: user.email || null,
      username: user.username,
      provider: user.auth_provider || user.provider || 'password',
      crazygamesId: user.crazygames_id || user.crazygamesId || null,
    },
    JWT_SECRET,
    { expiresIn: '30d' },
  )
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email || null,
    username: user.username,
    displayName: user.username,
    provider: user.auth_provider || user.provider || 'password',
    crazygamesId: user.crazygames_id || user.crazygamesId || null,
    profilePictureUrl: user.profile_picture_url || user.profilePictureUrl || null,
  }
}

function rememberMemoryUser(user) {
  if (user.email) memoryUsers.set(user.email, user)
  memoryById.set(user.id, user)
  if (user.crazygames_id) memoryByCgId.set(user.crazygames_id, user)
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
      try {
        const existing = await db('users').where({ email }).first()
        if (existing) return res.status(409).json({ error: 'Email already registered' })
        const [user] = await db('users')
          .insert({
            email,
            username,
            password_hash: hash,
            auth_provider: 'password',
          })
          .returning(['id', 'email', 'username', 'crazygames_id', 'auth_provider', 'profile_picture_url'])
        const token = signToken(user)
        return res.status(201).json({ token, user: publicUser(user) })
      } catch (err) {
        // users table / columns may be missing — fall through to memory
        console.warn('[Auth] signup DB failed:', err.message)
      }
    }

    if (memoryUsers.has(email)) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    const user = {
      id: uuidv4(),
      email,
      username,
      password_hash: hash,
      auth_provider: 'password',
      crazygames_id: null,
    }
    rememberMemoryUser(user)
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
      try {
        user = await db('users').where({ email }).first()
      } catch {
        user = null
      }
    }
    if (!user) user = memoryUsers.get(email)

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

    const token = signToken(user)
    return res.json({ token, user: publicUser(user) })
  } catch (err) {
    console.error('[Auth] login', err.message)
    return res.status(500).json({ error: 'Login failed' })
  }
})

/**
 * Link / create an ATE account from a CrazyGames user token.
 * Body: { token: string }  — from SDK.user.getUserToken()
 */
router.post('/crazygames', async (req, res) => {
  try {
    const cgToken = req.body.token || req.body.userToken
    let payload
    try {
      payload = await verifyCrazyGamesToken(cgToken)
    } catch (err) {
      return res.status(err.status || 401).json({ error: err.message || 'Invalid CrazyGames token' })
    }

    const cgUserId = String(payload.userId || payload.sub || '')
    if (!cgUserId) {
      return res.status(400).json({ error: 'CrazyGames token missing userId' })
    }

    const username = String(payload.username || `CG_${cgUserId.slice(0, 8)}`)
      .trim()
      .slice(0, 30) || `Player`
    const profilePictureUrl = payload.profilePictureUrl || payload.profilePicture || null
    const ateId = ateUserIdFromCg(cgUserId)
    const db = getKnex()

    let user = null

    if (db) {
      try {
        const link = await db('crazygames_accounts').where({ crazygames_id: cgUserId }).first()
        if (link) {
          await db('crazygames_accounts')
            .where({ crazygames_id: cgUserId })
            .update({
              username,
              profile_picture_url: profilePictureUrl,
              updated_at: db.fn.now(),
            })
          user = {
            id: link.user_id,
            username,
            email: null,
            crazygames_id: cgUserId,
            auth_provider: 'crazygames',
            profile_picture_url: profilePictureUrl,
          }
        } else {
          await db('crazygames_accounts').insert({
            crazygames_id: cgUserId,
            user_id: ateId,
            username,
            profile_picture_url: profilePictureUrl,
          })
          user = {
            id: ateId,
            username,
            email: null,
            crazygames_id: cgUserId,
            auth_provider: 'crazygames',
            profile_picture_url: profilePictureUrl,
          }
        }

        // Keep leaderboard profile in sync
        try {
          const existing = await db('profiles').where({ id: user.id }).first()
          if (existing) {
            await db('profiles').where({ id: user.id }).update({
              display_name: username,
              updated_at: db.fn.now(),
            })
          } else {
            await db('profiles').insert({
              id: user.id,
              display_name: username,
              wins: 0,
              losses: 0,
              total_battles: 0,
            })
          }
        } catch {
          /* profiles optional */
        }

        // Optional users table row if present
        try {
          if (await db.schema.hasTable('users')) {
            const byCg = await db('users').where({ crazygames_id: cgUserId }).first()
            if (!byCg) {
              const syntheticEmail = `cg_${cgUserId}@crazygames.ate.local`
              await db('users')
                .insert({
                  id: user.id.length === 36 ? user.id : undefined,
                  email: syntheticEmail,
                  username: `${username}`.slice(0, 30),
                  password_hash: await bcrypt.hash(uuidv4(), 8),
                  crazygames_id: cgUserId,
                  auth_provider: 'crazygames',
                  profile_picture_url: profilePictureUrl,
                })
                .catch(async () => {
                  // uuid id mismatch — skip users insert; crazygames_accounts is enough
                })
            } else {
              await db('users').where({ crazygames_id: cgUserId }).update({
                username: username.slice(0, 30),
                profile_picture_url: profilePictureUrl,
              })
              user.id = byCg.id
            }
          }
        } catch {
          /* optional */
        }
      } catch (err) {
        console.warn('[Auth] crazygames DB path failed, using memory:', err.message)
        user = null
      }
    }

    if (!user) {
      user = memoryByCgId.get(cgUserId)
      if (!user) {
        user = {
          id: ateId,
          username,
          email: null,
          crazygames_id: cgUserId,
          auth_provider: 'crazygames',
          profile_picture_url: profilePictureUrl,
          password_hash: null,
        }
        rememberMemoryUser(user)
      } else {
        user.username = username
        user.profile_picture_url = profilePictureUrl
        rememberMemoryUser(user)
      }
    }

    const token = signToken(user)
    return res.json({
      token,
      user: publicUser(user),
      linked: true,
      provider: 'crazygames',
    })
  } catch (err) {
    console.error('[Auth] crazygames', err.message)
    return res.status(500).json({ error: 'CrazyGames link failed' })
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const db = getKnex()
    let user
    if (db) {
      try {
        const link = await db('crazygames_accounts').where({ user_id: req.user.id }).first()
        if (link) {
          user = {
            id: link.user_id,
            username: link.username,
            crazygames_id: link.crazygames_id,
            auth_provider: 'crazygames',
            profile_picture_url: link.profile_picture_url,
            email: null,
          }
        }
      } catch {
        /* ignore */
      }
      if (!user) {
        try {
          user = await db('users').where({ id: req.user.id }).first()
        } catch {
          user = null
        }
      }
    }
    if (!user) user = memoryById.get(req.user.id) || memoryByCgId.get(req.user.crazygamesId)
    if (!user && req.user?.id) {
      user = {
        id: req.user.id,
        username: req.user.username || 'Player',
        email: req.user.email,
        auth_provider: req.user.provider || 'password',
        crazygames_id: req.user.crazygamesId,
      }
    }
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json({ user: publicUser(user) })
  } catch (err) {
    console.error('[Auth] me', err.message)
    return res.status(500).json({ error: 'Failed to load profile' })
  }
})

module.exports = router
