/**
 * Unified Social Media API
 * Routes to platform-specific implementations
 */

import type { SocialPlatform, PlatformAccount, PostContent, PostResult, PlatformAnalytics } from './types';
import { postToInstagram, getInstagramAnalytics, validateInstagramToken } from './instagram';
import { postToFacebook, getFacebookAnalytics, validateFacebookToken } from './facebook';
import { postToLinkedIn, getLinkedInAnalytics, validateLinkedInToken } from './linkedin';
import { postToTwitter, getTwitterAnalytics, validateTwitterToken, splitIntoThreads } from './twitter';
import { postToTikTok, getTikTokAnalytics, validateTikTokToken } from './tiktok';

export * from './types';
export * from './encryption';

/**
 * Post content to a specific platform
 */
export async function postToPlatform(
  platform: SocialPlatform,
  account: PlatformAccount,
  content: PostContent
): Promise<PostResult> {
  switch (platform) {
    case 'instagram':
      return postToInstagram(account, content);
    case 'facebook':
      return postToFacebook(account, content);
    case 'linkedin':
      return postToLinkedIn(account, content);
    case 'twitter':
      // Handle Twitter threads for long content
      if (content.text.length > 280 && !content.mediaUrls?.length) {
        const { postTwitterThread } = await import('./twitter');
        const tweets = splitIntoThreads(content.text);
        return postTwitterThread(account, tweets);
      }
      return postToTwitter(account, content);
    case 'tiktok':
      return postToTikTok(account, content);
    default:
      return {
        success: false,
        error: `Unsupported platform: ${platform}`,
        platform,
      };
  }
}

/**
 * Get analytics for a platform
 */
export async function getPlatformAnalytics(
  platform: SocialPlatform,
  account: PlatformAccount
): Promise<PlatformAnalytics> {
  switch (platform) {
    case 'instagram':
      return getInstagramAnalytics(account);
    case 'facebook':
      return getFacebookAnalytics(account);
    case 'linkedin':
      return getLinkedInAnalytics(account);
    case 'twitter':
      return getTwitterAnalytics(account);
    case 'tiktok':
      return getTikTokAnalytics(account);
    default:
      return {
        platform,
        timestamp: new Date(),
      };
  }
}

/**
 * Validate platform access token
 */
export async function validatePlatformToken(
  platform: SocialPlatform,
  accessToken: string
): Promise<boolean> {
  switch (platform) {
    case 'instagram':
      return validateInstagramToken(accessToken);
    case 'facebook':
      return validateFacebookToken(accessToken);
    case 'linkedin':
      return validateLinkedInToken(accessToken);
    case 'twitter':
      return validateTwitterToken(accessToken);
    case 'tiktok':
      return validateTikTokToken(accessToken);
    default:
      return false;
  }
}

/**
 * Get all analytics for connected accounts
 */
export async function getAllAnalytics(
  accounts: PlatformAccount[]
): Promise<PlatformAnalytics[]> {
  const analyticsPromises = accounts.map(account =>
    getPlatformAnalytics(account.platform, account)
  );
  
  return Promise.all(analyticsPromises);
}

/**
 * Post to multiple platforms simultaneously
 */
export async function postToMultiplePlatforms(
  platforms: SocialPlatform[],
  accounts: PlatformAccount[],
  content: PostContent
): Promise<PostResult[]> {
  const postPromises = platforms.map(platform => {
    const account = accounts.find(acc => acc.platform === platform);
    if (!account) {
      return Promise.resolve({
        success: false,
        error: `No account found for ${platform}`,
        platform,
      } as PostResult);
    }
    return postToPlatform(platform, account, content);
  });
  
  return Promise.all(postPromises);
}
