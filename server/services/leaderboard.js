/**
 * Leaderboard persistence — Knex against Supabase/Postgres when DATABASE_URL is set,
 * otherwise an in-memory store so local dev still works.
 */
require('dotenv').config()

let knex = null
const memory = {
  profiles: new Map(),
  matches: [],
}

function getKnex() {
  if (knex) return knex
  if (!process.env.DATABASE_URL) return null
  try {
    const Knex = require('knex')
    const config = require('../knexfile.js')
    const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
    knex = Knex(config[env])
    return knex
  } catch (err) {
    console.warn('[Leaderboard] Knex init failed:', err.message)
    return null
  }
}

function emptyProfile(id, displayName = 'Player', avatarId = null) {
  return {
    id,
    display_name: displayName || 'Player',
    avatar_id: avatarId,
    wins: 0,
    losses: 0,
    total_battles: 0,
    updated_at: new Date().toISOString(),
  }
}

async function ensureProfile(db, { id, displayName, avatarId }) {
  if (!id || id === '__BOT__') return null
  const existing = await db('profiles').where({ id }).first()
  if (existing) {
    const patch = { updated_at: db.fn.now() }
    if (displayName) patch.display_name = String(displayName).slice(0, 40)
    if (avatarId) patch.avatar_id = avatarId
    await db('profiles').where({ id }).update(patch)
    return { ...existing, ...patch }
  }
  const row = {
    id,
    display_name: String(displayName || 'Player').slice(0, 40),
    avatar_id: avatarId || null,
    wins: 0,
    losses: 0,
    total_battles: 0,
  }
  await db('profiles').insert(row)
  return row
}

async function recordMatchResult({
  battleId,
  mode,
  format,
  topic,
  winnerId,
  loserId,
  player1Id,
  player2Id,
  player1Name,
  player2Name,
  player1Avatar,
  player2Avatar,
}) {
  if (!winnerId || !loserId) return
  if (winnerId === '__BOT__' || loserId === '__BOT__') return

  const db = getKnex()
  if (!db) {
    for (const [id, name, avatar, won] of [
      [winnerId, player1Id === winnerId ? player1Name : player2Name, player1Id === winnerId ? player1Avatar : player2Avatar, true],
      [loserId, player1Id === loserId ? player1Name : player2Name, player1Id === loserId ? player1Avatar : player2Avatar, false],
    ]) {
      const prev = memory.profiles.get(id) || emptyProfile(id, name, avatar)
      prev.display_name = name || prev.display_name
      prev.avatar_id = avatar || prev.avatar_id
      prev.total_battles += 1
      if (won) prev.wins += 1
      else prev.losses += 1
      prev.updated_at = new Date().toISOString()
      memory.profiles.set(id, prev)
    }
    memory.matches.push({
      battle_id: battleId,
      mode,
      format,
      topic,
      winner_id: winnerId,
      loser_id: loserId,
      player1_id: player1Id,
      player2_id: player2Id,
      created_at: new Date().toISOString(),
    })
    return
  }

  try {
    await ensureProfile(db, { id: player1Id, displayName: player1Name, avatarId: player1Avatar })
    await ensureProfile(db, { id: player2Id, displayName: player2Name, avatarId: player2Avatar })

    await db('match_results').insert({
      battle_id: battleId,
      mode: mode || 'freestyle',
      format: format || 'best_of_3',
      topic: topic || null,
      winner_id: winnerId,
      loser_id: loserId,
      player1_id: player1Id,
      player2_id: player2Id,
    })

    await db('profiles').where({ id: winnerId }).increment({ wins: 1, total_battles: 1 })
    await db('profiles').where({ id: loserId }).increment({ losses: 1, total_battles: 1 })
    await db('profiles').whereIn('id', [winnerId, loserId]).update({ updated_at: db.fn.now() })
  } catch (err) {
    console.error('[Leaderboard] recordMatchResult failed:', err.message)
  }
}

async function getLeaderboard(limit = 50) {
  const db = getKnex()
  if (!db) {
    const rows = [...memory.profiles.values()]
      .filter((p) => p.total_battles > 0)
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins
        const ar = a.wins / Math.max(a.total_battles, 1)
        const br = b.wins / Math.max(b.total_battles, 1)
        return br - ar
      })
      .slice(0, limit)
      .map((p, i) => ({
        rank: i + 1,
        id: p.id,
        displayName: p.display_name,
        avatarId: p.avatar_id,
        characterId: p.avatar_id,
        wins: p.wins,
        losses: p.losses,
        totalBattles: p.total_battles,
        winRate: p.total_battles ? Math.round((p.wins / p.total_battles) * 100) : 0,
      }))
    return { leaderboard: rows, source: 'memory' }
  }

  try {
    const rows = await db('profiles')
      .where('total_battles', '>', 0)
      .orderBy('wins', 'desc')
      .orderByRaw('CASE WHEN total_battles > 0 THEN wins::float / total_battles ELSE 0 END DESC')
      .limit(limit)

    return {
      leaderboard: rows.map((p, i) => ({
        rank: i + 1,
        id: p.id,
        displayName: p.display_name,
        avatarId: p.avatar_id,
        characterId: p.avatar_id,
        wins: p.wins,
        losses: p.losses,
        totalBattles: p.total_battles,
        winRate: p.total_battles ? Math.round((p.wins / p.total_battles) * 100) : 0,
      })),
      source: 'database',
    }
  } catch (err) {
    console.error('[Leaderboard] getLeaderboard failed:', err.message)
    return { leaderboard: [], source: 'error', error: err.message }
  }
}

module.exports = {
  recordMatchResult,
  getLeaderboard,
  getKnex,
}
