# Polymarket Trading Bot — Developer Briefing

**From:** Oybek
**Date:** 2026-02-18
**Priority:** Review & evaluate for our trading project

---

Hey! I researched and audited open-source Polymarket trading bots on GitHub. Below are the 3 best ones I found — all passed a full security audit (no malware, no key exfiltration, no backdoors). They're already cloned in this directory. Please review and let me know which approach fits our project best.

---

## 1. `polymarket-trading-bot/` — Best Ready-to-Use Bot

**Repo:** https://github.com/discountry/polymarket-trading-bot
**Stars:** 177 | **Forks:** 93 | **Last updated:** Jan 2026 | **License:** MIT

### What it does
- Automated trading bot for Polymarket 15-minute BTC/ETH/SOL/XRP Up/Down markets
- Built-in "Flash Crash" strategy — detects sudden probability drops and buys the dip
- Real-time WebSocket orderbook data from Polymarket CLOB
- Gasless transactions via Polymarket Builder Program

### Tech stack
- Python (pure, no frameworks)
- `web3` + `eth-account` for signing
- WebSocket for live data
- YAML config files

### Tests
- **98/98 tests passing** (verified locally)
- Covers: order signing, crypto encryption, client API, market management, utils
- Run: `source .venv/bin/activate && pytest tests/ -v`

### Security audit results
| Check | Result |
|-------|--------|
| Private key exfiltration | SAFE — keys never sent over network, only used for local signing |
| Obfuscated code | SAFE — no eval/exec/base64 abuse |
| Hidden binaries | SAFE — zero binary files |
| Dependencies | SAFE — all 9 packages are well-known (web3, eth-account, cryptography, etc.) |
| Backdoor patterns | SAFE — all URLs are official Polymarket endpoints |
| File system attacks | SAFE — no system file access |
| Crypto mining | SAFE — none |

### Key strengths
- Encrypted private key storage (PBKDF2 + Fernet AES encryption)
- File permissions set to 0o600 on key files
- Clean, well-structured codebase — easy to extend
- Lightweight — only 9 dependencies
- Already has venv set up at `.venv/`

### What to look at
- `src/bot.py` — main trading interface
- `src/signer.py` — order signing (EIP-712)
- `src/crypto.py` — key encryption
- `src/websocket_client.py` — real-time orderbook
- `strategies/flash_crash.py` — the actual trading strategy
- `lib/market_manager.py` — market rotation for 15-min windows

---

## 2. `poly-maker/` — Market Making Bot (Reference)

**Repo:** https://github.com/warproxxx/poly-maker
**Stars:** 869 | **Forks:** 370 | **Last updated:** Dec 2024 | **License:** MIT

### What it does
- Automated market maker — provides liquidity on both sides of prediction markets
- Configurable per-market parameters via Google Sheets
- Real-time WebSocket order book monitoring
- Position merging (YES+NO → USDC recovery) via Gnosis Safe

### Tech stack
- Python + Node.js (for position merger)
- `py-clob-client` (official Polymarket SDK)
- Google Sheets API for configuration
- WebSocket for real-time data

### Tests
- No formal test suite included
- Author warns: **"In today's market, this bot is not profitable and will lose money"**

### Security audit results
| Check | Result |
|-------|--------|
| Private key exfiltration | SAFE — keys used only for local tx signing |
| Obfuscated code | SAFE — zero obfuscation |
| Hidden binaries | SAFE — none |
| Dependencies | SAFE — all official packages (py-clob-client, web3, gspread, etc.) |
| Backdoor patterns | SAFE — all 5 contract addresses verified against Polymarket docs |
| File system attacks | SAFE — only writes to local `positions/` directory |
| Crypto mining | SAFE — none |

### Key strengths
- Most mature/popular open-source Polymarket bot (869 stars)
- Real production experience — author ran it on live markets
- Google Sheets config = easy parameter tuning without code changes
- Position merging saves gas fees
- Good reference for understanding Polymarket's CLOB architecture

### Weaknesses
- Author explicitly says it's not profitable anymore (too much competition)
- Requires Google Sheets API setup (service account credentials)
- Uses `subprocess.run(shell=True)` in one place (low risk but not ideal)
- No test suite

### What to look at
- `trading.py` — core market making logic with risk management
- `poly_data/polymarket_client.py` — Polymarket API wrapper
- `poly_data/websocket_handler.py` — real-time order book
- `data_updater/` — market scanner and reward calculator

---

## 3. `polymarket-agents-official/` — Official Polymarket AI Framework

**Repo:** https://github.com/Polymarket/agents
**Stars:** 2,200 | **Forks:** 528 | **Last updated:** Jul 2024 | **License:** MIT

### What it does
- Official framework from the Polymarket team for building AI trading agents
- Uses LangChain + OpenAI for market analysis and "superforecaster" predictions
- RAG system (ChromaDB) for filtering markets by relevance
- CLI interface for querying markets, fetching news, running analysis

### Tech stack
- Python + LangChain + OpenAI
- ChromaDB for vector search
- `py-clob-client` (official Polymarket SDK)
- Docker support included

### Tests
- Basic unittest setup exists
- **Trade execution is commented out by default** (line 60-61 in `trade.py`)
- Framework only — you need to build the actual bot on top

### Security audit results
| Check | Result |
|-------|--------|
| Private key exfiltration | SAFE — no outbound POST calls, keys for local signing only |
| Obfuscated code | SAFE — uses safe `ast.literal_eval()` instead of `eval()` |
| Hidden binaries | SAFE — only a PNG screenshot |
| Dependencies | SAFE — all 170 packages legitimate (LangChain, OpenAI, web3, etc.) |
| Backdoor patterns | SAFE — all URLs verified as official Polymarket endpoints |
| File system attacks | SAFE — writes only to local ChromaDB directories |
| Crypto mining | SAFE — none |

### Key strengths
- Official Polymarket code — most trustworthy source
- AI-powered analysis (not just simple strategies)
- Good architecture for building custom agents
- Docker support for deployment

### Weaknesses
- **Dependency issues** — `pysha3` won't build on modern Python (3.12). Needs Python 3.9.10 specifically
- Trade execution commented out — need to uncomment and test
- 170 dependencies = heavy footprint
- Framework, not a ready bot — requires significant development
- Not actively maintained (last commit Jul 2024)

### What to look at
- `agents/application/trade.py` — trading logic (execution commented out)
- `agents/polymarket/polymarket.py` — Polymarket API integration
- `agents/connectors/chroma.py` — RAG vector search
- `scripts/python/cli.py` — CLI commands

---

## Repos I Investigated But DO NOT Recommend

These were found during research and should be **avoided**:

| Repo | Why to avoid |
|------|-------------|
| `luckeyfaraday/polymarket-bot` | **SCAM** — brand-new account (Jan 2026), 1 star, 0 forks, pushes $199 "Pro version" |
| `lorine93s/polymarket-market-maker-bot` | **FAKE** — 250 stars but only 1 commit, created Nov 2025. Astroturfed stars, likely malware trap |
| `borysdraxen/dappboris-dev` | **SUSPICIOUS** — URL mismatch between repo title and actual URL |
| `Trust412/Polymarket-spike-bot-v1` | **RISKY** — 311 stars but brand-new account (Apr 2025), no license, no tests |
| `Trust412/polymarket-copy-trading-bot-v3` | **RISKY** — requires private keys, new account with only bot repos |

---

## My Recommendation

**Start with `polymarket-trading-bot/`** (repo #1). Reasons:
1. 98/98 tests passing — it works
2. Cleanest codebase, easiest to understand and modify
3. Encrypted key storage — good security practices
4. Flash crash strategy is a real, documented approach
5. Lightest dependency footprint (9 packages vs 170)
6. Active development (last commit Jan 2026)

Use `poly-maker/` (#2) as reference for understanding market making and CLOB architecture.

Use `polymarket-agents-official/` (#3) if we want to add AI-powered analysis later — but fix the dependency issues first.

---

## Quick Start (for testing repo #1)

```bash
cd Projects/polymarket-bots-eval/polymarket-trading-bot
source .venv/bin/activate
pytest tests/ -v                    # Run all 98 tests
cp .env.example .env               # Set up config
# Edit .env with wallet details
# Edit config.yaml with trading parameters
python scripts/run_bot.py           # Start bot
```

**Important:** Do NOT use real funds until you've fully reviewed the strategy code and tested on small amounts first.
