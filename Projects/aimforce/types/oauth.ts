/**
 * OAuth-related TypeScript types
 */

export interface OAuthTokens {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  scope?: string
}

export interface OAuthState {
  clientId: string
  platform: string
  nonce: string
}

export interface SocialAccountInfo {
  id: string
  name: string
  username?: string
  email?: string
  profileUrl?: string
  avatarUrl?: string
}

export type OAuthPlatform = 
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'LINKEDIN'
  | 'TWITTER'
  | 'TIKTOK'
  | 'GOOGLE'

export interface OAuthError {
  error: string
  error_description?: string
  error_uri?: string
}
