/**
 * Post Scheduling Engine
 * Handles queue management, scheduling logic, and retry mechanism
 */

import { PrismaClient } from '@prisma/client';
import { postToMultiplePlatforms, type SocialPlatform, type PlatformAccount } from '../social';
import { decrypt } from '../social/encryption';

const prisma = new PrismaClient();

const MAX_RETRIES = 3;
const RETRY_DELAYS = [60000, 300000, 900000]; // 1min, 5min, 15min

/**
 * Process all scheduled posts that are due
 */
export async function processScheduledPosts(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
}> {
  const now = new Date();
  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Get all posts that are due and not already posted
    const duePosts = await prisma.scheduledPost.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        user: {
          include: {
            socialAccounts: true,
          },
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });

    console.log(`[Scheduler] Processing ${duePosts.length} posts...`);

    for (const post of duePosts) {
      results.processed++;
      
      try {
        await processPost(post);
        results.succeeded++;
      } catch (error: any) {
        console.error(`[Scheduler] Failed to process post ${post.id}:`, error);
        results.failed++;
        results.errors.push(`Post ${post.id}: ${error.message}`);
        
        // Update error status
        await handlePostFailure(post.id, error.message);
      }
    }

    console.log(`[Scheduler] Completed: ${results.succeeded} succeeded, ${results.failed} failed`);
  } catch (error: any) {
    console.error('[Scheduler] Critical error:', error);
    results.errors.push(`Critical: ${error.message}`);
  }

  return results;
}

/**
 * Process a single scheduled post
 */
async function processPost(post: any): Promise<void> {
  const platforms: SocialPlatform[] = JSON.parse(post.platforms);
  const mediaUrls = post.mediaUrls ? JSON.parse(post.mediaUrls) : [];
  
  // Mark as "posting" to prevent duplicate processing
  await prisma.scheduledPost.update({
    where: { id: post.id },
    data: { status: 'posting' },
  });

  // Get accounts for the platforms
  const accounts: PlatformAccount[] = post.user.socialAccounts
    .filter((acc: any) => platforms.includes(acc.platform) && acc.connected)
    .map((acc: any) => ({
      platform: acc.platform,
      accountId: acc.accountId,
      accountName: acc.accountName,
      accessToken: decrypt(acc.accessToken),
      refreshToken: acc.refreshToken ? decrypt(acc.refreshToken) : undefined,
      expiresAt: acc.expiresAt,
    }));

  if (accounts.length === 0) {
    throw new Error('No connected accounts found for specified platforms');
  }

  // Post to all platforms
  const results = await postToMultiplePlatforms(platforms, accounts, {
    text: post.content,
    mediaUrls,
  });

  // Collect post IDs and check for failures
  const postIds: Record<string, string> = {};
  const errors: string[] = [];

  for (const result of results) {
    if (result.success && result.postId) {
      postIds[result.platform] = result.postId;
    } else {
      errors.push(`${result.platform}: ${result.error}`);
    }
  }

  // Update post status
  if (errors.length === 0) {
    // All platforms succeeded
    await prisma.scheduledPost.update({
      where: { id: post.id },
      data: {
        status: 'posted',
        postIds: JSON.stringify(postIds),
        postedAt: new Date(),
        error: null,
      },
    });
  } else if (Object.keys(postIds).length > 0) {
    // Partial success
    await prisma.scheduledPost.update({
      where: { id: post.id },
      data: {
        status: 'posted',
        postIds: JSON.stringify(postIds),
        postedAt: new Date(),
        error: `Partial failure: ${errors.join('; ')}`,
      },
    });
  } else {
    // Complete failure
    throw new Error(errors.join('; '));
  }
}

/**
 * Handle post failure with retry logic
 */
async function handlePostFailure(postId: string, errorMessage: string): Promise<void> {
  const post = await prisma.scheduledPost.findUnique({
    where: { id: postId },
  });

  if (!post) return;

  const retryCount = post.retryCount + 1;

  if (retryCount <= MAX_RETRIES) {
    // Schedule retry
    const retryDelay = RETRY_DELAYS[retryCount - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    const nextRetry = new Date(Date.now() + retryDelay);

    await prisma.scheduledPost.update({
      where: { id: postId },
      data: {
        status: 'scheduled',
        retryCount,
        lastRetryAt: new Date(),
        scheduledFor: nextRetry,
        error: `Retry ${retryCount}/${MAX_RETRIES}: ${errorMessage}`,
      },
    });

    console.log(`[Scheduler] Scheduled retry ${retryCount} for post ${postId} at ${nextRetry}`);
  } else {
    // Max retries exceeded
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: {
        status: 'failed',
        error: `Failed after ${MAX_RETRIES} retries: ${errorMessage}`,
      },
    });

    console.log(`[Scheduler] Post ${postId} failed permanently after ${MAX_RETRIES} retries`);
  }
}

/**
 * Get upcoming posts (next 7 days)
 */
export async function getUpcomingPosts(userId: string, days: number = 7): Promise<any[]> {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  return prisma.scheduledPost.findMany({
    where: {
      userId,
      scheduledFor: {
        gte: new Date(),
        lte: endDate,
      },
      status: {
        in: ['scheduled', 'draft'],
      },
    },
    orderBy: {
      scheduledFor: 'asc',
    },
  });
}

/**
 * Get optimal posting times for a platform
 */
export function getOptimalPostingTime(
  platform: SocialPlatform,
  timezone: string = 'America/Denver'
): Date {
  const now = new Date();
  const optimalHours: Record<SocialPlatform, number[]> = {
    instagram: [9, 10, 19, 20],
    facebook: [12, 13, 14, 18, 19],
    linkedin: [7, 8, 12, 17, 18],
    twitter: [8, 9, 12, 17, 18],
    tiktok: [6, 7, 8, 19, 20, 21, 22],
  };

  const hours = optimalHours[platform] || [9];
  const currentHour = now.getHours();
  
  // Find next optimal hour
  let nextHour = hours.find(h => h > currentHour);
  
  if (!nextHour) {
    // Use first hour of next day
    nextHour = hours[0];
    now.setDate(now.getDate() + 1);
  }

  now.setHours(nextHour, 0, 0, 0);
  return now;
}

/**
 * Check if posting limit exceeded for platform today
 */
export async function checkPostingLimit(
  userId: string,
  platform: SocialPlatform
): Promise<{ exceeded: boolean; count: number; limit: number }> {
  const limits: Record<SocialPlatform, number> = {
    instagram: 3,
    facebook: 5,
    linkedin: 2,
    twitter: 10,
    tiktok: 4,
  };

  const limit = limits[platform];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await prisma.scheduledPost.count({
    where: {
      userId,
      platforms: {
        contains: platform,
      },
      scheduledFor: {
        gte: today,
        lt: tomorrow,
      },
      status: {
        in: ['scheduled', 'posted'],
      },
    },
  });

  return {
    exceeded: count >= limit,
    count,
    limit,
  };
}
