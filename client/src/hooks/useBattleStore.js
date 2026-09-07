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
  turnLive: false,
  countdownSec: 0,
  showCoinDraw: false,
  firstTurnUserId: null,
  coinDrawMs: 2500,
  pendingMyTurn: false,
  opponentTyping: false,
  lastRoastResult: null,
  lastRoastError: null,
  roastAcceptedAt: null,
  judging: false,
  toast: null,
  connectionStatus: 'online',
  showRoundTransition: false,
  roundTransition: null,
  roundScores: [],
  messages: [],
  winner: null,
  opponent: null,
  queueError: null,
  queuePosition: null,
  queueStartedAt: null,
}

export const useBattleStore = create((set, get) => ({
  ...initialState,

  setBattle: (data) => set({
    battleId: data.battleId ?? get().battleId,
    status: data.status,
    myId: data.myId ?? get().myId,
    opponent: data.opponent !== undefined ? data.opponent : get().opponent,
    format: data.format || get().format || 'best_of_3',
    mode: data.mode || get().mode || 'freestyle',
    topic: data.topic !== undefined ? data.topic : get().topic,
    currentRound: data.currentRound || get().currentRound || 1,
    isMyTurn: data.isMyTurn || false,
    queueError: data.queueError !== undefined ? data.queueError : null,
    queuePosition: data.queuePosition !== undefined ? data.queuePosition : get().queuePosition,
    queueStartedAt: data.queueStartedAt !== undefined ? data.queueStartedAt : get().queueStartedAt,
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
    turnLive: false,
    countdownSec: 0,
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
    judging: false,
    toast: null,
    showRoundTransition: false,
    roundTransition: null,
    connectionStatus: 'online',
    queueStartedAt: null,
    queuePosition: null,
  }),

  hydrateBattle: (snap) => set({
    status: 'active',
    battleId: snap.battleId,
    myId: snap.myId || get().myId,
    opponent: snap.opponent,
    format: snap.format || 'best_of_3',
    mode: snap.mode || 'freestyle',
    topic: snap.topic ?? null,
    currentRound: snap.currentRound || 1,
    isMyTurn: !!snap.isMyTurn,
    turnLive: !!snap.turnLive,
    countdownSec: snap.countdownSec || 0,
    showCoinDraw: false,
    firstTurnUserId: snap.firstTurnUserId ?? null,
    myScore: toMarks(snap.myScore ?? 0),
    opponentScore: toMarks(snap.opponentScore ?? 0),
    myTotalScore: toTotal(snap.myTotalScore ?? 0),
    opponentTotalScore: toTotal(snap.opponentTotalScore ?? 0),
    myRoundWins: snap.myRoundWins || 0,
    opponentRoundWins: snap.opponentRoundWins || 0,
    messages: snap.messages || get().messages,
    winner: null,
    judging: false,
    connectionStatus: 'online',
    toast: { type: 'info', message: 'Reconnected to battle' },
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

  setJudging: (judging) => set({ judging: !!judging }),

  setToast: (toast) => set({ toast }),

  clearToast: () => set({ toast: null }),

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

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
      judging: false,
      isMyTurn: isMine ? false : state.isMyTurn,
      myScore: isMine ? marks : state.myScore,
      opponentScore: !isMine ? marks : state.opponentScore,
      myTotalScore: isMine ? nextTotal : state.myTotalScore,
      opponentTotalScore: !isMine ? nextTotal : state.opponentTotalScore,
    })
  },

  deductTimeoutPenalty: () => {},

  beginRoundTransition: (data) => set({
    showRoundTransition: true,
    roundTransition: data,
    lastRoastResult: null,
    judging: false,
  }),

  advanceRound: (data) => set({
    currentRound: data.round,
    myRoundWins: data.myRoundWins,
    opponentRoundWins: data.opponentRoundWins,
    lastRoastResult: null,
    judging: false,
    showRoundTransition: false,
    roundTransition: null,
    roundScores: [...get().roundScores, data.roundResult],
    isMyTurn: data.isMyTurn,
    turnLive: false,
    countdownSec: data.isMyTurn ? 3 : 0,
    firstTurnUserId: data.firstTurnUserId ?? null,
  }),

  endBattle: (data) => set({
    status: 'completed',
    winner: data.winner,
    myRoundWins: data.myRoundWins ?? get().myRoundWins,
    opponentRoundWins: data.opponentRoundWins ?? get().opponentRoundWins,
    myTotalScore: data.myTotalScore != null ? toTotal(data.myTotalScore) : get().myTotalScore,
    opponentTotalScore: data.opponentTotalScore != null ? toTotal(data.opponentTotalScore) : get().opponentTotalScore,
    roundScores: data.finalRoundResult
      ? [...get().roundScores, data.finalRoundResult]
      : get().roundScores,
    showCoinDraw: false,
    judging: false,
    showRoundTransition: false,
  }),

  setTurn: (isMyTurn) => set({
    isMyTurn,
    turnLive: false,
    countdownSec: isMyTurn ? 3 : 0,
  }),

  setCountdown: (seconds) => set({
    countdownSec: Math.max(0, Number(seconds) || 0),
    turnLive: false,
    isMyTurn: true,
  }),

  setTurnLive: () => set({
    turnLive: true,
    countdownSec: 0,
    isMyTurn: true,
  }),

  noteRoastError: (message) => set({
    lastRoastError: Date.now(),
    judging: false,
    toast: message ? { type: 'error', message } : get().toast,
  }),

  noteRoastAccepted: () => set({ roastAcceptedAt: Date.now(), judging: true }),

  reset: () => set({ ...initialState }),
}))
