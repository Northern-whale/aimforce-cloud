"""Tests for the Nova Orchestrator."""

import pytest
from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.message_bus import MessageBus
from polymarket_agents.data.clob_client import ClobDataClient
from polymarket_agents.data.gamma_client import GammaClient
from polymarket_agents.agents.nova import NovaOrchestrator
from polymarket_agents.agents.scanner import ScannerAgent
from polymarket_agents.agents.researcher import ResearcherAgent


@pytest.fixture
def system():
    """Set up the full agent system for integration testing."""
    config = PolymarketConfig(mock_mode=True, min_opportunity_score=0, research_top_n=2)
    bus = MessageBus()
    gamma = GammaClient(config)
    clob = ClobDataClient(config)

    scanner = ScannerAgent(config, bus, gamma, clob)
    researcher = ResearcherAgent(config, bus)
    nova = NovaOrchestrator(config, bus)

    return {"config": config, "nova": nova, "scanner": scanner, "researcher": researcher}


@pytest.mark.asyncio
async def test_full_cycle(system):
    nova = system["nova"]
    report = await nova.run_cycle()
    assert "Watchlist" in report
    assert len(nova.watchlist) > 0
    assert len(nova.dossiers) > 0


@pytest.mark.asyncio
async def test_cycle_respects_research_top_n(system):
    nova = system["nova"]
    await nova.run_cycle()
    # research_top_n=2, so we should have at most 2 dossiers
    assert len(nova.dossiers) <= 2


@pytest.mark.asyncio
async def test_audit_log_written(system, tmp_path):
    config = system["config"]
    config.audit_log_path = str(tmp_path / "audit.jsonl")
    bus = MessageBus()
    gamma = GammaClient(config)
    clob = ClobDataClient(config)

    ScannerAgent(config, bus, gamma, clob)
    ResearcherAgent(config, bus)
    nova = NovaOrchestrator(config, bus)

    await nova.run_cycle()

    audit_file = tmp_path / "audit.jsonl"
    assert audit_file.exists()
    lines = audit_file.read_text().strip().split("\n")
    assert len(lines) >= 2  # at least cycle_start + cycle_complete
