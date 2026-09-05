/**
 * Dual-client PvP matchmaking smoke test.
 * Asserts two distinct users get match_found with the same battleId.
 */
const { io } = require('socket.io-client')

const URL = process.env.ATE_URL || 'http://127.0.0.1:3001'

function once(socket, event, timeoutMs = 15000) {
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

function connectClient(userId) {
  return new Promise((resolve, reject) => {
    const socket = io(URL, { transports: ['websocket'], auth: { userId } })
    const t = setTimeout(() => reject(new Error(`connect timeout ${userId}`)), 10000)
    socket.once('connect', () => {
      clearTimeout(t)
      resolve(socket)
    })
    socket.once('connect_error', (err) => {
      clearTimeout(t)
      reject(err)
    })
  })
}

async function main() {
  const idA = `pvp-a-${Date.now()}`
  const idB = `pvp-b-${Date.now()}`
  const format = 'best_of_3'
  const mode = 'freestyle'

  console.log('[test] connecting two clients…')
  const [a, b] = await Promise.all([connectClient(idA), connectClient(idB)])
  console.log('[test] connected', a.id, b.id)

  const matchA = once(a, 'match_found', 12000)
  const matchB = once(b, 'match_found', 12000)

  a.emit('join_queue', {
    userId: idA,
    format,
    mode,
    displayName: 'Alpha',
    characterId: 'static',
  })
  b.emit('join_queue', {
    userId: idB,
    format,
    mode,
    displayName: 'Bravo',
    characterId: 'static',
  })

  const [ma, mb] = await Promise.all([matchA, matchB])
  const battleA = ma.battle?.battleId
  const battleB = mb.battle?.battleId

  console.log('[test] match A', battleA, 'vs', ma.opponent?.displayName)
  console.log('[test] match B', battleB, 'vs', mb.opponent?.displayName)

  if (!battleA || !battleB) throw new Error('missing battleId')
  if (battleA !== battleB) throw new Error(`battleId mismatch ${battleA} !== ${battleB}`)
  if (ma.opponent?.userId !== idB && ma.opponent?.id !== idB) {
    // opponent payload may use userId field
    const opp = ma.opponent?.userId || ma.opponent?.id
    if (opp && opp !== idB) console.warn('[test] opponent id field shape:', ma.opponent)
  }

  console.log('[test] PASS — both clients matched battle', battleA)
  a.close()
  b.close()
  process.exit(0)
}

main().catch((e) => {
  console.error('[test] FAIL', e.message)
  process.exit(1)
})
