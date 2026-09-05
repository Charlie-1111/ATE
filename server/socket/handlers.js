const { v4: uuidv4 } = require('uuid')
const { scoreRoast, generateRoast, generateTopic, addMarks } = require('../services/ollama.js')
const { recordMatchResult } = require('../services/leaderboard.js')

const matchmakingQueue = []
const activeBattles = new Map()
const playerBattles = new Map()
const turnTimers = new Map()
const BOT_USER_ID = '__BOT__'
const START_SCORE = 0
const TURN_TIME_MS = 20000
const COIN_DRAW_MS = 2500
const TURN_COUNTDOWN_SECS = Number(process.env.ATE_TURN_COUNTDOWN_SECS) || 3

const BOT_NAMES = [
  'Chef LoudMouth', 'RoastBot 3000', 'Savage.exe', 'Toasty McBurns',
  'Burnzilla', 'The Roast Master', 'CRISPY', 'Sir Roasts-a-Lot',
]

function lastRoastText(battle, userId) {
  const rounds = Object.keys(battle.roundRoasts || {}).sort((a, b) => Number(a) - Number(b))
  for (let i = rounds.length - 1; i >= 0; i--) {
    const list = battle.roundRoasts[rounds[i]] || []
    for (let j = list.length - 1; j >= 0; j--) {
      if (list[j].playerId === userId && list[j].text && !list[j].text.startsWith('[')) {
        return list[j].text
      }
    }
  }
  return null
}

function opponentLastRoast(battle, userId) {
  const opp = battle.players.find((p) => p.userId !== userId)
  return opp ? lastRoastText(battle, opp.userId) : null
}

function scoreCtx(battle, userId) {
  return {
    lastOwnRoast: lastRoastText(battle, userId),
    opponentLastRoast: opponentLastRoast(battle, userId),
    topic: battle.topic || null,
  }
}

function recordRoast(battle, userId, { marks, quality, feedback, text, isTimeout, blocked }) {
  const hit = Number(marks ?? quality ?? 0) || 0
  const prev = battle.totalScore[userId] ?? START_SCORE
  const newTotal = addMarks(prev, hit)
  battle.totalScore[userId] = newTotal

  const currentRound = battle.currentRound
  if (!battle.roundRoasts[currentRound]) battle.roundRoasts[currentRound] = []
  battle.roundRoasts[currentRound].push({
    playerId: userId,
    marks: hit,
    quality: hit,
    score: hit,
    feedback,
    text,
    isTimeout: !!isTimeout,
    blocked: !!blocked,
  })

  if (userId === battle.players[0].userId) {
    battle.roundScores[currentRound] = { ...battle.roundScores[currentRound], player1: hit }
  } else {
    battle.roundScores[currentRound] = { ...battle.roundScores[currentRound], player2: hit }
  }

  return {
    playerId: userId,
    marks: hit,
    quality: hit,
    score: hit,
    feedback,
    text,
    newTotal,
    isTimeout: !!isTimeout,
    blocked: !!blocked,
  }
}

function matchPayload(battle, userId, opponent) {
  return {
    battle: {
      battleId: battle.id,
      yourTurn: battle.currentTurn === userId,
      firstTurnUserId: battle.currentTurn,
      format: battle.format,
      mode: battle.mode || 'freestyle',
      topic: battle.topic || null,
      coinDrawMs: COIN_DRAW_MS,
    },
    opponent: {
      id: opponent.userId,
      name: opponent.displayName || `Player ${(opponent.userId || '').slice(-4)}`,
      characterId: opponent.characterId || opponent.avatarId || null,
      avatarId: opponent.characterId || opponent.avatarId || null,
    },
  }
}

function beginFirstTurn(io, battle) {
  if (!activeBattles.has(battle.id) || battle.status !== 'active') return

  const firstId = battle.currentTurn
  const first = battle.players.find((p) => p.userId === firstId)
  if (!first) return

  if (first.socketId === 'bot') {
    const human = battle.players.find((p) => p.socketId !== 'bot')
    if (human) botTurn(io, battle, { id: human.socketId })
    return
  }

  const other = battle.players.find((p) => p.userId !== firstId)
  if (other && other.socketId !== 'bot') {
    io.to(other.socketId).emit('opponents_turn')
  }
  openHumanTurn(io, battle, first.socketId, first.userId)
}

function scheduleFirstTurn(io, battle) {
  setTimeout(() => beginFirstTurn(io, battle), COIN_DRAW_MS)
}

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Player connected: ${socket.id}`)

    socket.on('join_practice', async ({ userId, format, mode, displayName, characterId, avatarId }) => {
      const battleId = uuidv4()
      const isPlayerFirst = Math.random() < 0.5
      const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]
      const battleMode = mode === 'topic' ? 'topic' : 'freestyle'
      const charId = characterId || avatarId || 'static'
      let topic = null
      if (battleMode === 'topic') {
        topic = await generateTopic()
      }

      const botPlayer = {
        socketId: 'bot',
        userId: BOT_USER_ID,
        format,
        mode: battleMode,
        displayName: botName,
        characterId: 'lil_grid',
        joinedAt: Date.now(),
      }
      const humanPlayer = {
        socketId: socket.id,
        userId,
        format,
        mode: battleMode,
        displayName: displayName || 'You',
        characterId: charId,
        avatarId: charId,
        joinedAt: Date.now(),
      }

      const [p1, p2] = isPlayerFirst ? [humanPlayer, botPlayer] : [botPlayer, humanPlayer]
      const firstTurn = p1.userId

      const battle = {
        id: battleId,
        players: [p1, p2],
        format: format || 'best_of_3',
        mode: battleMode,
        topic,
        status: 'active',
        currentRound: 1,
        currentTurn: firstTurn,
        totalScore: { [p1.userId]: START_SCORE, [p2.userId]: START_SCORE },
        roundScores: {},
        roundRoasts: {},
        createdAt: Date.now(),
        isPractice: true,
        roastSubmitted: false,
        turnId: 0,
        countdownActive: false,
        turnLive: false,
      }

      activeBattles.set(battleId, battle)
      playerBattles.set(socket.id, battleId)

      socket.emit('match_found', matchPayload(battle, userId, botPlayer))
      console.log(`[Practice] ${userId} vs ${botName} (${format}, ${battleMode}${topic ? `: ${topic}` : ''})`)
      scheduleFirstTurn(io, battle)
    })

    socket.on('join_queue', ({ userId, format, mode, displayName, characterId, avatarId }) => {
      if (!userId) {
        socket.emit('queue_error', { error: 'missing_user' })
        return
      }
      const battleMode = mode === 'topic' ? 'topic' : 'freestyle'
      const fmt = format || 'best_of_3'
      const charId = characterId || avatarId || 'static'
      console.log(`[Queue] ${userId} joined (${fmt}, ${battleMode}) size=${matchmakingQueue.length + 1}`)
      const existing = matchmakingQueue.findIndex((p) => p.userId === userId)
      if (existing !== -1) matchmakingQueue.splice(existing, 1)

      matchmakingQueue.push({
        socketId: socket.id,
        userId,
        format: fmt,
        mode: battleMode,
        displayName: displayName || `Player ${(userId || '').slice(-4)}`,
        characterId: charId,
        avatarId: charId,
        joinedAt: Date.now(),
      })
      socket.emit('queued', { position: matchmakingQueue.length, mode: battleMode, format: fmt })
      tryMatch(io)
    })

    socket.on('leave_queue', ({ userId }) => {
      const idx = matchmakingQueue.findIndex((p) => p.userId === userId)
      if (idx !== -1) matchmakingQueue.splice(idx, 1)
    })

    socket.on('roast_typing', ({ battleId }) => {
      const battle = activeBattles.get(battleId)
      if (!battle) return
      const opponent = getOpponent(battle, socket.id)
      if (opponent && opponent.socketId !== 'bot') io.to(opponent.socketId).emit('opponent_typing')
    })

    socket.on('roast_stopped_typing', ({ battleId }) => {
      const battle = activeBattles.get(battleId)
      if (!battle) return
      const opponent = getOpponent(battle, socket.id)
      if (opponent && opponent.socketId !== 'bot') io.to(opponent.socketId).emit('opponent_stopped_typing')
    })

    socket.on('roast_sent', async ({ battleId, text, isTimeout, userId }) => {
      const battle = activeBattles.get(battleId)
      if (!battle) {
        socket.emit('roast_error', { error: 'no_battle', battleId })
        return
      }

      const player = resolvePlayer(battle, socket, userId)
      if (!player) {
        socket.emit('roast_error', { error: 'not_in_battle', battleId })
        return
      }
      if (battle.currentTurn !== player.userId) {
        socket.emit('roast_error', { error: 'not_your_turn', battleId, currentTurn: battle.currentTurn })
        return
      }
      if (battle.roastSubmitted) {
        socket.emit('roast_error', { error: 'already_submitted', battleId })
        return
      }
      if (battle.countdownActive) {
        socket.emit('roast_error', { error: 'countdown', battleId })
        return
      }
      if (!battle.turnLive) {
        socket.emit('roast_error', { error: 'turn_not_live', battleId })
        return
      }

      const turnId = battle.turnId
      clearTurnTimer(battleId)
      battle.roastSubmitted = true
      // Ack immediately so the client knows the roast counted (before slow Ollama)
      socket.emit('roast_accepted', { battleId, turnId, isTimeout: !!isTimeout })

      let payload

      if (isTimeout || !text || text.trim().length < 5) {
        payload = recordRoast(battle, player.userId, {
          marks: 0,
          quality: 0,
          feedback: 'TIMEOUT',
          text: '[No roast submitted]',
          isTimeout: true,
        })
        socket.emit('roast_scored', payload)
      } else {
        const result = await scoreRoastBounded(text, scoreCtx(battle, player.userId))
        // Stale turn / battle ended while scoring — don't apply
        if (!activeBattles.has(battle.id) || battle.turnId !== turnId) {
          socket.emit('roast_error', { error: 'stale_turn', battleId })
          return
        }
        payload = recordRoast(battle, player.userId, {
          marks: result.marks ?? result.quality,
          quality: result.marks ?? result.quality,
          feedback: result.feedback,
          text: text.trim(),
          blocked: result.blocked,
        })
        socket.emit('roast_scored', payload)
      }

      const currentRound = battle.currentRound
      const opponent = getOpponent(battle, socket.id)
      const roundData = battle.roundScores[currentRound]
      const roundComplete = roundData?.player1 != null && roundData?.player2 != null

      if (roundComplete) {
        finishRound(io, battle, currentRound)
      } else if (opponent?.socketId === 'bot') {
        battle.currentTurn = BOT_USER_ID
        battle.roastSubmitted = false
        battle.turnLive = false
        battle.countdownActive = false
        botTurn(io, battle, socket)
      } else if (opponent) {
        io.to(opponent.socketId).emit('roast_scored', payload)
        setTimeout(() => {
          if (!activeBattles.has(battle.id) || battle.status !== 'active') return
          socket.emit('opponents_turn')
          openHumanTurn(io, battle, opponent.socketId, opponent.userId)
        }, 3000)
      }
    })

    socket.on('disconnect', () => {
      const idx = matchmakingQueue.findIndex((p) => p.socketId === socket.id)
      if (idx !== -1) matchmakingQueue.splice(idx, 1)

      const battleId = playerBattles.get(socket.id)
      if (battleId) {
        clearTurnTimer(battleId)
        const battle = activeBattles.get(battleId)
        if (battle && battle.status === 'active') {
          battle.disconnectTimeout = setTimeout(() => {
            const opponent = getOpponent(battle, socket.id)
            if (opponent && opponent.socketId !== 'bot') {
              io.to(opponent.socketId).emit('opponent_disconnected')
            }
            activeBattles.delete(battleId)
            playerBattles.delete(socket.id)
            if (opponent) playerBattles.delete(opponent.socketId)
          }, 5000)
        }
      }
    })
  })
}

function startTurnTimer(io, battle, socketId, userId, opts = {}) {
  clearTurnTimer(battle.id)
  if (!opts.skipTurnBump) {
    battle.turnId = (battle.turnId || 0) + 1
  }
  const turnId = battle.turnId
  battle.roastSubmitted = false
  battle.currentTurn = userId
  battle.countdownActive = false
  battle.turnLive = true

  const timer = setTimeout(() => {
    if (!activeBattles.has(battle.id) || battle.status !== 'active') return
    if (battle.turnId !== turnId) return
    if (battle.roastSubmitted || battle.currentTurn !== userId) return

    console.log(`[Timer] ${userId} timed out in battle ${battle.id} turn=${turnId}`)
    battle.roastSubmitted = true

    const payload = recordRoast(battle, userId, {
      marks: 0,
      quality: 0,
      feedback: 'TIMEOUT',
      text: '[No roast submitted]',
      isTimeout: true,
    })

    io.to(socketId).emit('roast_scored', payload)

    const round = battle.currentRound
    const opponent = getOpponent(battle, socketId)
    if (opponent && opponent.socketId !== 'bot') {
      io.to(opponent.socketId).emit('roast_scored', payload)
    }

    const roundData = battle.roundScores[round]
    const roundComplete = roundData?.player1 != null && roundData?.player2 != null

    if (roundComplete) {
      finishRound(io, battle, round)
    } else if (opponent?.socketId === 'bot') {
      battle.currentTurn = BOT_USER_ID
      battle.roastSubmitted = false
      battle.turnLive = false
      botTurn(io, battle, { id: socketId })
    } else if (opponent) {
      battle.turnLive = false
      setTimeout(() => {
        if (!activeBattles.has(battle.id) || battle.status !== 'active') return
        io.to(socketId).emit('opponents_turn')
        openHumanTurn(io, battle, opponent.socketId, opponent.userId)
      }, 1000)
    }
  }, TURN_TIME_MS)

  turnTimers.set(`${battle.id}:${turnId}`, timer)
}

/**
 * Open a human turn with 3-2-1 countdown before the 20s clock starts.
 */
async function openHumanTurn(io, battle, socketId, userId) {
  if (!activeBattles.has(battle.id) || battle.status !== 'active') return

  clearTurnTimer(battle.id)
  battle.turnId = (battle.turnId || 0) + 1
  const turnId = battle.turnId
  battle.currentTurn = userId
  battle.roastSubmitted = false
  battle.countdownActive = true
  battle.turnLive = false

  io.to(socketId).emit('your_turn', { countdownSec: TURN_COUNTDOWN_SECS, turnId })

  for (let s = TURN_COUNTDOWN_SECS; s >= 1; s--) {
    if (!activeBattles.has(battle.id) || battle.status !== 'active') return
    if (battle.turnId !== turnId) return
    io.to(socketId).emit('turn_countdown', { seconds: s, turnId })
    await sleep(1000)
  }

  if (!activeBattles.has(battle.id) || battle.status !== 'active') return
  if (battle.turnId !== turnId) return

  battle.countdownActive = false
  battle.turnLive = true
  io.to(socketId).emit('turn_live', { turnId })
  startTurnTimer(io, battle, socketId, userId, { skipTurnBump: true })
}

function clearTurnTimer(battleId) {
  for (const [key, timer] of turnTimers.entries()) {
    if (key.startsWith(battleId)) {
      clearTimeout(timer)
      turnTimers.delete(key)
    }
  }
}

function resolvePlayer(battle, socket, userId) {
  let player = battle.players.find((p) => p.socketId === socket.id)
  if (player) return player
  if (!userId) return null
  player = battle.players.find((p) => p.userId === userId && p.socketId !== 'bot')
  if (!player) return null
  // Rebind after reconnect so later emits / timers hit this socket
  const prev = player.socketId
  if (prev && prev !== socket.id) playerBattles.delete(prev)
  player.socketId = socket.id
  playerBattles.set(socket.id, battle.id)
  console.log(`[Socket] rebound ${userId} ${prev} → ${socket.id}`)
  return player
}

async function scoreRoastBounded(text, ctx) {
  const SCORE_MS = Number(process.env.ATE_SCORE_TIMEOUT_MS) || 12000
  try {
    return await Promise.race([
      scoreRoast(text, ctx),
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ marks: 5, quality: 5, feedback: 'MID', blocked: false, source: 'score_timeout' })
        }, SCORE_MS)
      }),
    ])
  } catch (err) {
    console.error('[Ollama] Scoring failed:', err.message)
    return { marks: 5, quality: 5, feedback: 'MID', blocked: false, source: 'score_error' }
  }
}

async function botTurn(io, battle, humanSocket) {
  if (!activeBattles.has(battle.id) || battle.status !== 'active') return

  const sid = humanSocket?.id || humanSocket?.socketId
  if (!sid) {
    console.warn('[botTurn] missing human socket id')
    return
  }

  const typingDelay = Number(process.env.ATE_BOT_TYPING_MS) || (1500 + Math.random() * 3000)
  const thinkingDelay = Number(process.env.ATE_BOT_THINK_MS) || (1000 + Math.random() * 2000)
  const handoffDelay = Number(process.env.ATE_BOT_HANDOFF_MS) || 3000
  const roundAtStart = battle.currentRound
  let typingStarted = false
  let handedOff = false
  let handoffStarted = false

  const handToHuman = async () => {
    if (handoffStarted) return
    handoffStarted = true
    await sleep(handoffDelay)
    if (!activeBattles.has(battle.id) || battle.status !== 'active') return
    if (battle.currentRound !== roundAtStart) return
    const humanPlayer = battle.players.find((p) => p.socketId !== 'bot')
    if (!humanPlayer) return
    await openHumanTurn(io, battle, sid, humanPlayer.userId)
    handedOff = true
  }

  try {
    battle.currentTurn = BOT_USER_ID
    battle.roastSubmitted = false

    io.to(sid).emit('opponent_typing')
    typingStarted = true

    await sleep(typingDelay)
    if (!activeBattles.has(battle.id) || battle.status !== 'active') return
    if (battle.currentRound !== roundAtStart) return

    io.to(sid).emit('opponent_stopped_typing')
    typingStarted = false

    let roastText
    try {
      roastText = await generateRoast(battle.topic || null)
    } catch {
      roastText = fallbackRoast()
    }

    await sleep(thinkingDelay)
    if (!activeBattles.has(battle.id) || battle.status !== 'active') return
    if (battle.currentRound !== roundAtStart) return

    const round = battle.currentRound
    const result = await scoreRoastBounded(roastText, scoreCtx(battle, BOT_USER_ID))

    const payload = recordRoast(battle, BOT_USER_ID, {
      marks: result.marks ?? result.quality,
      quality: result.marks ?? result.quality,
      feedback: result.feedback,
      text: roastText,
      blocked: result.blocked,
    })

    io.to(sid).emit('roast_scored', payload)

    const roundData = battle.roundScores[round]
    const roundComplete = roundData?.player1 != null && roundData?.player2 != null

    if (roundComplete) {
      finishRound(io, battle, round)
      handedOff = true
      return
    }

    await handToHuman()
  } catch (err) {
    console.error('[botTurn] failed:', err.message)
  } finally {
    if (typingStarted && activeBattles.has(battle.id)) {
      io.to(sid).emit('opponent_stopped_typing')
    }
    if (
      !handedOff &&
      !handoffStarted &&
      activeBattles.has(battle.id) &&
      battle.status === 'active' &&
      battle.currentRound === roundAtStart &&
      battle.currentTurn === BOT_USER_ID
    ) {
      const humanPlayer = battle.players.find((p) => p.socketId !== 'bot')
      if (humanPlayer) {
        await openHumanTurn(io, battle, sid, humanPlayer.userId)
      }
    }
  }
}

const FALLBACK_ROASTS = [
  "You look like a default NPC that nobody talked to",
  "Your face cam needs a content warning",
  "Even your WiFi signal is stronger than your roast game",
  "You're the human equivalent of a pop-up ad",
  "I'd clap back but I don't want to be rude to the disabled",
  "You type like you look slowly and with no direction",
  "Your roast was so weak it needs a wheelchair",
  "I've seen better comebacks from autocomplete",
  "You're proof that evolution can go backwards",
  "If mediocrity was a person they'd tag you in this conversation",
]

function fallbackRoast() {
  return FALLBACK_ROASTS[Math.floor(Math.random() * FALLBACK_ROASTS.length)]
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function tryMatch(io) {
  const buckets = new Map()
  for (const p of matchmakingQueue) {
    const key = `${p.mode || 'freestyle'}|${p.format || 'best_of_3'}`
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(p)
  }
  for (const [, group] of buckets) {
    while (group.length >= 2) {
      const a = group.shift()
      const b = group.shift()
      matchPlayers(io, a, b)
    }
  }
}

async function matchPlayers(io, p1, p2) {
  const i1 = matchmakingQueue.indexOf(p1)
  if (i1 !== -1) matchmakingQueue.splice(i1, 1)
  const i2 = matchmakingQueue.indexOf(p2)
  if (i2 !== -1) matchmakingQueue.splice(i2, 1)

  const s1 = io.sockets.sockets.get(p1.socketId)
  const s2 = io.sockets.sockets.get(p2.socketId)
  if (!s1?.connected || !s2?.connected) {
    console.warn('[Match] abort — socket disconnected during pair')
    if (s1?.connected) {
      matchmakingQueue.push(p1)
      io.to(p1.socketId).emit('queued', {
        position: matchmakingQueue.length,
        mode: p1.mode,
        format: p1.format,
      })
    }
    if (s2?.connected) {
      matchmakingQueue.push(p2)
      io.to(p2.socketId).emit('queued', {
        position: matchmakingQueue.length,
        mode: p2.mode,
        format: p2.format,
      })
    }
    tryMatch(io)
    return
  }

  const battleId = uuidv4()
  const firstTurn = Math.random() < 0.5 ? p1.userId : p2.userId
  const mode = p1.mode || 'freestyle'
  let topic = null
  if (mode === 'topic') {
    try {
      topic = await Promise.race([
        generateTopic(),
        new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
      ])
      if (!topic) topic = 'Overhyped Tech Gadgets'
    } catch {
      topic = 'Overhyped Tech Gadgets'
    }
  }

  const still1 = io.sockets.sockets.get(p1.socketId)
  const still2 = io.sockets.sockets.get(p2.socketId)
  if (!still1?.connected || !still2?.connected) {
    console.warn('[Match] abort — socket lost after topic')
    if (still1?.connected) matchmakingQueue.push(p1)
    if (still2?.connected) matchmakingQueue.push(p2)
    tryMatch(io)
    return
  }

  const battle = {
    id: battleId,
    players: [p1, p2],
    format: p1.format,
    mode,
    topic,
    status: 'active',
    currentRound: 1,
    currentTurn: firstTurn,
    totalScore: { [p1.userId]: START_SCORE, [p2.userId]: START_SCORE },
    roundScores: {},
    roundRoasts: {},
    createdAt: Date.now(),
    isPractice: false,
    roastSubmitted: false,
    turnId: 0,
    countdownActive: false,
    turnLive: false,
  }
  activeBattles.set(battleId, battle)
  playerBattles.set(p1.socketId, battleId)
  playerBattles.set(p2.socketId, battleId)

  io.to(p1.socketId).emit('match_found', matchPayload(battle, p1.userId, p2))
  io.to(p2.socketId).emit('match_found', matchPayload(battle, p2.userId, p1))
  console.log(`[Match] ${p1.userId} vs ${p2.userId} (${p1.format}, ${mode}${topic ? `: ${topic}` : ''})`)
  scheduleFirstTurn(io, battle)
}

function getOpponent(battle, socketId) {
  return battle.players.find((p) => p.socketId !== socketId)
}

function emitBattleEnded(io, battle, winnerIdx) {
  const p1 = battle.players[0]
  const p2 = battle.players[1]
  const p1Wins = p1.roundWins || 0
  const p2Wins = p2.roundWins || 0

  for (const me of [p1, p2]) {
    if (me.socketId === 'bot') continue
    const opp = me === p1 ? p2 : p1
    const iWon = battle.players[winnerIdx].userId === me.userId
    io.to(me.socketId).emit('battle_ended', {
      winner: iWon ? 'me' : 'opponent',
      myRoundWins: me === p1 ? p1Wins : p2Wins,
      opponentRoundWins: me === p1 ? p2Wins : p1Wins,
      myTotalScore: battle.totalScore[me.userId] ?? START_SCORE,
      opponentTotalScore: battle.totalScore[opp.userId] ?? START_SCORE,
    })
    playerBattles.delete(me.socketId)
  }

  if (!battle.isPractice) {
    const winner = battle.players[winnerIdx]
    const loser = battle.players[1 - winnerIdx]
    recordMatchResult({
      battleId: battle.id,
      mode: battle.mode,
      format: battle.format,
      topic: battle.topic,
      winnerId: winner.userId,
      loserId: loser.userId,
      player1Id: p1.userId,
      player2Id: p2.userId,
      player1Name: p1.displayName,
      player2Name: p2.displayName,
      player1Avatar: p1.characterId || p1.avatarId,
      player2Avatar: p2.characterId || p2.avatarId,
    }).catch((err) => console.error('[Leaderboard]', err.message))
  }
}

function finishRound(io, battle, round) {
  if (!activeBattles.has(battle.id) || battle.status !== 'active') return

  const scores = battle.roundScores[round]
  if (!scores || scores.player1 == null || scores.player2 == null) return

  clearTurnTimer(battle.id)

  const roundWinner = scores.player1 > scores.player2 ? 0
    : scores.player2 > scores.player1 ? 1
      : -1

  if (roundWinner >= 0) {
    battle.players[roundWinner].roundWins = (battle.players[roundWinner].roundWins || 0) + 1
  }

  const p1Wins = battle.players[0].roundWins || 0
  const p2Wins = battle.players[1].roundWins || 0
  const winsNeeded = battle.format === 'best_of_5' ? 3 : 2

  if (p1Wins >= winsNeeded || p2Wins >= winsNeeded) {
    const winnerIdx = p1Wins >= winsNeeded ? 0 : 1
    battle.status = 'completed'
    clearTurnTimer(battle.id)
    emitBattleEnded(io, battle, winnerIdx)
    activeBattles.delete(battle.id)
    return
  }

  const nextRound = round + 1
  const firstTurn = Math.random() < 0.5 ? battle.players[0].userId : battle.players[1].userId

  battle.currentRound = nextRound
  battle.currentTurn = firstTurn
  battle.roundScores[nextRound] = {}
  battle.roastSubmitted = false

  for (const me of battle.players) {
    if (me.socketId === 'bot') continue
    const myWins = me === battle.players[0] ? p1Wins : p2Wins
    const oppWins = me === battle.players[0] ? p2Wins : p1Wins
    io.to(me.socketId).emit('round_result', {
      nextRound,
      myRoundWins: myWins,
      opponentRoundWins: oppWins,
      yourTurn: firstTurn === me.userId,
      firstTurnUserId: firstTurn,
      roundResult: { scores, roundWinner },
    })
  }

  const first = battle.players.find((p) => p.userId === firstTurn)
  if (first?.socketId === 'bot') {
    const human = battle.players.find((p) => p.socketId !== 'bot')
    if (human) botTurn(io, battle, { id: human.socketId })
  } else if (first) {
    openHumanTurn(io, battle, first.socketId, first.userId)
  }
}

module.exports = { setupSocketHandlers }
