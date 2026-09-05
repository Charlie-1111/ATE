import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatScore, getScoreTier } from '../../lib/scoring.js'

function ScoreBadge({ marks, quality, feedback, isTimeout }) {
  const hit = marks ?? quality
  if (hit === undefined && !feedback) return null

  const n = Number(hit) || 0
  const tier = getScoreTier(n)
  const tierClass = isTimeout || feedback === 'BLOCKED' || feedback === 'TIMEOUT'
    ? 'bg-red-950 text-danger border-2 border-danger'
    : n >= 9
      ? 'bg-gradient-to-b from-yellow-400 to-orange-500 text-black'
      : n >= 7
        ? 'bg-accent-gold text-black'
        : n >= 5
          ? 'bg-bg-card text-accent-cyan border-2 border-accent-cyan'
          : n >= 3
            ? 'bg-bg-surface text-text-muted border-2 border-gray-600'
            : 'bg-red-950 text-danger border-2 border-danger'

  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <div className={`px-3 py-1 font-display font-black text-sm rounded-lg border-2 border-black ${tierClass}`}>
        {formatScore(n)}/10
      </div>
      {(feedback || tier.label) && (
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
          {feedback || tier.label}
        </span>
      )}
    </div>
  )
}

function MessageBubble({ message }) {
  const { text, marks, quality, score, feedback, isMe, timestamp, isTimeout } = message

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3`}
    >
      <div
        className={`max-w-[85%] p-3 rounded-lg ${
          isMe
            ? 'bg-[#1a1a00] border-3 border-accent-gold border-r-6 border-r-accent-gold rounded-r-xl'
            : 'bg-[#1a0000] border-3 border-danger border-l-6 border-l-danger rounded-l-xl'
        }`}
      >
        <p className="text-white text-sm leading-relaxed">{text}</p>
        <ScoreBadge
          marks={marks ?? quality ?? score}
          quality={quality ?? score}
          feedback={feedback}
          isTimeout={isTimeout}
        />
      </div>
      {timestamp && (
        <span className="text-[10px] text-text-muted mt-1 px-1">
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
      <div className="px-4 py-2 border-b-2 border-accent-gold bg-[#1a1a00]">
        <h3 className="font-display text-accent-gold text-sm uppercase tracking-widest">
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
            <p className="text-text-muted text-sm italic">No roasts yet...</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id || i}
                message={msg}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
