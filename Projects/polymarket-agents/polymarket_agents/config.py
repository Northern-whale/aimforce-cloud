"""Configuration loader: YAML defaults + POLY_* env var overrides."""

from __future__ import annotations

import os
from dataclasses import dataclass, field, fields
from pathlib import Path

import yaml


@dataclass
class PolymarketConfig:
    clob_host: str = "https://clob.polymarket.com"
    clob_private_key: str = ""
    clob_chain_id: int = 137

    gamma_host: str = "https://gamma-api.polymarket.com"
    subgraph_url: str = ""
    ws_url: str = "wss://ws-subscriptions-clob.polymarket.com/ws"

    mock_mode: bool = True

    scan_interval_seconds: int = 300
    max_watchlist_size: int = 50
    min_opportunity_score: float = 20.0
    research_top_n: int = 5
    log_level: str = "INFO"
    audit_log_path: str = "logs/audit.jsonl"

    @classmethod
    def load(cls, config_path: Path | None = None) -> PolymarketConfig:
        """Load from YAML file, then override with POLY_* env vars."""
        data: dict = {}

        # Load YAML if provided and exists
        if config_path and config_path.exists():
            with open(config_path) as f:
                data = yaml.safe_load(f) or {}

        # Override with env vars (POLY_ prefix, case-insensitive field match)
        field_names = {f.name for f in fields(cls)}
        for key, value in os.environ.items():
            if key.startswith("POLY_"):
                field_name = key[5:].lower()
                if field_name in field_names:
                    data[field_name] = value

        # Coerce types based on field annotations
        coerced: dict = {}
        type_map = {f.name: f.type for f in fields(cls)}
        for k, v in data.items():
            if k not in type_map:
                continue
            ft = type_map[k]
            if ft == "bool" and isinstance(v, str):
                coerced[k] = v.lower() in ("true", "1", "yes")
            elif ft == "int" and isinstance(v, str):
                coerced[k] = int(v)
            elif ft == "float" and isinstance(v, str):
                coerced[k] = float(v)
            else:
                coerced[k] = v

        return cls(**coerced)
