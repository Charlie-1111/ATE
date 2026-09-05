import { useEffect, useCallback } from 'react'
import { useSocket } from '../context/SocketContext.jsx'
import { useBattleStore } from './useBattleStore.js'
import { useUserStore } from './useUserStore.js'
import { useCharacterStore } from './useCharacterStore.js'

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

    socket.on('opponent_typing', () => {
      store.setOpponentTyping(true)
    })

    socket.on('opponent_stopped_typing', () => {
      store.setOpponentTyping(false)
    })

    socket.on('roast_scored', (data) => {
      const myId = store.myId
      store.addMessage({
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
      store.setRoastResult(data)
      store.setOpponentTyping(false)
    })

    socket.on('timeout_penalty', () => {})

    socket.on('round_result', (data) => {
      store.advanceRound({
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
      // Ranked unlocks: bump local wins if we won a non-practice PvP (practice doesn't emit leaderboard)
      if (data.winner === 'me' && data.countedForLeaderboard !== false) {
        // Practice battles still emit battle_ended — server only records PvP.
        // Client can't always tell; sync from API when possible.
      }
    })

    socket.on('opponent_disconnected', () => {
      store.endBattle({ winner: 'opponent_disconnected' })
    })

    socket.on('roast_error', (data) => {
      console.error('[Roast] Error:', data.error)
    })

    socket.on('your_turn', () => {
      store.setTurn(true)
    })

    socket.on('opponents_turn', () => {
      store.setTurn(false)
    })

    return () => {
      socket.off('match_found')
      socket.off('opponent_typing')
      socket.off('opponent_stopped_typing')
      socket.off('roast_scored')
      socket.off('timeout_penalty')
      socket.off('round_result')
      socket.off('battle_ended')
      socket.off('opponent_disconnected')
      socket.off('roast_error')
      socket.off('your_turn')
      socket.off('opponents_turn')
    }
  }, [socket, userId, setRankedWins])

  // Pull ranked wins from leaderboard profile for unlock gating
  useEffect(() => {
    if (!userId) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/leaderboard?limit=100`)
        const data = await res.json()
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

  const findBattle = useCallback((format = 'best_of_3', mode = 'freestyle') => {
    const payload = queuePayload(format, mode)
    const go = () => {
      socket.emit('join_queue', payload)
      store.setBattle({ status: 'queued', myId: userId, format, mode })
    }
    if (!socket.connected) {
      join(userId)
      setTimeout(go, 500)
    } else {
      go()
    }
  }, [socket, userId, join, queuePayload])

  const findPractice = useCallback((format = 'best_of_3', mode = 'freestyle') => {
    const payload = queuePayload(format, mode)
    const go = () => {
      socket.emit('join_practice', payload)
      store.setBattle({ status: 'queued', myId: userId, format, mode })
    }
    if (!socket.connected) {
      join(userId)
      setTimeout(go, 500)
    } else {
      go()
    }
  }, [socket, userId, join, queuePayload])

  const leaveQueue = useCallback(() => {
    socket.emit('leave_queue', { userId })
    store.reset()
  }, [socket, userId])

  const sendRoast = useCallback((text, isTimeout = false) => {
    socket.emit('roast_sent', {
      battleId: store.battleId,
      text,
      round: store.currentRound,
      isTimeout,
    })
  }, [socket, store.battleId, store.currentRound])

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
