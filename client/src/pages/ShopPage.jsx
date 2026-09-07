import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CharacterViewer from '../components/character/CharacterViewer.jsx'
import { useCharacterStore } from '../hooks/useCharacterStore.js'
import {
  CHARACTERS,
  DEFAULT_CHARACTER_ID,
  getCharacter,
  isUnlocked,
  unlockHint,
  characterModelUrl,
} from '../lib/characterCatalog.js'
import { UI } from '../lib/uiAssets.js'
import { prefetchGltf } from '../lib/gltfCache.js'

export default function ShopPage() {
  const navigate = useNavigate()
  const {
    characterId,
    rankedWins,
    selectCharacter,
    resetCharacter,
  } = useCharacterStore()
  const [previewId, setPreviewId] = useState(characterId)
  const [hoverId, setHoverId] = useState(null)
  const preview = getCharacter(previewId)
  const dirty = previewId !== characterId

  useEffect(() => {
    prefetchGltf(characterModelUrl(previewId))
  }, [previewId])

  useEffect(() => {
    if (hoverId) prefetchGltf(characterModelUrl(hoverId))
  }, [hoverId])

  const confirmEquip = () => {
    if (!dirty) return
    if (selectCharacter(previewId)) {
      setPreviewId(previewId)
    }
  }

  return (
    <div className="min-h-screen bg-black text-[var(--ate-bone)] flex flex-col relative">
      <img src={UI.washSmoke} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none" />

      <header className="relative z-10 border-b-4 border-[var(--ate-gold)] bg-[var(--ate-ink)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={UI.logoSquare} alt="ATE" className="w-10 h-10" />
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--ate-grey)] font-mono">
              {rankedWins} ranked win{rankedWins === 1 ? '' : 's'} · unlock with wins
            </p>
            <h1 className="font-display text-xl text-[var(--ate-gold)] uppercase tracking-wider">
              Characters
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="font-display text-sm uppercase tracking-wider text-[var(--ate-grey)] hover:text-[var(--ate-bone)] border-2 border-gray-700 px-4 py-2 rounded-lg"
        >
          Back to Home
        </button>
      </header>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-8 max-w-6xl mx-auto w-full">
        <aside className="flex flex-col items-center gap-4 lg:w-80 flex-shrink-0">
          <motion.div
            className="ate-panel bg-[var(--ate-ink)] p-6 flex flex-col items-center gap-4 w-full relative"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              type="button"
              onClick={confirmEquip}
              disabled={!dirty}
              title={dirty ? 'Save this character' : 'Already equipped'}
              className={`absolute top-3 right-3 w-14 h-14 z-10 rounded-full transition-opacity ${
                dirty
                  ? 'opacity-100 hover:scale-110 cursor-pointer ring-2 ring-[var(--ate-gold)]'
                  : 'opacity-40 cursor-default'
              }`}
              aria-label={dirty ? 'Confirm and save character' : 'Character already equipped'}
            >
              <img src={UI.stampEquipped} alt="" className="w-full h-full pointer-events-none" />
            </button>

            <CharacterViewer
              characterId={previewId}
              size={220}
              live
              className="rounded-2xl"
            />
            <p className="font-display text-[var(--ate-gold)] uppercase tracking-widest text-lg">
              {preview.name}
            </p>
            <p className="text-xs text-[var(--ate-grey)] text-center font-mono">
              {dirty
                ? 'Press the tick to save — or leave without saving'
                : 'Equipped for battle & practice'}
            </p>
            {dirty && (
              <button
                type="button"
                onClick={confirmEquip}
                className="ate-btn-live text-sm py-2 px-6 w-auto"
              >
                Save Character
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                resetCharacter()
                setPreviewId(DEFAULT_CHARACTER_ID)
              }}
              className="text-xs uppercase tracking-wider text-[var(--ate-grey)] hover:text-[var(--ate-red)] font-display"
            >
              Reset to {getCharacter(DEFAULT_CHARACTER_ID).name}
            </button>
          </motion.div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {CHARACTERS.map((char) => {
              const equipped = characterId === char.id
              const previewing = previewId === char.id
              const unlocked = isUnlocked(char.id, { wins: rankedWins })
              const hint = unlockHint(char.id, { wins: rankedWins })
              const showLive = previewing || hoverId === char.id

              return (
                <div
                  key={char.id}
                  role={unlocked ? 'button' : undefined}
                  tabIndex={unlocked ? 0 : undefined}
                  onClick={() => {
                    if (unlocked) setPreviewId(char.id)
                  }}
                  onKeyDown={(e) => {
                    if (unlocked && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      setPreviewId(char.id)
                    }
                  }}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-3 bg-[var(--ate-ink)] ${
                    previewing ? 'border-[var(--ate-gold)]' : 'border-gray-800'
                  } ${unlocked ? 'cursor-pointer' : ''}`}
                  onMouseEnter={() => setHoverId(char.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <div className={`relative ${unlocked ? '' : 'opacity-70'}`}>
                    <CharacterViewer
                      characterId={char.id}
                      size={96}
                      live={showLive}
                      className="!border border-gray-700 rounded-xl"
                    />
                    {!unlocked && (
                      <img
                        src={UI.overlayLocked}
                        alt="Locked"
                        className="absolute inset-0 w-full h-full object-cover rounded-xl pointer-events-none"
                      />
                    )}
                    {equipped && unlocked && (
                      <img
                        src={UI.stampEquipped}
                        alt="Equipped"
                        className="absolute -bottom-2 -right-2 w-10 h-10 z-10 pointer-events-none"
                      />
                    )}
                  </div>
                  <p className="font-display text-sm uppercase tracking-wider">{char.name}</p>
                  {unlocked ? (
                    <span
                      className={`text-xs font-display uppercase tracking-wider px-3 py-1 rounded border-2 ${
                        equipped
                          ? 'border-[var(--ate-gold)] bg-[var(--ate-gold)] text-black'
                          : previewing
                            ? 'border-[var(--ate-gold)] text-[var(--ate-gold)]'
                            : 'border-gray-600 text-[var(--ate-grey)]'
                      }`}
                    >
                      {equipped ? 'Equipped' : previewing ? 'Selected' : 'Preview'}
                    </span>
                  ) : (
                    <p className="text-[10px] text-[var(--ate-grey)] font-mono text-center px-1">{hint}</p>
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
