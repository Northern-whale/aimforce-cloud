"""Structured audit logging (JSONL) and standard logging setup."""

from __future__ import annotations

import json
import logging
import sys
from datetime import datetime
from pathlib import Path


class AuditLogger:
    """Append-only JSONL log for agent decisions and actions."""

    def __init__(self, path: str = "logs/audit.jsonl"):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def log(self, agent: str, action: str, details: dict,
            outcome: str = "") -> None:
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "agent": agent,
            "action": action,
            "details": details,
            "outcome": outcome,
        }
        with open(self.path, "a") as f:
            f.write(json.dumps(entry) + "\n")


def setup_logging(level: str = "INFO") -> None:
    """Configure root logger with a clean console format."""
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%H:%M:%S",
        stream=sys.stdout,
    )
