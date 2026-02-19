import { prisma } from './prisma'
import { exchangeCodeForToken, type PlatformType } from './oauth-providers'

/**
 * Refresh an expired OAuth token
 */
export async function refreshOAuthToken(
  clientId: string,
  platform: string
): Promise<{ accessToken: string; expiresAt: Date | null } | null> {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        clientId,
        platform: platform.toUpperCase(),
      },
      orderBy: {
        connectedAt: 'desc',
      },
    })

    if (!account || !account.refreshToken) {
      return null
    }

    // Check if token is actually expired
    if (account.tokenExpiresAt && account.tokenExpiresAt > new Date()) {
      return {
        accessToken: account.accessToken!,
        expiresAt: account.tokenExpiresAt,
      }
    }

    // Platform-specific refresh logic
    let newTokens
    switch (platform.toUpperCase()) {
      case 'GOOGLE':
        newTokens = await refreshGoogleToken(account.refreshToken)
        break
      case 'FACEBOOK':
      case 'INSTAGRAM':
        newTokens = await refreshFacebookToken(account.refreshToken)
        break
      case 'LINKEDIN':
        newTokens = await refreshLinkedInToken(account.refreshToken)
        break
      case 'TWITTER':
        // Twitter OAuth 2.0 uses short-lived tokens, need re-auth
        return null
      default:
        return null
    }

    if (!newTokens) {
      return null
    }

    // Update database with new tokens
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token || account.refreshToken,
        tokenExpiresAt: newTokens.expires_in
          ? new Date(Date.now() + newTokens.expires_in * 1000)
          : null,
      },
    })

    return {
      accessToken: newTokens.access_token,
      expiresAt: newTokens.expires_in
        ? new Date(Date.now() + newTokens.expires_in * 1000)
        : null,
    }
  } catch (error) {
    console.error(`Failed to refresh ${platform} token:`, error)
    return null
  }
}

async function refreshGoogleToken(refreshToken: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Google token')
  }

  return await response.json()
}

async function refreshFacebookToken(refreshToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: process.env.FACEBOOK_APP_ID!,
        client_secret: process.env.FACEBOOK_APP_SECRET!,
        fb_exchange_token: refreshToken,
      })
  )

  if (!response.ok) {
    throw new Error('Failed to refresh Facebook token')
  }

  return await response.json()
}

async function refreshLinkedInToken(refreshToken: string) {
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh LinkedIn token')
  }

  return await response.json()
}

/**
 * Get a valid access token, refreshing if necessary
 */
export async function getValidAccessToken(
  clientId: string,
  platform: string
): Promise<string | null> {
  const account = await prisma.socialAccount.findFirst({
    where: {
      clientId,
      platform: platform.toUpperCase(),
    },
    orderBy: {
      connectedAt: 'desc',
    },
  })

  if (!account) {
    return null
  }

  // If token is still valid (with 5-minute buffer), return it
  const bufferMs = 5 * 60 * 1000 // 5 minutes
  if (account.tokenExpiresAt && account.tokenExpiresAt.getTime() > Date.now() + bufferMs) {
    return account.accessToken
  }

  // Token expired or about to expire, refresh it
  const refreshed = await refreshOAuthToken(clientId, platform)
  return refreshed?.accessToken || null
}
