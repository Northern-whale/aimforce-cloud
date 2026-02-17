"""CLOB API client wrapper for order book and price data."""

from __future__ import annotations

from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.models import OrderBookSnapshot


class ClobDataClient:
    """Read-only CLOB client. Uses mock when config.mock_mode is True."""

    def __init__(self, config: PolymarketConfig):
        self.config = config
        if config.mock_mode:
            from polymarket_agents.data.mock.mock_clob import MockClobClient
            self._client = MockClobClient()
        else:
            from py_clob_client.client import ClobClient  # type: ignore[import-untyped]
            self._client = ClobClient(
                host=config.clob_host,
                chain_id=config.clob_chain_id,
            )

    async def get_orderbook(self, token_id: str) -> OrderBookSnapshot:
        if self.config.mock_mode:
            return await self._client.get_orderbook(token_id)
        # Real client returns sync — wrap it
        raw = self._client.get_order_book(token_id)
        bids = [(float(b["price"]), float(b["size"])) for b in raw.get("bids", [])]
        asks = [(float(a["price"]), float(a["size"])) for a in raw.get("asks", [])]
        best_bid = bids[0][0] if bids else 0.0
        best_ask = asks[0][0] if asks else 1.0
        from datetime import datetime
        return OrderBookSnapshot(
            token_id=token_id,
            timestamp=datetime.utcnow(),
            bids=bids,
            asks=asks,
            midpoint=(best_bid + best_ask) / 2,
            spread=best_ask - best_bid,
        )

    async def get_midpoint(self, token_id: str) -> float:
        ob = await self.get_orderbook(token_id)
        return ob.midpoint

    async def get_price(self, token_id: str, side: str) -> float:
        ob = await self.get_orderbook(token_id)
        if side == "buy":
            return ob.asks[0][0] if ob.asks else 1.0
        return ob.bids[0][0] if ob.bids else 0.0
