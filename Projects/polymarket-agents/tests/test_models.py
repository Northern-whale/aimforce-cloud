"""Tests for Pydantic data models."""

from polymarket_agents.core.models import (
    AgentMessage,
    Market,
    MarketStatus,
    Opportunity,
    OrderBookSnapshot,
    SourceDossier,
    SourceEntry,
    Token,
)


def test_market_roundtrip():
    m = Market(
        condition_id="test_001",
        question="Test market?",
        slug="test-market",
        tokens=[Token(token_id="t1", outcome="Yes")],
        volume=1000.0,
        liquidity=500.0,
    )
    data = m.model_dump(mode="json")
    m2 = Market.model_validate(data)
    assert m2.condition_id == m.condition_id
    assert m2.tokens[0].outcome == "Yes"


def test_opportunity_roundtrip():
    m = Market(condition_id="c1", question="Q?", slug="q")
    opp = Opportunity(market=m, score=75.0, reasons=["high_volume"])
    data = opp.model_dump(mode="json")
    opp2 = Opportunity.model_validate(data)
    assert opp2.score == 75.0
    assert opp2.reasons == ["high_volume"]


def test_agent_message_has_correlation_id():
    msg = AgentMessage(sender="a", recipient="b", msg_type="test")
    assert len(msg.correlation_id) > 0


def test_source_dossier():
    d = SourceDossier(
        market_id="m1",
        sources=[SourceEntry(url="https://example.com", title="Ex", source_type="docs", relevance="test")],
        summary="Found 1 source",
    )
    assert len(d.sources) == 1
