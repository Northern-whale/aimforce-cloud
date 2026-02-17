"""Tests for CLOB data client (mock mode)."""

import pytest
from polymarket_agents.config import PolymarketConfig
from polymarket_agents.data.clob_client import ClobDataClient


@pytest.fixture
def clob():
    return ClobDataClient(PolymarketConfig(mock_mode=True))


@pytest.mark.asyncio
async def test_get_orderbook(clob):
    ob = await clob.get_orderbook("tok_001_yes")
    assert ob.token_id == "tok_001_yes"
    assert len(ob.bids) > 0
    assert len(ob.asks) > 0
    assert ob.midpoint > 0
    assert ob.spread > 0


@pytest.mark.asyncio
async def test_get_midpoint(clob):
    mid = await clob.get_midpoint("tok_001_yes")
    assert 0 < mid < 1


@pytest.mark.asyncio
async def test_get_price(clob):
    buy = await clob.get_price("tok_001_yes", "buy")
    sell = await clob.get_price("tok_001_yes", "sell")
    assert buy > sell  # ask > bid


@pytest.mark.asyncio
async def test_unknown_token_fallback(clob):
    ob = await clob.get_orderbook("unknown_token")
    assert ob.token_id == "unknown_token"
    assert len(ob.bids) > 0
