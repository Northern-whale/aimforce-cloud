import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { getAllAnalytics, type PlatformAccount } from '@/lib/social';
import { decrypt } from '@/lib/social/encryption';

const prisma = new PrismaClient();

/**
 * GET /api/social/analytics
 * Fetch analytics for all connected platforms
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        socialAccounts: {
          where: { connected: true },
        },
        scheduledPosts: {
          where: {
            status: 'posted',
            postedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get platform analytics
    const accounts: PlatformAccount[] = user.socialAccounts.map(acc => ({
      platform: acc.platform as any,
      accountId: acc.accountId,
      accountName: acc.accountName,
      accessToken: decrypt(acc.accessToken),
      refreshToken: acc.refreshToken ? decrypt(acc.refreshToken) : undefined,
      expiresAt: acc.expiresAt || undefined,
    }));

    const platformAnalytics = await getAllAnalytics(accounts);

    // Calculate aggregate metrics
    const totalFollowers = platformAnalytics.reduce((sum, p) => sum + (p.followers || 0), 0);
    const totalReach = platformAnalytics.reduce((sum, p) => sum + (p.reach || 0), 0);
    const totalEngagement = platformAnalytics.reduce((sum, p) => sum + (p.engagement || 0), 0);

    // Get top posts
    const topPosts = user.scheduledPosts
      .filter(post => post.analytics)
      .map(post => ({
        id: post.id,
        content: post.content.substring(0, 100),
        platforms: JSON.parse(post.platforms),
        postedAt: post.postedAt,
        analytics: JSON.parse(post.analytics!),
      }))
      .sort((a, b) => {
        const aEngagement = (a.analytics.likes || 0) + (a.analytics.comments || 0) + (a.analytics.shares || 0);
        const bEngagement = (b.analytics.likes || 0) + (b.analytics.comments || 0) + (b.analytics.shares || 0);
        return bEngagement - aEngagement;
      })
      .slice(0, 5);

    // Platform health status
    const platformHealth = user.socialAccounts.map(acc => ({
      platform: acc.platform,
      accountName: acc.accountName,
      connected: acc.connected,
      status: acc.connected ? 'active' : 'disconnected',
      lastUpdated: acc.updatedAt,
    }));

    return NextResponse.json({
      summary: {
        totalFollowers,
        totalReach,
        totalEngagement,
        connectedPlatforms: user.socialAccounts.filter(a => a.connected).length,
        totalPosts: user.scheduledPosts.length,
      },
      platformAnalytics,
      topPosts,
      platformHealth,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/analytics/refresh
 * Manually refresh analytics for a specific platform or all platforms
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        socialAccounts: {
          where: { connected: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { platform } = body;

    let accounts = user.socialAccounts;
    if (platform) {
      accounts = accounts.filter(acc => acc.platform === platform);
    }

    const platformAccounts: PlatformAccount[] = accounts.map(acc => ({
      platform: acc.platform as any,
      accountId: acc.accountId,
      accountName: acc.accountName,
      accessToken: decrypt(acc.accessToken),
      refreshToken: acc.refreshToken ? decrypt(acc.refreshToken) : undefined,
      expiresAt: acc.expiresAt || undefined,
    }));

    const analytics = await getAllAnalytics(platformAccounts);

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error: any) {
    console.error('Error refreshing analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
