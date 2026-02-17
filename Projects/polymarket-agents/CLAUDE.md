# CLAUDE.md — Polymarket Agents

## Overview

Multi-agent system ("Polymarket Opportunities Desk") that scans Polymarket markets, gathers research, and produces ranked opportunity watchlists. Phase 1 covers: Nova orchestrator, Market Scanner, Research Agent, and the Polymarket data layer.

## Architecture

```
polymarket_agents/
├── config.py          # YAML + POLY_* env var config loader
├── core/
│   ├── base_agent.py  # Abstract base: run_cycle(), on_message(), send()
│   ├── message_bus.py # In-process async pub/sub
│   ├── models.py      # Pydantic v2 models (Market, Opportunity, SourceDossier, AgentMessage)
│   └── logger.py      # AuditLogger (JSONL) + setup_logging()
├── data/
│   ├── gamma_client.py    # Market discovery (Gamma REST API)
│   ├── clob_client.py     # Order books (CLOB API / py-clob-client)
│   ├── subgraph_client.py # Historical data (GraphQL)
│   ├── websocket_feed.py  # Real-time updates (polling stub in Phase 1)
│   └── mock/              # Mock implementations for offline development
├── agents/
│   ├── nova.py        # Orchestrator: daily cycle, report compilation
│   ├── scanner.py     # Market Intelligence: heuristic scoring, watchlists
│   └── researcher.py  # Research: curated source lookups, dossiers
└── utils/
    └── formatting.py  # Report formatting helpers
```

## Commands

```bash
# Install (editable, with dev deps)
pip install -e ".[dev]"

# Run one cycle (mock mode by default)
python -m polymarket_agents --once

# Run continuously
python -m polymarket_agents

# Run tests
pytest tests/ -v

# Lint
ruff check polymarket_agents/
```

## Configuration

- `config/default.yaml` — default values
- Env vars with `POLY_` prefix override YAML (e.g., `POLY_MOCK_MODE=false`)
- `mock_mode=true` by default — runs without API credentials

## Agent Communication

Agents communicate via an in-process async message bus. Message types:
- `scan_request`: Nova → Scanner (trigger a scan cycle)
- `watchlist`: Scanner → Nova (ranked opportunities)
- `research_request`: Nova → Researcher (research a market)
- `dossier`: Researcher → Nova (source dossier for a market)

## Operating Rules

- No guaranteed returns — system reports what testing shows
- Evidence over hype — every strategy includes data sources and failure modes
- Least-privilege keys — only the (future) execution bot touches trading creds
- Kill switch — trading halts on threshold breach
- Audit trail — every decision logged to `logs/audit.jsonl`

## Development Notes

- Python 3.11+, async throughout (asyncio)
- Pydantic v2 for all data models
- httpx for async HTTP
- No LLM calls in Phase 1 — heuristic scoring only
- When adding new agents, inherit from `BaseAgent` and implement `run_cycle()` + `on_message()`
