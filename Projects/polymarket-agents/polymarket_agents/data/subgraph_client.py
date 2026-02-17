"""GraphQL client for the Polymarket subgraph (historical/aggregate data)."""

from __future__ import annotations

import httpx

from polymarket_agents.config import PolymarketConfig


class SubgraphClient:
    """Queries the Polymarket subgraph. Falls back to mock in mock_mode."""

    def __init__(self, config: PolymarketConfig):
        self.config = config
        if config.mock_mode:
            from polymarket_agents.data.mock.mock_subgraph import MockSubgraphClient
            self._mock = MockSubgraphClient()
        else:
            self._mock = None
            self._http = httpx.AsyncClient(timeout=30)

    async def query(self, graphql_query: str, variables: dict | None = None) -> dict:
        if self._mock:
            return await self._mock.query(graphql_query, variables)

        resp = await self._http.post(
            self.config.subgraph_url,
            json={"query": graphql_query, "variables": variables or {}},
        )
        resp.raise_for_status()
        return resp.json()

    async def get_market_volume(self, condition_id: str) -> float:
        if self._mock:
            return await self._mock.get_market_volume(condition_id)

        result = await self.query(
            """query($id: String!) {
                fixedProductMarketMaker(id: $id) { collateralVolume }
            }""",
            {"id": condition_id},
        )
        maker = result.get("data", {}).get("fixedProductMarketMaker")
        return float(maker["collateralVolume"]) if maker else 0.0

    async def get_top_markets_by_volume(self, first: int = 20) -> list[dict]:
        if self._mock:
            return await self._mock.get_top_markets_by_volume(first)

        result = await self.query(
            """query($first: Int!) {
                fixedProductMarketMakers(first: $first, orderBy: collateralVolume, orderDirection: desc) {
                    id collateralVolume
                }
            }""",
            {"first": first},
        )
        return result.get("data", {}).get("fixedProductMarketMakers", [])

    async def close(self) -> None:
        if not self._mock and hasattr(self, "_http"):
            await self._http.aclose()
