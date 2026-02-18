import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { getUpcomingPosts, checkPostingLimit, getOptimalPostingTime } from '@/lib/posting/scheduler';
import type { SocialPlatform } from '@/lib/social/types';

const prisma = new PrismaClient();

/**
 * GET /api/social/posts
 * List all scheduled posts for the user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const where: any = { userId: user.id };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.scheduledFor = {};
      if (startDate) where.scheduledFor.gte = new Date(startDate);
      if (endDate) where.scheduledFor.lte = new Date(endDate);
    }

    const posts = await prisma.scheduledPost.findMany({
      where,
      orderBy: { scheduledFor: 'desc' },
      take: 100,
    });

    // Parse JSON fields
    const formattedPosts = posts.map(post => ({
      ...post,
      platforms: JSON.parse(post.platforms),
      mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
      postIds: post.postIds ? JSON.parse(post.postIds) : {},
      analytics: post.analytics ? JSON.parse(post.analytics) : {},
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/posts
 * Create a new scheduled post
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { platforms, content, mediaUrls, scheduledFor, status = 'draft' } = body;

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform required' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Validate posting limits for each platform
    if (status === 'scheduled') {
      for (const platform of platforms) {
        const limit = await checkPostingLimit(user.id, platform as SocialPlatform);
        if (limit.exceeded) {
          return NextResponse.json(
            { error: `Posting limit exceeded for ${platform} (${limit.count}/${limit.limit} today)` },
            { status: 400 }
          );
        }
      }
    }

    // Create the post
    const post = await prisma.scheduledPost.create({
      data: {
        userId: user.id,
        platforms: JSON.stringify(platforms),
        content,
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
        status,
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        platforms: JSON.parse(post.platforms),
        mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
      },
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/social/posts/[id]
 * Update a scheduled post
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const url = new URL(req.url);
    const postId = url.searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { platforms, content, mediaUrls, scheduledFor, status } = body;

    const updateData: any = {};

    if (platforms) updateData.platforms = JSON.stringify(platforms);
    if (content) updateData.content = content;
    if (mediaUrls !== undefined) updateData.mediaUrls = mediaUrls ? JSON.stringify(mediaUrls) : null;
    if (scheduledFor) updateData.scheduledFor = new Date(scheduledFor);
    if (status) updateData.status = status;

    const post = await prisma.scheduledPost.update({
      where: {
        id: postId,
        userId: user.id,
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        platforms: JSON.parse(post.platforms),
        mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
      },
    });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social/posts/[id]
 * Delete a scheduled post
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const url = new URL(req.url);
    const postId = url.searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID required' },
        { status: 400 }
      );
    }

    await prisma.scheduledPost.delete({
      where: {
        id: postId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
