"""In-process async message bus for agent communication."""

from __future__ import annotations

import asyncio
import logging
from typing import Awaitable, Callable

from polymarket_agents.core.models import AgentMessage

Handler = Callable[[AgentMessage], Awaitable[None]]
logger = logging.getLogger(__name__)


class MessageBus:
    """Simple pub/sub bus. Agents subscribe by name; messages are delivered async."""

    def __init__(self, max_history: int = 10_000):
        self._subscribers: dict[str, Handler] = {}
        self._history: list[AgentMessage] = []
        self._max_history = max_history

    def subscribe(self, agent_name: str, handler: Handler) -> None:
        self._subscribers[agent_name] = handler

    async def publish(self, message: AgentMessage) -> None:
        self._history.append(message)
        if len(self._history) > self._max_history:
            self._history = self._history[-self._max_history:]

        if message.recipient == "__broadcast__":
            for name, handler in self._subscribers.items():
                if name != message.sender:
                    await handler(message)
        elif message.recipient in self._subscribers:
            await self._subscribers[message.recipient](message)
        else:
            logger.warning(f"No subscriber for recipient: {message.recipient}")

    def get_history(self, limit: int = 100) -> list[AgentMessage]:
        return self._history[-limit:]
