"""Tests for the Scanner Agent."""

import pytest
from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.message_bus import MessageBus
from polymarket_agents.data.clob_client import ClobDataClient
from polymarket_agents.data.gamma_client import GammaClient
from polymarket_agents.agents.scanner import ScannerAgent


@pytest.fixture
def scanner():
    config = PolymarketConfig(mock_mode=True, min_opportunity_score=0)
    bus = MessageBus()
    gamma = GammaClient(config)
    clob = ClobDataClient(config)
    return ScannerAgent(config, bus, gamma, clob)


@pytest.mark.asyncio
async def test_run_cycle_produces_watchlist(scanner):
    await scanner.run_cycle()
    assert len(scanner.watchlist) > 0


@pytest.mark.asyncio
async def test_watchlist_is_sorted_descending(scanner):
    await scanner.run_cycle()
    scores = [o.score for o in scanner.watchlist]
    assert scores == sorted(scores, reverse=True)


@pytest.mark.asyncio
async def test_watchlist_respects_max_size():
    config = PolymarketConfig(mock_mode=True, max_watchlist_size=2, min_opportunity_score=0)
    bus = MessageBus()
    gamma = GammaClient(config)
    clob = ClobDataClient(config)
    scanner = ScannerAgent(config, bus, gamma, clob)
    await scanner.run_cycle()
    assert len(scanner.watchlist) <= 2


@pytest.mark.asyncio
async def test_opportunities_have_reasons(scanner):
    await scanner.run_cycle()
    for opp in scanner.watchlist:
        assert len(opp.reasons) > 0
