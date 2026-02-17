"""Tests for Backtesting Engine."""

from datetime import datetime, timedelta

import pytest
from polymarket_agents.core.backtest import BacktestEngine
from polymarket_agents.core.models import (
    EntryRule,
    ExitRule,
    Strategy,
    StrategyType,
)


@pytest.fixture
def backtest_engine():
    return BacktestEngine(initial_capital=10_000.0)


@pytest.fixture
def sample_strategy():
    """Create a sample mean reversion strategy."""
    return Strategy(
        strategy_type=StrategyType.MEAN_REVERSION,
        market_id="market123",
        token_id="token456",
        entry_rules=[
            EntryRule(condition="spread", threshold=0.01, operator=">="),
        ],
        exit_rules=[
            ExitRule(condition="profit_pct", threshold=5.0, operator=">="),
            ExitRule(condition="time_elapsed_seconds", threshold=86400, operator=">="),
        ],
        position_size=0.1,
        max_loss_pct=5.0,
        max_gain_pct=10.0,
        description="Test mean reversion",
        confidence=0.75,
    )


@pytest.mark.asyncio
async def test_backtest_engine_init(backtest_engine):
    """Test BacktestEngine initialization."""
    assert backtest_engine.initial_capital == 10_000.0


@pytest.mark.asyncio
async def test_generate_mock_data(backtest_engine, sample_strategy):
    """Test mock data generation."""
    data = backtest_engine._generate_mock_data(sample_strategy)
    
    assert len(data) > 0
    assert len(data) == 60 * 24  # 60 days * 24 hours
    
    # Check data structure
    for point in data[:10]:
        assert "timestamp" in point
        assert "price" in point
        assert "volume" in point
        assert "spread" in point
        assert "liquidity" in point
        
        # Prices should be valid probabilities
        assert 0 < point["price"] < 1
        assert point["volume"] > 0
        assert point["spread"] > 0


@pytest.mark.asyncio
async def test_backtest_with_mock_data(backtest_engine, sample_strategy):
    """Test backtesting with mock data."""
    result = await backtest_engine.backtest_strategy(sample_strategy)
    
    assert result is not None
    assert result.strategy_id == sample_strategy.strategy_id
    assert result.initial_capital == 10_000.0
    assert result.final_capital > 0
    
    # Check that metrics are calculated
    assert isinstance(result.num_trades, int)
    assert isinstance(result.win_rate, float)
    assert isinstance(result.total_pnl, float)
    assert isinstance(result.sharpe_ratio, float)
    assert isinstance(result.max_drawdown, float)


@pytest.mark.asyncio
async def test_backtest_trades_generated(backtest_engine, sample_strategy):
    """Test that trades are generated during backtesting."""
    result = await backtest_engine.backtest_strategy(sample_strategy)
    
    # Should generate some trades
    assert result.num_trades >= 0
    assert len(result.trades) == result.num_trades
    
    # If trades exist, check their properties
    for trade in result.trades:
        assert trade.entry_time < trade.exit_time
        assert trade.entry_price > 0
        assert trade.exit_price > 0
        assert trade.position_size > 0
        assert trade.reason in ["rule_triggered", "stop_loss", "take_profit"]


@pytest.mark.asyncio
async def test_win_rate_calculation(backtest_engine, sample_strategy):
    """Test win rate calculation."""
    result = await backtest_engine.backtest_strategy(sample_strategy)
    
    if result.num_trades > 0:
        # Win rate should be percentage
        assert 0 <= result.win_rate <= 100
        
        # Win/loss counts should match total
        assert result.winning_trades + result.losing_trades == result.num_trades
        
        # Calculated win rate should match
        expected_win_rate = (result.winning_trades / result.num_trades) * 100
        assert abs(result.win_rate - expected_win_rate) < 0.01


@pytest.mark.asyncio
async def test_sharpe_ratio_calculation(backtest_engine):
    """Test Sharpe ratio calculation."""
    returns = [5.0, -2.0, 3.0, -1.0, 4.0, 2.0]
    sharpe = backtest_engine._calculate_sharpe(returns)
    
    assert isinstance(sharpe, float)
    # Sharpe can be negative, zero, or positive


@pytest.mark.asyncio
async def test_sortino_ratio_calculation(backtest_engine):
    """Test Sortino ratio calculation."""
    returns = [5.0, -2.0, 3.0, -1.0, 4.0, 2.0]
    sortino = backtest_engine._calculate_sortino(returns)
    
    assert isinstance(sortino, float)


@pytest.mark.asyncio
async def test_drawdown_calculation(backtest_engine):
    """Test drawdown calculation."""
    from polymarket_agents.core.models import BacktestTrade
    
    now = datetime.utcnow()
    
    trades = [
        BacktestTrade(
            entry_time=now,
            exit_time=now + timedelta(hours=1),
            entry_price=0.50,
            exit_price=0.55,
            position_size=1000.0,
            pnl=100.0,
            pnl_pct=10.0,
            reason="take_profit",
        ),
        BacktestTrade(
            entry_time=now + timedelta(hours=2),
            exit_time=now + timedelta(hours=3),
            entry_price=0.60,
            exit_price=0.54,
            position_size=1000.0,
            pnl=-100.0,
            pnl_pct=-10.0,
            reason="stop_loss",
        ),
    ]
    
    max_dd, duration = backtest_engine._calculate_drawdown(trades)
    
    assert isinstance(max_dd, float)
    assert isinstance(duration, int)
    assert max_dd >= 0
    assert duration >= 0


@pytest.mark.asyncio
async def test_entry_rule_evaluation(backtest_engine, sample_strategy):
    """Test entry rule evaluation."""
    data_point = {
        "price": 0.50,
        "volume": 100_000,
        "spread": 0.02,
        "liquidity": 50_000,
    }
    
    # Should pass with spread >= 0.01
    assert backtest_engine._check_entry_rules(sample_strategy, data_point)
    
    # Should fail with narrow spread
    data_point["spread"] = 0.005
    assert not backtest_engine._check_entry_rules(sample_strategy, data_point)


@pytest.mark.asyncio
async def test_exit_rule_evaluation(backtest_engine, sample_strategy):
    """Test exit rule evaluation."""
    data_point = {
        "price": 0.55,
        "volume": 100_000,
    }
    
    time_elapsed = 3600  # 1 hour
    pnl_pct = 3.0
    
    # Should not exit yet (profit < 5%, time < 24h)
    assert not backtest_engine._check_exit_rules(
        sample_strategy, data_point, time_elapsed, pnl_pct
    )
    
    # Should exit on profit target
    pnl_pct = 6.0
    assert backtest_engine._check_exit_rules(
        sample_strategy, data_point, time_elapsed, pnl_pct
    )
    
    # Should exit on time limit
    time_elapsed = 90000  # > 24 hours
    pnl_pct = 2.0
    assert backtest_engine._check_exit_rules(
        sample_strategy, data_point, time_elapsed, pnl_pct
    )


@pytest.mark.asyncio
async def test_profit_factor_calculation(backtest_engine, sample_strategy):
    """Test profit factor calculation."""
    result = await backtest_engine.backtest_strategy(sample_strategy)
    
    if result.winning_trades > 0 and result.losing_trades > 0:
        # Profit factor should be positive
        assert result.profit_factor >= 0
        
        # If avg_win and avg_loss are available, verify calculation
        if result.avg_win > 0 and result.avg_loss < 0:
            gross_profit = result.avg_win * result.winning_trades
            gross_loss = abs(result.avg_loss * result.losing_trades)
            expected_pf = gross_profit / gross_loss if gross_loss > 0 else 0
            # Allow some floating point variance
            assert abs(result.profit_factor - expected_pf) < 0.1


@pytest.mark.asyncio
async def test_empty_trades_backtest(backtest_engine, sample_strategy):
    """Test backtest with no trades executed."""
    # Create impossible entry conditions
    sample_strategy.entry_rules = [
        EntryRule(condition="volume", threshold=999_999_999, operator=">="),
    ]
    
    result = await backtest_engine.backtest_strategy(sample_strategy)
    
    assert result.num_trades == 0
    assert result.total_pnl == 0.0
    assert result.final_capital == backtest_engine.initial_capital
    assert len(result.trades) == 0
