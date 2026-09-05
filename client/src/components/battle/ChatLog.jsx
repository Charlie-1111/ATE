import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatScore } from '../../lib/scoring.js'
import { badgeForFeedback, UI } from '../../lib/uiAssets.js'

function ScoreBadge({ marks, feedback, isTimeout }) {
  const hit = marks
  if (hit === undefined && !feedback) return null

  const n = Number(hit) || 0
  const label = String(feedback || '').toUpperCase()
  const badgeSrc = isTimeout || label === 'TIMEOUT'
    ? UI.stampTimeout
    : label === 'BLOCKED'
      ? UI.stampBlocked
      : badgeForFeedback(feedback, n)

  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <img
        src={badgeSrc}
        alt={`${formatScore(n)}/10 ${feedback || ''}`}
        className="h-12 w-auto drop-shadow-[2px_2px_0_#000]"
      />
      <span className="text-xs font-display uppercase tracking-wider text-[var(--ate-bone)]">
        {formatScore(n)}/10{feedback ? ` · ${feedback}` : ''}
      </span>
    </div>
  )
}

function MessageBubble({ message }) {
  const { text, marks, quality, score, feedback, isMe, timestamp, isTimeout } = message
  const frame = isMe ? UI.bubbleYou : UI.bubbleThem

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3`}
    >
      <div
        className="relative max-w-[90%] p-4 min-h-[4rem]"
        style={{
          backgroundImage: `url(${frame})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <img src={UI.tape} alt="" className="absolute -top-2 right-4 w-12 opacity-80" />
        <p className="text-[var(--ate-bone)] text-sm leading-relaxed relative z-10">{text}</p>
        <ScoreBadge
          marks={marks ?? quality ?? score}
          feedback={feedback}
          isTimeout={isTimeout}
        />
      </div>
      {timestamp && (
        <span className="text-[10px] text-[var(--ate-grey)] mt-1 px-1">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </motion.div>
  )
}

export default function ChatLog({ messages = [] }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b-2 border-[var(--ate-gold)] bg-black/40">
        <h3 className="font-display text-[var(--ate-gold)] text-sm uppercase tracking-widest">
          Battle Log
        </h3>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1 min-h-0"
        style={{ maxHeight: '50vh' }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[var(--ate-grey)] text-sm italic">No roasts yet...</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <MessageBubble key={msg.id || i} message={msg} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
