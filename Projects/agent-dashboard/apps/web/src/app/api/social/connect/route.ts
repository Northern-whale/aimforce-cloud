import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * OAuth connection endpoints for social platforms
 * 
 * Flow:
 * 1. Frontend initiates: GET /api/social/connect?platform=instagram
 * 2. Redirect to platform OAuth
 * 3. Platform redirects back: GET /api/social/connect/callback?code=...&state=...
 * 4. Exchange code for access token
 * 5. Save to database via POST /api/social/accounts
 */

const OAUTH_CONFIGS = {
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    scopes: ['instagram_basic', 'instagram_content_publish'],
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
    scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'],
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['w_member_social', 'r_liteprofile'],
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/v2/auth/authorize',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token',
    scopes: ['user.info.basic', 'video.publish', 'video.upload'],
  },
};

/**
 * GET /api/social/connect?platform=<platform>
 * Initiate OAuth flow
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const platform = url.searchParams.get('platform') as keyof typeof OAUTH_CONFIGS;

    if (!platform || !OAUTH_CONFIGS[platform]) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }

    const config = OAUTH_CONFIGS[platform];
    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    const redirectUri = process.env[`${platform.toUpperCase()}_REDIRECT_URI`] || 
                        `${process.env.NEXTAUTH_URL}/api/social/connect/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: `${platform} OAuth not configured` },
        { status: 500 }
      );
    }

    // Generate state token (should be stored in session/database in production)
    const state = Buffer.from(JSON.stringify({
      platform,
      userId: session.user.email,
      timestamp: Date.now(),
    })).toString('base64');

    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: config.scopes.join(' '),
      response_type: 'code',
      state,
    });

    const authUrl = `${config.authUrl}?${authParams}`;

    // Return redirect URL for frontend to handle
    return NextResponse.json({
      authUrl,
      state,
    });
  } catch (error: any) {
    console.error('Error initiating OAuth:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/connect/exchange
 * Exchange OAuth code for access token
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { platform, code, state } = body;

    if (!platform || !code) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify state (in production, check against stored state)
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      if (stateData.userId !== session.user.email) {
        throw new Error('State mismatch');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid state token' },
        { status: 400 }
      );
    }

    const config = OAUTH_CONFIGS[platform as keyof typeof OAUTH_CONFIGS];
    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`];
    const redirectUri = process.env[`${platform.toUpperCase()}_REDIRECT_URI`] ||
                        `${process.env.NEXTAUTH_URL}/api/social/connect/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'OAuth not configured' },
        { status: 500 }
      );
    }

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(`Token exchange failed: ${JSON.stringify(error)}`);
    }

    const tokenData = await tokenResponse.json();

    // Return tokens to be saved via /api/social/accounts
    return NextResponse.json({
      success: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    });
  } catch (error: any) {
    console.error('Error exchanging OAuth code:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
