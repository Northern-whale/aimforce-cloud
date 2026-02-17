"""Mock Gamma API client with sample markets."""

from __future__ import annotations

from datetime import datetime, timedelta

from polymarket_agents.core.models import Market, MarketStatus, Token

_NOW = datetime.utcnow()

MOCK_MARKETS: list[Market] = [
    Market(
        condition_id="cond_001",
        question="Will Bitcoin exceed $100k by end of Q2 2026?",
        slug="bitcoin-100k-q2-2026",
        tokens=[
            Token(token_id="tok_001_yes", outcome="Yes"),
            Token(token_id="tok_001_no", outcome="No"),
        ],
        status=MarketStatus.ACTIVE,
        volume=2_500_000.0,
        liquidity=450_000.0,
        end_date=_NOW + timedelta(days=120),
        tags=["crypto", "bitcoin", "price"],
    ),
    Market(
        condition_id="cond_002",
        question="Will the Fed cut rates in March 2026?",
        slug="fed-rate-cut-march-2026",
        tokens=[
            Token(token_id="tok_002_yes", outcome="Yes"),
            Token(token_id="tok_002_no", outcome="No"),
        ],
        status=MarketStatus.ACTIVE,
        volume=1_800_000.0,
        liquidity=320_000.0,
        end_date=_NOW + timedelta(days=30),
        tags=["macro", "fed", "rates"],
    ),
    Market(
        condition_id="cond_003",
        question="Will SpaceX Starship reach orbit by April 2026?",
        slug="spacex-starship-orbit-2026",
        tokens=[
            Token(token_id="tok_003_yes", outcome="Yes"),
            Token(token_id="tok_003_no", outcome="No"),
        ],
        status=MarketStatus.ACTIVE,
        volume=950_000.0,
        liquidity=180_000.0,
        end_date=_NOW + timedelta(days=60),
        tags=["space", "spacex", "tech"],
    ),
    Market(
        condition_id="cond_004",
        question="Will US GDP growth exceed 3% in 2026?",
        slug="us-gdp-growth-2026",
        tokens=[
            Token(token_id="tok_004_yes", outcome="Yes"),
            Token(token_id="tok_004_no", outcome="No"),
        ],
        status=MarketStatus.ACTIVE,
        volume=600_000.0,
        liquidity=95_000.0,
        end_date=_NOW + timedelta(days=300),
        tags=["macro", "gdp", "economy"],
    ),
    Market(
        condition_id="cond_005",
        question="Will Ethereum merge to PoS finalize without issues by mid-2026?",
        slug="eth-pos-stable-2026",
        tokens=[
            Token(token_id="tok_005_yes", outcome="Yes"),
            Token(token_id="tok_005_no", outcome="No"),
        ],
        status=MarketStatus.ACTIVE,
        volume=1_200_000.0,
        liquidity=210_000.0,
        end_date=_NOW + timedelta(days=150),
        tags=["crypto", "ethereum", "tech"],
    ),
    Market(
        condition_id="cond_006",
        question="Will AI regulation bill pass US Congress in 2026?",
        slug="ai-regulation-congress-2026",
        tokens=[
            Token(token_id="tok_006_yes", outcome="Yes"),
            Token(token_id="tok_006_no", outcome="No"),
        ],
        status=MarketStatus.ACTIVE,
        volume=400_000.0,
        liquidity=70_000.0,
        end_date=_NOW + timedelta(days=200),
        tags=["politics", "ai", "regulation"],
    ),
]


class MockGammaClient:
    """Returns pre-built market data for testing."""

    async def get_active_markets(self, limit: int = 100, offset: int = 0) -> list[Market]:
        return MOCK_MARKETS[offset:offset + limit]

    async def get_market_by_slug(self, slug: str) -> Market | None:
        for m in MOCK_MARKETS:
            if m.slug == slug:
                return m
        return None

    async def get_markets_by_tag(self, tag: str) -> list[Market]:
        return [m for m in MOCK_MARKETS if tag in m.tags]
