"""Tests for Gamma client (mock mode)."""

import pytest
from polymarket_agents.config import PolymarketConfig
from polymarket_agents.data.gamma_client import GammaClient


@pytest.fixture
def gamma():
    return GammaClient(PolymarketConfig(mock_mode=True))


@pytest.mark.asyncio
async def test_get_active_markets(gamma):
    markets = await gamma.get_active_markets(limit=10)
    assert len(markets) > 0
    assert markets[0].condition_id


@pytest.mark.asyncio
async def test_get_market_by_slug(gamma):
    m = await gamma.get_market_by_slug("bitcoin-100k-q2-2026")
    assert m is not None
    assert "bitcoin" in m.slug


@pytest.mark.asyncio
async def test_get_market_by_slug_not_found(gamma):
    m = await gamma.get_market_by_slug("nonexistent")
    assert m is None


@pytest.mark.asyncio
async def test_get_markets_by_tag(gamma):
    markets = await gamma.get_markets_by_tag("crypto")
    assert len(markets) >= 1
    for m in markets:
        assert "crypto" in m.tags
