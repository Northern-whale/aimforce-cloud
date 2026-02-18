export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'twitter';

export interface PostContent {
  text: string;
  mediaUrls?: string[];
  mediaType?: 'image' | 'video';
}

export interface PostResult {
  success: boolean;
  postId?: string;
  error?: string;
  platform: SocialPlatform;
}

export interface PlatformAccount {
  platform: SocialPlatform;
  accountId: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface PlatformAnalytics {
  platform: SocialPlatform;
  followers?: number;
  reach?: number;
  impressions?: number;
  engagement?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  timestamp: Date;
}

export interface PlatformConfig {
  name: string;
  displayName: string;
  color: string;
  icon: string;
  maxTextLength: number;
  supportsImages: boolean;
  supportsVideos: boolean;
  supportsCarousel: boolean;
  maxImagesPerPost: number;
  optimalPostTimes: string[]; // Hour ranges like "09:00-11:00"
  maxPostsPerDay: number;
}

export const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  instagram: {
    name: 'instagram',
    displayName: 'Instagram',
    color: '#E1306C',
    icon: '📸',
    maxTextLength: 2200,
    supportsImages: true,
    supportsVideos: true,
    supportsCarousel: true,
    maxImagesPerPost: 10,
    optimalPostTimes: ['09:00-11:00', '19:00-21:00'],
    maxPostsPerDay: 3,
  },
  facebook: {
    name: 'facebook',
    displayName: 'Facebook',
    color: '#1877F2',
    icon: '👤',
    maxTextLength: 63206,
    supportsImages: true,
    supportsVideos: true,
    supportsCarousel: true,
    maxImagesPerPost: 10,
    optimalPostTimes: ['12:00-15:00', '18:00-20:00'],
    maxPostsPerDay: 5,
  },
  tiktok: {
    name: 'tiktok',
    displayName: 'TikTok',
    color: '#000000',
    icon: '🎵',
    maxTextLength: 2200,
    supportsImages: false,
    supportsVideos: true,
    supportsCarousel: false,
    maxImagesPerPost: 0,
    optimalPostTimes: ['06:00-09:00', '19:00-23:00'],
    maxPostsPerDay: 4,
  },
  linkedin: {
    name: 'linkedin',
    displayName: 'LinkedIn',
    color: '#0A66C2',
    icon: '💼',
    maxTextLength: 3000,
    supportsImages: true,
    supportsVideos: true,
    supportsCarousel: false,
    maxImagesPerPost: 9,
    optimalPostTimes: ['07:00-09:00', '12:00-13:00', '17:00-18:00'],
    maxPostsPerDay: 2,
  },
  twitter: {
    name: 'twitter',
    displayName: 'Twitter/X',
    color: '#1DA1F2',
    icon: '🐦',
    maxTextLength: 280,
    supportsImages: true,
    supportsVideos: true,
    supportsCarousel: false,
    maxImagesPerPost: 4,
    optimalPostTimes: ['08:00-10:00', '12:00-13:00', '17:00-18:00'],
    maxPostsPerDay: 10,
  },
};

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}
