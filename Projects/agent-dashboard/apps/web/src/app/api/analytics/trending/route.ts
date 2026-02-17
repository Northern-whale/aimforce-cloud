import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/trending - Get trending products and patterns
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7");

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Trending products by mentions
    const productMentions = await prisma.productMention.groupBy({
      by: ["productId"],
      where: {
        createdAt: { gte: startDate },
      },
      _sum: {
        mentions: true,
      },
      _count: {
        id: true, // number of calls
      },
      orderBy: {
        _sum: {
          mentions: "desc",
        },
      },
      take: 10,
    });

    const trendingProducts = await Promise.all(
      productMentions.map(async (mention) => {
        const product = await prisma.product.findUnique({
          where: { id: mention.productId },
        });

        return {
          product,
          mentions: mention._sum.mentions || 0,
          calls: mention._count.id,
        };
      })
    );

    // Trending categories
    const categoryCalls = await prisma.callLog.groupBy({
      by: ["category"],
      where: {
        createdAt: { gte: startDate },
        category: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Customer intent trends
    const intentTrends = await prisma.callLog.groupBy({
      by: ["customerIntent"],
      where: {
        createdAt: { gte: startDate },
        customerIntent: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Peak hours analysis
    const callsByHour = await getCallsByHour(startDate);

    // Brand popularity
    const allProducts = await prisma.product.findMany({
      include: {
        productMentions: {
          where: {
            createdAt: { gte: startDate },
          },
        },
      },
    });

    const brandStats: { [key: string]: { mentions: number; products: number } } = {};
    allProducts.forEach((product) => {
      const mentions = product.productMentions.reduce((sum, m) => sum + m.mentions, 0);
      if (!brandStats[product.brand]) {
        brandStats[product.brand] = { mentions: 0, products: 0 };
      }
      brandStats[product.brand].mentions += mentions;
      brandStats[product.brand].products += 1;
    });

    const topBrands = Object.entries(brandStats)
      .map(([brand, stats]) => ({ brand, ...stats }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5);

    return NextResponse.json({
      trendingProducts,
      categories: categoryCalls.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
      intents: intentTrends.map((i) => ({
        intent: i.customerIntent,
        count: i._count.id,
      })),
      peakHours: callsByHour,
      topBrands,
      period: `Last ${days} days`,
    });
  } catch (error) {
    console.error("[Analytics/Trending API] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending data" },
      { status: 500 }
    );
  }
}

async function getCallsByHour(startDate: Date) {
  const calls = await prisma.callLog.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
    },
  });

  const hourCounts: { [key: number]: number } = {};
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0;
  }

  calls.forEach((call) => {
    const hour = new Date(call.createdAt).getHours();
    hourCounts[hour] += 1;
  });

  return Object.entries(hourCounts).map(([hour, count]) => ({
    hour: parseInt(hour),
    count,
  }));
}
