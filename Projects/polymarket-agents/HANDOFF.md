# Polymarket Opportunities Desk — Handoff Doc

## What Was Built (Phase 1 — Complete)

**A multi-agent system for scanning Polymarket markets, gathering research, and producing ranked opportunity watchlists.**

### Architecture

**Core Framework:**
- `polymarket_agents/config.py` — YAML + `POLY_*` env var config loader with automatic type coercion
- `polymarket_agents/core/models.py` — Pydantic v2 models: Market, OrderBookSnapshot, Opportunity, SourceDossier, AgentMessage
- `polymarket_agents/core/base_agent.py` — Abstract base class all agents inherit from (`run_cycle()`, `on_message()`, `send()`)
- `polymarket_agents/core/message_bus.py` — In-process async pub/sub with message history for audit trail
- `polymarket_agents/core/logger.py` — AuditLogger (JSONL append-only) + structured console logging

**Data Layer (Mock-First Design):**
- `polymarket_agents/data/gamma_client.py` — Gamma API client for market discovery/metadata
- `polymarket_agents/data/clob_client.py` — CLOB API client for order books and prices
- `polymarket_agents/data/subgraph_client.py` — GraphQL client for historical/aggregate data
- `polymarket_agents/data/websocket_feed.py` — WebSocket stub (currently polls REST endpoints; real WS in Phase 2)
- `polymarket_agents/data/mock/` — 6 realistic sample markets with order books (bitcoin, fed rates, spacex, eth, gdp, ai regulation)

**Agents:**
- `polymarket_agents/agents/scanner.py` — **Market Intelligence Agent**: Heuristic scoring based on volume, liquidity, spread, time-to-expiry, tag relevance. Outputs ranked watchlist.
- `polymarket_agents/agents/researcher.py` — **Research Agent**: Curated source lookups (Polymarket docs/repos, CoinGecko, FRED, FiveThirtyEight). No LLM calls in Phase 1; outputs structured dossiers.
- `polymarket_agents/agents/nova.py` — **Nova Orchestrator**: Runs daily cycle (scan → watchlist → research dispatch → dossier collection → report compilation), enforces workflow gates, logs all decisions to audit trail.

**Entry Point:**
- `polymarket_agents/__main__.py` — CLI: `python -m polymarket_agents --once` (one cycle) or continuous mode with configurable interval

**Tests:**
- 25 tests covering config, models, data clients, and full agent integration
- All tests pass with mock data
- Coverage includes: config overrides, message bus pub/sub, agent cycle execution, watchlist sorting/filtering, research source matching

### How It Works (Daily Cycle)

1. **Nova** sends `scan_request` to **Scanner**
2. **Scanner** fetches markets from Gamma API, evaluates each with heuristic scoring, publishes ranked watchlist to **Nova**
3. **Nova** receives watchlist, requests research for top N opportunities (configurable via `research_top_n`)
4. **Researcher** processes each request, builds source dossiers with curated links, sends back to **Nova**
5. **Nova** compiles daily report (watchlist + dossiers), writes to console and audit log

All messages flow through the **MessageBus**. All decisions logged to `logs/audit.jsonl`.

### Configuration

**Files:**
- `config/default.yaml` — Default values
- `.env` — Secrets (gitignored, use `.env.template` as reference)
- Env vars with `POLY_` prefix override YAML values

**Key Settings:**
- `mock_mode: true` — Use mock data (no real API calls). Set to `false` when you have credentials.
- `scan_interval_seconds: 300` — Scan frequency in continuous mode
- `max_watchlist_size: 50` — Max opportunities in watchlist
- `min_opportunity_score: 20` — Threshold for inclusion
- `research_top_n: 5` — How many top opportunities to research

### Running the System

```bash
cd Projects/polymarket-agents

# Activate venv
source .venv/bin/activate

# One cycle (mock mode by default)
python -m polymarket_agents --once

# Continuous mode
python -m polymarket_agents

# Run tests
pytest tests/ -v

# With custom config
python -m polymarket_agents --config path/to/config.yaml --once
```

**Output:**
- Console: Daily report with scored watchlist + research dossiers
- `logs/audit.jsonl`: JSONL decision log (one JSON object per line)

### What's In Progress / TODO

**Nothing in progress — Phase 1 is complete and working.**

Next phases (not started):

- **Phase 2:** Strategy Engineer Agent, Backtest Agent, real WebSocket feed
- **Phase 3:** Paper Trading Agent, Risk Manager Agent, Security Agent
- **Phase 4:** Execution Bot (live trading)

See `/Users/oybekabdualiev/.claude/plans/sleepy-wiggling-taco.md` for full implementation plan.

### API Keys / Config Locations

**No real API keys needed for Phase 1** — everything runs in mock mode.

**When you add real credentials:**

1. Copy `.env.template` to `.env` (gitignored)
2. Fill in:
   - `POLY_CLOB_PRIVATE_KEY` — CLOB API private key (for trading, not needed for read-only)
   - `POLY_SUBGRAPH_URL` — GraphQL endpoint URL
3. Set `POLY_MOCK_MODE=false` in `.env`

**Other configs:**
- `.venv/` — Python 3.12 virtual environment (gitignored)
- `config/default.yaml` — Non-secret defaults

### Dependencies

**Python 3.11+ required** (currently using 3.12 in `.venv`).

**Core:**
- `pydantic>=2.0` — Data models
- `httpx>=0.27` — Async HTTP
- `pyyaml>=6.0` — Config files

**Optional (live mode):**
- `py-clob-client>=0.34` — Official Polymarket CLOB client (install with `pip install -e ".[live]"`)

**Dev:**
- `pytest>=8.0`, `pytest-asyncio>=0.23`, `pytest-cov>=5.0`, `ruff>=0.3`

### Known Issues / Notes

- `datetime.utcnow()` deprecation warnings in Python 3.12 — harmless, can be updated to `datetime.now(timezone.utc)` later
- Mock data is static — markets don't change between runs
- WebSocket feed is a polling stub (30s interval REST calls) — real WS integration is Phase 2

### File Structure

```
polymarket-agents/
├── CLAUDE.md                   # Sub-project guidance for Claude
├── HANDOFF.md                  # This file
├── pyproject.toml              # Project metadata, dependencies
├── .env.template               # Env var template
├── config/
│   └── default.yaml            # Default config values
├── polymarket_agents/
│   ├── __init__.py
│   ├── __main__.py             # Entry point
│   ├── config.py               # Config loader
│   ├── core/                   # Base classes, models, message bus, logger
│   ├── data/                   # Gamma, CLOB, Subgraph clients + mocks
│   ├── agents/                 # Scanner, Researcher, Nova
│   └── utils/                  # Formatting helpers
└── tests/                      # 25 passing tests
    ├── conftest.py
    ├── test_config.py
    ├── test_models.py
    ├── data/
    │   ├── test_clob_client.py
    │   └── test_gamma_client.py
    └── agents/
        ├── test_nova.py
        ├── test_scanner.py
        └── test_researcher.py
```

### Critical Files

- `core/base_agent.py` — Foundation class; all agents depend on this
- `core/models.py` — Shared data models; changes here affect everything
- `agents/nova.py` — Orchestrator; most complex coordination logic
- `data/gamma_client.py` — Primary data source for market discovery

### Next Steps (Recommended)

1. **Add CLAUDE.md** for this sub-project (document agent architecture, development patterns)
2. **Fix deprecation warnings** (replace `datetime.utcnow()` with `datetime.now(timezone.utc)`)
3. **Add more test markets** in `data/mock/` for diverse scenarios (low liquidity, expired markets, edge cases)
4. **Improve Scanner scoring** — current heuristic is simple; consider adding:
   - Bid-ask spread quality
   - Order book depth analysis
   - Price volatility detection
   - Momentum signals
5. **Phase 2 planning**: Strategy Engineer agent needs access to historical price data — confirm data availability from Subgraph or consider archiving order books
