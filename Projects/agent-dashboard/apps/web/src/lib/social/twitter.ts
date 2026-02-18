import type { PlatformAccount, PostContent, PostResult, PlatformAnalytics } from './types';

const TWITTER_API_BASE = 'https://api.twitter.com/2';

/**
 * Post to Twitter/X using API v2
 */
export async function postToTwitter(
  account: PlatformAccount,
  content: PostContent
): Promise<PostResult> {
  try {
    const { text, mediaUrls = [] } = content;
    
    let mediaIds: string[] = [];
    
    // Upload media if present
    if (mediaUrls.length > 0) {
      mediaIds = await Promise.all(
        mediaUrls.map(url => uploadMediaToTwitter(account.accessToken, url))
      );
    }

    // Create tweet
    const tweetData: any = {
      text: text,
    };

    if (mediaIds.length > 0) {
      tweetData.media = {
        media_ids: mediaIds,
      };
    }

    const response = await fetch(`${TWITTER_API_BASE}/tweets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Twitter API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const postId = data.data.id;

    return {
      success: true,
      postId,
      platform: 'twitter',
    };
  } catch (error: any) {
    console.error('Twitter posting error:', error);
    return {
      success: false,
      error: error.message || 'Failed to post to Twitter',
      platform: 'twitter',
    };
  }
}

/**
 * Upload media to Twitter
 */
async function uploadMediaToTwitter(
  accessToken: string,
  mediaUrl: string
): Promise<string> {
  // Twitter media upload uses v1.1 API with multipart upload
  // This is a simplified version - production would need chunked upload for large files
  
  const uploadEndpoint = 'https://upload.twitter.com/1.1/media/upload.json';
  
  // Fetch media file
  const mediaResponse = await fetch(mediaUrl);
  const mediaBuffer = await mediaResponse.arrayBuffer();
  const mediaBase64 = Buffer.from(mediaBuffer).toString('base64');
  
  // Upload media
  const formData = new URLSearchParams();
  formData.append('media_data', mediaBase64);
  
  const response = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload media to Twitter');
  }

  const data = await response.json();
  return data.media_id_string;
}

/**
 * Create a thread (multiple tweets)
 */
export async function postTwitterThread(
  account: PlatformAccount,
  tweets: string[]
): Promise<PostResult> {
  try {
    let previousTweetId: string | undefined;
    const tweetIds: string[] = [];

    for (const text of tweets) {
      const tweetData: any = { text };
      
      if (previousTweetId) {
        tweetData.reply = {
          in_reply_to_tweet_id: previousTweetId,
        };
      }

      const response = await fetch(`${TWITTER_API_BASE}/tweets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tweetData),
      });

      if (!response.ok) {
        throw new Error('Failed to post tweet in thread');
      }

      const data = await response.json();
      previousTweetId = data.data.id as string;
      tweetIds.push(previousTweetId);
    }

    return {
      success: true,
      postId: tweetIds[0], // First tweet ID
      platform: 'twitter',
    };
  } catch (error: any) {
    console.error('Twitter thread posting error:', error);
    return {
      success: false,
      error: error.message || 'Failed to post Twitter thread',
      platform: 'twitter',
    };
  }
}

/**
 * Get Twitter analytics
 */
export async function getTwitterAnalytics(
  account: PlatformAccount
): Promise<PlatformAnalytics> {
  try {
    // Get user info
    const userEndpoint = `${TWITTER_API_BASE}/users/me`;
    const params = new URLSearchParams({
      'user.fields': 'public_metrics',
    });

    const response = await fetch(`${userEndpoint}?${params}`, {
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Twitter analytics');
    }

    const data = await response.json();
    const metrics = data.data.public_metrics;

    return {
      platform: 'twitter',
      followers: metrics.followers_count,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Twitter analytics error:', error);
    return {
      platform: 'twitter',
      timestamp: new Date(),
    };
  }
}

/**
 * Validate Twitter access token
 */
export async function validateTwitterToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${TWITTER_API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Split long text into thread-sized chunks (280 chars max)
 */
export function splitIntoThreads(text: string, maxLength: number = 280): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const tweets: string[] = [];
  const sentences = text.split('. ');
  let currentTweet = '';

  for (const sentence of sentences) {
    const withSentence = currentTweet + (currentTweet ? '. ' : '') + sentence;
    
    if (withSentence.length <= maxLength - 5) { // Reserve space for " (1/n)"
      currentTweet = withSentence;
    } else {
      if (currentTweet) {
        tweets.push(currentTweet);
      }
      currentTweet = sentence;
    }
  }

  if (currentTweet) {
    tweets.push(currentTweet);
  }

  // Add thread numbering
  if (tweets.length > 1) {
    return tweets.map((tweet, i) => `${tweet} (${i + 1}/${tweets.length})`);
  }

  return tweets;
}
