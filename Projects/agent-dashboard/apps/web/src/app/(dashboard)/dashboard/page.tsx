import { prisma } from "@/lib/prisma";
import {
  Phone,
  MessageSquare,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

async function getMetrics() {
  const [totalCalls, totalConversations, recentCalls] = await Promise.all([
    prisma.callLog.count(),
    prisma.conversation.count(),
    prisma.callLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const completedCalls = await prisma.callLog.findMany({
    where: { duration: { not: null } },
    select: { duration: true },
  });

  const avgDuration =
    completedCalls.length > 0
      ? Math.round(
          completedCalls.reduce((sum, c) => sum + (c.duration || 0), 0) /
            completedCalls.length
        )
      : 0;

  return { totalCalls, totalConversations, avgDuration, recentCalls };
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const { totalCalls, totalConversations, avgDuration, recentCalls } =
    await getMetrics();

  const cards = [
    {
      title: "Total Calls",
      value: totalCalls,
      icon: Phone,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Conversations",
      value: totalConversations,
      icon: MessageSquare,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Avg Duration",
      value: formatDuration(avgDuration),
      icon: Clock,
      trend: "-5%",
      trendUp: false,
    },
    {
      title: "Response Time",
      value: "1.2s",
      icon: Zap,
      trend: "-15%",
      trendUp: true,
    },
  ];

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
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  card.trendUp ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {card.trendUp ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {card.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white">Recent Calls</h2>
        </div>
        <div className="divide-y divide-zinc-800">
          {recentCalls.map((call) => (
            <div key={call.id} className="px-5 py-3 flex items-center gap-4">
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  call.status === "completed"
                    ? "bg-emerald-400"
                    : call.status === "transferred"
                    ? "bg-amber-400"
                    : "bg-red-400"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{call.summary}</p>
                <p className="text-xs text-zinc-500">
                  {call.phoneNumber} &middot;{" "}
                  {call.duration ? formatDuration(call.duration) : "N/A"}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  call.status === "completed"
                    ? "bg-emerald-400/10 text-emerald-400"
                    : call.status === "transferred"
                    ? "bg-amber-400/10 text-amber-400"
                    : "bg-red-400/10 text-red-400"
                }`}
              >
                {call.status}
              </span>
            </div>
          ))}
          {recentCalls.length === 0 && (
            <div className="px-5 py-8 text-center text-zinc-500 text-sm">
              No calls recorded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
