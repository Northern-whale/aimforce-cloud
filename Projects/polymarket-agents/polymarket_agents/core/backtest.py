"""Backtesting engine for strategy evaluation.

Simulates historical trades, calculates performance metrics.
Uses mock historical data for Phase 2 (real historical data later).
"""

from __future__ import annotations

import logging
import math
from datetime import datetime, timedelta
from typing import List

from polymarket_agents.core.models import (
    BacktestResult,
    BacktestTrade,
    Strategy,
)

logger = logging.getLogger(__name__)


class BacktestEngine:
    """Simulates strategy performance on historical data."""

    def __init__(self, initial_capital: float = 10_000.0):
        self.initial_capital = initial_capital
        self.logger = logger

    async def backtest_strategy(
        self,
        strategy: Strategy,
        historical_data: list[dict] | None = None,
    ) -> BacktestResult:
        """
        Backtest a strategy on historical data.
        
        Args:
            strategy: Strategy to test
            historical_data: List of price/volume snapshots (mock for Phase 2)
        
        Returns:
            BacktestResult with performance metrics
        """
        self.logger.info(f"Backtesting strategy {strategy.strategy_id} ({strategy.strategy_type})")
        
        # Generate mock historical data if none provided
        if historical_data is None:
            historical_data = self._generate_mock_data(strategy)
        
        # Simulate trades
        trades = self._simulate_trades(strategy, historical_data)
        
        # Calculate metrics
        result = self._calculate_metrics(strategy, trades)
        
        self.logger.info(
            f"Backtest complete: {result.num_trades} trades, "
            f"{result.win_rate:.1f}% win rate, "
            f"{result.total_pnl_pct:.2f}% return"
        )
        
        return result

    def _generate_mock_data(self, strategy: Strategy) -> list[dict]:
        """Generate synthetic historical price data for testing."""
        # Mock 60 days of hourly data
        data_points = 60 * 24  # hourly for 60 days
        
        # Starting price around 0.5 (50% probability)
        base_price = 0.50
        
        historical_data = []
        current_time = datetime.utcnow() - timedelta(days=60)
        
        # Simulate random walk with trend based on strategy type
        price = base_price
        volume = 100_000.0
        
        for i in range(data_points):
            # Add randomness
            import random
            
            # Price movement
            if strategy.strategy_type.value == "momentum":
                # Trending market
                drift = 0.0002
                volatility = 0.01
            elif strategy.strategy_type.value == "mean_reversion":
                # Mean-reverting market
                drift = -0.0001 * (price - base_price)
                volatility = 0.015
            else:  # arbitrage
                drift = 0.0
                volatility = 0.02
            
            change = drift + volatility * (random.random() - 0.5)
            price = max(0.01, min(0.99, price + change))
            
            # Volume variation
            volume = max(10_000, volume * (1 + 0.1 * (random.random() - 0.5)))
            
            # Spread simulation
            spread = 0.01 + 0.03 * random.random()
            
            historical_data.append({
                "timestamp": current_time,
                "price": price,
                "volume": volume,
                "spread": spread,
                "liquidity": volume * 0.5,
            })
            
            current_time += timedelta(hours=1)
        
        return historical_data

    def _simulate_trades(
        self,
        strategy: Strategy,
        historical_data: list[dict],
    ) -> list[BacktestTrade]:
        """Simulate trades based on strategy rules."""
        trades: list[BacktestTrade] = []
        
        in_position = False
        entry_price = 0.0
        entry_time = datetime.utcnow()
        position_capital = self.initial_capital * strategy.position_size
        
        for i, data_point in enumerate(historical_data):
            price = data_point["price"]
            timestamp = data_point["timestamp"]
            volume = data_point["volume"]
            spread = data_point["spread"]
            
            if not in_position:
                # Check entry conditions
                if self._check_entry_rules(strategy, data_point):
                    in_position = True
                    entry_price = price
                    entry_time = timestamp
                    self.logger.debug(f"Entry at {price:.4f} on {timestamp}")
            else:
                # Check exit conditions
                time_elapsed = (timestamp - entry_time).total_seconds()
                pnl_pct = ((price - entry_price) / entry_price) * 100
                
                should_exit = False
                exit_reason = ""
                
                # Check exit rules
                if self._check_exit_rules(strategy, data_point, time_elapsed, pnl_pct):
                    should_exit = True
                    exit_reason = "rule_triggered"
                
                # Check stop loss
                if pnl_pct <= -strategy.max_loss_pct:
                    should_exit = True
                    exit_reason = "stop_loss"
                
                # Check take profit
                if pnl_pct >= strategy.max_gain_pct:
                    should_exit = True
                    exit_reason = "take_profit"
                
                if should_exit:
                    pnl = position_capital * (pnl_pct / 100)
                    
                    trade = BacktestTrade(
                        entry_time=entry_time,
                        exit_time=timestamp,
                        entry_price=entry_price,
                        exit_price=price,
                        position_size=position_capital,
                        pnl=pnl,
                        pnl_pct=pnl_pct,
                        reason=exit_reason,
                    )
                    trades.append(trade)
                    
                    in_position = False
                    self.logger.debug(
                        f"Exit at {price:.4f} on {timestamp}: "
                        f"PnL={pnl_pct:.2f}% ({exit_reason})"
                    )
        
        return trades

    def _check_entry_rules(self, strategy: Strategy, data_point: dict) -> bool:
        """Evaluate entry conditions."""
        for rule in strategy.entry_rules:
            value = data_point.get(rule.condition.replace("_24h", ""), 0)
            
            if rule.operator == ">=":
                if value < rule.threshold:
                    return False
            elif rule.operator == "<=":
                if value > rule.threshold:
                    return False
            elif rule.operator == ">":
                if value <= rule.threshold:
                    return False
            elif rule.operator == "<":
                if value >= rule.threshold:
                    return False
        
        return True

    def _check_exit_rules(
        self,
        strategy: Strategy,
        data_point: dict,
        time_elapsed: float,
        pnl_pct: float,
    ) -> bool:
        """Evaluate exit conditions."""
        for rule in strategy.exit_rules:
            if "time_elapsed" in rule.condition:
                value = time_elapsed
            elif "profit_pct" in rule.condition:
                value = pnl_pct
            else:
                value = data_point.get(rule.condition, 0)
            
            if rule.operator == ">=":
                if value >= rule.threshold:
                    return True
            elif rule.operator == "<=":
                if value <= rule.threshold:
                    return True
        
        return False

    def _calculate_metrics(
        self,
        strategy: Strategy,
        trades: list[BacktestTrade],
    ) -> BacktestResult:
        """Calculate comprehensive performance metrics."""
        if not trades:
            # No trades executed
            return BacktestResult(
                strategy_id=strategy.strategy_id,
                start_date=datetime.utcnow() - timedelta(days=60),
                end_date=datetime.utcnow(),
                initial_capital=self.initial_capital,
                final_capital=self.initial_capital,
                total_pnl=0.0,
                total_pnl_pct=0.0,
            )
        
        # Basic stats
        total_pnl = sum(t.pnl for t in trades)
        final_capital = self.initial_capital + total_pnl
        total_pnl_pct = (total_pnl / self.initial_capital) * 100
        
        # Win/loss stats
        winning_trades = [t for t in trades if t.pnl > 0]
        losing_trades = [t for t in trades if t.pnl < 0]
        
        num_wins = len(winning_trades)
        num_losses = len(losing_trades)
        win_rate = (num_wins / len(trades)) * 100 if trades else 0
        
        avg_win = sum(t.pnl for t in winning_trades) / num_wins if num_wins > 0 else 0
        avg_loss = sum(t.pnl for t in losing_trades) / num_losses if num_losses > 0 else 0
        
        # Profit factor
        gross_profit = sum(t.pnl for t in winning_trades)
        gross_loss = abs(sum(t.pnl for t in losing_trades))
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else 0
        
        # Drawdown calculation
        max_dd, max_dd_duration = self._calculate_drawdown(trades)
        
        # Sharpe ratio (simplified: assuming risk-free rate = 0)
        returns = [t.pnl_pct for t in trades]
        sharpe = self._calculate_sharpe(returns)
        
        # Sortino ratio (only penalize downside volatility)
        sortino = self._calculate_sortino(returns)
        
        return BacktestResult(
            strategy_id=strategy.strategy_id,
            start_date=trades[0].entry_time if trades else datetime.utcnow(),
            end_date=trades[-1].exit_time if trades else datetime.utcnow(),
            initial_capital=self.initial_capital,
            final_capital=final_capital,
            total_pnl=total_pnl,
            total_pnl_pct=total_pnl_pct,
            num_trades=len(trades),
            winning_trades=num_wins,
            losing_trades=num_losses,
            win_rate=win_rate,
            avg_win=avg_win,
            avg_loss=avg_loss,
            profit_factor=profit_factor,
            max_drawdown=max_dd,
            max_drawdown_duration_days=max_dd_duration,
            sharpe_ratio=sharpe,
            sortino_ratio=sortino,
            trades=trades,
        )

    def _calculate_drawdown(self, trades: list[BacktestTrade]) -> tuple[float, int]:
        """Calculate maximum drawdown and its duration."""
        if not trades:
            return 0.0, 0
        
        # Build equity curve
        capital = self.initial_capital
        equity_curve = [capital]
        
        for trade in trades:
            capital += trade.pnl
            equity_curve.append(capital)
        
        # Find max drawdown
        peak = equity_curve[0]
        max_dd = 0.0
        max_dd_duration = 0
        current_dd_start = 0
        
        for i, equity in enumerate(equity_curve):
            if equity > peak:
                peak = equity
                current_dd_start = i
            else:
                dd_pct = ((peak - equity) / peak) * 100
                if dd_pct > max_dd:
                    max_dd = dd_pct
                    max_dd_duration = i - current_dd_start
        
        # Convert duration from trades to days (approximate)
        if trades and max_dd_duration > 0:
            avg_trade_duration = sum(
                (t.exit_time - t.entry_time).total_seconds() for t in trades
            ) / len(trades)
            max_dd_duration = int((max_dd_duration * avg_trade_duration) / 86400)
        
        return max_dd, max_dd_duration

    def _calculate_sharpe(self, returns: list[float]) -> float:
        """Calculate Sharpe ratio (annualized)."""
        if not returns or len(returns) < 2:
            return 0.0
        
        mean_return = sum(returns) / len(returns)
        variance = sum((r - mean_return) ** 2 for r in returns) / len(returns)
        std_dev = math.sqrt(variance)
        
        if std_dev == 0:
            return 0.0
        
        # Annualize (assume trades are daily for simplification)
        sharpe = (mean_return / std_dev) * math.sqrt(252)
        
        return sharpe

    def _calculate_sortino(self, returns: list[float]) -> float:
        """Calculate Sortino ratio (only penalize downside volatility)."""
        if not returns or len(returns) < 2:
            return 0.0
        
        mean_return = sum(returns) / len(returns)
        
        # Only consider negative returns for downside deviation
        downside_returns = [r for r in returns if r < 0]
        
        if not downside_returns:
            return 0.0
        
        downside_variance = sum(r ** 2 for r in downside_returns) / len(downside_returns)
        downside_dev = math.sqrt(downside_variance)
        
        if downside_dev == 0:
            return 0.0
        
        # Annualize
        sortino = (mean_return / downside_dev) * math.sqrt(252)
        
        return sortino
