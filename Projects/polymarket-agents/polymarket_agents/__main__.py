"""Entry point: python -m polymarket_agents"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.logger import setup_logging
from polymarket_agents.core.message_bus import MessageBus
from polymarket_agents.data.clob_client import ClobDataClient
from polymarket_agents.data.gamma_client import GammaClient
from polymarket_agents.agents.nova import NovaOrchestrator
from polymarket_agents.agents.scanner import ScannerAgent
from polymarket_agents.agents.researcher import ResearcherAgent


async def run(config: PolymarketConfig, once: bool = False) -> None:
    bus = MessageBus()

    # Data layer
    gamma = GammaClient(config)
    clob = ClobDataClient(config)

    # Agents
    scanner = ScannerAgent(config, bus, gamma, clob)
    researcher = ResearcherAgent(config, bus)
    nova = NovaOrchestrator(config, bus)

    for agent in [scanner, researcher, nova]:
        await agent.start()

    try:
        if once:
            report = await nova.run_cycle()
            print(report)
        else:
            while True:
                report = await nova.run_cycle()
                print(report)
                print(f"\nNext scan in {config.scan_interval_seconds}s...\n")
                await asyncio.sleep(config.scan_interval_seconds)
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        for agent in [scanner, researcher, nova]:
            await agent.stop()
        await gamma.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Polymarket Opportunities Desk — multi-agent market scanner"
    )
    parser.add_argument(
        "--config", type=str, default="config/default.yaml",
        help="Path to YAML config file",
    )
    parser.add_argument(
        "--once", action="store_true",
        help="Run one cycle and exit",
    )
    args = parser.parse_args()

    config_path = Path(args.config)
    config = PolymarketConfig.load(config_path if config_path.exists() else None)
    setup_logging(config.log_level)

    asyncio.run(run(config, once=args.once))


if __name__ == "__main__":
    main()
