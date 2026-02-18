import { NextRequest, NextResponse } from 'next/server';
import { processScheduledPosts } from '@/lib/posting/scheduler';

/**
 * POST /api/social/cron
 * CRON endpoint to process scheduled posts
 * 
 * This should be called every minute by:
 * - Vercel Cron (if using Vercel)
 * - External cron service (cron-job.org, EasyCron)
 * - Server cron job (if self-hosted)
 * 
 * Security: Use a secret token to prevent unauthorized access
 */
export async function POST(req: NextRequest) {
  try {
    // Verify CRON secret
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'development-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[CRON] Unauthorized attempt to access cron endpoint');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting scheduled post processing...');
    const startTime = Date.now();
    
    const results = await processScheduledPosts();
    
    const duration = Date.now() - startTime;
    console.log(`[CRON] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      results,
    });
  } catch (error: any) {
    console.error('[CRON] Error processing scheduled posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/social/cron
 * Health check endpoint
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Social media CRON endpoint is active',
  });
}
