import { create } from 'zustand'

const START_SCORE = 0

function toMarks(n) {
  const x = Number(n)
  if (Number.isNaN(x)) return 0
  return Math.max(0, Math.min(10, Math.round(x * 10) / 10))
}

function toTotal(n) {
  const x = Number(n)
  if (Number.isNaN(x)) return 0
  return Math.max(0, Math.round(x * 10) / 10)
}

const initialState = {
  battleId: null,
  status: 'idle',
  format: 'best_of_3',
  mode: 'freestyle',
  topic: null,
  currentRound: 1,
  myId: null,
  myScore: START_SCORE,
  opponentScore: START_SCORE,
  myTotalScore: START_SCORE,
  opponentTotalScore: START_SCORE,
  myRoundWins: 0,
  opponentRoundWins: 0,
  isMyTurn: false,
  showCoinDraw: false,
  firstTurnUserId: null,
  coinDrawMs: 2500,
  opponentTyping: false,
  lastRoastResult: null,
  roundScores: [],
  messages: [],
  winner: null,
  opponent: null,
}

export const useBattleStore = create((set, get) => ({
  ...initialState,

  setBattle: (data) => set({
    battleId: data.battleId,
    status: data.status,
    myId: data.myId,
    opponent: data.opponent,
    format: data.format || 'best_of_3',
    mode: data.mode || 'freestyle',
    topic: data.topic ?? null,
    currentRound: data.currentRound || 1,
    isMyTurn: data.isMyTurn || false,
  }),

  startBattle: (data) => set({
    status: 'active',
    battleId: data.battleId,
    myId: data.myId || get().myId,
    opponent: data.opponent,
    format: data.format || get().format || 'best_of_3',
    mode: data.mode || 'freestyle',
    topic: data.topic ?? null,
    currentRound: 1,
    isMyTurn: false,
    showCoinDraw: true,
    firstTurnUserId: data.firstTurnUserId ?? null,
    coinDrawMs: data.coinDrawMs || 2500,
    pendingMyTurn: !!data.isMyTurn,
    myScore: START_SCORE,
    opponentScore: START_SCORE,
    myTotalScore: START_SCORE,
    opponentTotalScore: START_SCORE,
    myRoundWins: 0,
    opponentRoundWins: 0,
    messages: [],
    roundScores: [],
    winner: null,
    lastRoastResult: null,
  }),

  finishCoinDraw: () => {
    const state = get()
    set({
      showCoinDraw: false,
      isMyTurn: !!state.pendingMyTurn,
      pendingMyTurn: false,
    })
  },

  setOpponentTyping: (typing) => set({ opponentTyping: typing }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }],
  })),

  setRoastResult: (result) => {
    const state = get()
    const isMine = result.playerId === state.myId
    const marks = toMarks(result.marks ?? result.quality ?? result.score ?? 0)

    let nextTotal
    if (result.newTotal != null) {
      nextTotal = toTotal(result.newTotal)
    } else {
      const prev = isMine ? state.myTotalScore : state.opponentTotalScore
      nextTotal = toTotal(prev + marks)
    }

    set({
      lastRoastResult: { ...result, marks, quality: marks, score: marks },
      isMyTurn: false,
      myScore: isMine ? marks : state.myScore,
      opponentScore: !isMine ? marks : state.opponentScore,
      myTotalScore: isMine ? nextTotal : state.myTotalScore,
      opponentTotalScore: !isMine ? nextTotal : state.opponentTotalScore,
    })
  },

  deductTimeoutPenalty: () => {},

  advanceRound: (data) => set({
    currentRound: data.round,
    myRoundWins: data.myRoundWins,
    opponentRoundWins: data.opponentRoundWins,
    lastRoastResult: null,
    roundScores: [...get().roundScores, data.roundResult],
    isMyTurn: data.isMyTurn,
    firstTurnUserId: data.firstTurnUserId ?? null,
  }),

  endBattle: (data) => set({
    status: 'completed',
    winner: data.winner,
    myRoundWins: data.myRoundWins,
    opponentRoundWins: data.opponentRoundWins,
    myTotalScore: data.myTotalScore != null ? toTotal(data.myTotalScore) : get().myTotalScore,
    opponentTotalScore: data.opponentTotalScore != null ? toTotal(data.opponentTotalScore) : get().opponentTotalScore,
    roundScores: [...get().roundScores, data.finalRoundResult],
    showCoinDraw: false,
  }),

  setTurn: (isMyTurn) => set({ isMyTurn }),

  reset: () => set(initialState),
}))
