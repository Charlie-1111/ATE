import { useEffect, useCallback } from 'react'
import { useSocket } from '../context/SocketContext.jsx'
import { useBattleStore } from './useBattleStore.js'
import { useUserStore } from './useUserStore.js'
import { useCharacterStore } from './useCharacterStore.js'
import api from '../lib/api.js'

export function useBattle(userId) {
  const { socket, connected, join } = useSocket()
  const store = useBattleStore()
  const displayName = useUserStore((s) => s.displayName)
  const characterId = useCharacterStore((s) => s.characterId)
  const setRankedWins = useCharacterStore((s) => s.setRankedWins)

  useEffect(() => {
    if (!socket) return

    socket.on('match_found', (data) => {
      store.startBattle({
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
    })

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
      store.setOpponentTyping(true)
    })

    socket.on('opponent_stopped_typing', () => {
      store.setOpponentTyping(false)
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

    socket.on('timeout_penalty', () => {})

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
      store.endBattle({
        winner: data.winner,
        myRoundWins: data.myRoundWins,
        opponentRoundWins: data.opponentRoundWins,
        myTotalScore: data.myTotalScore,
        opponentTotalScore: data.opponentTotalScore,
      })
    })

    socket.on('opponent_disconnected', () => {
      store.endBattle({ winner: 'opponent_disconnected' })
    })

    socket.on('roast_error', (data) => {
      console.error('[Roast] Error:', data.error)
      useBattleStore.getState().noteRoastError()
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
      if (cur.status === 'queued') {
        cur.setBattle({
          status: 'idle',
          myId: userId,
          format: cur.format,
          mode: cur.mode,
          queueError: 'disconnected',
        })
      }
    }
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('match_found')
      socket.off('queued')
      socket.off('queue_error')
      socket.off('opponent_typing')
      socket.off('opponent_stopped_typing')
      socket.off('roast_scored')
      socket.off('roast_accepted')
      socket.off('timeout_penalty')
      socket.off('round_result')
      socket.off('battle_ended')
      socket.off('opponent_disconnected')
      socket.off('roast_error')
      socket.off('your_turn')
      socket.off('turn_countdown')
      socket.off('turn_live')
      socket.off('opponents_turn')
      socket.off('disconnect', onDisconnect)
    }
  }, [socket, userId, setRankedWins])

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
        // offline / no API — keep local wins
      }
    })()
    return () => { cancelled = true }
  }, [userId, setRankedWins])

  const queuePayload = useCallback((format, mode) => ({
    userId,
    format,
    mode: mode || 'freestyle',
    displayName,
    characterId,
    avatarId: characterId,
  }), [userId, displayName, characterId])

  const findBattle = useCallback(async (format = 'best_of_3', mode = 'freestyle') => {
    const payload = queuePayload(format, mode)
    store.setBattle({ status: 'queued', myId: userId, format, mode, queueError: null })
    const ok = socket.connected ? true : await join(userId)
    if (!ok && !socket.connected) {
      store.setBattle({ status: 'idle', myId: userId, format, mode, queueError: 'connect_failed' })
      return
    }
    socket.emit('join_queue', payload)
  }, [socket, userId, join, queuePayload, store])

  const findPractice = useCallback(async (format = 'best_of_3', mode = 'freestyle') => {
    const payload = queuePayload(format, mode)
    store.setBattle({ status: 'queued', myId: userId, format, mode, queueError: null })
    const ok = socket.connected ? true : await join(userId)
    if (!ok && !socket.connected) {
      store.setBattle({ status: 'idle', myId: userId, format, mode, queueError: 'connect_failed' })
      return
    }
    socket.emit('join_practice', payload)
  }, [socket, userId, join, queuePayload, store])

  const leaveQueue = useCallback(() => {
    socket.emit('leave_queue', { userId })
    store.reset()
  }, [socket, userId, store])

  const sendRoast = useCallback((text, isTimeout = false) => {
    const state = useBattleStore.getState()
    socket.emit('roast_sent', {
      battleId: state.battleId,
      text,
      round: state.currentRound,
      isTimeout,
      userId: state.myId,
    })
  }, [socket])

  const startTyping = useCallback(() => {
    socket.emit('roast_typing', { battleId: store.battleId })
  }, [socket, store.battleId])

  const stopTyping = useCallback(() => {
    socket.emit('roast_stopped_typing', { battleId: store.battleId })
  }, [socket, store.battleId])

  return {
    ...store,
    connected,
    findBattle,
    findPractice,
    leaveQueue,
    sendRoast,
    startTyping,
    stopTyping,
  }
}
