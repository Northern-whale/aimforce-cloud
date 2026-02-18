# Social Media Automation Platform - Setup Guide

## 📋 Overview

This social media automation platform integrates with Instagram, Facebook, LinkedIn, Twitter/X, and TikTok to provide:
- Multi-platform posting (single post → all platforms)
- Scheduled posting with smart timing
- Analytics and performance tracking
- Content calendar management
- Automated retry logic for failed posts

## 🚀 Quick Start

### 1. Database Migration

The Prisma schema has been updated with two new models:
- `SocialAccount` - Stores connected platform accounts
- `ScheduledPost` - Stores scheduled and posted content

Migration has already been applied. If you need to reset:

```bash
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web
npx prisma migrate reset
npx prisma migrate dev
```

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth (existing)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY="64-character-hex-string-for-token-encryption"

# CRON Security (generate with: openssl rand -hex 32)
CRON_SECRET="random-secure-string-for-cron-endpoint"

# Instagram/Facebook (Meta Graph API)
INSTAGRAM_CLIENT_ID="your-meta-app-id"
INSTAGRAM_CLIENT_SECRET="your-meta-app-secret"
INSTAGRAM_REDIRECT_URI="http://localhost:3000/api/social/connect/callback"

# Facebook uses same Meta app credentials
FACEBOOK_CLIENT_ID="your-meta-app-id"
FACEBOOK_CLIENT_SECRET="your-meta-app-secret"
FACEBOOK_REDIRECT_URI="http://localhost:3000/api/social/connect/callback"

# LinkedIn
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
LINKEDIN_REDIRECT_URI="http://localhost:3000/api/social/connect/callback"

# Twitter/X
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"
TWITTER_REDIRECT_URI="http://localhost:3000/api/social/connect/callback"

# TikTok (requires business account verification)
TIKTOK_CLIENT_ID="your-tiktok-client-key"
TIKTOK_CLIENT_SECRET="your-tiktok-client-secret"
TIKTOK_REDIRECT_URI="http://localhost:3000/api/social/connect/callback"
```

### 3. Generate Encryption Key

```bash
# Generate a secure encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
ENCRYPTION_KEY="<generated-key>"
```

### 4. Start Development Server

```bash
npm run dev
# Navigate to http://localhost:3000/social
```

---

## 🔑 OAuth Setup (Platform by Platform)

### Instagram & Facebook (Meta Graph API)

Instagram uses Facebook's Graph API and requires a Facebook App.

**Steps:**

1. **Create Facebook App**
   - Go to [developers.facebook.com](https://developers.facebook.com/)
   - Click "Create App" → Choose "Business" type
   - Name: "Your Business Social Manager"

2. **Add Products**
   - Add "Instagram Basic Display" (for personal accounts)
   - OR "Instagram Graph API" (for business accounts - recommended)
   - Add "Facebook Login"

3. **Configure OAuth**
   - Settings → Basic → Copy App ID and App Secret
   - Add redirect URI: `http://localhost:3000/api/social/connect/callback`
   - For production: `https://yourdomain.com/api/social/connect/callback`

4. **Instagram Business Account**
   - Instagram Graph API requires:
     - Instagram Professional Account (Business or Creator)
     - Connected to a Facebook Page
   - Go to Instagram → Settings → Account → Switch to Professional Account

5. **Permissions**
   - Request permissions:
     - `instagram_basic`
     - `instagram_content_publish`
     - `pages_show_list`
     - `pages_read_engagement`
     - `pages_manage_posts`

6. **Environment Variables**
   ```env
   INSTAGRAM_CLIENT_ID="<your-app-id>"
   INSTAGRAM_CLIENT_SECRET="<your-app-secret>"
   ```

**Note:** Meta requires App Review for production use. In development, you can test with admin/developer/tester roles.

---

### LinkedIn

**Steps:**

1. **Create LinkedIn App**
   - Go to [linkedin.com/developers](https://www.linkedin.com/developers/)
   - Click "Create app"
   - Fill in app details (name, company page, logo)

2. **Get Credentials**
   - Navigate to "Auth" tab
   - Copy Client ID and Client Secret

3. **Configure OAuth**
   - Add redirect URL: `http://localhost:3000/api/social/connect/callback`
   - For production: `https://yourdomain.com/api/social/connect/callback`

4. **Request Permissions**
   - Go to "Products" tab
   - Add "Share on LinkedIn" product
   - Request `w_member_social` scope

5. **Environment Variables**
   ```env
   LINKEDIN_CLIENT_ID="<your-client-id>"
   LINKEDIN_CLIENT_SECRET="<your-client-secret>"
   ```

**Note:** LinkedIn has strict API usage limits. Review their [API terms](https://www.linkedin.com/legal/l/api-terms-of-use).

---

### Twitter/X

**Steps:**

1. **Create Twitter App**
   - Go to [developer.twitter.com](https://developer.twitter.com/)
   - Apply for developer account (can take 1-2 days)
   - Once approved, create a new app in the Developer Portal

2. **Enable OAuth 2.0**
   - App Settings → User authentication settings → OAuth 2.0
   - Type of App: Web App
   - App permissions: Read and Write
   - Callback URL: `http://localhost:3000/api/social/connect/callback`

3. **Get Credentials**
   - OAuth 2.0 Client ID and Client Secret
   - (NOT the API Key and API Secret - those are OAuth 1.0a)

4. **Environment Variables**
   ```env
   TWITTER_CLIENT_ID="<your-oauth2-client-id>"
   TWITTER_CLIENT_SECRET="<your-oauth2-client-secret>"
   ```

**Note:** Twitter API v2 requires Elevated access for some features. Free tier has posting limits.

---

### TikTok

**⚠️ Important:** TikTok API access requires business verification and can take several weeks.

**Steps:**

1. **Apply for TikTok for Business**
   - Go to [developers.tiktok.com](https://developers.tiktok.com/)
   - Apply for API access (requires business verification)
   - This can take 2-4 weeks for approval

2. **Create App**
   - Once approved, create a new app in TikTok Developer Portal
   - Add "Content Posting API" product

3. **Configure OAuth**
   - Add redirect URI: `http://localhost:3000/api/social/connect/callback`

4. **Get Credentials**
   - Client Key and Client Secret

5. **Environment Variables**
   ```env
   TIKTOK_CLIENT_ID="<your-client-key>"
   TIKTOK_CLIENT_SECRET="<your-client-secret>"
   ```

**Recommendation:** Start with Instagram, Facebook, LinkedIn, and Twitter. Add TikTok later once approved.

---

## ⏰ CRON Setup (Automated Posting)

The system checks for scheduled posts every minute and posts them automatically.

### Option 1: Vercel Cron (Recommended for Vercel Deployment)

1. Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/social/cron",
      "schedule": "* * * * *"
    }
  ]
}
```

2. Deploy to Vercel - cron will run automatically

3. Set `CRON_SECRET` in Vercel environment variables

### Option 2: External Cron Service (cron-job.org)

1. Sign up at [cron-job.org](https://cron-job.org/)

2. Create new cron job:
   - URL: `https://yourdomain.com/api/social/cron`
   - Schedule: Every minute (`* * * * *`)
   - HTTP Method: POST
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`

3. Enable and save

### Option 3: Self-Hosted Node Cron

1. Install cron package:

```bash
npm install node-cron
```

2. Create `src/cron/social-posting.ts`:

```typescript
import cron from 'node-cron';

// Run every minute
cron.schedule('* * * * *', async () => {
  try {
    const response = await fetch('http://localhost:3000/api/social/cron', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
    });
    
    const result = await response.json();
    console.log('[CRON] Social posting:', result);
  } catch (error) {
    console.error('[CRON] Error:', error);
  }
});
```

3. Import in your app startup

### Testing CRON Endpoint

```bash
# Test manually
curl -X POST http://localhost:3000/api/social/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "timestamp": "2024-02-17T18:30:00.000Z",
  "duration": 123,
  "results": {
    "processed": 2,
    "succeeded": 2,
    "failed": 0,
    "errors": []
  }
}
```

---

## 🧪 Testing

### 1. Mock Mode (No Real Posts)

For testing without actually posting to social media, modify platform functions to return mock data:

```typescript
// src/lib/social/instagram.ts
export async function postToInstagram(account, content) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[MOCK] Instagram post:', content);
    return {
      success: true,
      postId: `mock_${Date.now()}`,
      platform: 'instagram',
    };
  }
  // ... real implementation
}
```

### 2. Test OAuth Flow

1. Start dev server
2. Navigate to `/social/settings`
3. Click "Connect" on a platform
4. Complete OAuth in popup
5. Verify account appears as connected

### 3. Test Scheduling

1. Go to `/social`
2. Select platforms and write a post
3. Set schedule time to 2 minutes from now
4. Click "Schedule Post"
5. Watch the CRON logs - post should execute at scheduled time

### 4. Test Manual Posting

Set schedule time to current time (or leave blank) and click "Post Now"

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

```bash
git add .
git commit -m "Add social media automation"
git push origin main
```

2. **Deploy to Vercel**
   - Import repository
   - Add all environment variables from `.env`
   - Deploy

3. **Update OAuth Redirect URIs**
   - Update all platform redirect URIs to: `https://yourdomain.vercel.app/api/social/connect/callback`

4. **Enable Cron**
   - Add `vercel.json` with cron configuration (see above)
   - Redeploy

### Railway / Render

1. Create new project from Git repository
2. Add environment variables
3. Deploy
4. Use external cron service (cron-job.org) to call `/api/social/cron`

### Self-Hosted (VPS)

1. Clone repository
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Start: `npm start`
5. Use PM2 to keep running:

```bash
pm2 start npm --name "social-dashboard" -- start
pm2 startup
pm2 save
```

6. Set up system cron:

```bash
crontab -e
# Add:
* * * * * curl -X POST http://localhost:3000/api/social/cron -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📊 Usage

### Creating a Post

1. Navigate to `/social`
2. Select platforms (Instagram, Facebook, LinkedIn, etc.)
3. Write your content (respects character limits)
4. (Optional) Add media URLs
5. (Optional) Set schedule time
6. Click "Post Now" or "Schedule Post"

### Managing Posts

- **Calendar View:** `/social/calendar` - Visual calendar of all scheduled posts
- **Edit/Delete:** Click on a post in the calendar
- **Retry Failed Posts:** Automatic retry with exponential backoff (1min, 5min, 15min)

### Analytics

- **Dashboard:** `/social` - Overview of all platforms
- **Detailed Analytics:** `/social/analytics` - Deep dive into metrics
- **Refresh:** Click "Refresh" to pull latest data from platforms

### Platform Management

- **Connect/Disconnect:** `/social/settings`
- **View Status:** Green = connected, Red = needs reauth

---

## 🔒 Security

1. **Token Encryption**
   - All access tokens stored encrypted using AES-256-GCM
   - ENCRYPTION_KEY must be set in production

2. **CRON Endpoint Protection**
   - Protected by Bearer token authentication
   - CRON_SECRET must match

3. **OAuth State Validation**
   - State tokens prevent CSRF attacks
   - Timestamp validation (reject old states)

4. **Environment Variables**
   - Never commit `.env` to git
   - Use platform's secret management in production

---

## 🐛 Troubleshooting

### "OAuth not configured" error

**Cause:** Missing or incorrect OAuth credentials

**Fix:** Verify environment variables are set correctly:
```bash
echo $INSTAGRAM_CLIENT_ID
echo $INSTAGRAM_CLIENT_SECRET
```

### Posts not executing on schedule

**Cause:** CRON not running or failing authentication

**Fix:**
1. Check CRON logs
2. Test CRON endpoint manually
3. Verify CRON_SECRET is correct

### "Failed to post to [platform]" error

**Causes:**
- Expired access token
- Invalid media URL
- Character limit exceeded
- Platform-specific requirements

**Fix:**
1. Check error message in post details
2. Reconnect the platform if token expired
3. Verify content meets platform requirements

### Database locked errors

**Cause:** SQLite limitations with concurrent writes

**Fix:** Migrate to PostgreSQL for production:

1. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Run migration:
   ```bash
   npx prisma migrate dev
   ```

---

## 📚 Resources

- [Meta Graph API Docs](https://developers.facebook.com/docs/graph-api/)
- [LinkedIn API Docs](https://docs.microsoft.com/en-us/linkedin/)
- [Twitter API v2 Docs](https://developer.twitter.com/en/docs/twitter-api)
- [TikTok API Docs](https://developers.tiktok.com/doc/overview)

---

## ✅ Success Checklist

- [ ] Database migrated successfully
- [ ] Environment variables configured
- [ ] At least 3 platforms connected (Instagram, Facebook, LinkedIn recommended)
- [ ] Test post scheduled and executed
- [ ] Analytics data visible
- [ ] CRON job running (check logs)
- [ ] OAuth flows working
- [ ] Content calendar displaying posts

---

## 🚀 Next Steps

1. **Rate Limiting:** Implement per-user rate limits
2. **Media Upload:** Direct file upload instead of URLs
3. **Post Templates:** Save and reuse post templates
4. **AI Content Generation:** Integrate with Claude for content suggestions
5. **Comment Management:** Reply to comments from dashboard
6. **Team Collaboration:** Multi-user support with roles
7. **Mobile App:** React Native app for on-the-go posting

---

**Built with:** Next.js 15, Prisma, SQLite, Meta Graph API, LinkedIn API, Twitter API v2

**Last Updated:** February 17, 2026
