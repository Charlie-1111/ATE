import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatTimer } from '../../lib/scoring.js'
import { UI } from '../../lib/uiAssets.js'
import { useBattleStore } from '../../hooks/useBattleStore.js'

const TURN_TIME = 20

export default function RoastInput({ isMyTurn, onSend, disabled }) {
  const [text, setText] = useState('')
  const [timeLeft, setTimeLeft] = useState(TURN_TIME)
  const [submitted, setSubmitted] = useState(false)
  const textareaRef = useRef(null)
  const timerRef = useRef(null)
  const submittedRef = useRef(false)
  const onSendRef = useRef(onSend)
  const turnEpochRef = useRef(0)
  const acceptedRef = useRef(false)

  const lastRoastError = useBattleStore((s) => s.lastRoastError)
  const roastAcceptedAt = useBattleStore((s) => s.roastAcceptedAt)
  const countdownSec = useBattleStore((s) => s.countdownSec)
  const turnLive = useBattleStore((s) => s.turnLive)

  const inCountdown = isMyTurn && !turnLive && countdownSec > 0
  const canType = isMyTurn && turnLive && !disabled

  useEffect(() => {
    onSendRef.current = onSend
  }, [onSend])

  useEffect(() => {
    if (roastAcceptedAt) acceptedRef.current = true
  }, [roastAcceptedAt])

  useEffect(() => {
    if (!lastRoastError || !isMyTurn) return
    submittedRef.current = false
    acceptedRef.current = false
    setSubmitted(false)
  }, [lastRoastError, isMyTurn])

  // Reset when our turn starts (before countdown / live)
  useEffect(() => {
    clearInterval(timerRef.current)
    if (!isMyTurn) return

    turnEpochRef.current += 1
    submittedRef.current = false
    acceptedRef.current = false
    setSubmitted(false)
    setText('')
    setTimeLeft(TURN_TIME)

    return () => clearInterval(timerRef.current)
  }, [isMyTurn])

  // 20s clock only after server says turn_live
  useEffect(() => {
    clearInterval(timerRef.current)
    if (!canType || submitted) return

    const epoch = turnEpochRef.current
    setTimeLeft(TURN_TIME)
    const focusId = setTimeout(() => textareaRef.current?.focus(), 50)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (epoch !== turnEpochRef.current) return prev
        if (prev <= 1) {
          clearInterval(timerRef.current)
          if (!submittedRef.current && !acceptedRef.current) {
            submittedRef.current = true
            setSubmitted(true)
            onSendRef.current('', true)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearTimeout(focusId)
      clearInterval(timerRef.current)
    }
  }, [canType, submitted])

  const handleSubmit = useCallback(() => {
    if (!text.trim() || submitted || disabled || !turnLive) return
    if (submittedRef.current) return
    clearInterval(timerRef.current)
    submittedRef.current = true
    setSubmitted(true)
    onSendRef.current(text.trim(), false)
    setText('')
  }, [text, submitted, disabled, turnLive])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const timerColor = timeLeft <= 7
    ? 'text-[var(--ate-red)]'
    : timeLeft <= 14
      ? 'text-orange-500'
      : 'text-[var(--ate-gold)]'

  const timerBg = timeLeft <= 7
    ? 'bg-[var(--ate-red)]'
    : timeLeft <= 14
      ? 'bg-orange-500'
      : 'bg-[var(--ate-gold)]'

  const timerPercent = (timeLeft / TURN_TIME) * 100
  const inputLocked = submitted || disabled || !turnLive
  const timerIcon = timeLeft <= 10 ? UI.timerFlame : UI.timerClock

  return (
    <div className="w-full relative">
      <AnimatePresence>
        {inCountdown && (
          <motion.div
            key={`cd-${countdownSec}`}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 rounded-lg"
          >
            <span className="font-display text-7xl text-[var(--ate-gold)] drop-shadow-[0_4px_0_#000]">
              {countdownSec}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isMyTurn ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6"
          >
            <p className="text-[var(--ate-grey)] text-lg uppercase tracking-widest font-display">
              {submitted ? "Opponent's Turn..." : 'Your Turn Coming Up'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`input-${turnEpochRef.current}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--ate-gold)] font-display uppercase tracking-wider flex items-center gap-2">
                <img src={UI.mic} alt="" className="w-6 h-6" />
                {inCountdown ? 'Get ready...' : 'Drop a roast'}
              </span>
              <div className="flex items-center gap-2">
                <img src={timerIcon} alt="" className="w-6 h-6" />
                <span
                  className={`font-mono text-3xl font-black ${inCountdown ? 'text-[var(--ate-grey)]' : timerColor}`}
                  role="timer"
                  aria-live="polite"
                >
                  {inCountdown ? '—:—' : formatTimer(timeLeft)}
                </span>
              </div>
            </div>

            <div className="relative h-2 bg-bg-surface rounded-full overflow-hidden border border-gray-700">
              <div
                className={`absolute inset-y-0 left-0 ${timerBg} rounded-full transition-all duration-1000`}
                style={{ width: inCountdown ? '100%' : `${timerPercent}%`, opacity: inCountdown ? 0.25 : 1 }}
              />
            </div>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inCountdown ? 'Countdown…' : 'Type your roast...'}
              maxLength={300}
              rows={2}
              disabled={inputLocked}
              className="w-full bg-bg-surface border-3 border-gray-600 rounded-lg px-4 py-3 text-white placeholder-text-muted
                focus:outline-none focus:border-[var(--ate-gold)]
                transition-all resize-none mt-3 disabled:opacity-50 font-sans"
              aria-label="Type your roast"
            />

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[var(--ate-grey)] font-mono">{text.length}/300</span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim() || inputLocked || text.trim().length < 5}
                className="bg-[var(--ate-gold)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed
                  text-black font-display py-2 px-8 rounded-lg transition-all uppercase tracking-wider
                  border-3 border-black text-sm"
              >
                {submitted ? 'Sent!' : 'Send'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
