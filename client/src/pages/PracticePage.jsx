import { useState, useEffect } from 'react'
import { useBattle } from '../hooks/useBattle.js'
import { useSocket } from '../context/SocketContext.jsx'
import { useCharacterStore } from '../hooks/useCharacterStore.js'
import { useUserStore } from '../hooks/useUserStore.js'
import BattleRoom from '../components/battle/BattleRoom.jsx'
import { motion } from 'framer-motion'
import { GoldTeeth, DiamondBracelet } from '../components/decorations/index.jsx'

export default function PracticePage() {
  const userId = useUserStore((s) => s.userId)
  const displayName = useUserStore((s) => s.displayName)
  const { join } = useSocket()
  const battle = useBattle(userId)
  const characterId = useCharacterStore((s) => s.characterId)
  const [mode, setMode] = useState('freestyle')
  const [format, setFormat] = useState('best_of_3')

  useEffect(() => {
    join(userId)
  }, [userId])

  if (battle.status === 'idle') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 px-4">
        <GoldTeeth className="w-40 h-24" />

        <motion.h1
          className="font-display text-5xl font-black text-accent-gold uppercase tracking-wider"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Practice vs AI
        </motion.h1>

        <p className="text-text-muted font-sans text-center">Hone your roast skills against a bot</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode('topic')}
            className={`font-display font-black uppercase tracking-wider px-6 py-3 rounded-lg border-4 ${
              mode === 'topic' ? 'bg-accent-gold text-black border-black' : 'bg-bg-card text-white border-gray-700'
            }`}
          >
            Topic
          </button>
          <button
            type="button"
            onClick={() => setMode('freestyle')}
            className={`font-display font-black uppercase tracking-wider px-6 py-3 rounded-lg border-4 ${
              mode === 'freestyle' ? 'bg-accent-gold text-black border-black' : 'bg-bg-card text-white border-gray-700'
            }`}
          >
            Freestyle
          </button>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setFormat('best_of_3')}
            className={`font-display font-black uppercase tracking-wider px-6 py-2 rounded-lg border-3 ${
              format === 'best_of_3' ? 'border-accent-gold text-accent-gold' : 'border-gray-700 text-text-muted'
            }`}
          >
            Best of 3
          </button>
          <button
            type="button"
            onClick={() => setFormat('best_of_5')}
            className={`font-display font-black uppercase tracking-wider px-6 py-2 rounded-lg border-3 ${
              format === 'best_of_5' ? 'border-accent-gold text-accent-gold' : 'border-gray-700 text-text-muted'
            }`}
          >
            Best of 5
          </button>
        </div>

        <button
          type="button"
          onClick={() => battle.findPractice(format, mode)}
          className="mt-2 bg-accent-gold hover:bg-yellow-500 text-black font-display font-black text-lg px-10 py-3 rounded-lg border-4 border-black uppercase tracking-wider"
        >
          Start Practice
        </button>

        <button
          type="button"
          onClick={() => { window.location.href = '/' }}
          className="text-text-muted text-sm mt-2 hover:text-accent-gold transition-colors font-display uppercase tracking-wider"
        >
          Back to Home
        </button>

        <DiamondBracelet className="w-16 h-32 mt-8" />
      </div>
    )
  }

  if (battle.status === 'queued') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <motion.div
          className="w-16 h-16 border-4 border-accent-gold border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-lg text-accent-gold font-display uppercase tracking-wider">Summoning AI opponent...</p>
        <button
          type="button"
          onClick={() => battle.leaveQueue()}
          className="bg-bg-card hover:bg-bg-surface text-text-muted font-display text-sm uppercase tracking-wider px-6 py-2 rounded border-2 border-gray-700"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <BattleRoom
      battleId={battle.battleId}
      myId={userId}
      opponent={battle.opponent}
      currentRound={battle.currentRound}
      format={battle.format}
      mode={battle.mode}
      topic={battle.topic}
      myScore={battle.myScore}
      opponentScore={battle.opponentScore}
      myTotalScore={battle.myTotalScore}
      opponentTotalScore={battle.opponentTotalScore}
      myRoundWins={battle.myRoundWins}
      opponentRoundWins={battle.opponentRoundWins}
      isMyTurn={battle.isMyTurn}
      showCoinDraw={battle.showCoinDraw}
      firstTurnUserId={battle.firstTurnUserId}
      coinDrawMs={battle.coinDrawMs}
      onCoinDrawDone={battle.finishCoinDraw}
      opponentTyping={battle.opponentTyping}
      lastRoastResult={battle.lastRoastResult}
      messages={battle.messages}
      winner={battle.winner}
      onSendRoast={battle.sendRoast}
      myName={displayName}
      characterId={characterId}
    />
  )
}
