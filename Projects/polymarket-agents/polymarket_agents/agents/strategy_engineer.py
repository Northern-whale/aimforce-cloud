"""Strategy Engineer Agent — generates trading strategies from market opportunities.

Phase 2: Heuristic-based strategy generation (no LLM).
Analyzes Scanner watchlist and generates:
- Mean reversion strategies
- Momentum strategies  
- Arbitrage strategies
"""

from __future__ import annotations

from datetime import datetime, timedelta

from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.base_agent import BaseAgent
from polymarket_agents.core.message_bus import MessageBus
from polymarket_agents.core.models import (
    AgentMessage,
    EntryRule,
    ExitRule,
    Opportunity,
    Strategy,
    StrategyType,
)


class StrategyEngineer(BaseAgent):
    """Analyzes opportunities and generates heuristic trading strategies."""

    def __init__(self, config: PolymarketConfig, bus: MessageBus):
        super().__init__("strategy_engineer", config, bus)
        self.opportunities: list[Opportunity] = []
        self.strategies: list[Strategy] = []

    async def run_cycle(self) -> None:
        """Generate strategies from current opportunity set."""
        if not self.opportunities:
            self.logger.info("No opportunities to analyze")
            return

        self.logger.info(f"Analyzing {len(self.opportunities)} opportunities for strategy generation")
        
        new_strategies: list[Strategy] = []
        
        for opp in self.opportunities:
            # Generate multiple strategy types for each opportunity
            strategies_for_opp = []
            
            # 1. Mean Reversion Strategy
            if "high_turnover" in opp.reasons and opp.orderbook:
                mr_strategy = self._create_mean_reversion_strategy(opp)
                if mr_strategy:
                    strategies_for_opp.append(mr_strategy)
            
            # 2. Momentum Strategy
            if "high_volume" in opp.reasons:
                momentum_strategy = self._create_momentum_strategy(opp)
                if momentum_strategy:
                    strategies_for_opp.append(momentum_strategy)
            
            # 3. Arbitrage Strategy (spread-based)
            if opp.orderbook and opp.orderbook.spread > 0.02:
                arb_strategy = self._create_arbitrage_strategy(opp)
                if arb_strategy:
                    strategies_for_opp.append(arb_strategy)
            
            new_strategies.extend(strategies_for_opp)
        
        self.strategies = new_strategies
        self.logger.info(f"Generated {len(self.strategies)} strategies")
        
        # Publish strategies to Nova for backtesting
        await self.send("nova", "strategies_ready", {
            "strategies": [s.model_dump(mode="json") for s in self.strategies],
            "count": len(self.strategies),
        })

    def _create_mean_reversion_strategy(self, opp: Opportunity) -> Strategy | None:
        """Mean reversion: buy when price deviates below midpoint, sell at reversion."""
        if not opp.orderbook or not opp.market.tokens:
            return None
        
        token_id = opp.market.tokens[0].token_id
        midpoint = opp.orderbook.midpoint
        spread = opp.orderbook.spread
        
        # Mean reversion only makes sense if there's sufficient spread
        if spread < 0.01:
            return None
        
        # Entry: price drops 2% below midpoint
        entry_threshold = midpoint * 0.98
        
        # Exit: price reverts to midpoint
        exit_threshold = midpoint
        
        strategy = Strategy(
            strategy_type=StrategyType.MEAN_REVERSION,
            market_id=opp.market.condition_id,
            token_id=token_id,
            entry_rules=[
                EntryRule(
                    condition="price_below_midpoint",
                    threshold=entry_threshold,
                    operator="<="
                ),
                EntryRule(
                    condition="spread",
                    threshold=0.01,
                    operator=">="
                )
            ],
            exit_rules=[
                ExitRule(
                    condition="price_at_midpoint",
                    threshold=exit_threshold,
                    operator=">="
                ),
                ExitRule(
                    condition="time_elapsed_seconds",
                    threshold=86400,  # 24 hours max hold
                    operator=">="
                )
            ],
            position_size=0.1,  # 10% of capital
            max_loss_pct=5.0,
            max_gain_pct=10.0,
            description=f"Mean reversion on {opp.market.question[:50]}... (spread={spread:.4f})",
            confidence=min(opp.score / 100, 0.9),
        )
        
        return strategy

    def _create_momentum_strategy(self, opp: Opportunity) -> Strategy | None:
        """Momentum: ride strong trends in high-volume markets."""
        if not opp.market.tokens:
            return None
        
        token_id = opp.market.tokens[0].token_id
        
        # Momentum requires high volume and liquidity
        if opp.market.volume < 500_000:
            return None
        
        # Entry: price shows upward momentum (simplified: volume + score)
        confidence = opp.score / 100
        
        strategy = Strategy(
            strategy_type=StrategyType.MOMENTUM,
            market_id=opp.market.condition_id,
            token_id=token_id,
            entry_rules=[
                EntryRule(
                    condition="volume_24h",
                    threshold=500_000,
                    operator=">="
                ),
                EntryRule(
                    condition="liquidity",
                    threshold=50_000,
                    operator=">="
                )
            ],
            exit_rules=[
                ExitRule(
                    condition="profit_pct",
                    threshold=15.0,
                    operator=">="
                ),
                ExitRule(
                    condition="volume_drop_pct",
                    threshold=30.0,  # exit if volume drops 30%
                    operator=">="
                )
            ],
            position_size=0.15,  # 15% of capital
            max_loss_pct=8.0,
            max_gain_pct=25.0,
            description=f"Momentum play on {opp.market.question[:50]}... (vol=${opp.market.volume:,.0f})",
            confidence=confidence,
        )
        
        return strategy

    def _create_arbitrage_strategy(self, opp: Opportunity) -> Strategy | None:
        """Arbitrage: exploit wide spreads."""
        if not opp.orderbook or not opp.market.tokens:
            return None
        
        token_id = opp.market.tokens[0].token_id
        spread = opp.orderbook.spread
        
        # Only viable if spread is wide enough to cover fees + slippage
        if spread < 0.02:  # 2% minimum
            return None
        
        # Entry: immediate execution at best ask
        # Exit: immediate sell at best bid (or wait for spread to narrow)
        
        strategy = Strategy(
            strategy_type=StrategyType.ARBITRAGE,
            market_id=opp.market.condition_id,
            token_id=token_id,
            entry_rules=[
                EntryRule(
                    condition="spread",
                    threshold=0.02,
                    operator=">="
                ),
                EntryRule(
                    condition="liquidity",
                    threshold=10_000,  # need liquidity for quick execution
                    operator=">="
                )
            ],
            exit_rules=[
                ExitRule(
                    condition="spread_narrowed",
                    threshold=0.01,  # exit when spread narrows
                    operator="<="
                ),
                ExitRule(
                    condition="time_elapsed_seconds",
                    threshold=3600,  # 1 hour max
                    operator=">="
                )
            ],
            position_size=0.2,  # 20% of capital (quick in/out)
            max_loss_pct=3.0,
            max_gain_pct=5.0,
            description=f"Arbitrage on {opp.market.question[:50]}... (spread={spread:.4f})",
            confidence=0.85 if spread > 0.05 else 0.7,
        )
        
        return strategy

    async def on_message(self, message: AgentMessage) -> None:
        """Handle incoming messages."""
        if message.msg_type == "watchlist":
            # Receive watchlist from Scanner
            opps_data = message.payload.get("opportunities", [])
            self.opportunities = [Opportunity.model_validate(o) for o in opps_data]
            self.logger.info(f"Received {len(self.opportunities)} opportunities from scanner")
            # Automatically run strategy generation
            await self.run_cycle()
        
        elif message.msg_type == "strategy_request":
            # Manual trigger from Nova
            await self.run_cycle()
