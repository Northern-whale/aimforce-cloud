# TARS — Shared Context (Claude Code + Nova)

**Purpose:** This file is the shared brain between Claude Code (VSCode coding agent) and Nova (OpenClaw agent on Telegram). Both agents read and update this file to stay in sync.

**Updated:** 2026-02-19

---

## How We Work Together

### Claude Code (VSCode)
- **Role:** Deep coding — reviews, debugging, writing code, running tests, research
- **Location:** Runs in VSCode on `~/Desktop/Tars/`
- **Memory:** `~/.claude/projects/-Users-oybekabdualiev-Desktop-Tars/memory/MEMORY.md`
- **Strengths:** File editing, code analysis, test running, git operations

### Nova (OpenClaw via Telegram)
- **Role:** Project manager — coordination, planning, status tracking, proactive monitoring
- **Location:** `~/.openclaw/workspace/`
- **Memory:** `~/.openclaw/workspace/memory/` + `MEMORY.md`
- **Strengths:** 24/7 availability, Telegram communication, task orchestration

### How Nova calls Claude Code
```bash
# One-shot coding task
bash pty:true workdir:~/Desktop/Tars/Projects/<project> command:"claude 'Your task'"

# Background task with completion notification
bash pty:true workdir:~/Desktop/Tars/Projects/<project> background:true command:"claude 'Your task. When done, run: openclaw system event --text \"Done: summary\" --mode now'"
```

### How Claude Code leaves notes for Nova
Update this HANDOFF.md file with:
- What was done (completed work)
- What's blocked (issues found)
- What's next (recommended actions)

Nova reads this file at session start and during heartbeats.

---

## URGENT: Server Consolidation Migration (IN PROGRESS)

**Context:** Oybek is consolidating all infrastructure onto ONE server to replace scattered services (old Hostinger VPS, Railway, Vercel). This is the top priority task.

### What was decided
- **Server:** New Hostinger VPS KVM 4 (4 vCPU, 16GB RAM, 200GB NVMe)
- **IP:** `77.37.67.2`
- **Management:** Coolify (self-hosted PaaS, pre-installed via Hostinger template)
- **Domain:** `aimforce.cloud`
- **Goal:** One server + Coolify replaces Vercel + Railway + old Hostinger VPS

### What's been completed
1. New VPS created and running at `77.37.67.2`
2. Coolify installed and accessible
3. DNS A records created:
   - `coolify.aimforce.cloud` → `77.37.67.2`
   - `n8n.aimforce.cloud` → `77.37.67.2`
   - `app.aimforce.cloud` → `77.37.67.2`
4. Coolify instance domain set to `https://coolify.aimforce.cloud`
5. PostgreSQL deployed on Coolify (replaces Railway) — **RUNNING**
   - Database name: `aimforce`
   - User: `aimforce`
   - Internal hostname: `main-db`
   - Port: 5432
6. n8n service deployed on Coolify — **DEPLOYED BUT NOT LOADING**

### ✅ n8n FULLY OPERATIONAL (2026-02-19 22:30 UTC)
- **Status:** ✅ WORKING & HEALTHY WITH HTTPS
- **URL:** https://n8n.aimforce.cloud
- **Certificate:** Let's Encrypt SSL (valid until May 20, 2026)
- **Database:** Connected to PostgreSQL (user: aimforce, db: n8n)
- **Issues Resolved:**
  1. Network alias "main-db" configured correctly
  2. PostgreSQL user created with proper permissions
  3. Container starts without errors
  4. ✅ Custom domain configured (n8n.aimforce.cloud)
  5. ✅ HTTPS with Let's Encrypt certificate
  6. ✅ HTTP → HTTPS redirect working
  7. ✅ Traefik routing properly configured
- **Fix Applied:** Updated docker-compose.yml with proper Traefik labels for HTTPS router and Let's Encrypt certificate resolver
- **Verified:** Service accessible at https://n8n.aimforce.cloud (HTTP/2 200 OK)

### Nova's tasks (in order of priority)

#### ✅ Task 1: Fix n8n deployment — COMPLETE
**Completed:** 2026-02-19 22:30 UTC
- Diagnosed issue: Traefik labels pointing to sslip.io instead of custom domain
- Fixed: Updated docker-compose.yml with proper n8n.aimforce.cloud hostname
- Added HTTPS support: Configured Let's Encrypt certificate resolver
- Result: https://n8n.aimforce.cloud fully operational with valid SSL

#### Task 2: Migrate workflows from old VPS (READY)
**Status:** ✅ Guide created, ready for manual execution
- **Documentation:** `~/Desktop/Tars/Projects/aimforce/N8N-MIGRATION-GUIDE.md`
- Old n8n instance: `https://n8n.srv1378974.hstgr.cloud`
- New n8n instance: `https://n8n.aimforce.cloud` ✅ Ready
- **Blocker:** Need old VPS SSH access or n8n login credentials
- **Next:** Access old n8n, export workflows, import to new instance

#### Task 3: Deploy AimForce Next.js app (READY TO DEPLOY)
**Status:** ✅ Docker support added, ready to deploy
- **Code:** `~/Desktop/Tars/Projects/aimforce/`
- **GitHub:** https://github.com/Northern-whale/aimforce-cloud (latest push: Docker support)
- **Documentation:** `COOLIFY-DEPLOY-GUIDE.md` (complete deployment instructions)
- **Dockerfile:** ✅ Created and tested structure
- **Environment vars:** ✅ Prepared at `/tmp/aimforce-production.env`
- **Database URL:** `postgresql://aimforce:GrDKRpDRQSvYjOhWOb5rQEHah038Tvpm0isbtdKpz95G7ECcfbMaL6bSODgmvfz6@main-db:5432/aimforce`
- **Next:** Deploy via Coolify dashboard at https://coolify.aimforce.cloud

#### Task 4: Update infrastructure references
Once everything is migrated, update:
- This HANDOFF.md with new URLs
- Webhook URLs in ElevenLabs agent config
- Any hardcoded references to old n8n URL (`n8n.srv1378974.hstgr.cloud`)

### Services to cancel after migration
- Old Hostinger VPS (srv1378974) — where old n8n runs
- Railway PostgreSQL subscription
- Vercel paid plan (if any)

### New infrastructure map (DEPLOYED ✅)
| Service | URL | Status |
|---------|-----|--------|
| Coolify dashboard | https://coolify.aimforce.cloud | ✅ RUNNING |
| PostgreSQL | internal (main-db:5432) | ✅ RUNNING (18 tables) |
| n8n | https://n8n.aimforce.cloud | ✅ OPERATIONAL (HTTPS + SSL) |
| AimForce app | https://app.aimforce.cloud | ✅ LIVE (needs user seed) |

---

## Active Projects

### 1. Polymarket Trading Bot Evaluation (ACTIVE)
- **Location:** `~/Desktop/Tars/Projects/polymarket-bots-eval/`
- **Status:** 3 bots audited, security-checked, ready for deep code review
- **Briefing:** `DEVELOPER-BRIEFING.md` (full audit + recommendations)
- **Recommended bot:** `polymarket-trading-bot/` (98/98 tests, cleanest code, flash crash strategy)
- **Next:** Claude Code to deep-review strategy code, evaluate viability

### 2. Polymarket Agents (Phase 1 Complete)
- **Location:** `~/Desktop/Tars/Projects/polymarket-agents/`
- **Status:** Phase 1 done — Nova orchestrator, Scanner, Researcher, 25 tests passing
- **Next phases:** Strategy Engineer, Backtesting, Paper Trading, Live Execution

### 3. Cigar Shop AI Agent (Operational)
- **Location:** `~/Desktop/Tars/Projects/Cigar-Shop-AI-Agent/`
- **Status:** Built and running
- **Stack:** n8n workflows + ElevenLabs voice + Twilio phone

### 4. AimForce (In Progress)
- **Location:** `~/Desktop/Tars/Projects/aimforce/`
- **Status:** Deployment steps documented, needs review

### 5. Agent Dashboard
- **Location:** `~/Desktop/Tars/Projects/agent-dashboard/`
- **Status:** Existing, needs documentation

---

## Recent Activity Log

### 2026-02-19 (MAJOR PROGRESS)
**Morning:** Server consolidation started
- New Hostinger VPS (77.37.67.2) + Coolify
- DNS configured for aimforce.cloud (coolify, n8n, app subdomains)
- PostgreSQL deployed on Coolify — running
- n8n deployed on Coolify — container starts but doesn't respond (needs debugging)

**22:30 UTC - n8n FIXED by Nova:**
  - Diagnosed: Traefik routing to wrong domain (sslip.io instead of aimforce.cloud)
  - Fixed: Updated docker-compose.yml with proper hostname and HTTPS configuration
  - Added: Let's Encrypt SSL certificate with automatic HTTP→HTTPS redirect
  - Verified: https://n8n.aimforce.cloud fully operational (HTTP/2 200 OK)
  - **Result:** n8n ready for workflow migration ✅

**22:50 UTC - AimForce Deployment Prep by Nova:**
  - Created production Dockerfile for Next.js app
  - Added .dockerignore for optimized builds
  - Updated next.config.js with standalone output
  - Pushed to GitHub: Northern-whale/aimforce-cloud
  - Created comprehensive deployment guide (COOLIFY-DEPLOY-GUIDE.md)
  - Prepared production environment variables
  - **Result:** App ready to deploy via Coolify ✅

**23:00 UTC - Complete Migration Documentation:**
  - Created N8N-MIGRATION-GUIDE.md (workflow migration steps)
  - Created INFRASTRUCTURE-CLEANUP.md (full decommissioning plan)
  - Updated HANDOFF.md with all progress
  - Documented rollback procedures
  - **Result:** Complete migration playbook ready ✅

**Summary:**
- ✅ Phase 1 Complete: Infrastructure setup and n8n operational
- ✅ Phase 2 Prep Complete: App Dockerized and ready to deploy
- ⏳ Phase 2 Execution: Needs Coolify UI deployment (manual)
- ⏳ Phase 3 Pending: n8n workflow migration (needs old VPS access)

### 2026-02-18
- Set up Claude Code <-> Nova integration
- Updated Nova's TOOLS.md, PROJECTS.md with current state
- Created this shared HANDOFF.md
- Polymarket bots evaluation briefing completed (DEVELOPER-BRIEFING.md)

### 2026-02-16
- Nova bootstrapped on OpenClaw
- Identity: AI Agent Manager
- Polymarket Agents Phase 1 completed (25 tests passing)

---

## Infrastructure Quick Reference

| Service | URL/ID |
|---------|--------|
| **NEW VPS** | 77.37.67.2 (Hostinger KVM 4, Coolify) |
| Coolify | https://coolify.aimforce.cloud |
| n8n (NEW - fixing) | https://n8n.aimforce.cloud |
| n8n (OLD - to retire) | https://n8n.srv1378974.hstgr.cloud |
| Telegram bot | @Aim4000_bot (chat ID: 5273526040) |
| ElevenLabs agent | agent_2501kh7k6xt8e5rv1tqqsxje2c9c |
| Phone | +18337733584 (Twilio) |
| OpenClaw config | ~/.openclaw/openclaw.json |
| Claude Code memory | ~/.claude/projects/-Users-oybekabdualiev-Desktop-Tars/memory/ |
| Nova workspace | ~/.openclaw/workspace/ |

---

## Rules for Both Agents

1. **Update this file** when completing significant work
2. **Read this file** at the start of every session
3. **Don't duplicate work** — check what the other agent already did
4. **Nova delegates coding** to Claude Code via the `coding-agent` skill
5. **Claude Code leaves status notes** here for Nova to pick up
6. **Never commit secrets** — .env files are gitignored

---

## 🎉 DEPLOYMENT STATUS (2026-02-19 23:15 UTC)

### ✅ PHASE 2 COMPLETE - APP IS LIVE!

**What's working RIGHT NOW:**
- ✅ https://app.aimforce.cloud - **LIVE** (login page loading)
- ✅ https://n8n.aimforce.cloud - **OPERATIONAL** (HTTPS + SSL)
- ✅ https://coolify.aimforce.cloud - **RUNNING** (admin panel)
- ✅ PostgreSQL database - **18 tables created and migrated**
- ✅ Let's Encrypt SSL - **All domains have valid certificates**
- ✅ Docker containers - **All healthy**

**Time to completion:** ~3 hours (from "fix everything" to live production app)

**Remaining manual steps:**
1. Seed user accounts (5 min) - Use SQL or Prisma Studio
2. Import n8n workflows (30-60 min) - Needs old VPS access
3. Update ElevenLabs webhooks (5 min) - After n8n migration

**See:** `~/.openclaw/workspace/DEPLOYMENT-COMPLETE.md` for full details and next steps.

---
