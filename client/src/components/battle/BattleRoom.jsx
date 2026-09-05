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
import { GoldTeeth, DiamondBracelet, ChainVertical } from '../decorations/index.jsx'

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
  characterId = 'echo',
}) {
  const [showScore, setShowScore] = useState(false)

  useEffect(() => {
    if (!showCoinDraw) return undefined
    const t = setTimeout(() => {
      onCoinDrawDone?.()
    }, coinDrawMs || 2500)
    return () => clearTimeout(t)
  }, [showCoinDraw, coinDrawMs, onCoinDrawDone, battleId])

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
      <AnimatePresence>
        {showCoinDraw && (
          <CoinDrawOverlay
            youGoFirst={youGoFirst}
            opponentName={opponent?.name || 'Opponent'}
          />
        )}
      </AnimatePresence>

      <div className="bg-bg-card border-b-4 border-accent-gold px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GoldTeeth className="w-12 h-8" />
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-text-muted font-mono">
              {format === 'best_of_5' ? 'Best of 5' : 'Best of 3'}
              {' · '}
              {mode === 'topic' ? 'Topic' : 'Freestyle'}
            </span>
            <h2 className="font-display text-accent-gold text-xl font-black uppercase tracking-wider">
              Round {currentRound}
            </h2>
          </div>
        </div>
        <DiamondBracelet className="w-8 h-16" />
      </div>

      {topic && (
        <div className="bg-accent-gold/10 border-b-2 border-accent-gold/40 px-4 py-2 text-center">
          <p className="text-xs uppercase tracking-widest text-text-muted font-mono">Topic</p>
          <p className="font-display font-black text-accent-gold uppercase tracking-wider">{topic}</p>
        </div>
      )}

      <div className="flex-1 flex relative">
        <div className="absolute left-0 top-0 h-full flex items-center z-10 opacity-80">
          <ChainVertical className="h-96" />
        </div>

        <div className="w-32 lg:w-40 flex-shrink-0 flex flex-col items-center pt-4 ml-8">
          <PlayerPanel
            player={{ name: myName, characterId }}
            isActive={isMyTurn && !showCoinDraw}
            isOpponent={false}
            animation={
              showScore && lastRoastResult?.playerId === myId
                ? 'roast'
                : 'idle'
            }
          />
        </div>

        <div className="flex-1 flex flex-col mx-4 min-w-0">
          <div className="flex-1 bg-bg-card border-4 border-gray-800 rounded-lg overflow-hidden flex flex-col min-h-0">
            <ChatLog messages={messages} />
          </div>

          <AnimatePresence>
            {showScore && lastRoastResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex items-center justify-center z-20"
              >
                <ScoreReveal result={lastRoastResult} isVisible={showScore} />
              </motion.div>
            )}
          </AnimatePresence>

          <TypingIndicator isOpponent={opponentTyping} />

          <div className="bg-bg-card border-t-4 border-accent-gold p-3 rounded-b-lg">
            <RoastInput
              isMyTurn={isMyTurn && !showCoinDraw}
              onSend={onSendRoast}
              disabled={(showScore && !isMyTurn) || showCoinDraw}
            />
          </div>
        </div>

        <div className="w-32 lg:w-40 flex-shrink-0 flex flex-col items-center pt-4 mr-8">
          <PlayerPanel
            player={{
              name: opponent?.name || 'Opponent',
              characterId: opponent?.characterId || opponent?.avatarId || 'riot',
            }}
            isActive={!isMyTurn && !showCoinDraw}
            isOpponent={true}
            animation={
              showScore && lastRoastResult && lastRoastResult.playerId !== myId
                ? 'roast'
                : showScore && lastRoastResult?.playerId === myId
                  ? 'hit'
                  : 'idle'
            }
          />
        </div>

        <div className="absolute right-0 top-0 h-full flex items-center z-10 opacity-80">
          <ChainVertical className="h-96" />
        </div>
      </div>

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
  )
}
