"""Nova — Orchestrator / Portfolio Governor.

Owns the daily cycle, assigns work, reviews outputs, and compiles reports.
Phase 2: Coordinates Strategy Engineer and Backtesting workflow.
"""

from __future__ import annotations

import asyncio
from datetime import datetime

from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.base_agent import BaseAgent
from polymarket_agents.core.logger import AuditLogger
from polymarket_agents.core.message_bus import MessageBus
from polymarket_agents.core.models import (
    AgentMessage,
    BacktestResult,
    Opportunity,
    SourceDossier,
    Strategy,
)
from polymarket_agents.utils.formatting import format_daily_report


class NovaOrchestrator(BaseAgent):
    """Central orchestrator. Runs the daily cycle and coordinates all agents."""

    def __init__(self, config: PolymarketConfig, bus: MessageBus):
        super().__init__("nova", config, bus)
        self.audit = AuditLogger(config.audit_log_path)
        self.watchlist: list[Opportunity] = []
        self.dossiers: list[SourceDossier] = []
        self.strategies: list[Strategy] = []
        self.backtest_results: list[BacktestResult] = []
        self._expected_dossiers = 0
        self._cycle_done: asyncio.Event = asyncio.Event()

    async def run_cycle(self) -> str:
        """Execute one full daily cycle:
        1. Trigger scanner
        2. Wait for watchlist
        3. Request research for top N opportunities
        4. Wait for all dossiers
        5. Compile and return daily report
        """
        self.logger.info("=== Starting daily cycle ===")
        self.audit.log("nova", "cycle_start", {"phase": 1})

        self.watchlist = []
        self.dossiers = []
        self._cycle_done.clear()

        # Step 1: Trigger scan
        await self.send("scanner", "scan_request", {})

        # Steps 2-4 are driven by on_message callbacks.
        # Wait for the cycle to complete (all dossiers received).
        try:
            await asyncio.wait_for(self._cycle_done.wait(), timeout=120)
        except asyncio.TimeoutError:
            self.logger.warning("Cycle timed out waiting for agent responses")

        # Step 5: Compile report
        report = format_daily_report(self.watchlist, self.dossiers)
        self.audit.log("nova", "cycle_complete", {
            "opportunities": len(self.watchlist),
            "dossiers": len(self.dossiers),
        })
        self.logger.info("=== Daily cycle complete ===")
        return report

    async def on_message(self, message: AgentMessage) -> None:
        if message.msg_type == "watchlist":
            await self._handle_watchlist(message)
        elif message.msg_type == "dossier":
            await self._handle_dossier(message)
        elif message.msg_type == "strategies_ready":
            await self._handle_strategies(message)
        elif message.msg_type == "backtest_complete":
            await self._handle_backtest_results(message)

    async def _handle_watchlist(self, message: AgentMessage) -> None:
        """Process watchlist from Scanner, dispatch research requests."""
        raw_opps = message.payload.get("opportunities", [])
        self.watchlist = [Opportunity.model_validate(o) for o in raw_opps]
        self.logger.info(f"Received watchlist with {len(self.watchlist)} opportunities")

        self.audit.log("nova", "watchlist_received", {
            "count": len(self.watchlist),
            "top_scores": [o.score for o in self.watchlist[:5]],
        })

        # Request research for top N
        top_n = self.watchlist[:self.config.research_top_n]
        self._expected_dossiers = len(top_n)

        if self._expected_dossiers == 0:
            self._cycle_done.set()
            return

        for opp in top_n:
            await self.send("researcher", "research_request", {
                "market_id": opp.market.condition_id,
                "question": opp.market.question,
                "tags": opp.market.tags,
            })

    async def _handle_dossier(self, message: AgentMessage) -> None:
        """Accumulate research dossiers; complete cycle when all received."""
        dossier = SourceDossier.model_validate(message.payload)
        self.dossiers.append(dossier)
        self.logger.info(
            f"Received dossier {len(self.dossiers)}/{self._expected_dossiers}: "
            f"{dossier.market_id}"
        )

        self.audit.log("nova", "dossier_received", {
            "market_id": dossier.market_id,
            "source_count": len(dossier.sources),
            "progress": f"{len(self.dossiers)}/{self._expected_dossiers}",
        })

        if len(self.dossiers) >= self._expected_dossiers:
            self._cycle_done.set()

    async def _handle_strategies(self, message: AgentMessage) -> None:
        """Process strategies from Strategy Engineer."""
        strategies_data = message.payload.get("strategies", [])
        self.strategies = [Strategy.model_validate(s) for s in strategies_data]
        
        self.logger.info(f"Received {len(self.strategies)} strategies from Strategy Engineer")
        self.audit.log("nova", "strategies_received", {
            "count": len(self.strategies),
            "types": [s.strategy_type.value for s in self.strategies],
        })
        
        # Note: Backtesting is now handled by main loop, not here
        # (to keep Nova focused on orchestration, not computation)

    async def _handle_backtest_results(self, message: AgentMessage) -> None:
        """Process backtest results."""
        results_data = message.payload.get("results", [])
        self.backtest_results = [BacktestResult.model_validate(r) for r in results_data]
        
        self.logger.info(f"Received {len(self.backtest_results)} backtest results")
        self.audit.log("nova", "backtest_results_received", {
            "count": len(self.backtest_results),
            "avg_win_rate": sum(r.win_rate for r in self.backtest_results) / len(self.backtest_results) if self.backtest_results else 0,
        })
