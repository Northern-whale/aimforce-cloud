import { prisma } from "@/lib/prisma";
import {
  Phone,
  MessageSquare,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Package,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

async function getMetrics() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalCalls, totalConversations, recentCalls, weekCalls, products, insights] = await Promise.all([
    prisma.callLog.count(),
    prisma.conversation.count(),
    prisma.callLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        productMentions: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.callLog.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.product.count(),
    prisma.businessInsight.findMany({
      where: { priority: "high" },
      orderBy: { createdAt: "desc" },
      take: 3,
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

  // Get trending product
  const trendingProducts = await prisma.productMention.groupBy({
    by: ["productId"],
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
    _sum: {
      mentions: true,
    },
    orderBy: {
      _sum: {
        mentions: "desc",
      },
    },
    take: 1,
  });

  let trendingProduct = null;
  if (trendingProducts.length > 0) {
    trendingProduct = await prisma.product.findUnique({
      where: { id: trendingProducts[0].productId },
    });
  }

  return {
    totalCalls,
    totalConversations,
    avgDuration,
    recentCalls,
    weekCalls,
    products,
    insights,
    trendingProduct,
    trendingMentions: trendingProducts[0]?._sum.mentions || 0,
  };
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const {
    totalCalls,
    totalConversations,
    avgDuration,
    recentCalls,
    weekCalls,
    products,
    insights,
    trendingProduct,
    trendingMentions,
  } = await getMetrics();

  const cards = [
    {
      title: "Total Calls",
      value: totalCalls,
      subtitle: `${weekCalls} this week`,
      icon: Phone,
      trend: "+12%",
      trendUp: true,
      href: "/calls",
    },
    {
      title: "Products",
      value: products,
      subtitle: trendingProduct ? `${trendingProduct.brand} trending` : "View inventory",
      icon: Package,
      trend: trendingMentions > 0 ? `${trendingMentions} mentions` : null,
      trendUp: true,
      href: "/products",
    },
    {
      title: "Avg Duration",
      value: formatDuration(avgDuration),
      subtitle: "Per call",
      icon: Clock,
      trend: "-5%",
      trendUp: false,
    },
    {
      title: "Response Time",
      value: "0.8s",
      subtitle: "AI response",
      icon: Zap,
      trend: "-15%",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const CardWrapper = card.href ? Link : "div";
          return (
            <CardWrapper
              key={card.title}
              href={card.href || ""}
              className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 ${
                card.href ? "hover:border-blue-500 transition-colors cursor-pointer" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-zinc-400">{card.title}</span>
                <card.icon className="w-5 h-5 text-zinc-500" />
              </div>
              <div className="flex items-end justify-between mb-1">
                <span className="text-2xl font-bold text-white">{card.value}</span>
                {card.trend && (
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
                )}
              </div>
              <p className="text-xs text-zinc-500">{card.subtitle}</p>
            </CardWrapper>
          );
        })}
      </div>

      {/* High Priority Insights */}
      {insights.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Priority Insights
            </h2>
            <Link
              href="/analytics"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {insights.map((insight) => (
              <div key={insight.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white mb-1">{insight.title}</h3>
                    <p className="text-sm text-zinc-400">{insight.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-red-600 text-white font-medium">
                    HIGH
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Calls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recent Calls</h2>
          <Link
            href="/calls"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="divide-y divide-zinc-800">
          {recentCalls.map((call) => (
            <div key={call.id} className="px-5 py-3">
              <div className="flex items-start gap-4">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                    call.status === "completed"
                      ? "bg-emerald-400"
                      : call.status === "transferred"
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white mb-1">{call.summary}</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{call.phoneNumber}</span>
                    <span>•</span>
                    <span>{call.duration ? formatDuration(call.duration) : "N/A"}</span>
                    {call.category && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{call.category.replace("_", " ")}</span>
                      </>
                    )}
                  </div>
                  {call.productMentions.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <Package className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-purple-400">
                        Mentioned: {call.productMentions.map((m) => m.product.name).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
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
                  {call.sentiment && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        call.sentiment === "positive"
                          ? "bg-green-500/10 text-green-400"
                          : call.sentiment === "negative"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-zinc-700 text-zinc-400"
                      }`}
                    >
                      {call.sentiment}
                    </span>
                  )}
                </div>
              </div>
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
