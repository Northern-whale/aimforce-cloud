"""WebSocket feed for real-time market updates.

Phase 1: polling stub that uses REST endpoints on a timer.
Phase 2: real WebSocket connection to CLOB WS endpoint.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Awaitable, Callable

from polymarket_agents.config import PolymarketConfig
from polymarket_agents.data.clob_client import ClobDataClient

logger = logging.getLogger(__name__)
UpdateCallback = Callable[[dict], Awaitable[None]]


class WebSocketFeed:
    """
    Real-time WebSocket feed for Polymarket CLOB.
    
    Falls back to polling mode if WebSocket connection fails.
    WebSocket endpoint: wss://ws-subscriptions-clob.polymarket.com/ws/market
    """

    def __init__(self, config: PolymarketConfig, clob: ClobDataClient):
        self.config = config
        self._clob = clob
        self._callbacks: list[UpdateCallback] = []
        self._token_ids: list[str] = []
        self._running = False
        self._poll_interval = 30  # seconds (fallback mode)
        self._ws_url = "wss://ws-subscriptions-clob.polymarket.com/ws/market"
        self._use_polling_fallback = True  # Phase 2: Start with fallback, add real WS optionally

    def on_update(self, callback: UpdateCallback) -> None:
        """Register a callback for market updates."""
        self._callbacks.append(callback)

    async def subscribe(self, token_ids: list[str]) -> None:
        """Subscribe to market updates for given token IDs."""
        self._token_ids = list(set(self._token_ids + token_ids))
        logger.info(f"Subscribed to {len(self._token_ids)} markets")

    async def start(self) -> None:
        """Start the feed (WebSocket or polling fallback)."""
        self._running = True
        
        # Try WebSocket first, fall back to polling if it fails
        if not self._use_polling_fallback:
            try:
                await self._start_websocket()
            except Exception as e:
                logger.warning(f"WebSocket connection failed: {e}. Falling back to polling mode.")
                self._use_polling_fallback = True
        
        if self._use_polling_fallback:
            await self._start_polling()

    async def _start_websocket(self) -> None:
        """Start real WebSocket connection (requires websockets library)."""
        try:
            import websockets
        except ImportError:
            logger.error("websockets library not installed. Install with: pip install websockets")
            raise
        
        logger.info(f"Connecting to WebSocket: {self._ws_url}")
        
        async with websockets.connect(self._ws_url) as websocket:
            # Subscribe to markets
            for token_id in self._token_ids:
                subscribe_msg = {
                    "type": "subscribe",
                    "market": token_id,
                    "assets": ["orderbook"],
                }
                await websocket.send(json.dumps(subscribe_msg))
                logger.debug(f"Subscribed to market {token_id}")
            
            logger.info("WebSocket feed started")
            
            # Listen for updates
            while self._running:
                try:
                    message = await asyncio.wait_for(
                        websocket.recv(),
                        timeout=60.0
                    )
                    
                    data = json.loads(message)
                    
                    # Parse update and notify callbacks
                    update = self._parse_ws_message(data)
                    if update:
                        for cb in self._callbacks:
                            await cb(update)
                    
                except asyncio.TimeoutError:
                    # Send ping to keep connection alive
                    await websocket.ping()
                except Exception as e:
                    logger.error(f"WebSocket error: {e}")
                    # Reconnect logic
                    await asyncio.sleep(5)
                    raise  # Re-raise to trigger reconnection

    def _parse_ws_message(self, data: dict) -> dict | None:
        """Parse WebSocket message into standard update format."""
        # Polymarket WS message format (simplified):
        # {"event": "orderbook", "market": "token_id", "data": {...}}
        
        if data.get("event") == "orderbook":
            token_id = data.get("market", "")
            orderbook_data = data.get("data", {})
            
            bids = orderbook_data.get("bids", [])
            asks = orderbook_data.get("asks", [])
            
            best_bid = float(bids[0]["price"]) if bids else 0.0
            best_ask = float(asks[0]["price"]) if asks else 1.0
            midpoint = (best_bid + best_ask) / 2
            spread = best_ask - best_bid
            
            return {
                "type": "orderbook",
                "token_id": token_id,
                "midpoint": midpoint,
                "spread": spread,
                "best_bid": best_bid,
                "best_ask": best_ask,
            }
        
        return None

    async def _start_polling(self) -> None:
        """Fallback: poll REST API for updates."""
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
        """Stop the feed."""
        self._running = False
        logger.info("WebSocket feed stopped")
