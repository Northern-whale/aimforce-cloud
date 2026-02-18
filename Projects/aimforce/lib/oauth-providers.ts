// OAuth Provider Configurations for Social Media Platforms

export const oauthProviders = {
  facebook: {
    name: 'Facebook',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scope: 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish',
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    redirectUri: `${process.env.NEXTAUTH_URL}/api/oauth/callback/facebook`,
  },
  
  instagram: {
    name: 'Instagram',
    // Instagram uses Facebook Graph API
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scope: 'instagram_basic,instagram_content_publish',
    clientId: process.env.FACEBOOK_APP_ID, // Same as Facebook
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    redirectUri: `${process.env.NEXTAUTH_URL}/api/oauth/callback/instagram`,
  },
  
  linkedin: {
    name: 'LinkedIn',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scope: 'w_member_social,r_basicprofile',
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: `${process.env.NEXTAUTH_URL}/api/oauth/callback/linkedin`,
  },
  
  twitter: {
    name: 'Twitter',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scope: 'tweet.read,tweet.write,users.read,offline.access',
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    redirectUri: `${process.env.NEXTAUTH_URL}/api/oauth/callback/twitter`,
  },
  
  tiktok: {
    name: 'TikTok',
    authUrl: 'https://www.tiktok.com/v2/auth/authorize',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token',
    scope: 'video.upload,user.info.basic',
    clientId: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    redirectUri: `${process.env.NEXTAUTH_URL}/api/oauth/callback/tiktok`,
  },
}

export type PlatformType = keyof typeof oauthProviders

export function generateOAuthUrl(platform: PlatformType, state: string): string {
  const provider = oauthProviders[platform]
  if (!provider) throw new Error(`Unknown platform: ${platform}`)
  
  const params = new URLSearchParams({
    client_id: provider.clientId || '',
    redirect_uri: provider.redirectUri,
    scope: provider.scope,
    response_type: 'code',
    state,
  })
  
  return `${provider.authUrl}?${params.toString()}`
}

export async function exchangeCodeForToken(
  platform: PlatformType,
  code: string
): Promise<{
  access_token: string
  refresh_token?: string
  expires_in?: number
}> {
  const provider = oauthProviders[platform]
  if (!provider) throw new Error(`Unknown platform: ${platform}`)
  
  const params = new URLSearchParams({
    client_id: provider.clientId || '',
    client_secret: provider.clientSecret || '',
    code,
    redirect_uri: provider.redirectUri,
    grant_type: 'authorization_code',
  })
  
  const response = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }
  
  return response.json()
}
