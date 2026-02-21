import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/insights - Get business insights
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const limit = parseInt(searchParams.get("limit") || "20");

    const insights = await prisma.businessInsight.findMany({
      where: {
        ...(type && { type }),
        ...(priority && { priority }),
      },
      orderBy: [
        { priority: "desc" }, // high priority first
        { createdAt: "desc" },
      ],
      take: limit,
    });

    // Also generate fresh insights from recent data
    const freshInsights = await generateFreshInsights();

    return NextResponse.json({
      insights,
      fresh: freshInsights,
      total: insights.length,
    });
  } catch (error) {
    console.error("[Analytics/Insights API] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}

// Helper: Generate real-time insights from current data
async function generateFreshInsights() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Top products by mentions (last 7 days)
    const topProducts = await prisma.productMention.groupBy({
      by: ["productId"],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _sum: {
        mentions: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          mentions: "desc",
        },
      },
      take: 3,
    });

    const insights = [];

    if (topProducts.length > 0) {
      const topProduct = await prisma.product.findUnique({
        where: { id: topProducts[0].productId },
      });

      if (topProduct) {
        insights.push({
          type: "trending_product",
          title: `${topProduct.brand} ${topProduct.name} is Trending`,
          description: `Mentioned ${topProducts[0]._sum.mentions} times in ${topProducts[0]._count.id} calls this week`,
          data: {
            productId: topProduct.id,
            mentions: topProducts[0]._sum.mentions,
            calls: topProducts[0]._count.id,
          },
          priority: "high",
        });
      }
    }

    // Call volume by hour (peak times)
    const recentCalls = await prisma.callLog.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const hourCounts: { [key: number]: number } = {};
    recentCalls.forEach((call) => {
      const hour = new Date(call.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourCounts).reduce(
      (max, [hour, count]) => (count > max.count ? { hour: parseInt(hour), count } : max),
      { hour: 0, count: 0 }
    );

    if (peakHour.count > 0) {
      insights.push({
        type: "peak_hour",
        title: `Peak Call Time: ${peakHour.hour}:00`,
        description: `${peakHour.count} calls received around ${peakHour.hour}:00 this week`,
        data: {
          peakHour: peakHour.hour,
          callCount: peakHour.count,
        },
        priority: "normal",
      });
    }

    // Transfer rate
    const transferredCalls = await prisma.callLog.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
        transferred: true,
      },
    });

    const totalCalls = recentCalls.length;
    const transferRate = totalCalls > 0 ? (transferredCalls / totalCalls) * 100 : 0;

    if (transferRate > 20) {
      insights.push({
        type: "customer_interest",
        title: "High Transfer Rate",
        description: `${transferRate.toFixed(1)}% of calls are being transferred. Consider expanding AI knowledge base.`,
        data: {
          transferRate,
          transferred: transferredCalls,
          total: totalCalls,
        },
        priority: "normal",
      });
    }

    // Customer intent distribution
    const intentCounts = await prisma.callLog.groupBy({
      by: ["customerIntent"],
      where: {
        createdAt: { gte: sevenDaysAgo },
        customerIntent: { not: null },
      },
      _count: {
        id: true,
      },
    });

    const buyingIntentCalls = intentCounts.find((i) => i.customerIntent === "buying")?._count.id || 0;
    const buyingRate = totalCalls > 0 ? (buyingIntentCalls / totalCalls) * 100 : 0;

    if (buyingIntentCalls > 5) {
      insights.push({
        type: "revenue_opportunity",
        title: "Strong Buying Intent",
        description: `${buyingIntentCalls} calls (${buyingRate.toFixed(1)}%) showed buying intent this week`,
        data: {
          buyingCalls: buyingIntentCalls,
          buyingRate,
        },
        priority: buyingRate > 30 ? "high" : "normal",
      });
    }

    return insights;
  } catch (error) {
    console.error("[generateFreshInsights] Error:", error);
    return [];
  }
}
