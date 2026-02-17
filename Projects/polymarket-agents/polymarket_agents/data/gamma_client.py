"""Gamma REST API client for market discovery and metadata."""

from __future__ import annotations

import httpx

from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.models import Market, MarketStatus, Token


class GammaClient:
    """Fetches market data from the Gamma API. Falls back to mock in mock_mode."""

    def __init__(self, config: PolymarketConfig):
        self.config = config
        if config.mock_mode:
            from polymarket_agents.data.mock.mock_gamma import MockGammaClient
            self._mock = MockGammaClient()
        else:
            self._mock = None
            self._http = httpx.AsyncClient(
                base_url=config.gamma_host,
                timeout=30,
            )

    async def get_active_markets(self, limit: int = 100, offset: int = 0) -> list[Market]:
        if self._mock:
            return await self._mock.get_active_markets(limit, offset)

        resp = await self._http.get("/events", params={
            "limit": limit,
            "offset": offset,
            "active": True,
        })
        resp.raise_for_status()
        markets = []
        for event in resp.json():
            for mkt in event.get("markets", [event]):
                markets.append(self._parse_market(mkt))
        return markets[:limit]

    async def get_market_by_slug(self, slug: str) -> Market | None:
        if self._mock:
            return await self._mock.get_market_by_slug(slug)

        resp = await self._http.get(f"/events/slug/{slug}")
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return self._parse_market(resp.json())

    async def get_markets_by_tag(self, tag: str) -> list[Market]:
        if self._mock:
            return await self._mock.get_markets_by_tag(tag)

        resp = await self._http.get("/events", params={"tag": tag})
        resp.raise_for_status()
        return [self._parse_market(m) for m in resp.json()]

    def _parse_market(self, data: dict) -> Market:
        tokens = []
        for t in data.get("tokens", []):
            tokens.append(Token(
                token_id=t.get("token_id", ""),
                outcome=t.get("outcome", ""),
            ))
        return Market(
            condition_id=data.get("condition_id", data.get("id", "")),
            question=data.get("question", ""),
            slug=data.get("slug", ""),
            tokens=tokens,
            status=MarketStatus(data.get("active", "active") if isinstance(data.get("active"), str) else "active"),
            volume=float(data.get("volume", 0)),
            liquidity=float(data.get("liquidity", 0)),
            end_date=None,
            tags=data.get("tags", []),
        )

    async def close(self) -> None:
        if not self._mock and hasattr(self, "_http"):
            await self._http.aclose()
