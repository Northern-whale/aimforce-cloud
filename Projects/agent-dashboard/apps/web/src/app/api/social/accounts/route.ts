import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { decrypt, encrypt } from '@/lib/social/encryption';

const prisma = new PrismaClient();

/**
 * GET /api/social/accounts
 * List all connected social accounts for the user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { socialAccounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return accounts without sensitive tokens
    const accounts = user.socialAccounts.map(acc => ({
      id: acc.id,
      platform: acc.platform,
      accountId: acc.accountId,
      accountName: acc.accountName,
      connected: acc.connected,
      expiresAt: acc.expiresAt,
      createdAt: acc.createdAt,
      updatedAt: acc.updatedAt,
    }));

    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error('Error fetching social accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/accounts
 * Add or update a social account
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
    const { platform, accountId, accountName, accessToken, refreshToken, expiresAt } = body;

    if (!platform || !accountId || !accountName || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Encrypt tokens
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    // Upsert account
    const account = await prisma.socialAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId: user.id,
          platform,
          accountId,
        },
      },
      update: {
        accountName,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        connected: true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        platform,
        accountId,
        accountName,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        connected: true,
      },
    });

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        platform: account.platform,
        accountName: account.accountName,
      },
    });
  } catch (error: any) {
    console.error('Error adding social account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social/accounts/[id]
 * Disconnect a social account
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const accountId = url.searchParams.get('id');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mark as disconnected instead of deleting (preserve history)
    await prisma.socialAccount.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: {
        connected: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error disconnecting account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
