"""Tests for the Researcher Agent."""

import pytest
from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.message_bus import MessageBus
from polymarket_agents.agents.researcher import ResearcherAgent


@pytest.fixture
def researcher():
    config = PolymarketConfig(mock_mode=True)
    bus = MessageBus()
    return ResearcherAgent(config, bus)


@pytest.mark.asyncio
async def test_research_market_returns_dossier(researcher):
    dossier = await researcher.research_market("cond_001", "Will BTC hit 100k?", ["crypto"])
    assert dossier.market_id == "cond_001"
    assert len(dossier.sources) > 0
    assert dossier.summary


@pytest.mark.asyncio
async def test_research_includes_polymarket_sources(researcher):
    dossier = await researcher.research_market("cond_001", "Test?")
    urls = {s.url for s in dossier.sources}
    assert "https://docs.polymarket.com/" in urls


@pytest.mark.asyncio
async def test_topic_sources_added_for_tags(researcher):
    dossier = await researcher.research_market("cond_001", "Fed rate cut?", ["macro"])
    urls = {s.url for s in dossier.sources}
    assert "https://fred.stlouisfed.org/" in urls
