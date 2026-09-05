# ATE — Real-Time 1v1 Roasting Battle Platform

## Decisions Made

| Decision | Choice |
|----------|--------|
| LLM | Ollama + llama3.2 (3B) — local, free, unlimited |
| Scoring | Additive 1-10 per roast, score on send only |
| Avatar | Inline SVG React components (animated) |
| Database | PostgreSQL |
| Frontend | React 18 + Vite + TailwindCSS + Framer Motion |
| Realtime | Socket.io (WebSocket) |
| Auth | JWT (bcrypt passwords) |
| Deployment | Vercel (FE) + Railway (BE) + Supabase (DB) |

---

## Tech Stack

### Frontend
- **React 18** via Vite (fast HMR, ESM)
- **TailwindCSS** — dark theme, neon accents (purple/blue/green)
- **Framer Motion** — score animations, page transitions, fire effects
- **Socket.io-client** — real-time battle events
- **React Router v6** — page routing
- **Zustand** — lightweight state management (auth, socket, battle state)

### Backend
- **Node.js + Express** — REST API + WebSocket server
- **Socket.io** — rooms, events, real-time battles
- **PostgreSQL** via `pg` + `knex` (query builder + migrations)
- **JWT** — `jsonwebtoken` + `bcryptjs`
- **Ollama** — `ollama` npm package, llama3.2 model

---

## Project Structure

```
ATE/
├── PLAN.md
├── package.json              # root workspace config
│
├── client/                   # React frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css           # Tailwind imports + dark theme
│       │
│       ├── assets/
│       │   └── avatars/        # SVG files copied from Downloads
│       │       ├── skin/
│       │       │   ├── light.jsx
│       │       │   ├── medium.jsx
│       │       │   ├── tan.jsx
│       │       │   ├── dark.jsx
│       │       │   └── very_dark.jsx
│       │       ├── hair/
│       │       │   ├── undercut.jsx
│       │       │   ├── afro.jsx
│       │       │   ├── ... (15 total)
│       │       ├── eyes/
│       │       │   ├── blue_circles.jsx
│       │       │   ├── ... (10 total)
│       │       ├── mouth/
│       │       │   ├── smile.jsx
│       │       │   ├── ... (8 total)
│       │       └── accessories/
│       │           ├── gold_chain.jsx
│       │           ├── ... (21 total)
│       │
│       ├── components/
│       │   ├── ui/
│       │   │   ├── Button.jsx
│       │   │   ├── Input.jsx
│       │   │   ├── Card.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── ScoreDisplay.jsx
│       │   │   └── FireEffect.jsx
│       │   ├── avatar/
│       │   │   ├── AvatarRenderer.jsx    # Stacked SVG layers
│       │   │   ├── AvatarBuilder.jsx     # Customization UI
│       │   │   └── AvatarPreview.jsx     # Live preview
│       │   ├── battle/
│       │   │   ├── BattleRoom.jsx        # Main battle screen
│       │   │   ├── TypingIndicator.jsx
│       │   │   ├── RoastInput.jsx        # Text input + timer
│       │   │   ├── ScoreBoard.jsx        # Live scores display
│       │   │   ├── BattleResult.jsx      # Winner screen
│       │   │   └── BattleHistory.jsx
│       │   ├── leaderboard/
│       │   │   ├── LeaderboardTable.jsx
│       │   │   └── LeaderboardFilters.jsx
│       │   ├── profile/
│       │   │   ├── ProfileCard.jsx
│       │   │   ├── StatsDisplay.jsx
│       │   │   └── BattleHistoryList.jsx
│       │   └── shop/
│       │       ├── CosmeticsShop.jsx
│       │       ├── CosmeticCard.jsx
│       │       └── DailyDeals.jsx
│       │
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── SignupPage.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── BattlePage.jsx
│       │   ├── LeaderboardPage.jsx
│       │   ├── ShopPage.jsx
│       │   └── AvatarPage.jsx
│       │
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── SocketContext.jsx
│       │
│       ├── hooks/
│       │   ├── useSocket.js
│       │   ├── useBattle.js
│       │   └── useAuth.js
│       │
│       ├── lib/
│       │   ├── api.js              # axios fetch helpers
│       │   ├── socket.js           # socket.io client setup
│       │   └── scoring.js          # client-side score calculations
│       │
│       └── config/
│           ├── avatars.js          # avatar parts registry
│           └── cosmetics.js        # cosmetics catalog
│
├── server/                   # Express backend
│   ├── package.json
│   ├── index.js              # Entry point (Express + Socket.io)
│   ├── knexfile.js           # DB config
│   ├── migrations/
│   │   └── 001_initial.js    # All tables
│   ├── routes/
│   │   ├── auth.js           # POST /signup, /login, /me
│   │   ├── users.js          # GET /users/:id, PATCH /users/:id
│   │   ├── battles.js        # GET /battles/:id, history
│   │   ├── cosmetics.js      # GET /cosmetics, POST /buy
│   │   └── leaderboard.js    # GET /leaderboard
│   ├── middleware/
│   │   └── auth.js           # JWT verification
│   ├── socket/
│   │   └── handlers.js       # All Socket.io event handlers
│   ├── services/
│   │   ├── ollama.js         # Ollama API integration
│   │   ├── matchmaking.js    # Queue logic
│   │   └── leaderboard.js    # Leaderboard refresh logic
│   ├── models/
│   │   ├── User.js
│   │   ├── Battle.js
│   │   ├── Roast.js
│   │   └── Cosmetic.js
│   └── config/
│       ├── database.js       # DB connection
│       └── environment.js    # env vars
│
└── data/
    └── avatars/              # Original SVG files (source of truth)
        ├── skin_tones/
        ├── hairstyles/
        ├── eyes/
        ├── mouths/
        └── accessories/
```

---

## Database Schema (PostgreSQL + Knex Migrations)

### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PRIMARY KEY |
| username | VARCHAR(30) | UNIQUE, NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| country | VARCHAR(2) | ISO code, nullable |
| avatar_config | JSONB | `{ skin, hair, eyes, mouth, accessories[] }` |
| avg_score | DECIMAL(3,1) | computed, default 0 |
| total_battles | INT | default 0 |
| wins | INT | default 0 |
| losses | INT | default 0 |
| cosmetics_owned | UUID[] | array of cosmetic IDs |
| title | VARCHAR(50) | nullable, unlocked via battle pass |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### battles
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PRIMARY KEY |
| player1_id | UUID | FK → users |
| player2_id | UUID | FK → users |
| status | ENUM | queued / active / completed / abandoned |
| winner_id | UUID | FK → users, nullable |
| format | ENUM | best_of_3 / best_of_5 |
| player1_total_score | INT | default 0 |
| player2_total_score | INT | default 0 |
| current_round | INT | default 1 |
| created_at | TIMESTAMP | |
| ended_at | TIMESTAMP | |

### roasts
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PRIMARY KEY |
| battle_id | UUID | FK → battles |
| player_id | UUID | FK → users |
| round | INT | 1, 2, 3, etc. |
| text | TEXT | the roast message |
| ai_score | INT | 1-10 from Ollama |
| ai_feedback | VARCHAR(50) | e.g. "FIRE 🔥", "WEAK", "SAVAGE" |
| created_at | TIMESTAMP | |

### cosmetics
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(50) | NOT NULL |
| type | ENUM | skin / hair / eyes / mouth / accessory |
| price | DECIMAL(5,2) | 0 = free |
| rarity | ENUM | common / rare / legendary |
| unlock_method | ENUM | free / paid / battle_pass |
| svg_path | VARCHAR(255) | path to SVG file |
| created_at | TIMESTAMP | |

### user_cosmetics
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FK → users |
| cosmetic_id | UUID | FK → cosmetics |
| owned_at | TIMESTAMP | |

### leaderboard_cache
| Column | Type | Notes |
|--------|------|-------|
| user_id | UUID | FK → users, PRIMARY KEY |
| world_rank | INT | |
| country_rank | INT | |
| avg_score | DECIMAL(3,1) | |
| total_battles | INT | |
| updated_at | TIMESTAMP | refreshed hourly |

---

## Core Game Flow

```
1. User signs up → creates avatar (inline SVG builder)
2. User clicks "Find Battle" → joins matchmaking queue
3. Socket.io matches two players → creates battle record
4. Battle starts → both players see opponent avatar
5. Best of 3 or 5 (player choice before battle)
6. Each round:
   a. Player A types roast (60s timer)
   b. Player B sees typing in real-time (no content, just typing indicator)
   c. Player A hits send
   d. Server sends text to Ollama → gets score (1-10) + feedback
   e. Both players see score + feedback
   f. 3-second "thinking" pause
   g. Player B's turn to type (10s response window)
   h. Player B sends → Ollama scores → both see result
7. After all rounds → calculate winner (highest total score)
8. Winner screen shows final scores, avatars, badges
9. Leaderboard updates
```

---

## Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_queue` | `{ userId, format }` | Enter matchmaking |
| `leave_queue` | `{ userId }` | Exit queue |
| `roast_typing` | `{ battleId }` | Opponent sees "typing..." |
| `roast_sent` | `{ battleId, text, round }` | Send roast to server |
| `ready_next_round` | `{ battleId }` | Player ready for next turn |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `match_found` | `{ battle, opponent }` | Matched with opponent |
| `battle_started` | `{ battle, opponent }` | Battle begins |
| `opponent_typing` | `{}` | Opponent is typing |
| `roast_scored` | `{ score, feedback, playerScore }` | AI score revealed |
| `round_result` | `{ winner, scores }` | Round winner |
| `battle_ended` | `{ winner, finalScores, stats }` | Battle complete |
| `leaderboard_updated` | `{ rank }` | Your rank changed |

---

## Ollama Integration

```js
// server/services/ollama.js
const ollama = require('ollama')({ host: 'http://localhost:11434' })

async function scoreRoast(roastText) {
  const response = await ollama.chat({
    model: 'llama3.2',
    messages: [{
      role: 'user',
      content: `Score this roast battle response 1-10 on creativity, humor, delivery, and savageness.
Return ONLY: "SCORE: [number]" and "FEEDBACK: [2 word reaction]".
Examples of feedback: "FIRE 🔥", "WEAK", "SAVAGE", "CREATIVE", "MID", "COOKING", "DESTROYED".
Toxicity check: if roast contains slurs, doxxing, or family attacks → return "SCORE: 0" and "FEEDBACK: BLOCKED".
Roast: "${roastText}"`
    }],
    stream: false,
    options: { temperature: 0.7 }
  })
  return parseScore(response.message.content)
}

function parseScore(text) {
  const scoreMatch = text.match(/SCORE:\s*(\d+)/)
  const feedbackMatch = text.match(/FEEDBACK:\s*(.+)/)
  return {
    score: scoreMatch ? parseInt(scoreMatch[1]) : 5,
    feedback: feedbackMatch ? feedbackMatch[1].trim() : 'MID'
  }
}
```

---

## Avatar SVG → React Component Conversion

Each SVG file from `Downloads/avatar_parts/` will be converted to a React component:

```jsx
// client/src/assets/avatars/skin/medium.jsx
export default function MediumSkin() {
  return (
    <g id="skin_tone_medium">
      <path d="M80 139v31l20 15 20-15v-31" fill="#E7AD7A" stroke="#10121C" strokeWidth="5"/>
      <path d="M100 31q42 0 56 35v43q-4 26-21 41l-35 20-35-20q-17-15-21-41V66q14-35 56-35z" fill="#E7AD7A" stroke="#10121C" strokeWidth="5"/>
      <path d="M62 65q12-25 38-28" fill="none" stroke="white" strokeWidth="5" opacity=".22"/>
    </g>
  )
}
```

Avatar renderer stacks them:
```jsx
// client/src/components/avatar/AvatarRenderer.jsx
function AvatarRenderer({ config, size = 128 }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <SkinLayer skin={config.skin} />
      <HairLayer hair={config.hair} />
      <EyesLayer eyes={config.eyes} />
      <MouthLayer mouth={config.mouth} />
      {config.accessories?.map(acc => (
        <AccessoryLayer key={acc} accessory={acc} />
      ))}
    </svg>
  )
}
```

---

## UI Theme

```
Background:  #0a0a1a (near black)
Surface:     #1a1a2e (dark purple)
Card:        #16213e (dark blue)
Accent 1:    #7c3aed (purple)
Accent 2:    #06b6d4 (cyan)
Accent 3:    #f59e0b (amber/gold for scores)
Danger:      #ef4444 (red)
Success:     #22c55e (green)
Text:        #e2e8f0 (light gray)
Muted:       #64748b (gray)
Fire effect: gradient from #f97316 → #ef4444 → #dc2626
```

---

## Build Order

### Phase 1: Foundation (Days 1-3)
1. Initialize monorepo (root package.json with workspaces)
2. Scaffold Vite + React client
3. Scaffold Express + Socket.io server
4. Set up TailwindCSS + dark theme
5. PostgreSQL database + Knex migrations
6. Environment variables (.env)

### Phase 2: Auth & Users (Days 3-4)
7. JWT auth middleware
8. Signup/login API routes
9. AuthContext (React)
10. Login/Signup pages with dark UI

### Phase 3: Avatar System (Days 4-6)
11. Convert all 59 SVGs to React components
12. Avatar registry config (cosmetics.js)
13. AvatarRenderer component
14. AvatarBuilder UI (select skin, hair, eyes, mouth, accessories)
15. Save avatar config to user profile

### Phase 4: Matchmaking & Battles (Days 6-9)
16. Socket.io connection + rooms
17. Matchmaking queue (in-memory, FIFO)
18. Battle room UI (both avatars, timer, input)
19. Roast input + send flow
20. Ollama integration + scoring
21. Score display with Framer Motion animations
22. Turn alternation logic
23. Best of 3/5 format
24. Battle result screen

### Phase 5: Leaderboard & Profiles (Days 9-10)
25. Leaderboard queries (global + country)
26. Leaderboard page (table with avatars, ranks)
27. Profile page (stats, battle history)
28. Cache leaderboard (refresh hourly via cron)

### Phase 6: Cosmetics Shop (Days 10-12)
29. Cosmetics catalog (seed data)
30. Shop UI (grid of items, filter by type)
31. Equip/unequip cosmetics
32. Free vs paid item distinction
33. Daily deals rotation

### Phase 7: Polish (Days 12-14)
34. Fire effects for high scores (Framer Motion)
35. Page transitions
36. Mobile responsive
37. Loading states + error handling
38. Socket reconnection logic

---

## Scripts

```json
// Root package.json
{
  "name": "ate",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "npm run dev --workspace=client",
    "dev:server": "npm run dev --workspace=server",
    "build": "npm run build --workspace=client",
    "db:migrate": "npm run migrate --workspace=server",
    "db:seed": "npm run seed --workspace=server"
  }
}
```

---

## Key Metrics
- DAU, battles/user/day, cosmetics conversion rate
- Day 7 & 30 retention, avg score distribution
- Battle completion rate, churn, revenue/user
