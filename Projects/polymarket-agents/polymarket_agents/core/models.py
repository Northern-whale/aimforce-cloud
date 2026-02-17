"""Shared data models used across all agents and the data layer."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from uuid import uuid4

from pydantic import BaseModel, Field


class MarketStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    RESOLVED = "resolved"


class Token(BaseModel):
    token_id: str
    outcome: str


class Market(BaseModel):
    """Core market representation from Gamma API."""

    condition_id: str
    question: str
    slug: str
    tokens: list[Token] = Field(default_factory=list)
    status: MarketStatus = MarketStatus.ACTIVE
    volume: float = 0.0
    liquidity: float = 0.0
    end_date: datetime | None = None
    tags: list[str] = Field(default_factory=list)


class OrderBookSnapshot(BaseModel):
    """Point-in-time order book from CLOB."""

    token_id: str
    timestamp: datetime
    bids: list[tuple[float, float]] = Field(default_factory=list)  # (price, size)
    asks: list[tuple[float, float]] = Field(default_factory=list)
    midpoint: float = 0.0
    spread: float = 0.0


class Opportunity(BaseModel):
    """Scanner output: a tagged and scored opportunity."""

    market: Market
    score: float  # 0–100
    reasons: list[str] = Field(default_factory=list)
    missing_data: list[str] = Field(default_factory=list)
    orderbook: OrderBookSnapshot | None = None
    detected_at: datetime = Field(default_factory=datetime.utcnow)


class SourceEntry(BaseModel):
    url: str
    title: str
    source_type: str  # "repo", "paper", "blog", "docs", "news"
    relevance: str
    pros: list[str] = Field(default_factory=list)
    cons: list[str] = Field(default_factory=list)
    last_updated: datetime | None = None
    license: str | None = None


class SourceDossier(BaseModel):
    """Research Agent output for a given market."""

    market_id: str
    sources: list[SourceEntry] = Field(default_factory=list)
    summary: str = ""
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class AgentMessage(BaseModel):
    """Message passed between agents on the bus."""

    sender: str
    recipient: str  # agent name or "__broadcast__"
    msg_type: str  # "watchlist", "research_request", "dossier", "command", etc.
    payload: dict = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    correlation_id: str = Field(default_factory=lambda: uuid4().hex[:12])
