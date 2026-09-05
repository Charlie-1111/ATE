import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CharacterViewer from '../components/character/CharacterViewer.jsx'
import { useCharacterStore } from '../hooks/useCharacterStore.js'
import {
  CHARACTERS,
  getCharacter,
  isUnlocked,
  unlockHint,
} from '../lib/characterCatalog.js'
import { GoldTeeth } from '../components/decorations/index.jsx'

export default function ShopPage() {
  const navigate = useNavigate()
  const {
    characterId,
    rankedWins,
    purchasedIds,
    selectCharacter,
    unlockPremium,
    resetCharacter,
  } = useCharacterStore()
  const selected = getCharacter(characterId)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b-4 border-accent-gold bg-bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GoldTeeth className="w-12 h-8" />
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted font-mono">
              {rankedWins} ranked win{rankedWins === 1 ? '' : 's'}
            </p>
            <h1 className="font-display text-xl font-black text-accent-gold uppercase tracking-wider">
              Characters
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="font-display text-sm uppercase tracking-wider text-text-muted hover:text-white border-2 border-gray-700 px-4 py-2 rounded-lg"
        >
          Back to Home
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-8 max-w-6xl mx-auto w-full">
        <aside className="flex flex-col items-center gap-4 lg:w-80 flex-shrink-0">
          <motion.div
            className="bg-bg-card border-4 border-accent-gold rounded-2xl p-6 flex flex-col items-center gap-4 w-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CharacterViewer
              characterId={characterId}
              size={220}
              interactive
              className="rounded-2xl"
            />
            <p className="font-display text-accent-gold uppercase tracking-widest text-lg">
              {selected.name}
            </p>
            <p className="text-xs text-text-muted text-center font-mono">
              Equipped for battle &amp; practice
            </p>
            <button
              type="button"
              onClick={resetCharacter}
              className="text-xs uppercase tracking-wider text-text-muted hover:text-danger font-display"
            >
              Reset to Echo
            </button>
          </motion.div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {CHARACTERS.map((char) => {
              const on = characterId === char.id
              const unlocked = isUnlocked(char.id, { wins: rankedWins, purchasedIds })
              const hint = unlockHint(char.id, { wins: rankedWins, purchasedIds })

              return (
                <div
                  key={char.id}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-3 bg-bg-card ${
                    on
                      ? 'border-accent-gold shadow-[0_0_0_2px_#000]'
                      : 'border-gray-800'
                  }`}
                >
                  <div className={`relative ${unlocked ? '' : 'opacity-45 grayscale'}`}>
                    <CharacterViewer
                      characterId={char.id}
                      size={96}
                      className="!border border-gray-700 rounded-xl"
                    />
                    {char.rarity === 'premium' && (
                      <span className="absolute top-1 right-1 text-[9px] font-display uppercase bg-accent-gold text-black px-1.5 py-0.5 rounded">
                        $
                      </span>
                    )}
                  </div>
                  <p className="font-display text-sm uppercase tracking-wider">{char.name}</p>
                  {unlocked ? (
                    <button
                      type="button"
                      onClick={() => selectCharacter(char.id)}
                      className={`text-xs font-display uppercase tracking-wider px-3 py-1 rounded border-2 ${
                        on
                          ? 'border-accent-gold bg-accent-gold text-black'
                          : 'border-gray-600 text-text-muted hover:border-accent-gold hover:text-white'
                      }`}
                    >
                      {on ? 'Equipped' : 'Equip'}
                    </button>
                  ) : char.rarity === 'premium' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Unlock ${char.name} for ${char.price}? (mock purchase)`)) {
                          unlockPremium(char.id)
                        }
                      }}
                      className="text-xs font-display uppercase tracking-wider px-3 py-1 rounded border-2 border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-black"
                    >
                      Buy {char.price}
                    </button>
                  ) : (
                    <p className="text-[10px] text-text-muted font-mono text-center px-1">{hint}</p>
                  )}
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
