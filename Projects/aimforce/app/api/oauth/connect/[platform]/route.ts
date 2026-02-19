import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { generateOAuthUrl, type PlatformType } from '@/lib/oauth-providers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform: platformParam } = await params
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.clientId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const platform = platformParam.toLowerCase() as PlatformType
  
  // Generate random state for CSRF protection
  const state = JSON.stringify({
    clientId: session.user.clientId,
    platform,
    nonce: Math.random().toString(36).substring(7),
  })
  
  try {
    const authUrl = generateOAuthUrl(platform as PlatformType, Buffer.from(state).toString('base64'))
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('OAuth connection error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}
