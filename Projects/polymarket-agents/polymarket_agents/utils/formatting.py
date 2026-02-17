"""Output formatting helpers."""

from __future__ import annotations

from polymarket_agents.core.models import Opportunity, SourceDossier


def format_watchlist(opportunities: list[Opportunity]) -> str:
    """Format a watchlist for console/report output."""
    if not opportunities:
        return "No opportunities found."

    lines = [f"=== Watchlist ({len(opportunities)} opportunities) ===\n"]
    for i, opp in enumerate(opportunities, 1):
        lines.append(f"{i}. [{opp.score:.0f}] {opp.market.question}")
        lines.append(f"   Market: {opp.market.slug} | Volume: ${opp.market.volume:,.0f} | Liquidity: ${opp.market.liquidity:,.0f}")
        if opp.reasons:
            lines.append(f"   Reasons: {'; '.join(opp.reasons)}")
        if opp.missing_data:
            lines.append(f"   Missing: {'; '.join(opp.missing_data)}")
        lines.append("")
    return "\n".join(lines)


def format_dossier(dossier: SourceDossier) -> str:
    """Format a research dossier for console/report output."""
    lines = [f"=== Research Dossier: {dossier.market_id} ===\n"]
    if dossier.summary:
        lines.append(f"Summary: {dossier.summary}\n")
    for src in dossier.sources:
        lines.append(f"  [{src.source_type}] {src.title}")
        lines.append(f"    URL: {src.url}")
        lines.append(f"    Relevance: {src.relevance}")
        if src.pros:
            lines.append(f"    Pros: {', '.join(src.pros)}")
        if src.cons:
            lines.append(f"    Cons: {', '.join(src.cons)}")
        lines.append("")
    return "\n".join(lines)


def format_daily_report(watchlist: list[Opportunity],
                        dossiers: list[SourceDossier]) -> str:
    """Format the full daily report."""
    sections = [
        "=" * 60,
        "  POLYMARKET OPPORTUNITIES DESK — DAILY REPORT",
        "=" * 60,
        "",
        format_watchlist(watchlist),
    ]
    if dossiers:
        sections.append("\n--- Research Results ---\n")
        for d in dossiers:
            sections.append(format_dossier(d))
    sections.append("=" * 60)
    return "\n".join(sections)
