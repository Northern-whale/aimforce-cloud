"""Mock CLOB client with realistic sample data."""

from __future__ import annotations

from datetime import datetime

from polymarket_agents.core.models import OrderBookSnapshot

# Realistic sample order books keyed by token_id
_MOCK_BOOKS: dict[str, dict] = {
    "tok_001_yes": {
        "bids": [(0.62, 500.0), (0.60, 1200.0), (0.58, 800.0), (0.55, 2000.0)],
        "asks": [(0.64, 450.0), (0.66, 900.0), (0.68, 1500.0), (0.70, 3000.0)],
    },
    "tok_001_no": {
        "bids": [(0.34, 400.0), (0.32, 1000.0), (0.30, 1800.0)],
        "asks": [(0.36, 500.0), (0.38, 1100.0), (0.40, 2500.0)],
    },
    "tok_002_yes": {
        "bids": [(0.45, 300.0), (0.43, 700.0), (0.40, 1500.0)],
        "asks": [(0.48, 350.0), (0.50, 800.0), (0.55, 2000.0)],
    },
    "tok_002_no": {
        "bids": [(0.50, 350.0), (0.48, 750.0), (0.45, 1600.0)],
        "asks": [(0.53, 400.0), (0.55, 900.0), (0.60, 2200.0)],
    },
    "tok_003_yes": {
        "bids": [(0.85, 200.0), (0.83, 500.0), (0.80, 1000.0)],
        "asks": [(0.87, 180.0), (0.90, 600.0), (0.92, 1200.0)],
    },
    "tok_003_no": {
        "bids": [(0.11, 150.0), (0.10, 400.0), (0.08, 900.0)],
        "asks": [(0.13, 200.0), (0.15, 500.0), (0.18, 1100.0)],
    },
}


class MockClobClient:
    """Returns pre-built order book data for testing."""

    async def get_orderbook(self, token_id: str) -> OrderBookSnapshot:
        book = _MOCK_BOOKS.get(token_id, {
            "bids": [(0.50, 100.0)],
            "asks": [(0.52, 100.0)],
        })
        bids = book["bids"]
        asks = book["asks"]
        best_bid = bids[0][0] if bids else 0.0
        best_ask = asks[0][0] if asks else 1.0
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
