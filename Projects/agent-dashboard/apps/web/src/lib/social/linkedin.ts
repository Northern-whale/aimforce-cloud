import type { PlatformAccount, PostContent, PostResult, PlatformAnalytics } from './types';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

/**
 * Post to LinkedIn using LinkedIn API v2
 */
export async function postToLinkedIn(
  account: PlatformAccount,
  content: PostContent
): Promise<PostResult> {
  try {
    const { text, mediaUrls = [] } = content;
    
    // Get person URN
    const personUrn = `urn:li:person:${account.accountId}`;
    
    const shareData: any = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text,
          },
          shareMediaCategory: mediaUrls.length > 0 ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    // Add media if present
    if (mediaUrls.length > 0) {
      const media = await Promise.all(
        mediaUrls.map(async (url) => {
          // In production, you'd upload the image to LinkedIn first
          // This is a simplified version
          return {
            status: 'READY',
            description: {
              text: 'Image',
            },
            media: url, // This should be the LinkedIn-uploaded asset URN
            title: {
              text: 'Image',
            },
          };
        })
      );

      shareData.specificContent['com.linkedin.ugc.ShareContent'].media = media;
    }

    const response = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(shareData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LinkedIn API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const postId = data.id;

    return {
      success: true,
      postId,
      platform: 'linkedin',
    };
  } catch (error: any) {
    console.error('LinkedIn posting error:', error);
    return {
      success: false,
      error: error.message || 'Failed to post to LinkedIn',
      platform: 'linkedin',
    };
  }
}

/**
 * Get LinkedIn analytics
 */
export async function getLinkedInAnalytics(
  account: PlatformAccount
): Promise<PlatformAnalytics> {
  try {
    const personUrn = `urn:li:person:${account.accountId}`;
    
    // Get connection count (follower equivalent)
    const profileEndpoint = `${LINKEDIN_API_BASE}/me`;
    const response = await fetch(profileEndpoint, {
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LinkedIn profile');
    }

    const profileData = await response.json();

    // Get share statistics (this requires additional API calls in production)
    return {
      platform: 'linkedin',
      followers: 0, // Would need Organization API for follower count
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('LinkedIn analytics error:', error);
    return {
      platform: 'linkedin',
      timestamp: new Date(),
    };
  }
}

/**
 * Validate LinkedIn access token
 */
export async function validateLinkedInToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${LINKEDIN_API_BASE}/me`, {
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
 * Upload image to LinkedIn (helper for future implementation)
 */
async function uploadImageToLinkedIn(
  accessToken: string,
  personUrn: string,
  imageUrl: string
): Promise<string> {
  // Step 1: Register upload
  const registerEndpoint = `${LINKEDIN_API_BASE}/assets?action=registerUpload`;
  const registerData = {
    registerUploadRequest: {
      recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
      owner: personUrn,
      serviceRelationships: [
        {
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent',
        },
      ],
    },
  };

  const registerResponse = await fetch(registerEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registerData),
  });

  const registerResult = await registerResponse.json();
  const uploadUrl = registerResult.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const asset = registerResult.value.asset;

  // Step 2: Upload image binary (simplified - in production, fetch and upload)
  // const imageResponse = await fetch(imageUrl);
  // const imageBuffer = await imageResponse.arrayBuffer();
  // await fetch(uploadUrl, { method: 'PUT', body: imageBuffer });

  return asset;
}
