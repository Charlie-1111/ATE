let ollamaClient = null

function getOllama() {
  if (!ollamaClient) {
    const { Ollama } = require('ollama')
    ollamaClient = new Ollama({
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    })
  }
  return ollamaClient
}

const JUDGE_MODEL = process.env.ROAST_JUDGE_MODEL || 'roast-judge'
const FALLBACK_MODEL = process.env.OLLAMA_REF_MODEL || 'llama3.2'

const FEEDBACK_WORDS = new Set([
  'FIRE', 'WEAK', 'SAVAGE', 'CREATIVE', 'MID', 'COOKING',
  'DESTROYED', 'BRUTAL', 'WACK', 'SPICY', 'BLOCKED', 'TIMEOUT', 'LAZY', 'TRASH',
])

const TOXICITY_RE = /\b(nigg|faggot|retard|kys|kill yourself|doxx?|ssn|social security)\b/i
const FAMILY_ATTACK_RE = /\b(your (mom|mother|dad|father|grandma|grandpa|sister|brother)\b.*(die|dead|rape|kill|fuck))/i
const KEYSMASH_RE = /^(?:(.)\1{4,}|[asdfghjkl]{8,}|[qwerty]{8,})$/i

function labelForMarks(marks) {
  if (marks >= 9) return 'DESTROYED'
  if (marks >= 7) return 'SPICY'
  if (marks >= 5) return 'MID'
  if (marks >= 3) return 'WEAK'
  return 'TRASH'
}

/**
 * Layer A — deterministic precheck before LLM.
 * Returns a full result if the roast should not go to the AI, else null.
 */
function precheckRoast(text, { lastRoast } = {}) {
  const trimmed = (text || '').trim()

  if (!trimmed || trimmed.length < 5) {
    return {
      marks: 0,
      quality: 0,
      feedback: 'WEAK',
      criteria: null,
      blocked: false,
      source: 'precheck',
    }
  }

  if (TOXICITY_RE.test(trimmed) || FAMILY_ATTACK_RE.test(trimmed)) {
    return {
      marks: 0,
      quality: 0,
      feedback: 'BLOCKED',
      criteria: null,
      blocked: true,
      source: 'precheck',
    }
  }

  const letters = trimmed.replace(/[^a-zA-Z]/g, '')
  const emojiOnly = letters.length < 3 && /[\u{1F300}-\u{1FAFF}]/u.test(trimmed)
  if (emojiOnly || KEYSMASH_RE.test(trimmed.replace(/\s/g, ''))) {
    return {
      marks: 1.5,
      quality: 1.5,
      feedback: 'LAZY',
      criteria: null,
      blocked: false,
      source: 'precheck',
    }
  }

  if (lastRoast) {
    const a = normalizeForDup(trimmed)
    const b = normalizeForDup(lastRoast)
    if (a.length > 10 && b.length > 10 && (a === b || similarity(a, b) > 0.85)) {
      return {
        marks: 2,
        quality: 2,
        feedback: 'LAZY',
        criteria: null,
        blocked: false,
        source: 'precheck',
      }
    }
  }

  return null
}

function normalizeForDup(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

function similarity(a, b) {
  if (a === b) return 1
  const shorter = a.length < b.length ? a : b
  const longer = a.length < b.length ? b : a
  if (longer.includes(shorter) && shorter.length / longer.length > 0.85) return 0.9
  let matches = 0
  const wordsA = new Set(a.split(' '))
  const wordsB = b.split(' ')
  for (const w of wordsB) if (wordsA.has(w)) matches++
  return matches / Math.max(wordsA.size, wordsB.length, 1)
}

const JUDGE_PROMPT = `You are a Gen Z roast-battle judge. Score this roast from 0 to 10 (absolute marks for THIS message only).
Rubric: Originality 35%, Impact 30%, Punch/craft 20%, Cultural fluency 15%.
Wit over pure meanness. Unoriginal brutality caps around 4.

OUTPUT — exactly these lines:
SCORE: [0-10]
LABEL: [DESTROYED|SPICY|FIRE|MID|WEAK|TRASH]
`

const REFEREE_PROMPT = `You are a comedy-club roast battle REFEREE.
Judge how strong this roast is on an absolute 0–10 quality scale (marks for THIS message only — not a delta).

CRITERIA (each 0–10):
1. SPECIFICITY — Concrete target / vivid image vs generic insults
2. CRAFT — Setup → punchline, timing, economy of words
3. ORIGINALITY — Unexpected angle / wordplay vs recycled insults
4. CROWD — Would a roast audience laugh or go "ooh"?

OUTPUT — exactly these lines, nothing else:
SPECIFICITY: [0-10]
CRAFT: [0-10]
ORIGINALITY: [0-10]
CROWD: [0-10]
QUALITY: [0-10 average]
FEEDBACK: [one of: FIRE WEAK SAVAGE CREATIVE MID COOKING DESTROYED BRUTAL WACK SPICY TRASH]
`

let judgeAvailable = null

async function modelExists(name) {
  try {
    const ollama = getOllama()
    const { models } = await ollama.list()
    return (models || []).some((m) => {
      const n = (m.name || m.model || '').split(':')[0]
      return n === name || (m.name || '') === name
    })
  } catch {
    return false
  }
}

async function preferJudge() {
  if (judgeAvailable === null) {
    judgeAvailable = await modelExists(JUDGE_MODEL)
    if (judgeAvailable) console.log(`[Ollama] Using judge model ${JUDGE_MODEL}`)
    else console.log(`[Ollama] ${JUDGE_MODEL} not found; falling back to ${FALLBACK_MODEL}`)
  }
  return judgeAvailable
}

/**
 * Score a roast. Returns { marks, quality, feedback, criteria, blocked, source }.
 * `marks` is absolute 0–10 added to the player's running total.
 */
async function scoreRoast(text, ctx = {}) {
  const pre = precheckRoast(text, { lastRoast: ctx.lastOwnRoast })
  if (pre) return pre

  let contextBlock = ''
  if (ctx.opponentLastRoast) {
    contextBlock += `\nOpponent's last roast (reward clever callbacks):\n"${ctx.opponentLastRoast}"\n`
  }
  if (ctx.topic) {
    contextBlock += `\nBATTLE TOPIC: "${ctx.topic}" — reward roasts that play on this topic.\n`
  }

  const ollama = getOllama()
  const useJudge = await preferJudge()

  if (useJudge) {
    try {
      const response = await ollama.chat({
        model: JUDGE_MODEL,
        messages: [{
          role: 'user',
          content: `${JUDGE_PROMPT}${contextBlock}\nRoast:\n"${text.trim()}"`,
        }],
        stream: false,
        options: { temperature: 0.2, num_predict: 40 },
      })
      return parseJudge(response.message.content)
    } catch (err) {
      console.warn(`[Ollama] Judge failed (${err.message}); falling back to referee`)
      judgeAvailable = false
    }
  }

  const response = await ollama.chat({
    model: FALLBACK_MODEL,
    messages: [{
      role: 'user',
      content: `${REFEREE_PROMPT}${contextBlock}\nRoast to judge:\n"${text.trim()}"`,
    }],
    stream: false,
    options: { temperature: 0.3, num_predict: 80 },
  })

  return parseReferee(response.message.content)
}

function parseNum(re, text, fallback) {
  const m = text.match(re)
  if (!m) return fallback
  const n = parseFloat(m[1])
  return Number.isNaN(n) ? fallback : n
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

function round1(n) {
  return Math.round(n * 10) / 10
}

function parseJudge(text) {
  let marks = parseNum(/SCORE:\s*(-?\d+(?:\.\d+)?)/i, text, NaN)
  if (Number.isNaN(marks)) {
    marks = parseNum(/QUALITY:\s*(-?\d+(?:\.\d+)?)/i, text, 5)
  }
  marks = round1(clamp(marks, 0, 10))

  let feedback = labelForMarks(marks)
  const fb = text.match(/LABEL:\s*([A-Za-z]+)/i) || text.match(/FEEDBACK:\s*([A-Za-z]+)/i)
  if (fb) {
    const word = fb[1].toUpperCase()
    if (FEEDBACK_WORDS.has(word)) feedback = word
  }

  return {
    marks,
    quality: marks,
    feedback,
    criteria: null,
    blocked: false,
    source: 'judge',
  }
}

function parseReferee(text) {
  const specificity = clamp(parseNum(/SPECIFICITY:\s*(-?\d+(?:\.\d+)?)/i, text, 5), 0, 10)
  const craft = clamp(parseNum(/CRAFT:\s*(-?\d+(?:\.\d+)?)/i, text, 5), 0, 10)
  const originality = clamp(parseNum(/ORIGINALITY:\s*(-?\d+(?:\.\d+)?)/i, text, 5), 0, 10)
  const crowd = clamp(parseNum(/CROWD:\s*(-?\d+(?:\.\d+)?)/i, text, 5), 0, 10)

  let quality = parseNum(/QUALITY:\s*(-?\d+(?:\.\d+)?)/i, text, NaN)
  if (Number.isNaN(quality)) {
    quality = (specificity + craft + originality + crowd) / 4
  }
  // Legacy DELTA ignored for totals — quality is absolute marks
  quality = round1(clamp(quality, 0, 10))
  const marks = quality

  let feedback = labelForMarks(marks)
  const fb = text.match(/FEEDBACK:\s*([A-Za-z]+)/i)
  if (fb) {
    const word = fb[1].toUpperCase()
    if (FEEDBACK_WORDS.has(word)) feedback = word
  }

  return {
    marks,
    quality,
    feedback,
    criteria: { specificity, craft, originality, crowd },
    blocked: false,
    source: 'referee',
  }
}

/** @deprecated Delta scoring removed; kept for tests that still import it. */
function applyDelta(current, delta) {
  return round1(clamp((Number(current) || 0) + (Number(delta) || 0), 0, 10))
}

/** Add absolute marks to a running total (no 0–10 ceiling on the sum). */
function addMarks(current, marks) {
  return round1(Math.max(0, (Number(current) || 0) + (Number(marks) || 0)))
}

const ROAST_PROMPT = `You are a witty roast battle opponent. Generate a single, funny roast line (under 30 words).
No explanations, no "ROAST:" prefix, no quotes. Just the roast itself.
Be clever and funny, not hateful. Think comedy club, not schoolyard.
Prefer specific imagery and a clear punchline over generic insults.
No slurs, no doxxing, no family attacks.

Write one roast:`

async function generateRoast(topic = null) {
  const ollama = getOllama()
  const topicLine = topic
    ? `\nThe battle topic is: "${topic}". Your roast MUST riff on this topic.\n`
    : ''

  const response = await ollama.chat({
    model: FALLBACK_MODEL,
    messages: [{
      role: 'user',
      content: `${ROAST_PROMPT}${topicLine}`,
    }],
    stream: false,
    options: {
      temperature: 0.9,
      num_predict: 60,
    },
  })

  let text = response.message.content.trim()
  text = text.replace(/^["']|["']$/g, '').replace(/^ROAST:\s*/i, '')
  if (text.length > 200) text = text.substring(0, 200)
  return text
}

const TOPIC_POOL = [
  'bad fashion sense',
  'school cafeteria food',
  'WiFi that never works',
  'group projects',
  'morning people',
  'phone battery anxiety',
  'gym selfies',
  'reality TV addiction',
  'overpriced coffee',
  'being chronically late',
  'dry shampoo addiction',
  'unread email pile',
  'parking lot drama',
  'airline middle seats',
  'roommate dishes',
  'slow walkers',
  'group chat ghosts',
  'playlist gatekeepers',
  'office microwave fish',
  'selfie lighting',
  'expired milk gambles',
  'IKEA furniture rage',
  'printer paper jams',
  'Monday alarms',
  'spoiler addicts',
  'gas station sushi',
  'loud phone calls',
  'wrong Zoom backgrounds',
  'socks with sandals',
  'unlimited breadsticks',
  'dating app bios',
  'crypto bros',
  'airpods everywhere',
  'vending machine theft',
  'elevator small talk',
  'side hustle burnout',
  'influencer voice',
  'cold brew snobs',
  'karaoke confidence',
  'fantasy football',
  'road trip playlists',
  'hotel pillow wars',
  'shared Netflix profiles',
  'food delivery tips',
  'bathroom selfie culture',
  'conference call mute',
  'thrift flip fails',
  'gym mirror ego',
  'autocorrect betrayal',
  'sunday scaries',
]

/** Recently dealt topics — avoid repeats across matches. */
const recentTopics = []
const RECENT_LIMIT = 12

function normalizeTopic(t) {
  return String(t || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isTooSimilar(a, b) {
  const na = normalizeTopic(a)
  const nb = normalizeTopic(b)
  if (!na || !nb) return false
  if (na === nb) return true
  // share a distinctive word (4+ chars) → treat as same lane
  const wa = new Set(na.split(' ').filter((w) => w.length >= 4))
  const wb = nb.split(' ').filter((w) => w.length >= 4)
  return wb.some((w) => wa.has(w))
}

function rememberTopic(topic) {
  recentTopics.push(normalizeTopic(topic))
  while (recentTopics.length > RECENT_LIMIT) recentTopics.shift()
}

function pickFromPool() {
  const fresh = TOPIC_POOL.filter(
    (t) => !recentTopics.some((r) => isTooSimilar(t, r)),
  )
  const pool = fresh.length ? fresh : TOPIC_POOL
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Prefer a curated rotating pool so topics stay varied.
 * Ollama is optional spice — rejected if it repeats a recent theme.
 */
async function generateTopic() {
  let topic = pickFromPool()

  try {
    const ollama = getOllama()
    const avoid = recentTopics.slice(-5).join(', ') || 'none'
    const response = await ollama.chat({
      model: FALLBACK_MODEL,
      messages: [{
        role: 'user',
        content: `Invent ONE short roast-battle topic (2–5 words). Everyday life, comedy-club safe.
No quotes. Do NOT use adulting, adulting is overrated, or anything like: ${avoid}.
Examples: cafeteria food, WiFi lag, gym selfies, printer rage.
Topic:`,
      }],
      stream: false,
      options: { temperature: 1.1, num_predict: 16 },
    })
    let candidate = (response.message.content || '').trim()
    candidate = candidate
      .replace(/^["']|["']$/g, '')
      .replace(/^Topic:\s*/i, '')
      .split('\n')[0]
      .trim()
    if (
      candidate.length >= 3 &&
      candidate.length <= 48 &&
      !recentTopics.some((r) => isTooSimilar(candidate, r)) &&
      !/adulting/i.test(candidate)
    ) {
      topic = candidate
    }
  } catch {
    // keep pool pick
  }

  rememberTopic(topic)
  return topic
}

/** Ping Ollama so the model is warm before the first real score. */
async function warmUp() {
  try {
    const ollama = getOllama()
    const model = FALLBACK_MODEL
    console.log(`[Ollama] Warming up ${model}...`)
    await ollama.chat({
      model,
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
      stream: false,
      options: { temperature: 0, num_predict: 4 },
    })
    console.log('[Ollama] Warm-up complete')
    return true
  } catch (err) {
    console.warn('[Ollama] Warm-up failed:', err.message)
    return false
  }
}

module.exports = {
  scoreRoast,
  generateRoast,
  generateTopic,
  warmUp,
  applyDelta,
  addMarks,
  precheckRoast,
  parseReferee,
  parseJudge,
  labelForMarks,
}
