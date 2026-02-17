"""WebSocket feed for real-time market updates.

Phase 1: polling stub that uses REST endpoints on a timer.
Phase 2: real WebSocket connection to CLOB WS endpoint.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Awaitable, Callable

from polymarket_agents.config import PolymarketConfig
from polymarket_agents.data.clob_client import ClobDataClient

logger = logging.getLogger(__name__)
UpdateCallback = Callable[[dict], Awaitable[None]]


class WebSocketFeed:
    """Polling-based stub. Same interface as a real WS feed."""

    def __init__(self, config: PolymarketConfig, clob: ClobDataClient):
        self.config = config
        self._clob = clob
        self._callbacks: list[UpdateCallback] = []
        self._token_ids: list[str] = []
        self._running = False
        self._poll_interval = 30  # seconds

    def on_update(self, callback: UpdateCallback) -> None:
        self._callbacks.append(callback)

    async def subscribe(self, token_ids: list[str]) -> None:
        self._token_ids = list(set(self._token_ids + token_ids))

    async def start(self) -> None:
        self._running = True
        logger.info(f"WebSocket feed started (polling mode, {self._poll_interval}s interval)")
        while self._running:
            for token_id in self._token_ids:
                try:
                    ob = await self._clob.get_orderbook(token_id)
                    update = {
                        "type": "orderbook",
                        "token_id": token_id,
                        "midpoint": ob.midpoint,
                        "spread": ob.spread,
                        "best_bid": ob.bids[0][0] if ob.bids else 0,
                        "best_ask": ob.asks[0][0] if ob.asks else 1,
                    }
                    for cb in self._callbacks:
                        await cb(update)
                except Exception as e:
                    logger.error(f"Feed poll error for {token_id}: {e}")
            await asyncio.sleep(self._poll_interval)

    async def stop(self) -> None:
        self._running = False
        logger.info("WebSocket feed stopped")
