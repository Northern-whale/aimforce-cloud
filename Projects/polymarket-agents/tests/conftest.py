"""Shared test fixtures."""

from __future__ import annotations

import pytest

from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.message_bus import MessageBus


@pytest.fixture
def config() -> PolymarketConfig:
    return PolymarketConfig(mock_mode=True)


@pytest.fixture
def bus() -> MessageBus:
    return MessageBus()
