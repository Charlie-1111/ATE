import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatTimer } from '../../lib/scoring.js'

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

  useEffect(() => {
    onSendRef.current = onSend
  }, [onSend])

  // Fresh turn: reset input + timer whenever turn starts or round re-enables input
  useEffect(() => {
    clearInterval(timerRef.current)
    if (!isMyTurn) return

    turnEpochRef.current += 1
    submittedRef.current = false
    setSubmitted(false)
    setText('')
    setTimeLeft(TURN_TIME)

    // Focus after overlay/disabled clears
    const focusId = setTimeout(() => textareaRef.current?.focus(), 50)
    return () => {
      clearTimeout(focusId)
      clearInterval(timerRef.current)
    }
  }, [isMyTurn])

  // Countdown only while it's your turn, not submitted, and not blocked by overlay
  useEffect(() => {
    clearInterval(timerRef.current)
    if (!isMyTurn || submitted || disabled) return

    const epoch = turnEpochRef.current
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (epoch !== turnEpochRef.current) return prev
        if (prev <= 1) {
          clearInterval(timerRef.current)
          if (!submittedRef.current) {
            submittedRef.current = true
            setSubmitted(true)
            onSendRef.current('', true)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [isMyTurn, submitted, disabled])

  // If overlay blocked the start of the turn, restart the full timer when it lifts
  useEffect(() => {
    if (isMyTurn && !submitted && !disabled) {
      setTimeLeft((t) => (t <= 0 ? TURN_TIME : t))
      textareaRef.current?.focus()
    }
  }, [disabled, isMyTurn, submitted])

  const handleSubmit = useCallback(() => {
    if (!text.trim() || submitted || disabled) return
    if (submittedRef.current) return
    clearInterval(timerRef.current)
    submittedRef.current = true
    setSubmitted(true)
    onSendRef.current(text.trim(), false)
    setText('')
  }, [text, submitted, disabled])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const timerColor = timeLeft <= 7
    ? 'text-danger'
    : timeLeft <= 14
      ? 'text-orange-500'
      : 'text-accent-gold'

  const timerBg = timeLeft <= 7
    ? 'bg-danger'
    : timeLeft <= 14
      ? 'bg-orange-500'
      : 'bg-accent-gold'

  const timerPercent = (timeLeft / TURN_TIME) * 100
  const inputLocked = submitted || disabled

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!isMyTurn ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6"
          >
            <p className="text-text-muted text-lg font-bold uppercase tracking-widest font-display">
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
              <span className="text-sm text-accent-gold font-display uppercase tracking-wider">
                Drop a roast
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted font-mono">TIME</span>
                <span
                  className={`font-mono text-3xl font-black ${timerColor}`}
                  role="timer"
                  aria-live="polite"
                  aria-label={`${timeLeft} seconds remaining`}
                >
                  {formatTimer(timeLeft)}
                </span>
              </div>
            </div>

            <div className="relative h-2 bg-bg-surface rounded-full overflow-hidden border border-gray-700">
              <div
                className={`absolute inset-y-0 left-0 ${timerBg} rounded-full transition-all duration-1000`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your roast..."
              maxLength={300}
              rows={2}
              disabled={inputLocked}
              className="w-full bg-bg-surface border-3 border-gray-600 rounded-lg px-4 py-3 text-white placeholder-text-muted
                focus:outline-none focus:border-accent-gold
                transition-all resize-none mt-3 disabled:opacity-50 font-sans"
              aria-label="Type your roast"
            />

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-text-muted font-mono">{text.length}/300</span>
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || inputLocked || text.trim().length < 5}
                className="bg-accent-gold hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed
                  text-black font-display font-black py-2 px-8 rounded-lg transition-all uppercase tracking-wider
                  border-3 border-black text-sm
                  focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2 focus:ring-offset-black"
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
