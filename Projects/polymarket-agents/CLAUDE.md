# CLAUDE.md — Polymarket Opportunities Desk

This file provides guidance to Claude Code when working in this sub-project.

## Project Overview

**Polymarket Opportunities Desk** is a multi-agent system for scanning Polymarket prediction markets, gathering research, and producing ranked opportunity watchlists. Built in Python 3.11+ with async throughout.

**Current Status:** Phase 1 complete (Nova orchestrator, Scanner, Researcher, data layer with mocks). Remaining agents (Strategy, Backtest, Paper Trading, Execution, Risk, Security) are Phase 2+.

## Architecture

**Agent-based design:**
- All agents inherit from `BaseAgent` (abstract base class)
- Agents communicate via `MessageBus` (in-process async pub/sub)
- Data layer auto-selects mock vs real clients based on `config.mock_mode`

**Daily cycle flow:**
```
Nova → Scanner → Watchlist → Researcher → Dossiers → Daily Report
       ↓                      ↓
    Gamma API           Curated Sources
    CLOB API            (Polymarket docs, FRED, CoinGecko, etc.)
```

**Audit trail:** Every decision logged to `logs/audit.jsonl` (JSONL format, one decision per line).

## Key Design Decisions

1. **Mock-first data layer**: Every data client checks `config.mock_mode` and substitutes realistic mock data. System runs fully offline without API credentials.

2. **No LLM in Phase 1**: Scanner uses heuristic scoring (volume, liquidity, spread, tags). Researcher does structured lookups. LLM integration is deferred to Phase 2.

3. **In-process message bus**: 3 agents in one process don't need Redis/Kafka. Simple async pub/sub (~40 lines) with message history. Can swap for external broker later behind same interface.

4. **Asyncio throughout**: Data layer involves concurrent HTTP calls (Gamma, CLOB, Subgraph). Message bus uses `asyncio.create_task` for non-blocking delivery. Avoids threading complexity.

5. **Configuration**: YAML defaults in `config/default.yaml`, overridden by `POLY_*` env vars. `.env` file for secrets (gitignored).

## Commands

```bash
# Activate venv
source .venv/bin/activate

# Run one cycle (mock mode)
python -m polymarket_agents --once

# Continuous mode
python -m polymarket_agents

# Run tests
pytest tests/ -v

# Lint
ruff check .

# Format
ruff format .

# Type check (if you add mypy)
mypy polymarket_agents/
```

## Development Workflow

### Adding a New Agent

1. Create `polymarket_agents/agents/new_agent.py`
2. Inherit from `BaseAgent`:
   ```python
   from polymarket_agents.core.base_agent import BaseAgent

   class NewAgent(BaseAgent):
       async def run_cycle(self) -> None:
           # Work logic
           ...

       async def on_message(self, message: AgentMessage) -> None:
           # Handle incoming messages
           if message.msg_type == "some_request":
               ...
   ```
3. Wire into `__main__.py`:
   ```python
   new_agent = NewAgent(config, bus)
   await new_agent.start()
   ```
4. Add tests in `tests/agents/test_new_agent.py`

### Adding a New Data Source

1. Create client in `polymarket_agents/data/new_source.py`
2. Create mock in `polymarket_agents/data/mock/mock_new_source.py`
3. Auto-select based on `config.mock_mode`:
   ```python
   if config.mock_mode:
       from polymarket_agents.data.mock.mock_new_source import MockNewSourceClient
       self._client = MockNewSourceClient()
   else:
       # Real client
       ...
   ```
4. Add tests in `tests/data/test_new_source.py` (test against mock first)

### Adding Config Options

1. Add field to `PolymarketConfig` dataclass in `config.py`:
   ```python
   @dataclass
   class PolymarketConfig:
       ...
       new_option: str = "default_value"
   ```
2. Add to `config/default.yaml`:
   ```yaml
   new_option: "default_value"
   ```
3. Add to `.env.template` if it's a secret:
   ```bash
   POLY_NEW_OPTION=value
   ```
4. Override with `POLY_NEW_OPTION` env var

## Testing

**Philosophy:** Mock data first, integration tests cover full cycle.

**Fixtures:** `conftest.py` provides `config` and `bus` fixtures.

**Async tests:** Use `@pytest.mark.asyncio` decorator. `pytest-asyncio` plugin handles event loops.

**Coverage:**
```bash
pytest tests/ --cov=polymarket_agents --cov-report=term-missing
```

## File Organization

```
polymarket_agents/
├── __init__.py              # Package root
├── __main__.py              # Entry point (CLI)
├── config.py                # Config loader
├── core/                    # Framework
│   ├── base_agent.py        # Abstract base
│   ├── message_bus.py       # Pub/sub
│   ├── models.py            # Pydantic models
│   └── logger.py            # Audit log + setup
├── data/                    # Data layer
│   ├── gamma_client.py      # Market discovery
│   ├── clob_client.py       # Order books
│   ├── subgraph_client.py   # Historical data
│   ├── websocket_feed.py    # Real-time (stub)
│   └── mock/                # Mock implementations
├── agents/                  # Agent implementations
│   ├── nova.py              # Orchestrator
│   ├── scanner.py           # Market intelligence
│   └── researcher.py        # Research & sources
└── utils/                   # Helpers
    └── formatting.py        # Report formatting
```

## Operating Rules (from Spec)

1. **No guaranteed returns** — Never claim "20-30% daily" as expectation
2. **Evidence > hype** — Strategies must include data sources, assumptions, failure modes
3. **Backtest + paper trade required** — Live trading requires passing both gates with documented performance
4. **Least-privilege keys** — Only execution bot touches trading credentials; all others read-only
5. **Security veto** — If security agent flags supply-chain or runtime risk, strategy is blocked
6. **Kill switch always on** — If drawdown/slippage/latency/error rates cross thresholds, trading halts
7. **Audit trail** — Every decision logged: inputs → strategy spec → tests → approvals → trades

## Phase Roadmap

### Phase 1 (Complete ✅)
- Nova orchestrator
- Market Scanner (heuristic scoring)
- Research Agent (curated sources)
- Data layer with mocks
- Full test coverage

### Phase 2 (Next)
- Strategy Engineer Agent (hypothesis builder)
- Backtest Agent (historical replay, slippage simulation)
- Real WebSocket feed (replace polling stub)
- LLM integration for Researcher (narrative analysis)

### Phase 3
- Paper Trading / Shadow Execution Agent
- Risk Manager Agent (portfolio limits, correlation, event risk)
- Security Agent (dependency audits, malware scanning, SAST)

### Phase 4
- Execution Bot (live trading with strict controls)
- Kill switch implementation
- Multi-market position management
- Real-time risk monitoring

## Common Patterns

### Agent sends a message
```python
await self.send("recipient_agent", "message_type", {
    "key": "value",
})
```

### Agent handles a message
```python
async def on_message(self, message: AgentMessage) -> None:
    if message.msg_type == "watchlist":
        opportunities = [Opportunity.model_validate(o) for o in message.payload["opportunities"]]
        # Process...
```

### Log a decision
```python
from polymarket_agents.core.logger import AuditLogger

audit = AuditLogger(config.audit_log_path)
audit.log("agent_name", "action", {"detail": "value"}, outcome="success")
```

### Fetch market data
```python
markets = await self.gamma.get_active_markets(limit=100)
ob = await self.clob.get_orderbook(token_id)
volume = await self.subgraph.get_market_volume(condition_id)
```

## Troubleshooting

**ImportError on `py_clob_client`:**
- Install live dependencies: `pip install -e ".[live]"`
- Or keep `mock_mode=true` (no real client needed)

**Tests fail with "event loop is closed":**
- Check `pytest-asyncio` is installed
- Ensure `asyncio_mode = "auto"` in `pyproject.toml`

**Agent messages not arriving:**
- Check agent is subscribed: `bus.subscribe(agent_name, handler)`
- Verify recipient name matches exactly (case-sensitive)
- Check bus history: `bus.get_history()`

**Config not loading:**
- Env vars must have `POLY_` prefix
- YAML file must be valid (check with `pyyaml`)
- Check type coercion in `config.py` (bool/int/float parsing)

## Dependencies

**Core (always installed):**
- `pydantic>=2.0` — Data models with validation
- `httpx>=0.27` — Async HTTP client
- `pyyaml>=6.0` — Config file parsing

**Optional (install with `pip install -e ".[live]"`):**
- `py-clob-client>=0.34` — Official Polymarket CLOB client

**Dev (install with `pip install -e ".[dev]"`):**
- `pytest>=8.0`, `pytest-asyncio>=0.23`, `pytest-cov>=5.0`, `ruff>=0.3`

## Guidelines from Root CLAUDE.md

(Inherited from `/Users/oybekabdualiev/Desktop/Tars/CLAUDE.md`)

- Do what is asked; nothing more, nothing less
- Prefer editing existing files over creating new ones
- Never proactively create documentation files unless requested
- Do not use dramatic/hyperbolic language
- When tasks can be divided into subtasks, use sub-agents in parallel
- Sub-agents must not spawn further sub-agents
- Sub-agents must not commit or push; only main agent handles git
- When making changes to MCP server, ask user to reload before testing
- Never commit `.env`, API keys, or `*-config.json` files
