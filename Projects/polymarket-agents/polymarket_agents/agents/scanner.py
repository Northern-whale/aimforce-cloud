"""Market Intelligence Agent — scans markets and ranks opportunities."""

from __future__ import annotations

from datetime import datetime

from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.base_agent import BaseAgent
from polymarket_agents.core.message_bus import MessageBus
from polymarket_agents.core.models import AgentMessage, Market, Opportunity
from polymarket_agents.data.clob_client import ClobDataClient
from polymarket_agents.data.gamma_client import GammaClient


class ScannerAgent(BaseAgent):
    """Watches markets, evaluates liquidity/spreads/catalysts, publishes ranked watchlist."""

    def __init__(self, config: PolymarketConfig, bus: MessageBus,
                 gamma: GammaClient, clob: ClobDataClient):
        super().__init__("scanner", config, bus)
        self.gamma = gamma
        self.clob = clob
        self.watchlist: list[Opportunity] = []

    async def run_cycle(self) -> None:
        self.logger.info("Starting market scan cycle")
        markets = await self.gamma.get_active_markets(limit=200)
        self.logger.info(f"Fetched {len(markets)} active markets")

        opportunities: list[Opportunity] = []
        for market in markets:
            score, reasons, missing = self._evaluate(market)
            if score >= self.config.min_opportunity_score:
                # Fetch order book for the first token
                ob = None
                if market.tokens:
                    try:
                        ob = await self.clob.get_orderbook(market.tokens[0].token_id)
                    except Exception as e:
                        self.logger.warning(f"Failed to get orderbook for {market.tokens[0].token_id}: {e}")
                        missing.append("orderbook_unavailable")

                opportunities.append(Opportunity(
                    market=market,
                    score=score,
                    reasons=reasons,
                    missing_data=missing,
                    orderbook=ob,
                ))

        self.watchlist = sorted(
            opportunities, key=lambda o: o.score, reverse=True
        )[:self.config.max_watchlist_size]

        self.logger.info(f"Watchlist: {len(self.watchlist)} opportunities (threshold={self.config.min_opportunity_score})")

        # Send watchlist to Nova (orchestrator)
        await self.send("nova", "watchlist", {
            "opportunities": [o.model_dump(mode="json") for o in self.watchlist],
        })
        
        # Send watchlist to Strategy Engineer (Phase 2)
        await self.send("strategy_engineer", "watchlist", {
            "opportunities": [o.model_dump(mode="json") for o in self.watchlist],
        })

    def _evaluate(self, market: Market) -> tuple[float, list[str], list[str]]:
        """Heuristic scoring based on volume, liquidity, time-to-expiry, and tags.

        Returns (score 0-100, list of reasons, list of missing data).
        """
        score = 0.0
        reasons: list[str] = []
        missing: list[str] = []

        # Volume score (0-30 points)
        if market.volume >= 1_000_000:
            score += 30
            reasons.append("high_volume")
        elif market.volume >= 500_000:
            score += 20
            reasons.append("medium_volume")
        elif market.volume >= 100_000:
            score += 10
            reasons.append("low_volume")
        else:
            missing.append("volume_too_low")

        # Liquidity score (0-25 points)
        if market.liquidity >= 200_000:
            score += 25
            reasons.append("deep_liquidity")
        elif market.liquidity >= 50_000:
            score += 15
            reasons.append("moderate_liquidity")
        elif market.liquidity > 0:
            score += 5
        else:
            missing.append("no_liquidity_data")

        # Time-to-expiry score (0-20 points): prefer markets expiring in 7-90 days
        if market.end_date:
            days_left = (market.end_date - datetime.utcnow()).days
            if 7 <= days_left <= 90:
                score += 20
                reasons.append(f"expiry_{days_left}d")
            elif 90 < days_left <= 180:
                score += 10
                reasons.append(f"expiry_{days_left}d")
            elif days_left < 7:
                score += 5
                reasons.append("expiring_soon")
        else:
            missing.append("no_end_date")

        # Tag bonus (0-15 points): high-interest categories
        high_interest_tags = {"crypto", "politics", "macro", "ai", "tech"}
        matching_tags = set(market.tags) & high_interest_tags
        if matching_tags:
            score += min(len(matching_tags) * 5, 15)
            reasons.append(f"tags:{','.join(matching_tags)}")

        # Activity bonus (0-10 points): volume/liquidity ratio as proxy for trading activity
        if market.liquidity > 0:
            turnover = market.volume / market.liquidity
            if turnover > 5:
                score += 10
                reasons.append("high_turnover")
            elif turnover > 2:
                score += 5

        return min(score, 100), reasons, missing

    async def on_message(self, message: AgentMessage) -> None:
        if message.msg_type == "scan_request":
            await self.run_cycle()
