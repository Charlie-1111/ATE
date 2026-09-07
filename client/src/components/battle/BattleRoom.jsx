import { useEffect, useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlayerPanel from './PlayerPanel.jsx'
import ScoreBoard from './ScoreBoard.jsx'
import RoastInput from './RoastInput.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import ScoreReveal from './ScoreReveal.jsx'
import BattleResult from './BattleResult.jsx'
import ChatLog from './ChatLog.jsx'
import CoinDrawOverlay from './CoinDrawOverlay.jsx'
import { UI } from '../../lib/uiAssets.js'
import { playSfx, vibrate } from '../../lib/audio.js'
import { UI as UIx } from '../../lib/uiAssets.js'

function RoundDots({ wins, needed, color }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: needed }).map((_, i) => (
        <img
          key={i}
          src={i < wins ? (color === 'gold' ? UI.pipGold : UI.pipRed) : UI.pipEmpty}
          alt=""
          className="w-4 h-4"
        />
      ))}
    </div>
  )
}

function BattleRoom({
  battleId,
  myId,
  opponent,
  currentRound,
  format,
  mode = 'freestyle',
  topic = null,
  myScore,
  opponentScore,
  myTotalScore,
  opponentTotalScore,
  myRoundWins,
  opponentRoundWins,
  isMyTurn,
  showCoinDraw = false,
  firstTurnUserId = null,
  coinDrawMs = 2500,
  onCoinDrawDone,
  opponentTyping,
  lastRoastResult,
  messages,
  winner,
  onSendRoast,
  onStartTyping,
  onStopTyping,
  judging = false,
  toast = null,
  onClearToast,
  connectionStatus = 'online',
  showRoundTransition = false,
  roundTransition = null,
  myName = 'You',
  characterId = 'static',
  onRematch,
  onPracticeAgain,
  isPractice = false,
}) {
  const [showScore, setShowScore] = useState(false)
  const winsNeeded = format === 'best_of_5' ? 3 : 2

  useEffect(() => {
    if (!showCoinDraw) return undefined
    const ms = coinDrawMs || 2500
    const t = setTimeout(() => onCoinDrawDone?.(), ms)
    const hard = setTimeout(() => onCoinDrawDone?.(), ms + 1500)
    return () => {
      clearTimeout(t)
      clearTimeout(hard)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCoinDraw, coinDrawMs, battleId])

  useEffect(() => {
    if (lastRoastResult) {
      setShowScore(true)
      playSfx('score')
      vibrate([10, 40, 10])
      const timer = setTimeout(() => setShowScore(false), 2500)
      return () => clearTimeout(timer)
    }
    setShowScore(false)
  }, [lastRoastResult])

  useEffect(() => {
    if (isMyTurn) setShowScore(false)
  }, [isMyTurn, currentRound])

  useEffect(() => {
    if (showRoundTransition) {
      playSfx('round')
    }
  }, [showRoundTransition])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => onClearToast?.(), 3500)
    return () => clearTimeout(t)
  }, [toast, onClearToast])

  if (winner) {
    return (
      <BattleResult
        winner={winner}
        myRoundWins={myRoundWins}
        opponentRoundWins={opponentRoundWins}
        myTotalScore={myTotalScore}
        opponentTotalScore={opponentTotalScore}
        myName={myName}
        opponentName={opponent?.name || 'Opponent'}
        messages={messages}
        onRematch={onRematch}
        onPracticeAgain={onPracticeAgain}
        isPractice={isPractice}
      />
    )
  }

  const youGoFirst = firstTurnUserId != null
    ? firstTurnUserId === myId
    : isMyTurn

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <img
        src={UI.washSmoke}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      />

      <AnimatePresence>
        {showCoinDraw && (
          <CoinDrawOverlay
            youGoFirst={youGoFirst}
            opponentName={opponent?.name || 'Opponent'}
          />
        )}
      </AnimatePresence>

      {/* Sticky match progress */}
      <div className="relative z-[60] sticky top-0 bg-[var(--ate-ink)]/95 border-b-4 border-[var(--ate-gold)] px-4 py-2 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img src={UI.logoSquare} alt="ATE" className="w-9 h-9" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ate-grey)] font-mono">
              {format === 'best_of_5' ? 'Best of 5' : 'Best of 3'}
              {' · '}
              {mode === 'topic' ? 'Topic' : 'Freestyle'}
            </span>
            <h2 className="font-display text-[var(--ate-gold)] text-lg uppercase tracking-wider leading-tight">
              Round {currentRound}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] uppercase text-[var(--ate-gold)] font-mono">{myName}</p>
            <RoundDots wins={myRoundWins} needed={winsNeeded} color="gold" />
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase text-[var(--ate-red)] font-mono">{opponent?.name || 'Opp'}</p>
            <RoundDots wins={opponentRoundWins} needed={winsNeeded} color="red" />
          </div>
        </div>
      </div>

      {connectionStatus === 'reconnecting' && (
        <div className="relative z-[100] bg-amber-600 text-black text-center text-xs font-mono py-1">
          Reconnecting…
        </div>
      )}
      {connectionStatus === 'opponent_reconnecting' && (
        <div className="relative z-[100] bg-amber-700/90 text-white text-center text-xs font-mono py-1">
          Opponent reconnecting…
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`relative z-[100] text-center text-sm font-mono py-2 ${
              toast.type === 'error' ? 'bg-[var(--ate-red)] text-white' : 'bg-[var(--ate-gold)] text-black'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {topic && (
        <div className="relative z-10 bg-[var(--ate-gold)]/10 border-b-2 border-[var(--ate-gold)]/40 px-4 py-2 text-center sticky top-[52px]">
          <p className="text-xs uppercase tracking-widest text-[var(--ate-grey)] font-mono">Topic</p>
          <p className="font-display text-[var(--ate-gold)] uppercase tracking-wider text-sm md:text-base">{topic}</p>
        </div>
      )}

      <AnimatePresence>
        {showRoundTransition && roundTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 flex flex-col items-center justify-center gap-4 px-4"
          >
            <p className="font-display text-3xl text-[var(--ate-gold)] uppercase tracking-wider">
              Round {roundTransition.round} complete
            </p>
            <p className="font-mono text-[var(--ate-bone)] text-xl">
              You {roundTransition.myMarks} · Them {roundTransition.opponentMarks}
            </p>
            {roundTransition.youWonRound && (
              <p className="font-display text-[var(--ate-red)] uppercase">You took the round</p>
            )}
            <div className="flex gap-6 mt-2">
              <RoundDots wins={roundTransition.myRoundWins} needed={winsNeeded} color="gold" />
              <RoundDots wins={roundTransition.opponentRoundWins} needed={winsNeeded} color="red" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex relative z-10 min-h-0">
        <div className="w-28 sm:w-36 lg:w-44 flex-shrink-0 flex flex-col items-center pt-4 ml-1 sm:ml-2">
          <PlayerPanel
            player={{ name: myName, characterId }}
            isActive={isMyTurn && !showCoinDraw}
            isOpponent={false}
            animation={
              showScore && lastRoastResult?.playerId === myId ? 'roast' : 'idle'
            }
            live={!showCoinDraw}
          />
        </div>

        <div className="flex-1 flex flex-col mx-1 sm:mx-2 md:mx-4 min-w-0 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-2 z-20 pointer-events-none">
            <img src={UIx.vs} alt="VS" className="w-12 h-12 sm:w-16 sm:h-16 opacity-90" />
          </div>

          <div className="flex-1 bg-[var(--ate-ink)] border-4 border-gray-800 rounded-lg overflow-hidden flex flex-col min-h-0 mt-8">
            <ChatLog messages={messages} />
          </div>

          <AnimatePresence>
            {showScore && lastRoastResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex items-center justify-center z-30"
              >
                <ScoreReveal result={lastRoastResult} isVisible={showScore} />
              </motion.div>
            )}
          </AnimatePresence>

          <TypingIndicator isOpponent={opponentTyping} />

          <div className="bg-[var(--ate-ink)] border-t-4 border-[var(--ate-gold)] p-3 rounded-b-lg">
            <RoastInput
              isMyTurn={isMyTurn && !showCoinDraw}
              onSend={onSendRoast}
              onStartTyping={onStartTyping}
              onStopTyping={onStopTyping}
              judging={judging}
              disabled={(showScore && !isMyTurn) || showCoinDraw || showRoundTransition}
            />
          </div>
        </div>

        <div className="w-28 sm:w-36 lg:w-44 flex-shrink-0 flex flex-col items-center pt-4 mr-1 sm:mr-2">
          <PlayerPanel
            player={{
              name: opponent?.name || 'Opponent',
              characterId: opponent?.characterId || opponent?.avatarId || 'lil_grid',
            }}
            isActive={!isMyTurn && !showCoinDraw}
            isOpponent
            animation={
              showScore && lastRoastResult && lastRoastResult.playerId !== myId
                ? 'roast'
                : showScore && lastRoastResult?.playerId === myId && (lastRoastResult.marks ?? 0) >= 7
                  ? 'hit'
                  : 'idle'
            }
            live={!showCoinDraw}
          />
        </div>
      </div>

      <div className="relative z-10">
        <ScoreBoard
          myTotalScore={myTotalScore}
          opponentTotalScore={opponentTotalScore}
          myRoundWins={myRoundWins}
          opponentRoundWins={opponentRoundWins}
          format={format}
          myName={myName}
          opponentName={opponent?.name || 'Opponent'}
        />
      </div>
    </div>
  )
}

export default memo(BattleRoom)
