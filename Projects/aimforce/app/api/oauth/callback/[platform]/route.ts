import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { exchangeCodeForToken, type PlatformType } from '@/lib/oauth-providers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // Handle OAuth errors (user denied, etc.)
  if (error) {
    console.error(`OAuth error for ${platform}:`, error, errorDescription)
    const errorMessage = error === 'access_denied' 
      ? 'You denied access. Please try again and approve the connection.'
      : `Authentication failed: ${errorDescription || error}`
    return NextResponse.redirect(new URL(`/portal/social?error=${encodeURIComponent(errorMessage)}`, request.url))
  }
  
  if (!code || !stateParam) {
    return NextResponse.redirect(new URL('/portal/social?error=missing_code', request.url))
  }
  
  try {
    // Decode state
    const state = JSON.parse(Buffer.from(stateParam, 'base64').toString())
    const { clientId } = state
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(platform as PlatformType, code)
    
    // Get account info from platform
    const accountInfo = await getAccountInfo(platform, tokens.access_token)
    
    // Save to database
    await prisma.socialAccount.upsert({
      where: {
        clientId_platform_accountId: {
          clientId,
          platform: platform.toUpperCase(),
          accountId: accountInfo.id,
        },
      },
      create: {
        clientId,
        platform: platform.toUpperCase(),
        accountName: accountInfo.name,
        accountId: accountInfo.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        isActive: true,
        lastUsed: new Date(),
      },
    })
    
    // Redirect back to social page with success
    return NextResponse.redirect(new URL('/portal/social?success=connected', request.url))
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/portal/social?error=auth_failed', request.url))
  }
}

async function getAccountInfo(platform: string, accessToken: string) {
  // Platform-specific API calls to get account info
  const endpoints: Record<string, string> = {
    FACEBOOK: 'https://graph.facebook.com/me?fields=id,name',
    INSTAGRAM: 'https://graph.facebook.com/me?fields=id,username',
    LINKEDIN: 'https://api.linkedin.com/v2/me',
    TWITTER: 'https://api.twitter.com/2/users/me',
    TIKTOK: 'https://open.tiktokapis.com/v2/user/info/',
  }
  
  const endpoint = endpoints[platform.toUpperCase()]
  if (!endpoint) {
    throw new Error(`Unknown platform: ${platform}`)
  }
  
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch account info: ${await response.text()}`)
  }
  
  const data = await response.json()
  
  // Normalize response across platforms
  return {
    id: data.id || data.data?.user?.union_id,
    name: data.name || data.username || data.localizedFirstName || data.data?.user?.display_name,
  }
}
