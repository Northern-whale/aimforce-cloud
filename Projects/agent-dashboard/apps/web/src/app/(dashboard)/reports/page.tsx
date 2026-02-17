import { prisma } from "@/lib/prisma";
import {
  Phone,
  MessageSquare,
  Clock,
  Zap,
  ArrowUpRight,
} from "lucide-react";

async function getReportData() {
  const [totalCalls, totalConversations, completedCalls, sentimentCounts] =
    await Promise.all([
      prisma.callLog.count(),
      prisma.conversation.count(),
      prisma.callLog.findMany({
        where: { duration: { not: null, gt: 0 } },
        select: { duration: true },
      }),
      prisma.callLog.groupBy({
        by: ["sentiment"],
        _count: true,
      }),
    ]);

  const avgDuration =
    completedCalls.length > 0
      ? Math.round(
          completedCalls.reduce((sum, c) => sum + (c.duration || 0), 0) /
            completedCalls.length
        )
      : 0;

  const sentiments = Object.fromEntries(
    sentimentCounts.map((s) => [s.sentiment || "unknown", s._count])
  );

  return { totalCalls, totalConversations, avgDuration, sentiments };
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default async function ReportsPage() {
  const { totalCalls, totalConversations, avgDuration, sentiments } =
    await getReportData();

  const cards = [
    { title: "Total Calls", value: totalCalls, icon: Phone },
    { title: "Conversations", value: totalConversations, icon: MessageSquare },
    { title: "Avg Duration", value: formatDuration(avgDuration), icon: Clock },
    { title: "Response Time", value: "1.2s", icon: Zap },
  ];

  const totalSentiment = Object.values(sentiments).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-400">{card.title}</span>
              <card.icon className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-white">{card.value}</span>
              <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />
                +12%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sentiment breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-base font-semibold text-white mb-4">
          Call Sentiment
        </h2>
        <div className="space-y-3">
          {[
            { label: "Positive", key: "positive", color: "bg-emerald-500" },
            { label: "Neutral", key: "neutral", color: "bg-zinc-500" },
            { label: "Negative", key: "negative", color: "bg-red-500" },
          ].map((s) => {
            const count = sentiments[s.key] || 0;
            const pct = Math.round((count / totalSentiment) * 100);
            return (
              <div key={s.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-300">{s.label}</span>
                  <span className="text-zinc-400">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className={`${s.color} h-2 rounded-full transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
