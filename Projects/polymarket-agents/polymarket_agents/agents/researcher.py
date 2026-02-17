"""Research & Sources Agent — finds relevant information for markets."""

from __future__ import annotations

import re
from datetime import datetime

from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.base_agent import BaseAgent
from polymarket_agents.core.message_bus import MessageBus
from polymarket_agents.core.models import AgentMessage, SourceDossier, SourceEntry


# Curated sources for Phase 1 (structured lookup, no LLM)
_POLYMARKET_SOURCES: list[SourceEntry] = [
    SourceEntry(
        url="https://github.com/Polymarket/py-clob-client",
        title="Polymarket Python CLOB Client",
        source_type="repo",
        relevance="Official Python client for CLOB API — order placement, market data",
        pros=["official", "actively maintained", "well-documented"],
        cons=["sync only, needs async wrapper"],
        license="MIT",
    ),
    SourceEntry(
        url="https://github.com/Polymarket/clob-client",
        title="Polymarket TypeScript CLOB Client",
        source_type="repo",
        relevance="Official TS client for CLOB API — reference implementation",
        pros=["official", "comprehensive"],
        cons=["TypeScript only"],
        license="MIT",
    ),
    SourceEntry(
        url="https://docs.polymarket.com/",
        title="Polymarket Documentation",
        source_type="docs",
        relevance="Official API documentation, market mechanics, fee structure",
        pros=["authoritative", "up-to-date"],
    ),
    SourceEntry(
        url="https://github.com/Polymarket/agents",
        title="Polymarket Agents Framework",
        source_type="repo",
        relevance="Official agent framework for autonomous trading on Polymarket",
        pros=["official reference architecture", "includes market analysis patterns"],
        cons=["opinionated design, may not match our architecture"],
        license="MIT",
    ),
    SourceEntry(
        url="https://gamma-api.polymarket.com/",
        title="Gamma API",
        source_type="docs",
        relevance="Market discovery, metadata, event information",
        pros=["no authentication needed for reads"],
    ),
]

# Tag-to-source mapping for topic-specific research
_TOPIC_SOURCES: dict[str, list[SourceEntry]] = {
    "crypto": [
        SourceEntry(
            url="https://www.coingecko.com/",
            title="CoinGecko",
            source_type="docs",
            relevance="Cryptocurrency price data and market metrics",
            pros=["comprehensive", "free API"],
        ),
    ],
    "politics": [
        SourceEntry(
            url="https://projects.fivethirtyeight.com/polls/",
            title="FiveThirtyEight Polls",
            source_type="docs",
            relevance="Political polling data and analysis",
            pros=["data-driven", "historical data"],
        ),
    ],
    "macro": [
        SourceEntry(
            url="https://fred.stlouisfed.org/",
            title="FRED Economic Data",
            source_type="docs",
            relevance="Federal Reserve economic data — rates, GDP, employment",
            pros=["authoritative", "free API", "comprehensive"],
        ),
    ],
}


class ResearcherAgent(BaseAgent):
    """Finds relevant repos, docs, data sources for markets on the watchlist.

    Phase 1: Structured lookup against curated sources.
    Phase 2: LLM-powered web search and analysis.
    """

    def __init__(self, config: PolymarketConfig, bus: MessageBus):
        super().__init__("researcher", config, bus)
        self._pending_requests: list[dict] = []

    async def run_cycle(self) -> None:
        """Process any pending research requests."""
        while self._pending_requests:
            req = self._pending_requests.pop(0)
            dossier = await self.research_market(
                req["market_id"], req["question"], req.get("tags", [])
            )
            await self.send("nova", "dossier", dossier.model_dump(mode="json"),
                            correlation_id=req.get("correlation_id", ""))

    async def research_market(self, market_id: str, question: str,
                               tags: list[str] | None = None) -> SourceDossier:
        """Build a source dossier for a given market question."""
        self.logger.info(f"Researching market {market_id}: {question}")

        sources: list[SourceEntry] = []

        # Always include core Polymarket sources
        sources.extend(_POLYMARKET_SOURCES)

        # Add topic-specific sources based on tags
        for tag in (tags or []):
            if tag in _TOPIC_SOURCES:
                sources.extend(_TOPIC_SOURCES[tag])

        # Generate relevance-scored summary
        summary = self._summarize(question, sources)

        return SourceDossier(
            market_id=market_id,
            sources=sources,
            summary=summary,
        )

    def _summarize(self, question: str, sources: list[SourceEntry]) -> str:
        """Generate a brief summary of available sources."""
        repo_count = sum(1 for s in sources if s.source_type == "repo")
        doc_count = sum(1 for s in sources if s.source_type == "docs")
        return (
            f"Found {len(sources)} relevant sources ({repo_count} repos, {doc_count} docs) "
            f"for: {question}"
        )

    async def on_message(self, message: AgentMessage) -> None:
        if message.msg_type == "research_request":
            self._pending_requests.append({
                "market_id": message.payload.get("market_id", ""),
                "question": message.payload.get("question", ""),
                "tags": message.payload.get("tags", []),
                "correlation_id": message.correlation_id,
            })
            await self.run_cycle()
