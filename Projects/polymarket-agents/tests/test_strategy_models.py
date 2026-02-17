"""Tests for Phase 2 strategy and backtesting models."""

from datetime import datetime, timedelta

import pytest
from polymarket_agents.core.models import (
    BacktestResult,
    BacktestTrade,
    EntryRule,
    ExitRule,
    MarketSignal,
    SignalType,
    Strategy,
    StrategyType,
)


def test_market_signal_creation():
    """Test MarketSignal model creation."""
    signal = MarketSignal(
        signal_type=SignalType.BUY,
        token_id="token123",
        market_id="market456",
        confidence=0.85,
        entry_price=0.55,
        reasoning="High volume + favorable spread",
    )
    
    assert signal.signal_type == SignalType.BUY
    assert signal.token_id == "token123"
    assert signal.confidence == 0.85
    assert signal.entry_price == 0.55
    assert isinstance(signal.generated_at, datetime)


def test_strategy_creation():
    """Test Strategy model with entry/exit rules."""
    entry_rules = [
        EntryRule(condition="spread", threshold=0.02, operator=">="),
        EntryRule(condition="volume_24h", threshold=100_000, operator=">="),
    ]
    
    exit_rules = [
        ExitRule(condition="profit_pct", threshold=10.0, operator=">="),
        ExitRule(condition="time_elapsed_seconds", threshold=86400, operator=">="),
    ]
    
    strategy = Strategy(
        strategy_type=StrategyType.MEAN_REVERSION,
        market_id="market123",
        token_id="token456",
        entry_rules=entry_rules,
        exit_rules=exit_rules,
        position_size=0.1,
        max_loss_pct=5.0,
        max_gain_pct=15.0,
        description="Mean reversion strategy",
        confidence=0.75,
    )
    
    assert strategy.strategy_type == StrategyType.MEAN_REVERSION
    assert len(strategy.entry_rules) == 2
    assert len(strategy.exit_rules) == 2
    assert strategy.position_size == 0.1
    assert strategy.max_loss_pct == 5.0
    assert strategy.strategy_id  # auto-generated


def test_backtest_trade():
    """Test BacktestTrade model."""
    now = datetime.utcnow()
    
    trade = BacktestTrade(
        entry_time=now,
        exit_time=now + timedelta(hours=24),
        entry_price=0.50,
        exit_price=0.55,
        position_size=1000.0,
        pnl=100.0,
        pnl_pct=10.0,
        reason="take_profit",
    )
    
    assert trade.entry_price == 0.50
    assert trade.exit_price == 0.55
    assert trade.pnl == 100.0
    assert trade.pnl_pct == 10.0
    assert trade.reason == "take_profit"


def test_backtest_result():
    """Test BacktestResult model with metrics."""
    start = datetime.utcnow() - timedelta(days=30)
    end = datetime.utcnow()
    
    trades = [
        BacktestTrade(
            entry_time=start,
            exit_time=start + timedelta(days=1),
            entry_price=0.50,
            exit_price=0.55,
            position_size=1000.0,
            pnl=100.0,
            pnl_pct=10.0,
            reason="take_profit",
        ),
        BacktestTrade(
            entry_time=start + timedelta(days=2),
            exit_time=start + timedelta(days=3),
            entry_price=0.60,
            exit_price=0.57,
            position_size=1000.0,
            pnl=-50.0,
            pnl_pct=-5.0,
            reason="stop_loss",
        ),
    ]
    
    result = BacktestResult(
        strategy_id="strat123",
        start_date=start,
        end_date=end,
        initial_capital=10_000.0,
        final_capital=10_050.0,
        total_pnl=50.0,
        total_pnl_pct=0.5,
        num_trades=2,
        winning_trades=1,
        losing_trades=1,
        win_rate=50.0,
        avg_win=100.0,
        avg_loss=-50.0,
        profit_factor=2.0,
        max_drawdown=5.0,
        max_drawdown_duration_days=1,
        sharpe_ratio=1.2,
        sortino_ratio=1.5,
        trades=trades,
    )
    
    assert result.strategy_id == "strat123"
    assert result.num_trades == 2
    assert result.winning_trades == 1
    assert result.losing_trades == 1
    assert result.win_rate == 50.0
    assert result.total_pnl == 50.0
    assert result.sharpe_ratio == 1.2
    assert len(result.trades) == 2


def test_strategy_types():
    """Test all strategy type enums."""
    assert StrategyType.MEAN_REVERSION.value == "mean_reversion"
    assert StrategyType.MOMENTUM.value == "momentum"
    assert StrategyType.ARBITRAGE.value == "arbitrage"
    assert StrategyType.LIQUIDITY_PROVISION.value == "liquidity_provision"


def test_signal_types():
    """Test all signal type enums."""
    assert SignalType.BUY.value == "buy"
    assert SignalType.SELL.value == "sell"
    assert SignalType.HOLD.value == "hold"
