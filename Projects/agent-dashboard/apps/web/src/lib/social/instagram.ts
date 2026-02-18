import type { PlatformAccount, PostContent, PostResult, PlatformAnalytics } from './types';

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Post to Instagram using Meta Graph API
 * Requires Instagram Business Account connected to Facebook Page
 */
export async function postToInstagram(
  account: PlatformAccount,
  content: PostContent
): Promise<PostResult> {
  try {
    const { text, mediaUrls = [], mediaType = 'image' } = content;
    
    if (mediaUrls.length === 0) {
      throw new Error('Instagram requires at least one image or video');
    }

    // Step 1: Create container(s)
    const containers: string[] = [];
    
    if (mediaUrls.length === 1) {
      // Single post
      const containerId = await createMediaContainer(
        account.accountId,
        account.accessToken,
        mediaUrls[0],
        text,
        mediaType
      );
      containers.push(containerId);
    } else {
      // Carousel post
      for (const url of mediaUrls) {
        const containerId = await createMediaContainer(
          account.accountId,
          account.accessToken,
          url,
          undefined, // No caption on individual items
          mediaType
        );
        containers.push(containerId);
      }
    }

    // Step 2: Publish the post
    const postId = await publishMediaContainer(
      account.accountId,
      account.accessToken,
      containers,
      text
    );

    return {
      success: true,
      postId,
      platform: 'instagram',
    };
  } catch (error: any) {
    console.error('Instagram posting error:', error);
    return {
      success: false,
      error: error.message || 'Failed to post to Instagram',
      platform: 'instagram',
    };
  }
}

/**
 * Create a media container for Instagram post
 */
async function createMediaContainer(
  igUserId: string,
  accessToken: string,
  mediaUrl: string,
  caption?: string,
  mediaType: 'image' | 'video' = 'image'
): Promise<string> {
  const endpoint = `${GRAPH_API_BASE}/${igUserId}/media`;
  
  const params: any = {
    access_token: accessToken,
  };

  if (mediaType === 'image') {
    params.image_url = mediaUrl;
  } else {
    params.media_type = 'VIDEO';
    params.video_url = mediaUrl;
  }

  if (caption) {
    params.caption = caption;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create container: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Publish media container(s) to Instagram
 */
async function publishMediaContainer(
  igUserId: string,
  accessToken: string,
  containerIds: string[],
  caption?: string
): Promise<string> {
  const endpoint = `${GRAPH_API_BASE}/${igUserId}/media_publish`;
  
  const params: any = {
    access_token: accessToken,
  };

  if (containerIds.length === 1) {
    params.creation_id = containerIds[0];
  } else {
    // Carousel
    params.media_type = 'CAROUSEL';
    params.children = containerIds;
  }

  if (caption) {
    params.caption = caption;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to publish: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Get Instagram account analytics
 */
export async function getInstagramAnalytics(
  account: PlatformAccount
): Promise<PlatformAnalytics> {
  try {
    const endpoint = `${GRAPH_API_BASE}/${account.accountId}`;
    const params = new URLSearchParams({
      fields: 'followers_count,media_count',
      access_token: account.accessToken,
    });

    const response = await fetch(`${endpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Instagram analytics');
    }

    const data = await response.json();

    // Get insights for engagement
    const insightsEndpoint = `${GRAPH_API_BASE}/${account.accountId}/insights`;
    const insightsParams = new URLSearchParams({
      metric: 'impressions,reach,profile_views',
      period: 'day',
      access_token: account.accessToken,
    });

    const insightsResponse = await fetch(`${insightsEndpoint}?${insightsParams}`);
    const insightsData = insightsResponse.ok ? await insightsResponse.json() : null;

    return {
      platform: 'instagram',
      followers: data.followers_count,
      reach: insightsData?.data?.find((m: any) => m.name === 'reach')?.values?.[0]?.value,
      impressions: insightsData?.data?.find((m: any) => m.name === 'impressions')?.values?.[0]?.value,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Instagram analytics error:', error);
    return {
      platform: 'instagram',
      timestamp: new Date(),
    };
  }
}

/**
 * Validate Instagram access token
 */
export async function validateInstagramToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${GRAPH_API_BASE}/me?access_token=${accessToken}`
    );
    return response.ok;
  } catch {
    return false;
  }
}
