"""Mock Subgraph client with sample historical data."""

from __future__ import annotations


_MOCK_VOLUMES: dict[str, float] = {
    "cond_001": 2_500_000.0,
    "cond_002": 1_800_000.0,
    "cond_003": 950_000.0,
    "cond_004": 600_000.0,
    "cond_005": 1_200_000.0,
    "cond_006": 400_000.0,
}


class MockSubgraphClient:
    """Returns pre-built subgraph query results."""

    async def query(self, graphql_query: str, variables: dict | None = None) -> dict:
        return {"data": {"markets": []}}

    async def get_market_volume(self, condition_id: str) -> float:
        return _MOCK_VOLUMES.get(condition_id, 0.0)

    async def get_top_markets_by_volume(self, first: int = 20) -> list[dict]:
        sorted_items = sorted(_MOCK_VOLUMES.items(), key=lambda x: x[1], reverse=True)
        return [
            {"condition_id": cid, "volume": vol}
            for cid, vol in sorted_items[:first]
        ]
