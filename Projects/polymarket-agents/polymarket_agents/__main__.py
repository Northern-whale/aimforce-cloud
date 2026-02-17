"""Entry point: python -m polymarket_agents

Phase 2: Includes Strategy Engineer and Backtesting pipeline.
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

from polymarket_agents.config import PolymarketConfig
from polymarket_agents.core.backtest import BacktestEngine
from polymarket_agents.core.logger import setup_logging
from polymarket_agents.core.message_bus import MessageBus
from polymarket_agents.core.models import AgentMessage
from polymarket_agents.data.clob_client import ClobDataClient
from polymarket_agents.data.gamma_client import GammaClient
from polymarket_agents.agents.nova import NovaOrchestrator
from polymarket_agents.agents.scanner import ScannerAgent
from polymarket_agents.agents.researcher import ResearcherAgent
from polymarket_agents.agents.strategy_engineer import StrategyEngineer


async def run(config: PolymarketConfig, once: bool = False) -> None:
    bus = MessageBus()

    # Data layer
    gamma = GammaClient(config)
    clob = ClobDataClient(config)

    # Agents (Phase 1)
    scanner = ScannerAgent(config, bus, gamma, clob)
    researcher = ResearcherAgent(config, bus)
    
    # Agents (Phase 2)
    strategy_engineer = StrategyEngineer(config, bus)
    
    # Orchestrator
    nova = NovaOrchestrator(config, bus)
    
    # Backtesting engine (not an agent, run by main loop)
    backtest_engine = BacktestEngine(initial_capital=10_000.0)

    # Start all agents
    for agent in [scanner, researcher, strategy_engineer, nova]:
        await agent.start()

    try:
        if once:
            # Phase 1 + Phase 2 workflow
            await nova.run_cycle()
            
            # Wait a bit for Strategy Engineer to generate strategies
            await asyncio.sleep(2)
            
            # Run backtests
            if strategy_engineer.strategies:
                print(f"\n{'='*60}")
                print(f"Running backtests on {len(strategy_engineer.strategies)} strategies...")
                print(f"{'='*60}\n")
                
                results = []
                for strategy in strategy_engineer.strategies:
                    result = await backtest_engine.backtest_strategy(strategy)
                    results.append(result)
                    
                    # Print summary
                    print(f"Strategy: {strategy.strategy_type.value}")
                    print(f"  Market: {strategy.description[:60]}...")
                    print(f"  Trades: {result.num_trades}")
                    print(f"  Win Rate: {result.win_rate:.1f}%")
                    print(f"  Total Return: {result.total_pnl_pct:.2f}%")
                    print(f"  Sharpe Ratio: {result.sharpe_ratio:.2f}")
                    print(f"  Max Drawdown: {result.max_drawdown:.2f}%")
                    print()
                
                # Update Nova with backtest results
                await bus.publish(AgentMessage(
                    sender="backtest_engine",
                    recipient="nova",
                    msg_type="backtest_complete",
                    payload={"results": [r.model_dump(mode="json") for r in results]}
                ))
            
            # Print final report
            print("\n" + "="*60)
            print("DAILY REPORT")
            print("="*60 + "\n")
            
            print(f"Opportunities Found: {len(nova.watchlist)}")
            print(f"Research Dossiers: {len(nova.dossiers)}")
            print(f"Strategies Generated: {len(nova.strategies)}")
            print(f"Backtests Run: {len(nova.backtest_results)}")
            
            if nova.backtest_results:
                avg_win_rate = sum(r.win_rate for r in nova.backtest_results) / len(nova.backtest_results)
                avg_return = sum(r.total_pnl_pct for r in nova.backtest_results) / len(nova.backtest_results)
                print(f"\nBacktest Summary:")
                print(f"  Average Win Rate: {avg_win_rate:.1f}%")
                print(f"  Average Return: {avg_return:.2f}%")
        else:
            while True:
                await nova.run_cycle()
                
                # Run backtesting in background
                if strategy_engineer.strategies:
                    asyncio.create_task(_run_backtests(strategy_engineer, backtest_engine, bus))
                
                print(f"\nNext scan in {config.scan_interval_seconds}s...\n")
                await asyncio.sleep(config.scan_interval_seconds)
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        for agent in [scanner, researcher, strategy_engineer, nova]:
            await agent.stop()
        await gamma.close()


async def _run_backtests(strategy_engineer, backtest_engine, bus):
    """Background task to run backtests."""
    results = []
    for strategy in strategy_engineer.strategies:
        result = await backtest_engine.backtest_strategy(strategy)
        results.append(result)
    
    # Notify Nova
    await bus.publish(AgentMessage(
        sender="backtest_engine",
        recipient="nova",
        msg_type="backtest_complete",
        payload={"results": [r.model_dump(mode="json") for r in results]}
    ))


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
