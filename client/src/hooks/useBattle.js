import { useEffect, useCallback } from 'react'
import { useSocket } from '../context/SocketContext.jsx'
import { useBattleStore } from './useBattleStore.js'
import { useUserStore } from './useUserStore.js'
import { useCharacterStore } from './useCharacterStore.js'
import api from '../lib/api.js'
import { prefetchGltf } from '../lib/gltfCache.js'
import { characterModelUrl } from '../lib/characterCatalog.js'

const ROAST_ERR = {
  no_battle: 'Battle not found',
  not_in_battle: 'Not in this battle',
  not_your_turn: 'Not your turn',
  already_submitted: 'Already sent',
  already_round_roast: 'Already roasted this round',
  countdown: 'Wait for countdown',
  turn_not_live: 'Turn not live yet',
  stale_turn: 'Turn expired',
  invalid_roast: 'Invalid roast',
}

export function useBattle(userId) {
  const { socket, connected, join } = useSocket()
  const displayName = useUserStore((s) => s.displayName)
  const characterId = useCharacterStore((s) => s.characterId)
  const setRankedWins = useCharacterStore((s) => s.setRankedWins)

  // Thin selectors — avoid full-store subscription
  const status = useBattleStore((s) => s.status)
  const battleId = useBattleStore((s) => s.battleId)
  const format = useBattleStore((s) => s.format)
  const mode = useBattleStore((s) => s.mode)
  const topic = useBattleStore((s) => s.topic)
  const currentRound = useBattleStore((s) => s.currentRound)
  const opponent = useBattleStore((s) => s.opponent)
  const myScore = useBattleStore((s) => s.myScore)
  const opponentScore = useBattleStore((s) => s.opponentScore)
  const myTotalScore = useBattleStore((s) => s.myTotalScore)
  const opponentTotalScore = useBattleStore((s) => s.opponentTotalScore)
  const myRoundWins = useBattleStore((s) => s.myRoundWins)
  const opponentRoundWins = useBattleStore((s) => s.opponentRoundWins)
  const isMyTurn = useBattleStore((s) => s.isMyTurn)
  const showCoinDraw = useBattleStore((s) => s.showCoinDraw)
  const firstTurnUserId = useBattleStore((s) => s.firstTurnUserId)
  const coinDrawMs = useBattleStore((s) => s.coinDrawMs)
  const opponentTyping = useBattleStore((s) => s.opponentTyping)
  const lastRoastResult = useBattleStore((s) => s.lastRoastResult)
  const messages = useBattleStore((s) => s.messages)
  const winner = useBattleStore((s) => s.winner)
  const queueError = useBattleStore((s) => s.queueError)
  const queuePosition = useBattleStore((s) => s.queuePosition)
  const queueStartedAt = useBattleStore((s) => s.queueStartedAt)
  const judging = useBattleStore((s) => s.judging)
  const toast = useBattleStore((s) => s.toast)
  const connectionStatus = useBattleStore((s) => s.connectionStatus)
  const showRoundTransition = useBattleStore((s) => s.showRoundTransition)
  const roundTransition = useBattleStore((s) => s.roundTransition)
  const finishCoinDraw = useBattleStore((s) => s.finishCoinDraw)
  const clearToast = useBattleStore((s) => s.clearToast)

  useEffect(() => {
    if (!socket) return undefined

    const onMatchFound = (data) => {
      const oppChar = data.opponent?.characterId || data.opponent?.avatarId
      prefetchGltf(characterModelUrl(characterId))
      if (oppChar) prefetchGltf(characterModelUrl(oppChar))
      useBattleStore.getState().startBattle({
        battleId: data.battle.battleId,
        myId: userId,
        opponent: data.opponent,
        isMyTurn: data.battle.yourTurn,
        firstTurnUserId: data.battle.firstTurnUserId,
        coinDrawMs: data.battle.coinDrawMs,
        format: data.battle.format,
        mode: data.battle.mode,
        topic: data.battle.topic,
      })
    }

    socket.on('match_found', onMatchFound)

    socket.on('queued', (data) => {
      const cur = useBattleStore.getState()
      if (cur.status !== 'queued' && cur.status !== 'idle') return
      useBattleStore.getState().setBattle({
        status: 'queued',
        myId: userId,
        format: data.format || cur.format,
        mode: data.mode || cur.mode,
        queuePosition: data.position,
        queueError: null,
        queueStartedAt: cur.queueStartedAt || Date.now(),
      })
    })

    socket.on('queue_error', (data) => {
      useBattleStore.getState().setBattle({
        status: 'idle',
        myId: userId,
        queueError: data.error || 'queue_failed',
      })
    })

    socket.on('opponent_typing', () => {
      useBattleStore.getState().setOpponentTyping(true)
    })

    socket.on('opponent_stopped_typing', () => {
      useBattleStore.getState().setOpponentTyping(false)
    })

    socket.on('roast_scored', (data) => {
      const myId = useBattleStore.getState().myId
      const storeApi = useBattleStore.getState()
      storeApi.addMessage({
        playerId: data.playerId,
        text: data.text,
        marks: data.marks ?? data.quality ?? data.score,
        quality: data.marks ?? data.quality ?? data.score,
        score: data.marks ?? data.quality ?? data.score,
        feedback: data.feedback,
        scoredBy: data.scoredBy,
        newTotal: data.newTotal,
        isMe: data.playerId === myId,
        isTimeout: data.isTimeout,
        blocked: data.blocked,
      })
      storeApi.setRoastResult(data)
      storeApi.setOpponentTyping(false)
    })

    socket.on('roast_accepted', () => {
      useBattleStore.getState().noteRoastAccepted()
    })

    socket.on('round_complete', (data) => {
      const storeApi = useBattleStore.getState()
      storeApi.setOpponentTyping(false)
      storeApi.beginRoundTransition({
        round: data.round,
        myMarks: data.myMarks,
        opponentMarks: data.opponentMarks,
        myRoundWins: data.myRoundWins,
        opponentRoundWins: data.opponentRoundWins,
        youWonRound: data.youWonRound,
      })
    })

    socket.on('round_result', (data) => {
      const storeApi = useBattleStore.getState()
      storeApi.setOpponentTyping(false)
      storeApi.advanceRound({
        round: data.nextRound,
        myRoundWins: data.myRoundWins,
        opponentRoundWins: data.opponentRoundWins,
        roundResult: data.roundResult,
        isMyTurn: data.yourTurn,
        firstTurnUserId: data.firstTurnUserId,
      })
    })

    socket.on('battle_ended', (data) => {
      useBattleStore.getState().endBattle({
        winner: data.winner,
        myRoundWins: data.myRoundWins,
        opponentRoundWins: data.opponentRoundWins,
        myTotalScore: data.myTotalScore,
        opponentTotalScore: data.opponentTotalScore,
      })
    })

    socket.on('opponent_disconnected', () => {
      useBattleStore.getState().endBattle({ winner: 'opponent_disconnected' })
    })

    socket.on('opponent_reconnecting', () => {
      useBattleStore.getState().setToast({ type: 'warn', message: 'Opponent reconnecting…' })
      useBattleStore.getState().setConnectionStatus('opponent_reconnecting')
    })

    socket.on('battle_state', (data) => {
      useBattleStore.getState().hydrateBattle({
        ...data,
        myId: userId,
      })
    })

    socket.on('roast_error', (data) => {
      console.error('[Roast] Error:', data.error)
      const msg = ROAST_ERR[data.error] || data.error || 'Roast error'
      useBattleStore.getState().noteRoastError(msg)
    })

    socket.on('your_turn', (data) => {
      const storeApi = useBattleStore.getState()
      storeApi.setOpponentTyping(false)
      storeApi.setTurn(true)
      if (data?.countdownSec) storeApi.setCountdown(data.countdownSec)
    })

    socket.on('turn_countdown', (data) => {
      useBattleStore.getState().setCountdown(data?.seconds ?? 3)
    })

    socket.on('turn_live', () => {
      useBattleStore.getState().setTurnLive()
    })

    socket.on('opponents_turn', () => {
      useBattleStore.getState().setTurn(false)
    })

    const onDisconnect = () => {
      const cur = useBattleStore.getState()
      cur.setConnectionStatus('reconnecting')
      if (cur.status === 'queued') {
        cur.setBattle({
          status: 'idle',
          myId: userId,
          format: cur.format,
          mode: cur.mode,
          queueError: 'disconnected',
        })
      } else if (cur.status === 'active' && cur.battleId) {
        cur.setToast({ type: 'warn', message: 'Reconnecting…' })
      }
    }

    const onConnect = () => {
      const cur = useBattleStore.getState()
      cur.setConnectionStatus('online')
      if (cur.status === 'active' && cur.battleId) {
        socket.emit('request_battle_state', { battleId: cur.battleId, userId })
      }
    }

    socket.on('disconnect', onDisconnect)
    socket.on('connect', onConnect)

    return () => {
      socket.off('match_found', onMatchFound)
      socket.off('queued')
      socket.off('queue_error')
      socket.off('opponent_typing')
      socket.off('opponent_stopped_typing')
      socket.off('roast_scored')
      socket.off('roast_accepted')
      socket.off('round_complete')
      socket.off('round_result')
      socket.off('battle_ended')
      socket.off('opponent_disconnected')
      socket.off('opponent_reconnecting')
      socket.off('battle_state')
      socket.off('roast_error')
      socket.off('your_turn')
      socket.off('turn_countdown')
      socket.off('turn_live')
      socket.off('opponents_turn')
      socket.off('disconnect', onDisconnect)
      socket.off('connect', onConnect)
    }
  }, [socket, userId, characterId, setRankedWins])

  useEffect(() => {
    if (!userId) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/leaderboard', { params: { limit: 100 } })
        const me = (data.leaderboard || []).find((r) => r.id === userId)
        if (!cancelled && me && typeof me.wins === 'number') {
          const local = useCharacterStore.getState().rankedWins
          setRankedWins(Math.max(local, me.wins))
        }
      } catch {
        // offline
      }
    })()
    return () => { cancelled = true }
  }, [userId, setRankedWins])

  const queuePayload = useCallback((fmt, m) => ({
    userId,
    format: fmt,
    mode: m || 'freestyle',
    displayName,
    characterId,
    avatarId: characterId,
  }), [userId, displayName, characterId])

  const findBattle = useCallback(async (fmt = 'best_of_3', m = 'freestyle') => {
    const payload = queuePayload(fmt, m)
    useBattleStore.getState().setBattle({
      status: 'queued',
      myId: userId,
      format: fmt,
      mode: m,
      queueError: null,
      queueStartedAt: Date.now(),
    })
    const ok = socket.connected ? true : await join(userId)
    if (!ok && !socket.connected) {
      useBattleStore.getState().setBattle({
        status: 'idle',
        myId: userId,
        format: fmt,
        mode: m,
        queueError: 'connect_failed',
      })
      return
    }
    socket.emit('join_queue', payload)
  }, [socket, userId, join, queuePayload])

  const findPractice = useCallback(async (fmt = 'best_of_3', m = 'freestyle') => {
    const payload = queuePayload(fmt, m)
    useBattleStore.getState().setBattle({
      status: 'queued',
      myId: userId,
      format: fmt,
      mode: m,
      queueError: null,
      queueStartedAt: Date.now(),
    })
    const ok = socket.connected ? true : await join(userId)
    if (!ok && !socket.connected) {
      useBattleStore.getState().setBattle({
        status: 'idle',
        myId: userId,
        format: fmt,
        mode: m,
        queueError: 'connect_failed',
      })
      return
    }
    socket.emit('join_practice', payload)
  }, [socket, userId, join, queuePayload])

  const leaveQueue = useCallback(() => {
    socket.emit('leave_queue', { userId })
    useBattleStore.getState().reset()
  }, [socket, userId])

  const sendRoast = useCallback((text, isTimeout = false) => {
    const state = useBattleStore.getState()
    socket.emit('roast_sent', {
      battleId: state.battleId,
      text,
      round: state.currentRound,
      isTimeout,
      userId: state.myId,
      turnId: state.turnId,
    })
  }, [socket])

  const startTyping = useCallback(() => {
    const id = useBattleStore.getState().battleId
    if (id) socket.emit('roast_typing', { battleId: id })
  }, [socket])

  const stopTyping = useCallback(() => {
    const id = useBattleStore.getState().battleId
    if (id) socket.emit('roast_stopped_typing', { battleId: id })
  }, [socket])

  const rematch = useCallback(async (asPractice = false) => {
    const cur = useBattleStore.getState()
    const fmt = cur.format || 'best_of_3'
    const m = cur.mode || 'freestyle'
    useBattleStore.getState().reset()
    if (asPractice) await findPractice(fmt, m)
    else await findBattle(fmt, m)
  }, [findBattle, findPractice])

  return {
    connected,
    status,
    battleId,
    format,
    mode,
    topic,
    currentRound,
    opponent,
    myScore,
    opponentScore,
    myTotalScore,
    opponentTotalScore,
    myRoundWins,
    opponentRoundWins,
    isMyTurn,
    showCoinDraw,
    firstTurnUserId,
    coinDrawMs,
    opponentTyping,
    lastRoastResult,
    messages,
    winner,
    queueError,
    queuePosition,
    queueStartedAt,
    judging,
    toast,
    connectionStatus,
    showRoundTransition,
    roundTransition,
    finishCoinDraw,
    clearToast,
    findBattle,
    findPractice,
    leaveQueue,
    sendRoast,
    startTyping,
    stopTyping,
    rematch,
  }
}
