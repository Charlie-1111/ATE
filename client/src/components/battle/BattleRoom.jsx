import { useEffect, useState } from 'react'
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

export default function BattleRoom({
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
  myName = 'You',
  characterId = 'static',
}) {
  const [showScore, setShowScore] = useState(false)

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
      const timer = setTimeout(() => setShowScore(false), 2500)
      return () => clearTimeout(timer)
    }
    setShowScore(false)
  }, [lastRoastResult])

  useEffect(() => {
    if (isMyTurn) setShowScore(false)
  }, [isMyTurn, currentRound])

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

      <div className="relative z-10 bg-[var(--ate-ink)] border-b-4 border-[var(--ate-gold)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={UI.logoSquare} alt="ATE" className="w-10 h-10" />
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--ate-grey)] font-mono">
              {format === 'best_of_5' ? 'Best of 5' : 'Best of 3'}
              {' · '}
              {mode === 'topic' ? 'Topic' : 'Freestyle'}
            </span>
            <h2 className="font-display text-[var(--ate-gold)] text-xl uppercase tracking-wider">
              Round {currentRound}
            </h2>
          </div>
        </div>
      </div>

      {topic && (
        <div className="relative z-10 bg-[var(--ate-gold)]/10 border-b-2 border-[var(--ate-gold)]/40 px-4 py-2 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--ate-grey)] font-mono">Topic</p>
          <p className="font-display text-[var(--ate-gold)] uppercase tracking-wider">{topic}</p>
        </div>
      )}

      <div className="flex-1 flex relative z-10 min-h-0">
        <div className="w-36 lg:w-44 flex-shrink-0 flex flex-col items-center pt-4 ml-2">
          <PlayerPanel
            player={{ name: myName, characterId }}
            isActive={isMyTurn && !showCoinDraw}
            isOpponent={false}
            animation={
              showScore && lastRoastResult?.playerId === myId ? 'roast' : 'idle'
            }
          />
        </div>

        <div className="flex-1 flex flex-col mx-2 md:mx-4 min-w-0 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-2 z-20 pointer-events-none">
            <img src={UI.vs} alt="VS" className="w-16 h-16 opacity-90" />
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
              disabled={(showScore && !isMyTurn) || showCoinDraw}
            />
          </div>
        </div>

        <div className="w-36 lg:w-44 flex-shrink-0 flex flex-col items-center pt-4 mr-2">
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
                : showScore && lastRoastResult?.playerId === myId
                  ? 'hit'
                  : 'idle'
            }
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
