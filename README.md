# Solo Leveling 2

A gamified self-improvement web app inspired by Solo Leveling. It turns personal development into an RPG: track five core stats (Strength, Vitality, Agility, Intelligence, Perception), complete AI-generated daily quests, gain XP, unlock badges and titles, and watch your character sheet level up as you improve in real life.

Quests and progression are generated with Google's Gemini, tailored to your goals and history. The app maintains detailed logs, applies lightweight caching and optimized data-fetch patterns for sub‑second loads on multi-user, AI-driven quest flows, and uses a modular, reusable component architecture for growth.

> Note: This project is inspired by the Solo Leveling anime/manga but does not include any copyrighted assets. It focuses on personal development mechanics and game-like progression.

## Features

- RPG-style character sheet with 5 upgradable stats
- AI-generated daily quests and evolving questlines (Gemini 1.5 Flash)
- XP system, level-ups, badges, passives, and unlockable titles
- Setup assessment that assigns starting stats using AI analysis
- Progress logs, completed quests, and focus logs to guide growth
- Request-and-proof pattern for quests (instructions + proof fields)
- Daily quest caching to reduce API calls and speed up UX
- JWT-based auth with protected API routes
- Modern UI with Next.js App Router, Tailwind, and Radix UI

## Tech Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS + Radix UI primitives
- MongoDB + Mongoose
- JSON Web Tokens (JWT) for auth
- Google Gemini 1.5 Flash for quest generation

## Architecture Overview

- App Router API routes under `app/api/*` handle auth, profile, stats, setup, and quest lifecycle.
- JWTs are issued on register/login and stored client-side; requests use a small wrapper (`useAuthenticatedFetch`) that injects Bearer tokens and handles 401 redirects.
- Mongoose models persist users, setup responses, quest caches, badges, passives, titles, and logs.
- Gemini integration (`lib/gemini.ts`) builds a structured prompt from stats, profile, focus logs, and completed quests, then parses a JSON-only response for questlines, passives, metrics, report templates, and title unlocks.
- Performance: quest results are cached in `user.questCache` with a 24h freshness window; data fetching uses narrow selects and simple patterns for responsive UI.

### Data Model (key fields)

`User` (see `lib/models/User.ts`):

- email (unique), password (hashed)
- setupCompleted: boolean
- stats: { strength, vitality, agility, intelligence, perception }
- logs: stat change history
- completedQuests: { questTitle, questDescription, completedAt, rewards[] }
- focusLogs: { stat, questTitle, chosenAt }
- profile: free-form structured profile consumed by Gemini
- badges[], passives[], titles[]
- questCache: cached Gemini sections + updatedAt
- xp, level

`SetupResponse` (see `lib/models/SetupResponse.ts`):

- userId, responses for each stat (question + answer), timestamps

## API Overview

Auth

- POST `/api/auth/register` → { token }
- POST `/api/auth/login` → { token }
- GET `/api/auth/me` → { user }
- POST `/api/auth/logout` → { success }

Setup

- GET `/api/setup` → { questions }
- POST `/api/setup` → analyzes responses with AI, saves initial stats

Profile & Stats

- GET `/api/profile` → profile, badges, xp/level, passives, titles, setupCompleted
- POST `/api/profile` → update profile (clears quest cache to re-personalize)
- GET `/api/stats` → { stats, logs }
- PATCH `/api/stats` → update stats (internal use)

Quests

- GET `/api/quests` → generates or returns cached quests (24h cache)
- POST `/api/quests/complete` → submit completion; awards XP, badges, stat gains
- GET `/api/quests/completed` → list completed quests
- POST `/api/focus` → record which stat you chose to focus on
- POST `/api/quest-logs` → internal progress logging

Badges & Milestones

- GET `/api/badges` → user badges
- GET/POST `/api/milestones` → internal milestone tracking

Utilities (dev only)

- POST `/api/reset-setup` → reset setup state for testing

All non-auth endpoints require a Bearer token in the `Authorization` header.

## Getting Started

Prerequisites

- Node.js 18+ (recommended)
- MongoDB (Atlas or local)
- Google Gemini API key (Generative Language API)

1. Install dependencies

```bash
npm install
```

2. Create your environment file from the example

```bash
copy .env.example .env.local
```

3. Fill in `.env.local` with your keys (see Environment Variables below)

4. Run the dev server

```bash
npm run dev
```

App will be available at http://localhost:3000

## Environment Variables

Required (see `.env.example`):

- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing JWTs
- `GEMINI_API_KEY` — Google Generative Language API key

## Scripts

- `npm run dev` — start Next.js dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint

## How It Works

1. Sign up or log in to receive a JWT. The token is stored client-side.
2. Complete the setup assessment; Gemini analyzes your answers to set initial stats.
3. Fetch daily quests; results are personalized using your stats, profile, and history. Quests are cached for 24 hours per user.
4. Choose a quest (optionally record a focus stat), complete it, submit proof; the system awards XP, badges, and stat gains.
5. Track your growth on the profile and stats pages.

## Performance & Scalability

- Quest responses are cached per user (`questCache`) to reduce LLM calls and latency.
- API routes select only needed fields where appropriate.
- Email uses a unique index via Mongoose for quick lookups; consider adding additional compound indexes as data grows (e.g., on `completedQuests.completedAt`, `milestones.badge`, or `setupresponses.userId`).

## Security Notes

- Tokens are verified in API routes; 401s clear tokens client-side and redirect to `/login`.
- Store secrets only in environment variables; never commit `.env.local`.

## Deployment

- Works well on Vercel. Add the same environment variables in your deployment environment.
- Ensure your MongoDB is reachable from the hosting environment.

## Acknowledgements

- Inspired by Solo Leveling (D&C Media/Jang Sung-rak, Chugong). This project is a fan-inspired personal development tool and does not include copyrighted material.
- Powered by Google Gemini.
