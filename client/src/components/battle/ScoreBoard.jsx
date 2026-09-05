import { formatTotal } from '../../lib/scoring.js'

export default function ScoreBoard({ myTotalScore, opponentTotalScore, myRoundWins, opponentRoundWins, format, myName, opponentName }) {
  const totalRounds = format === 'best_of_5' ? 5 : 3
  const winsNeeded = Math.ceil(totalRounds / 2)

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto px-4 py-3 bg-bg-card border-t-3 border-accent-gold">
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-accent-gold text-sm uppercase tracking-wider">{myName}</span>
        <span className="font-display text-3xl font-black text-white">{formatTotal(myTotalScore)}</span>
        <div className="flex gap-1">
          {Array.from({ length: winsNeeded }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-2 rounded-sm ${
                i < myRoundWins ? 'bg-accent-gold' : 'bg-bg-surface border border-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Round</span>
        <div className="flex gap-1">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border-2 ${
                i < myRoundWins + opponentRoundWins
                  ? i < myRoundWins
                    ? 'bg-accent-gold border-accent-gold'
                    : 'bg-danger border-danger'
                  : 'bg-bg-surface border-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-danger text-sm uppercase tracking-wider">{opponentName}</span>
        <span className="font-display text-3xl font-black text-white">{formatTotal(opponentTotalScore)}</span>
        <div className="flex gap-1">
          {Array.from({ length: winsNeeded }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-2 rounded-sm ${
                i < opponentRoundWins ? 'bg-danger' : 'bg-bg-surface border border-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
