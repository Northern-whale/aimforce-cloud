"""Tests for Strategy Engineer Agent."""

from datetime import datetime, timedelta

import pytest
from polymarket_agents.agents.strategy_engineer import StrategyEngineer
from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.message_bus import MessageBus
from polymarket_agents.core.models import (
    AgentMessage,
    Market,
    MarketStatus,
    Opportunity,
    OrderBookSnapshot,
    StrategyType,
    Token,
)


@pytest.fixture
def config():
    return PolymarketConfig()


@pytest.fixture
def bus():
    return MessageBus()


@pytest.fixture
def strategy_engineer(config, bus):
    return StrategyEngineer(config, bus)


@pytest.fixture
def sample_opportunity():
    """Create a sample opportunity for testing."""
    market = Market(
        condition_id="market123",
        question="Will Bitcoin reach $100k by EOY?",
        slug="btc-100k",
        tokens=[Token(token_id="token123", outcome="Yes")],
        status=MarketStatus.ACTIVE,
        volume=1_000_000.0,
        liquidity=200_000.0,
        end_date=datetime.utcnow() + timedelta(days=30),
        tags=["crypto", "bitcoin"],
    )
    
    orderbook = OrderBookSnapshot(
        token_id="token123",
        timestamp=datetime.utcnow(),
        bids=[(0.48, 1000), (0.47, 500)],
        asks=[(0.52, 1000), (0.53, 500)],
        midpoint=0.50,
        spread=0.04,
    )
    
    return Opportunity(
        market=market,
        score=75.0,
        reasons=["high_volume", "high_turnover", "deep_liquidity"],
        missing_data=[],
        orderbook=orderbook,
    )


@pytest.mark.asyncio
async def test_strategy_engineer_init(strategy_engineer):
    """Test Strategy Engineer initialization."""
    assert strategy_engineer.name == "strategy_engineer"
    assert strategy_engineer.opportunities == []
    assert strategy_engineer.strategies == []


@pytest.mark.asyncio
async def test_receive_watchlist(strategy_engineer, sample_opportunity):
    """Test receiving watchlist from Scanner."""
    message = AgentMessage(
        sender="scanner",
        recipient="strategy_engineer",
        msg_type="watchlist",
        payload={
            "opportunities": [sample_opportunity.model_dump(mode="json")],
        },
    )
    
    # Before message
    assert len(strategy_engineer.opportunities) == 0
    
    # Process message
    await strategy_engineer.on_message(message)
    
    # After message - should trigger strategy generation
    await asyncio.sleep(0.1)  # Give time for async processing
    
    assert len(strategy_engineer.opportunities) == 1
    # Strategy generation happens in run_cycle which is called by on_message


@pytest.mark.asyncio
async def test_mean_reversion_strategy(strategy_engineer, sample_opportunity):
    """Test mean reversion strategy generation."""
    strategy = strategy_engineer._create_mean_reversion_strategy(sample_opportunity)
    
    assert strategy is not None
    assert strategy.strategy_type == StrategyType.MEAN_REVERSION
    assert strategy.market_id == "market123"
    assert strategy.token_id == "token123"
    assert len(strategy.entry_rules) > 0
    assert len(strategy.exit_rules) > 0
    assert 0 < strategy.position_size <= 1.0
    assert strategy.confidence > 0


@pytest.mark.asyncio
async def test_momentum_strategy(strategy_engineer, sample_opportunity):
    """Test momentum strategy generation."""
    strategy = strategy_engineer._create_momentum_strategy(sample_opportunity)
    
    assert strategy is not None
    assert strategy.strategy_type == StrategyType.MOMENTUM
    assert strategy.market_id == "market123"
    assert strategy.token_id == "token123"
    assert len(strategy.entry_rules) > 0
    assert len(strategy.exit_rules) > 0


@pytest.mark.asyncio
async def test_arbitrage_strategy(strategy_engineer, sample_opportunity):
    """Test arbitrage strategy generation."""
    strategy = strategy_engineer._create_arbitrage_strategy(sample_opportunity)
    
    assert strategy is not None
    assert strategy.strategy_type == StrategyType.ARBITRAGE
    assert strategy.market_id == "market123"
    assert strategy.token_id == "token123"
    assert len(strategy.entry_rules) > 0
    assert len(strategy.exit_rules) > 0


@pytest.mark.asyncio
async def test_no_strategy_without_orderbook(strategy_engineer, sample_opportunity):
    """Test that some strategies require orderbook data."""
    # Remove orderbook
    sample_opportunity.orderbook = None
    
    mean_rev = strategy_engineer._create_mean_reversion_strategy(sample_opportunity)
    assert mean_rev is None
    
    arb = strategy_engineer._create_arbitrage_strategy(sample_opportunity)
    assert arb is None


@pytest.mark.asyncio
async def test_no_arbitrage_on_narrow_spread(strategy_engineer, sample_opportunity):
    """Test that arbitrage strategy is not created for narrow spreads."""
    # Set narrow spread
    sample_opportunity.orderbook.spread = 0.005  # 0.5%
    
    strategy = strategy_engineer._create_arbitrage_strategy(sample_opportunity)
    assert strategy is None  # Should not create strategy for narrow spread


@pytest.mark.asyncio
async def test_run_cycle_generates_strategies(strategy_engineer, sample_opportunity):
    """Test full cycle of strategy generation."""
    strategy_engineer.opportunities = [sample_opportunity]
    
    await strategy_engineer.run_cycle()
    
    # Should generate at least one strategy (probably multiple)
    assert len(strategy_engineer.strategies) > 0
    
    # Check that strategies have valid properties
    for strategy in strategy_engineer.strategies:
        assert strategy.strategy_id
        assert strategy.market_id == "market123"
        assert strategy.position_size > 0
        assert strategy.confidence > 0


import asyncio
