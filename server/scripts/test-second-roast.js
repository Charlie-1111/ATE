/**
 * Smoke-test: practice battle, two human roasts must both score (not TIMEOUT).
 * Waits for turn_live (after 3-2-1 countdown) before each send.
 */
const { io } = require('socket.io-client')

const URL = process.env.ATE_URL || 'http://127.0.0.1:3001'
const USER = `test-${Date.now()}`

function once(socket, event, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      socket.off(event, onEvent)
      reject(new Error(`timeout waiting for ${event}`))
    }, timeoutMs)
    function onEvent(data) {
      clearTimeout(t)
      resolve(data)
    }
    socket.once(event, onEvent)
  })
}

function waitForTurnLive(socket) {
  return once(socket, 'turn_live', 180000)
}

async function sendAndAwaitScore(socket, battleId, text, myId) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout waiting for my roast_scored')), 180000)
    const onScore = (result) => {
      if (result.playerId !== myId) return
      cleanup()
      resolve(result)
    }
    const onErr = (e) => {
      cleanup()
      reject(new Error(`roast_error: ${e.error}`))
    }
    const cleanup = () => {
      clearTimeout(t)
      socket.off('roast_scored', onScore)
      socket.off('roast_error', onErr)
    }
    socket.on('roast_scored', onScore)
    socket.on('roast_error', onErr)
    socket.emit('roast_sent', { battleId, text, isTimeout: false, userId: myId })
  })
}

async function main() {
  const socket = io(URL, { transports: ['websocket'] })
  await once(socket, 'connect', 10000)
  console.log('[test] connected', socket.id)

  const matchP = once(socket, 'match_found', 30000)
  const firstLiveP = waitForTurnLive(socket)

  socket.emit('join_practice', {
    userId: USER,
    format: 'best_of_3',
    mode: 'freestyle',
    displayName: 'Tester',
    characterId: 'static',
  })
  const match = await matchP
  const battleId = match.battle.battleId
  const myId = USER
  console.log('[test] match', battleId, 'yourTurn', match.battle.yourTurn, 'first', match.battle.firstTurnUserId)

  console.log('[test] waiting for first turn_live (countdown)')
  await firstLiveP
  console.log('[test] turn live — sending roast #1')

  const r1 = await sendAndAwaitScore(
    socket,
    battleId,
    'Your wifi password is weaker than your comebacks buddy',
    myId,
  )
  console.log('[test] roast #1 scored', { marks: r1.marks ?? r1.quality, feedback: r1.feedback, timeout: r1.isTimeout })
  if (r1.isTimeout) throw new Error('roast #1 was TIMEOUT')

  console.log('[test] waiting for second turn_live')
  await waitForTurnLive(socket)
  console.log('[test] turn live — sending roast #2')

  const r2 = await sendAndAwaitScore(
    socket,
    battleId,
    'You dress like a buffering youtube video from 2009',
    myId,
  )
  console.log('[test] roast #2 scored', {
    marks: r2.marks ?? r2.quality,
    feedback: r2.feedback,
    timeout: r2.isTimeout,
    text: r2.text,
  })
  if (r2.isTimeout) throw new Error('roast #2 was TIMEOUT — bug reproduced')
  if (!r2.text || r2.text.startsWith('[')) throw new Error('roast #2 text missing')

  console.log('[test] PASS — both roasts scored')
  socket.close()
  process.exit(0)
}

main().catch((e) => {
  console.error('[test] FAIL', e.message)
  process.exit(1)
})
