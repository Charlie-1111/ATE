import { formatTotal } from '../../lib/scoring.js'
import { UI } from '../../lib/uiAssets.js'

export default function ScoreBoard({
  myTotalScore,
  opponentTotalScore,
  myRoundWins,
  opponentRoundWins,
  format,
  myName,
  opponentName,
}) {
  const totalRounds = format === 'best_of_5' ? 5 : 3
  const winsNeeded = Math.ceil(totalRounds / 2)

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto px-4 py-3 bg-[var(--ate-ink)] border-t-4 border-[var(--ate-gold)]">
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-[var(--ate-gold)] text-sm uppercase tracking-wider">{myName}</span>
        <span className="font-display text-3xl text-[var(--ate-bone)]">{formatTotal(myTotalScore)}</span>
        <div className="flex gap-1">
          {Array.from({ length: winsNeeded }).map((_, i) => (
            <img
              key={i}
              src={i < myRoundWins ? UI.pipGold : UI.pipEmpty}
              alt=""
              className="w-5 h-5"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--ate-grey)]">Round</span>
        <img src={UI.vs} alt="VS" className="w-10 h-10" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-[var(--ate-red)] text-sm uppercase tracking-wider">{opponentName}</span>
        <span className="font-display text-3xl text-[var(--ate-bone)]">{formatTotal(opponentTotalScore)}</span>
        <div className="flex gap-1">
          {Array.from({ length: winsNeeded }).map((_, i) => (
            <img
              key={i}
              src={i < opponentRoundWins ? UI.pipRed : UI.pipEmpty}
              alt=""
              className="w-5 h-5"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
