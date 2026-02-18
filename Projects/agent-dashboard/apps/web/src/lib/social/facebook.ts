import type { PlatformAccount, PostContent, PostResult, PlatformAnalytics } from './types';

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Post to Facebook Page using Meta Graph API
 */
export async function postToFacebook(
  account: PlatformAccount,
  content: PostContent
): Promise<PostResult> {
  try {
    const { text, mediaUrls = [], mediaType = 'image' } = content;
    
    let postId: string;

    if (mediaUrls.length === 0) {
      // Text-only post
      postId = await createTextPost(account.accountId, account.accessToken, text);
    } else if (mediaUrls.length === 1) {
      // Single media post
      if (mediaType === 'video') {
        postId = await createVideoPost(account.accountId, account.accessToken, mediaUrls[0], text);
      } else {
        postId = await createPhotoPost(account.accountId, account.accessToken, mediaUrls[0], text);
      }
    } else {
      // Multiple photos (album)
      postId = await createPhotoAlbum(account.accountId, account.accessToken, mediaUrls, text);
    }

    return {
      success: true,
      postId,
      platform: 'facebook',
    };
  } catch (error: any) {
    console.error('Facebook posting error:', error);
    return {
      success: false,
      error: error.message || 'Failed to post to Facebook',
      platform: 'facebook',
    };
  }
}

/**
 * Create a text-only post
 */
async function createTextPost(
  pageId: string,
  accessToken: string,
  message: string
): Promise<string> {
  const endpoint = `${GRAPH_API_BASE}/${pageId}/feed`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      access_token: accessToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create text post: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Create a photo post
 */
async function createPhotoPost(
  pageId: string,
  accessToken: string,
  photoUrl: string,
  message: string
): Promise<string> {
  const endpoint = `${GRAPH_API_BASE}/${pageId}/photos`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: photoUrl,
      caption: message,
      access_token: accessToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create photo post: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Create a video post
 */
async function createVideoPost(
  pageId: string,
  accessToken: string,
  videoUrl: string,
  description: string
): Promise<string> {
  const endpoint = `${GRAPH_API_BASE}/${pageId}/videos`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_url: videoUrl,
      description,
      access_token: accessToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create video post: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Create a photo album post
 */
async function createPhotoAlbum(
  pageId: string,
  accessToken: string,
  photoUrls: string[],
  message: string
): Promise<string> {
  // Upload photos first
  const photoIds: string[] = [];
  
  for (const url of photoUrls) {
    const endpoint = `${GRAPH_API_BASE}/${pageId}/photos`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        published: false, // Don't publish individual photos
        access_token: accessToken,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      photoIds.push(data.id);
    }
  }

  // Create post with attached photos
  const feedEndpoint = `${GRAPH_API_BASE}/${pageId}/feed`;
  const attachedMedia = photoIds.map(id => ({ media_fbid: id }));
  
  const response = await fetch(feedEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      attached_media: attachedMedia,
      access_token: accessToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create album post: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Get Facebook Page analytics
 */
export async function getFacebookAnalytics(
  account: PlatformAccount
): Promise<PlatformAnalytics> {
  try {
    const endpoint = `${GRAPH_API_BASE}/${account.accountId}`;
    const params = new URLSearchParams({
      fields: 'followers_count,fan_count',
      access_token: account.accessToken,
    });

    const response = await fetch(`${endpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Facebook analytics');
    }

    const data = await response.json();

    // Get page insights
    const insightsEndpoint = `${GRAPH_API_BASE}/${account.accountId}/insights`;
    const insightsParams = new URLSearchParams({
      metric: 'page_impressions,page_engaged_users,page_post_engagements',
      period: 'day',
      access_token: account.accessToken,
    });

    const insightsResponse = await fetch(`${insightsEndpoint}?${insightsParams}`);
    const insightsData = insightsResponse.ok ? await insightsResponse.json() : null;

    return {
      platform: 'facebook',
      followers: data.fan_count || data.followers_count,
      impressions: insightsData?.data?.find((m: any) => m.name === 'page_impressions')?.values?.[0]?.value,
      engagement: insightsData?.data?.find((m: any) => m.name === 'page_engaged_users')?.values?.[0]?.value,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Facebook analytics error:', error);
    return {
      platform: 'facebook',
      timestamp: new Date(),
    };
  }
}

/**
 * Validate Facebook access token
 */
export async function validateFacebookToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${GRAPH_API_BASE}/me?access_token=${accessToken}`
    );
    return response.ok;
  } catch {
    return false;
  }
}
