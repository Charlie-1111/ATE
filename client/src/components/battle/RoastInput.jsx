import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatTimer } from '../../lib/scoring.js'
import { UI } from '../../lib/uiAssets.js'
import { useBattleStore } from '../../hooks/useBattleStore.js'
import { playSfx, vibrate } from '../../lib/audio.js'

const TURN_TIME = 20

export default function RoastInput({
  isMyTurn,
  onSend,
  disabled,
  onStartTyping,
  onStopTyping,
  judging = false,
}) {
  const [text, setText] = useState('')
  const [timeLeft, setTimeLeft] = useState(TURN_TIME)
  const [submitted, setSubmitted] = useState(false)
  const textareaRef = useRef(null)
  const timerRef = useRef(null)
  const submittedRef = useRef(false)
  const onSendRef = useRef(onSend)
  const turnEpochRef = useRef(0)
  const acceptedRef = useRef(false)
  const lockedRoundRef = useRef(null)
  const typingTimerRef = useRef(null)
  const lastTypingEmit = useRef(0)
  const typingAliveRef = useRef(null)

  const lastRoastError = useBattleStore((s) => s.lastRoastError)
  const roastAcceptedAt = useBattleStore((s) => s.roastAcceptedAt)
  const countdownSec = useBattleStore((s) => s.countdownSec)
  const turnLive = useBattleStore((s) => s.turnLive)
  const currentRound = useBattleStore((s) => s.currentRound)

  const alreadySentThisRound = lockedRoundRef.current === currentRound
  const inCountdown = isMyTurn && !turnLive && countdownSec > 0 && !alreadySentThisRound
  const canType = isMyTurn && turnLive && !disabled && !alreadySentThisRound && !judging

  useEffect(() => {
    onSendRef.current = onSend
  }, [onSend])

  useEffect(() => {
    if (countdownSec > 0 && inCountdown) {
      playSfx('tick')
      if (countdownSec === 1) vibrate(20)
    }
  }, [countdownSec, inCountdown])

  useEffect(() => {
    if (roastAcceptedAt) {
      acceptedRef.current = true
      lockedRoundRef.current = useBattleStore.getState().currentRound
      submittedRef.current = true
      setSubmitted(true)
      onStopTyping?.()
    }
  }, [roastAcceptedAt, onStopTyping])

  useEffect(() => {
    if (!lastRoastError || !isMyTurn) return
    if (lockedRoundRef.current === currentRound) return
    submittedRef.current = false
    acceptedRef.current = false
    setSubmitted(false)
  }, [lastRoastError, isMyTurn, currentRound])

  useEffect(() => {
    clearInterval(timerRef.current)
    clearInterval(typingAliveRef.current)
    if (!isMyTurn) {
      onStopTyping?.()
      return undefined
    }
    if (lockedRoundRef.current === currentRound) {
      submittedRef.current = true
      setSubmitted(true)
      return undefined
    }

    turnEpochRef.current += 1
    submittedRef.current = false
    acceptedRef.current = false
    setSubmitted(false)
    setText('')
    setTimeLeft(TURN_TIME)

    return () => {
      clearInterval(timerRef.current)
      clearInterval(typingAliveRef.current)
    }
  }, [isMyTurn, currentRound, onStopTyping])

  useEffect(() => {
    clearInterval(timerRef.current)
    if (!canType || submitted || alreadySentThisRound) return undefined

    const epoch = turnEpochRef.current
    setTimeLeft(TURN_TIME)
    const focusId = setTimeout(() => textareaRef.current?.focus(), 50)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (epoch !== turnEpochRef.current) return prev
        if (prev <= 1) {
          clearInterval(timerRef.current)
          if (!submittedRef.current && !acceptedRef.current && lockedRoundRef.current !== currentRound) {
            submittedRef.current = true
            lockedRoundRef.current = currentRound
            setSubmitted(true)
            onStopTyping?.()
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
  }, [canType, submitted, alreadySentThisRound, currentRound, onStopTyping])

  const emitTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastTypingEmit.current < 300) return
    lastTypingEmit.current = now
    onStartTyping?.()
  }, [onStartTyping])

  const handleChange = (e) => {
    const v = e.target.value
    setText(v)
    if (!canType || submitted) return
    emitTyping()
    clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => onStopTyping?.(), 2800)
    clearInterval(typingAliveRef.current)
    typingAliveRef.current = setInterval(() => {
      if (submittedRef.current) return
      onStartTyping?.()
    }, 3000)
  }

  const handleSubmit = useCallback(() => {
    if (!text.trim() || submitted || disabled || !turnLive || judging) return
    if (submittedRef.current || lockedRoundRef.current === currentRound) return
    clearInterval(timerRef.current)
    clearInterval(typingAliveRef.current)
    clearTimeout(typingTimerRef.current)
    submittedRef.current = true
    lockedRoundRef.current = currentRound
    setSubmitted(true)
    onStopTyping?.()
    playSfx('send')
    vibrate(15)
    onSendRef.current(text.trim(), false)
    setText('')
  }, [text, submitted, disabled, turnLive, judging, currentRound, onStopTyping])

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
  const inputLocked = submitted || disabled || !turnLive || alreadySentThisRound || judging
  const timerIcon = timeLeft <= 10 ? UI.timerFlame : UI.timerClock

  return (
    <div className="w-full relative" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <AnimatePresence>
        {judging && (
          <motion.div
            key="judging"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/75 rounded-lg"
          >
            <div className="w-10 h-10 border-4 border-[var(--ate-gold)] border-t-transparent rounded-full animate-spin" />
            <span className="font-display text-[var(--ate-gold)] uppercase tracking-wider text-lg">
              Judging…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {inCountdown && (
          <motion.div
            key={`cd-${countdownSec}`}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 rounded-lg motion-reduce:transition-none"
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
              {submitted || judging ? "Opponent's Turn..." : 'Your Turn Coming Up'}
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
                {judging ? 'Judging…' : inCountdown ? 'Get ready...' : 'Drop a roast'}
              </span>
              <div className="flex items-center gap-2">
                <img src={timerIcon} alt="" className="w-6 h-6" />
                <span
                  className={`font-mono text-3xl font-black ${inCountdown || judging ? 'text-[var(--ate-grey)]' : timerColor}`}
                  role="timer"
                  aria-live="polite"
                >
                  {inCountdown || judging ? '—:—' : formatTimer(timeLeft)}
                </span>
              </div>
            </div>

            <div className="relative h-2 bg-bg-surface rounded-full overflow-hidden border border-gray-700">
              <div
                className={`absolute inset-y-0 left-0 ${timerBg} rounded-full transition-all duration-1000`}
                style={{ width: inCountdown || judging ? '100%' : `${timerPercent}%`, opacity: inCountdown || judging ? 0.25 : 1 }}
              />
            </div>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              onBlur={() => onStopTyping?.()}
              onKeyDown={handleKeyDown}
              placeholder={judging ? 'Judging…' : inCountdown ? 'Countdown…' : 'Type your roast...'}
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
                {judging ? 'Judging…' : submitted ? 'Sent!' : 'Send'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
