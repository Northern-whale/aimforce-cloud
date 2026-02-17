"""Tests for configuration loader."""

from polymarket_agents.config import PolymarketConfig


def test_default_config():
    cfg = PolymarketConfig()
    assert cfg.mock_mode is True
    assert cfg.max_watchlist_size == 50
    assert cfg.clob_chain_id == 137


def test_load_without_file():
    cfg = PolymarketConfig.load(None)
    assert cfg.mock_mode is True


def test_env_override(monkeypatch):
    monkeypatch.setenv("POLY_MOCK_MODE", "false")
    monkeypatch.setenv("POLY_MAX_WATCHLIST_SIZE", "10")
    cfg = PolymarketConfig.load(None)
    assert cfg.mock_mode is False
    assert cfg.max_watchlist_size == 10
