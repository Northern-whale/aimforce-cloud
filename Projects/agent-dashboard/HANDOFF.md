# Agent Dashboard — Handoff Doc

**Last updated:** 2026-02-16
**Status:** Phase 1 MVP complete

## What This Is

A CRM-like web dashboard where business owners interact with their AI agent (TARS). Chat with Claude via streaming text, view call logs, reports, and analytics. Built as the front-end for an AI agency that helps businesses generate sales.

## How to Run

```bash
cd Projects/agent-dashboard/apps/web
pnpm install         # first time only
pnpm dev             # starts on localhost:3000
```

**Login:** `owner@tars.ai` / `tars2026`

## What Was Built

### Pages
- `/login` — credentials auth (NextAuth.js v5, JWT sessions)
- `/dashboard` — KPI cards (calls, conversations, avg duration, response time) + recent calls list
- `/chat` — streaming chat with Claude Sonnet 4.5, conversation sidebar, message persistence
- `/calls` — call log table with status indicators, sentiment, duration
- `/reports` — metric cards + sentiment breakdown visualization
- `/settings` — account info, sign out

### API Routes
- `POST /api/chat/stream` — SSE streaming Claude responses, saves to DB
- `GET/POST /api/chat/conversations` — list/create conversations
- `GET /api/chat?conversationId=X` — get messages
- `GET /api/reports` — dashboard metrics
- `GET /api/reports/calls` — paginated call logs
- `POST /api/webhooks/n8n` — receive events from n8n (validates `x-webhook-secret` header)

### Database (SQLite via Prisma)
- File: `apps/web/prisma/dev.db`
- Schema: `apps/web/prisma/schema.prisma`
- Tables: User, Conversation, Message, CallLog, Metric, Event
- Seeded with sample call logs and owner account

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 + Lucide icons (no component library)
- **Auth:** NextAuth.js v5 beta (credentials provider, JWT)
- **Database:** Prisma 6 + SQLite
- **AI:** `@anthropic-ai/sdk` (Claude Sonnet 4.5)
- **Monorepo:** pnpm workspaces + Turborepo
- **Shared types:** `packages/shared/` (TypeScript types for chat, reports, API responses)

## API Keys Location

All in `apps/web/.env` (gitignored):
- `DATABASE_URL` — SQLite path
- `NEXTAUTH_SECRET` — JWT signing
- `OWNER_EMAIL` / `OWNER_PASSWORD` — login credentials
- `ANTHROPIC_API_KEY` — Claude API key

Template at `.env.template` (root of agent-dashboard).

## Next Tasks

### Phase 2: Voice
1. Add `VoiceButton` component with Web Speech API (`use-voice` hook)
2. Add Whisper API fallback at `/api/voice/transcribe`
3. Add TTS output via `speechSynthesis`

### Phase 3: Mobile App
1. Scaffold Expo app at `apps/mobile/`
2. Tab navigation: Chat, Reports, Settings
3. Voice recording with `expo-av` + Whisper
4. Push notifications with `expo-notifications`

### Phase 4: Advanced
1. SSE endpoint at `/api/events/stream` for real-time push
2. Connect n8n webhook to sync call data from Vapi
3. Recharts time-series charts
4. CSV export

## Key Files

- `apps/web/src/app/api/chat/stream/route.ts` — core streaming chat endpoint
- `apps/web/src/hooks/use-chat.ts` — client-side chat state management
- `apps/web/src/lib/claude.ts` — Claude API wrapper with system prompt
- `apps/web/src/lib/auth.ts` — NextAuth configuration
- `apps/web/prisma/schema.prisma` — database schema
- `apps/web/prisma/seed.ts` — sample data seeder
- `packages/shared/src/types/` — shared TypeScript types
