# TARS — AI Business Assistant Workspace — Handoff Doc

## Overview

**TARS** is a monorepo workspace for building AI-powered business automations and managing processes. Integrates with n8n (workflow automation) and contains multiple sub-projects.

**Location:** `/Users/oybekabdualiev/Desktop/Tars`

**Primary Language:** Russian for user-facing docs; English for code and technical docs.

---

## Sub-Projects Summary

### 1. **n8n-mcp** (`Projects/n8n-mcp/`)
**What:** TypeScript MCP (Model Context Protocol) server providing AI assistants access to n8n node information.
**Status:** Existing codebase (not modified in this session).
**Has CLAUDE.md:** Yes (detailed architecture, commands, guidelines).

### 2. **Cigar-Shop-AI-Agent** (`Projects/Cigar-Shop-AI-Agent/`)
**What:** AI-powered customer service agent for a cigar shop built with n8n workflows + ElevenLabs voice.
**Status:** Existing codebase (not modified in this session).

### 3. **openclaw** (`Projects/openclaw/`)
**What:** Unknown (existing project, not documented in this session).
**Status:** Existing codebase (not modified in this session).

### 4. **agent-dashboard** (`Projects/agent-dashboard/`)
**What:** Unknown (existing project, not documented in this session).
**Status:** Existing codebase (not modified in this session).

### 5. **polymarket-agents** (`Projects/polymarket-agents/`) ✨ **NEW**
**What:** Multi-agent system for scanning Polymarket prediction markets, gathering research, producing ranked opportunity watchlists.
**Status:** **Phase 1 complete** — Nova orchestrator, Scanner, Researcher, data layer with mocks. 25 tests passing. Full end-to-end cycle working.
**Has CLAUDE.md:** Yes.
**Has HANDOFF.md:** Yes (detailed handoff in `Projects/polymarket-agents/HANDOFF.md`).
**Language:** Python 3.11+ (using 3.12 venv).

---

## What Was Built/Changed (This Session)

### Built from Scratch: Polymarket Opportunities Desk (Phase 1)

**Created:** `Projects/polymarket-agents/` — Complete multi-agent trading research system.

**Architecture:**
- **Core framework:** Config loader, Pydantic models, abstract base agent, async message bus, audit logger
- **Data layer:** Gamma API client, CLOB client, Subgraph client, WebSocket stub (polling), realistic mock data (6 sample markets)
- **Agents:** Nova (orchestrator), Scanner (heuristic scoring), Researcher (curated sources)
- **Tests:** 25 passing tests covering config, models, data clients, full agent integration
- **Entry point:** CLI with `--once` and continuous modes

**How to run:**
```bash
cd Projects/polymarket-agents
source .venv/bin/activate
python -m polymarket_agents --once    # one cycle
pytest tests/ -v                      # 25 tests
```

**See:** `Projects/polymarket-agents/HANDOFF.md` for full details.

### Modified: Root `.gitignore`

**Added Python-specific patterns:**
```
# Python
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/
.venv/
venv/
*.egg
.pytest_cache/
.ruff_cache/
logs/
```

---

## What's In Progress

**Nothing in progress** — Polymarket Phase 1 is complete and working.

**Next phases (not started):**
- Phase 2: Strategy Engineer, Backtest Agent, real WebSocket feed
- Phase 3: Paper Trading, Risk Manager, Security Agent
- Phase 4: Execution Bot (live trading)

---

## API Keys / Config Locations

### n8n Integration (Existing)
- **Config:** `.claude/n8n-config.json` (gitignored)
- **API credentials:** `.env` (gitignored)
- **Template:** `.env.template`
- **Connection status:** `.claude/n8n-connection-status.md`

### Polymarket Agents (New)
- **No real API keys needed yet** — runs in mock mode
- **When adding credentials:**
  - Copy `Projects/polymarket-agents/.env.template` to `Projects/polymarket-agents/.env`
  - Fill in `POLY_CLOB_PRIVATE_KEY`, `POLY_SUBGRAPH_URL`
  - Set `POLY_MOCK_MODE=false`
- **Config:** `Projects/polymarket-agents/config/default.yaml` (non-secret defaults)
- **Venv:** `Projects/polymarket-agents/.venv/` (Python 3.12)

### Other Projects
- **openclaw:** Config may be in `~/.openclaw/.env` (user opened `~/.openclaw/openclaw.json` in IDE, suggesting external config)
- **Cigar-Shop-AI-Agent:** Unknown (check project for `.env` or config files)
- **agent-dashboard:** Unknown (check project for config)

---

## Repository Structure

```
Tars/
├── .claude/                # Claude Code config, n8n connection, permissions
├── .env                    # Environment variables (gitignored)
├── .env.template           # Template for env vars
├── .gitignore              # Git ignore rules (updated with Python patterns)
├── CLAUDE.md               # Repository-wide guidance for Claude
├── HANDOFF.md              # This file
├── README.md               # Repository overview
├── Projects/               # Sub-projects
│   ├── n8n-mcp/            # TypeScript MCP server for n8n (has CLAUDE.md)
│   ├── Cigar-Shop-AI-Agent/
│   ├── openclaw/
│   ├── agent-dashboard/
│   └── polymarket-agents/  # NEW: Python multi-agent system (has CLAUDE.md + HANDOFF.md)
├── docs/                   # Documentation
├── templates/              # Workflow templates
├── prompts/                # AI prompts
└── archive/                # Archived materials
```

---

## Git Status

**Branch:** `main` (no commits yet — this is a fresh repository)

**Untracked files:**
- `.claude/`, `.env.template`, `.gitignore`, `CLAUDE.md`, `Projects/`, `README.md`, `docs/`

**Ready to commit:**
- All files staged for initial commit below

---

## Next Steps (Recommended)

1. **Review handoff docs:**
   - Read `Projects/polymarket-agents/HANDOFF.md` (comprehensive)
   - Read `Projects/polymarket-agents/CLAUDE.md` (development guide)

2. **Test the system:**
   ```bash
   cd Projects/polymarket-agents
   source .venv/bin/activate
   python -m polymarket_agents --once
   pytest tests/ -v
   ```

3. **Continue development:**
   - See implementation plan: `~/.claude/plans/sleepy-wiggling-taco.md`
   - Phase 2 adds Strategy Engineer, Backtest Agent, real WebSocket feed

4. **Document other projects:**
   - Create HANDOFF.md files for `n8n-mcp`, `Cigar-Shop-AI-Agent`, `openclaw`, `agent-dashboard`
   - Identify API key locations for each

5. **Initial git commit:**
   - Commit all current work to establish baseline
   - See commands below

---

## Quick Reference

### Project Paths
- **Tars monorepo:** `/Users/oybekabdualiev/Desktop/Tars`
- **n8n MCP server:** `Projects/n8n-mcp/`
- **Polymarket agents:** `Projects/polymarket-agents/`
- **Claude memory:** `~/.claude/projects/-Users-oybekabdualiev-Desktop-Tars/memory/`
- **Implementation plans:** `~/.claude/plans/`

### Key Files
- **Root guidance:** `CLAUDE.md` (repository-wide rules)
- **Root handoff:** `HANDOFF.md` (this file)
- **Polymarket handoff:** `Projects/polymarket-agents/HANDOFF.md`
- **Polymarket guidance:** `Projects/polymarket-agents/CLAUDE.md`
- **Git ignore:** `.gitignore` (includes Python patterns now)

### Python Environment (Polymarket)
- **Python version:** 3.12.12 (installed via Homebrew)
- **Venv location:** `Projects/polymarket-agents/.venv/`
- **Activate:** `source Projects/polymarket-agents/.venv/bin/activate`

---

## Commit Commands

```bash
# Stage all files
git add .

# Commit with message
git commit -m "$(cat <<'EOF'
Initial commit: TARS workspace with Polymarket Agents Phase 1

- Add repository structure (n8n-mcp, Cigar-Shop-AI-Agent, openclaw, agent-dashboard)
- Add Polymarket Opportunities Desk multi-agent system (Phase 1 complete)
  - Core framework: config, models, base agent, message bus, audit logger
  - Data layer: Gamma, CLOB, Subgraph clients with mock implementations
  - Agents: Nova orchestrator, Scanner (heuristic scoring), Researcher (curated sources)
  - Tests: 25 passing tests covering full system
  - Entry point: CLI with --once and continuous modes
- Add CLAUDE.md (repository-wide guidance)
- Add HANDOFF.md (repository + polymarket handoff docs)
- Update .gitignore with Python patterns

Phase 1 verified working:
- python -m polymarket_agents --once (full cycle in mock mode)
- pytest tests/ -v (25/25 tests pass)
- Audit log written to logs/audit.jsonl

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"

# If you want to push to remote (create repo first on GitHub/GitLab):
# git remote add origin <your-repo-url>
# git push -u origin main
```

---

## For the Next System/Person

**What you need to know:**

1. **Polymarket Agents is ready to use** — Phase 1 complete, 25 tests passing, runs in mock mode
2. **No API credentials needed yet** — everything works with mock data
3. **All decisions are logged** — check `Projects/polymarket-agents/logs/audit.jsonl`
4. **Read the handoffs first** — `Projects/polymarket-agents/HANDOFF.md` has all the details
5. **CLAUDE.md files guide development** — architecture, patterns, troubleshooting

**Quick start:**
```bash
cd /Users/oybekabdualiev/Desktop/Tars/Projects/polymarket-agents
source .venv/bin/activate
python -m polymarket_agents --once
```

**Questions to answer:**
- What are `openclaw` and `agent-dashboard`? (Document them)
- Where are API keys for existing projects? (Create inventory)
- What's the n8n instance URL? (Check `.env` or `.claude/n8n-config.json`)

---

**Last updated:** 2026-02-16
**Created by:** Claude Sonnet 4.5 (Tars session)
