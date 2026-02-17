# HANDOFF.md — Tars Workspace

**Last updated:** 2026-02-16 (session 2 — agent-dashboard MVP)
**Previous agent:** Claude Code (Opus 4.6) via VSCode extension

---

## 1. What Is This

Tars is an AI business assistant workspace. The main active project is an **AI voice agent for a cigar shop** — the first client for an AI agency business. The system answers phone calls via ElevenLabs, processes queries through n8n workflows with Anthropic Claude, logs calls to Google Sheets, and sends Telegram notifications to the business owner.

---

## 2. Project Structure

```
~/Desktop/Tars/
├── CLAUDE.md              # Instructions for Claude Code
├── HANDOFF.md             # This file
├── .env                   # Local env vars (gitignored)
├── .env.template          # Template for env vars
├── .gitignore
├── .claude/               # Claude Code config, n8n connection, permissions
│   ├── permissions.json   # MCP permission model (allow search/get, ask create, deny delete)
│   ├── n8n-config.json    # n8n API config (gitignored)
│   ├── n8n-connection-status.md
│   └── plans/             # Implementation plans
├── Projects/
│   ├── Cigar-Shop-AI-Agent/  # Active — voice agent for cigar shop
│   ├── n8n-mcp/              # Reference — TypeScript MCP server for n8n (v2.35.2)
│   ├── openclaw/             # Reference — personal AI assistant platform
│   ├── agent-dashboard/      # Early stage — Next.js dashboard for agents
│   └── polymarket-agents/    # Early stage — Python prediction market scanner
├── docs/                  # Setup guides, examples, analysis
└── README.md
```

---

## 3. Cigar Shop AI Agent — MAIN PROJECT

### What was built

A complete voice agent pipeline with 3 n8n workflows on `https://n8n.srv1378974.hstgr.cloud`:

| Workflow | ID | Status | Purpose |
|----------|-----|--------|---------|
| **Cigar Shop Voice Agent** | `pxTG3FeekTOoNsSs` | ACTIVE | Webhook receives ElevenLabs prompts, responds via Anthropic Claude with cigar shop knowledge |
| **Cigar Shop Call Logger** | `VazpWJo19Vo4nMGp` | ACTIVE | Logs calls to Google Sheets + sends Telegram notifications for leads/transfers |
| **Cigar Shop Daily Report** | `64l2UYX9K1vG0VCn` | INACTIVE | Scheduled 9PM daily — reads call logs, AI summarizes, sends Telegram report |

### Voice Agent details
- **Webhook:** `POST https://n8n.srv1378974.hstgr.cloud/webhook/elevenlabs-voice-agent`
- **Body:** `{"prompt": "...", "sessionId": "..."}`
- **LLM:** Anthropic Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- **Persona:** Viktor — Russian-speaking cigar expert
- **Knowledge base:** Full inventory with prices (Cohiba, Montecristo, Romeo y Julieta, Partagas, Davidoff, Arturo Fuente, Padron), store hours, delivery info, transfer triggers
- **Tested and working** — responds correctly in Russian with prices

### Call Logger details
- **Webhook:** `POST https://n8n.srv1378974.hstgr.cloud/webhook/call-logger`
- **Telegram:** Sends to chat ID `5273526040` via `@Aim4000_bot`
- **Google Sheets:** Configured but OAuth NOT authorized (see "In Progress" below)
- **Error handling:** `onError: continueRegularOutput` on Google Sheets node so Telegram still works even without Sheets
- **Tested and working** — Telegram notifications confirmed received

### ElevenLabs Agent
- **Agent ID:** `agent_2501kh7k6xt8e5rv1tqqsxje2c9c`
- **Agent name:** "Receptionist for Edwards" (Edwards Pipe & Tobacco, Englewood CO)
- **LLM:** gemini-2.5-flash (ElevenLabs-side)
- **Phone:** `+18337733584` (Twilio)
- **Custom tool:** `tool_0601khm2960ze9y9htjwr0zky4hz` — webhook POST to n8n Voice Agent workflow
- **Tool created via:** `POST https://api.elevenlabs.io/v1/convai/tools` then added to agent via `PATCH /v1/convai/agents/{id}` with `tool_ids` array

### Key files
- `Projects/Cigar-Shop-AI-Agent/knowledge-base.json` — cigar inventory, prices, FAQ, transfer triggers
- `Projects/Cigar-Shop-AI-Agent/AI-AGENT-PROMPTS.md` — system prompts, function defs, voice settings, test scenarios
- `Projects/Cigar-Shop-AI-Agent/README.md` — project overview and architecture
- `Projects/Cigar-Shop-AI-Agent/workflow-demo-elevenlabs.json` — ElevenLabs TTS demo workflow

---

## 4. What's In Progress

### Google Sheets OAuth2 (BLOCKED — needs browser)
The Google Sheets credential exists in n8n (`aMGRYUFEwtx3AHFM`) with client ID/secret, but the OAuth2 token exchange was never completed. The user needs to:

1. **Add redirect URI** in Google Cloud Console → APIs & Services → Credentials → OAuth Client:
   ```
   https://n8n.srv1378974.hstgr.cloud/rest/oauth2-credential/callback
   ```
2. **Enable Google Sheets API** in Google Cloud Console if not already
3. **Open n8n UI** → Credentials → "Google Sheets" → Click "Sign in with Google"
4. **Spreadsheet already created:** `https://docs.google.com/spreadsheets/d/1VHWjVqSQRe3VOY9EMSUn3dlb4iH3liawILatwI9HNkc/edit`
   - Needs sheet tab renamed to "Call Logs"
   - Needs headers: timestamp, session_id, topic, resolved, transferred, transfer_reason, lead_captured, lead_name, lead_contact, lead_interest, summary, business_id
   - URL already set in both workflow nodes

### Daily Report workflow (NOT ACTIVATED)
- Workflow `64l2UYX9K1vG0VCn` is built but inactive
- Depends on Google Sheets working (reads call logs)
- Activate after Google Sheets OAuth is complete

---

## 5. API Keys & Config Locations

### Agent Dashboard secrets
`Projects/agent-dashboard/apps/web/.env` — contains:
- `DATABASE_URL` — SQLite path (`file:./prisma/dev.db`)
- `NEXTAUTH_SECRET` — JWT signing secret
- `OWNER_EMAIL` / `OWNER_PASSWORD` — Dashboard login credentials
- `ANTHROPIC_API_KEY` — Claude API key for chat

### Primary secrets file
`~/.openclaw/.env` — contains:
- `ANTHROPIC_API_KEY` — Anthropic API key (`sk-ant-oat01-...`)
- `TELEGRAM_BOT_TOKEN` — Original bot `8213558124:...`
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret

### Other secrets (NOT in files, used via n8n or direct API)
- **n8n API key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...HatrpuIcrM7G4ojK9i8pdfIZvZJUOFmWsFFB8ALxuDA` (header: `X-N8N-API-KEY`)
- **n8n MCP token:** JWT in `N8N_MCP_TOKEN` (for MCP server at `/mcp-server/http`)
- **ElevenLabs API key:** `sk_379a53efc52bf060f900bc6b222a52c2ae506e0a7579d92a`
- **Tars Telegram Bot token:** `8402224558:AAHm8of8e4qj12WCUIH5qt3FVR-3Q6DFtA8` (`@Aim4000_bot`)
- **Perplexity API key:** stored in `~/.openclaw/.env` (was there, may have been removed in recent edit)

### n8n Credentials (created via REST API)
| Name | ID | Type | Status |
|------|-----|------|--------|
| Anthropic account | `Obw7plw4OoAF2WaN` | anthropicApi | Working (on Voice Agent) |
| Anthropic account 2 | `d6TiGFroExDDWaGA` | anthropicApi | Working (on Daily Report) |
| Tars Telegram Bot | `eQ5hAMH6UUVYrVf7` | telegramApi | Working (token: `8402224558:...`) |
| Google Sheets | `aMGRYUFEwtx3AHFM` | googleSheetsOAuth2Api | NOT AUTHORIZED (needs browser OAuth) |

### n8n Instance
- **URL:** `https://n8n.srv1378974.hstgr.cloud`
- **MCP endpoint:** `https://n8n.srv1378974.hstgr.cloud/mcp-server/http` (Bearer token auth)
- **REST API:** Standard REST with `X-N8N-API-KEY` header
- **Owner:** Oybek Abdualiev (`ibk4business@gmail.com`)

### OpenClaw config
- `~/.openclaw/openclaw.json` — Nova agent config, Telegram channel, gateway settings
- Nova agent uses Anthropic Claude Sonnet 4.5

---

## 6. Next Tasks (Planned)

### Immediate
1. Complete Google Sheets OAuth2 authorization (browser required)
2. Add headers to spreadsheet "Call Logs" tab
3. Activate Daily Report workflow (`64l2UYX9K1vG0VCn`)
4. End-to-end test: call phone number → AI responds → logged to Sheets → Telegram notification

### Phase 2 — Agent Dashboard (MVP COMPLETE)
The owner web dashboard is now fully built at `Projects/agent-dashboard/`:
- **Dashboard:** KPI cards (calls, conversations, avg duration, response time) + recent calls
- **Chat:** Full streaming chat with Claude Sonnet 4.5, conversation persistence, sidebar
- **Call Logs:** Status-coded table with sentiment, duration, phone numbers
- **Reports:** Metric cards + sentiment breakdown bars
- **Auth:** NextAuth.js v5 credentials (login: `owner@tars.ai` / `tars2026`)
- **API:** Streaming chat, conversations CRUD, reports, n8n webhook receiver
- **DB:** SQLite via Prisma with 7 tables, seeded with sample data
- **Stack:** Next.js 16 + Tailwind v4 + Prisma 6 + Claude API + pnpm/Turborepo

**To run:** `cd Projects/agent-dashboard/apps/web && pnpm dev` → `localhost:3000`

**Next steps for dashboard:**
1. Voice input (Web Speech API mic button + Whisper fallback)
2. Voice output (TTS for AI responses)
3. Mobile app (Expo React Native)
4. Real-time SSE notifications from n8n
5. Recharts time-series charts + CSV export

### Phase 3 (planned, not started)
- Multi-business templating (clone workflows per client, shared infra)
- Onboarding flow for new business clients

### Phase 4 (planned, not started)
- Nova as meta-agent monitoring all business agents

---

## 7. Test Commands

### Voice Agent (working)
```bash
curl -X POST https://n8n.srv1378974.hstgr.cloud/webhook/elevenlabs-voice-agent \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Какие кубинские сигары есть?","sessionId":"test-1"}'
```

### Call Logger (working — Telegram only, Sheets needs OAuth)
```bash
curl -X POST https://n8n.srv1378974.hstgr.cloud/webhook/call-logger \
  -H "Content-Type: application/json" \
  -d '{"topic":"pricing","resolved":true,"transferred":false,"lead_captured":true,"lead_name":"Test","lead_contact":"+70001112233","lead_interest":"Cohiba","summary":"Test call","session_id":"test-1","business_id":"cigar-shop-1"}'
```

### Telegram Bot check
```bash
curl https://api.telegram.org/bot8402224558:AAHm8of8e4qj12WCUIH5qt3FVR-3Q6DFtA8/getMe
```

---

## 8. Known Issues / Gotchas

1. **n8n Set node v3.4** uses `assignments.assignments[]` format, NOT `fields.values[]`. The old format silently fails.
2. **n8n webhook registration** requires a `webhookId` field on webhook nodes — without it, webhooks don't register even if the workflow shows `active: true`.
3. **n8n `WorkflowHasIssuesError`** blocks execution before any node runs. Empty required fields (like Google Sheets URL) trigger this. Use `onError: continueRegularOutput` on problematic nodes AND fill in placeholder values.
4. **ElevenLabs custom tools** must be created via dedicated `POST /v1/convai/tools` endpoint with `tool_config` wrapper, then added to agent via `tool_ids` array. Inline tool definitions in PATCH are silently dropped.
5. **n8n credential creation** via REST API is picky: anthropicApi needs `header: false`, googleSheetsOAuth2Api needs `serverUrl`, `sendAdditionalBodyProperties`, `additionalBodyProperties` fields.
6. **n8n MCP vs REST API** — MCP uses Bearer JWT token, REST API uses `X-N8N-API-KEY` header. They're different auth mechanisms.
