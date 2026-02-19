import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.clientId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { socialAccountId, platform, content, scheduledFor } = await request.json()

    if (!platform || !content || !scheduledFor) {
      return NextResponse.json(
        { error: 'Platform, content, and scheduledFor are required' },
        { status: 400 }
      )
    }

    // If socialAccountId provided, verify it belongs to this client
    if (socialAccountId) {
      const account = await prisma.socialAccount.findFirst({
        where: { id: socialAccountId, clientId: session.user.clientId },
      })
      if (!account) {
        return NextResponse.json({ error: 'Social account not found' }, { status: 404 })
      }
    }

    // Find any connected account for this platform if not provided
    const accountId =
      socialAccountId ||
      (
        await prisma.socialAccount.findFirst({
          where: { clientId: session.user.clientId, platform: platform.toUpperCase() },
        })
      )?.id

    if (!accountId) {
      return NextResponse.json(
        { error: `No ${platform} account connected. Please connect it first.` },
        { status: 400 }
      )
    }

    const post = await prisma.scheduledPost.create({
      data: {
        clientId: session.user.clientId,
        socialAccountId: accountId,
        platform: platform.toUpperCase(),
        content,
        scheduledFor: new Date(scheduledFor),
        status: 'SCHEDULED',
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Schedule post error:', error)
    return NextResponse.json({ error: 'Failed to schedule post' }, { status: 500 })
  }
}
