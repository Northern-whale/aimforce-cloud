import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ScheduleClient from './schedule-client'

export default async function SchedulePage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CLIENT' || !session.user.clientId) {
    redirect('/login')
  }

  const clientId = session.user.clientId

  const [scheduledPosts, socialAccounts, postedThisWeek, postedThisMonth] = await Promise.all([
    prisma.scheduledPost.findMany({
      where: { clientId, status: 'SCHEDULED' },
      orderBy: { scheduledFor: 'asc' },
      include: { socialAccount: true },
    }),
    prisma.socialAccount.findMany({
      where: { clientId, isActive: true },
    }),
    prisma.scheduledPost.count({
      where: {
        clientId,
        status: 'POSTED',
        postedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.scheduledPost.count({
      where: {
        clientId,
        status: 'POSTED',
        postedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
  ])

  // Serialize dates for client component
  const serializedPosts = scheduledPosts.map((post) => ({
    id: post.id,
    platform: post.platform,
    content: post.content,
    scheduledFor: post.scheduledFor.toISOString(),
    status: post.status,
    aiScore: post.aiScore,
    socialAccount: post.socialAccount
      ? { accountName: post.socialAccount.accountName }
      : null,
  }))

  const connectedPlatforms = socialAccounts.map((acc) => acc.platform)

  return (
    <ScheduleClient
      posts={serializedPosts}
      connectedPlatforms={connectedPlatforms}
      postedThisWeek={postedThisWeek}
      postedThisMonth={postedThisMonth}
    />
  )
}
