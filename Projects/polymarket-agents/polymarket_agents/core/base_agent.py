"""Abstract base class for all agents."""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod

from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.message_bus import MessageBus
from polymarket_agents.core.models import AgentMessage


class BaseAgent(ABC):
    """Every agent inherits from this. Provides bus integration, logging, lifecycle."""

    def __init__(self, name: str, config: PolymarketConfig, bus: MessageBus):
        self.name = name
        self.config = config
        self.bus = bus
        self.logger = logging.getLogger(f"agent.{name}")
        self._running = False
        self.bus.subscribe(self.name, self.on_message)

    @abstractmethod
    async def run_cycle(self) -> None:
        """Execute one work cycle."""
        ...

    @abstractmethod
    async def on_message(self, message: AgentMessage) -> None:
        """Handle an incoming message from the bus."""
        ...

    async def send(self, recipient: str, msg_type: str, payload: dict,
                   correlation_id: str = "") -> None:
        msg = AgentMessage(
            sender=self.name,
            recipient=recipient,
            msg_type=msg_type,
            payload=payload,
            correlation_id=correlation_id,
        )
        await self.bus.publish(msg)

    async def start(self) -> None:
        self._running = True
        self.logger.info(f"Agent '{self.name}' started")

    async def stop(self) -> None:
        self._running = False
        self.logger.info(f"Agent '{self.name}' stopped")
