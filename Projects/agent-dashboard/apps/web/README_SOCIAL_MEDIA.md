# 🚀 Social Media Automation Platform

## Overview

A complete multi-platform social media management system integrated into the AI Receptionist dashboard. Post to Instagram, Facebook, LinkedIn, Twitter/X, and TikTok from a single interface with smart scheduling, analytics, and automated retry logic.

## 🎯 Features

### ✅ Core Features Implemented

- **Multi-Platform Posting**: Post to 5 platforms simultaneously from one interface
- **Smart Scheduling**: AI-suggested optimal posting times per platform
- **Content Calendar**: Visual calendar with drag-and-drop scheduling
- **Analytics Dashboard**: Real-time metrics from all platforms
- **Automated Retry**: 3-attempt retry logic with exponential backoff
- **Platform Health Monitoring**: Connection status and token management
- **Secure Token Storage**: AES-256-GCM encryption for access tokens
- **OAuth 2.0 Integration**: Secure platform authentication
- **CRON-based Automation**: Minute-accurate post execution

### 📊 Platform Support

| Platform | Posting | Analytics | Status |
|----------|---------|-----------|--------|
| Instagram | ✅ | ✅ | Production Ready |
| Facebook | ✅ | ✅ | Production Ready |
| LinkedIn | ✅ | ⚠️ | Basic Analytics |
| Twitter/X | ✅ | ✅ | Production Ready |
| TikTok | ⚠️ | ⚠️ | API Access Required |

## 📁 Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── social/
│   │       ├── page.tsx              # Main dashboard
│   │       ├── calendar/
│   │       │   └── page.tsx          # Content calendar
│   │       ├── analytics/
│   │       │   └── page.tsx          # Analytics dashboard
│   │       └── settings/
│   │           └── page.tsx          # Platform connections
│   └── api/
│       └── social/
│           ├── accounts/
│           │   └── route.ts          # Account management
│           ├── posts/
│           │   └── route.ts          # Post CRUD
│           ├── analytics/
│           │   └── route.ts          # Analytics fetching
│           ├── connect/
│           │   └── route.ts          # OAuth flow
│           └── cron/
│               └── route.ts          # Automated posting
├── components/
│   └── social/
│       ├── platform-connect.tsx       # Platform connection UI
│       ├── post-composer.tsx          # Post creation form
│       ├── content-calendar.tsx       # Calendar view
│       └── analytics-widgets.tsx      # Analytics components
└── lib/
    ├── social/
    │   ├── index.ts                   # Unified API
    │   ├── types.ts                   # TypeScript types
    │   ├── encryption.ts              # Token encryption
    │   ├── instagram.ts               # Instagram API
    │   ├── facebook.ts                # Facebook API
    │   ├── linkedin.ts                # LinkedIn API
    │   ├── twitter.ts                 # Twitter API
    │   └── tiktok.ts                  # TikTok API (placeholder)
    └── posting/
        └── scheduler.ts               # Posting engine
```

## 🗄️ Database Schema

### SocialAccount
```prisma
model SocialAccount {
  id           String    @id @default(cuid())
  userId       String
  platform     String    // instagram, facebook, tiktok, linkedin, twitter
  accountId    String    // platform-specific ID
  accountName  String    // @username or page name
  accessToken  String    // encrypted
  refreshToken String?   // encrypted
  expiresAt    DateTime?
  connected    Boolean   @default(true)
  metadata     String?   // JSON for platform-specific data
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  user         User      @relation(fields: [userId], references: [id])
  
  @@unique([userId, platform, accountId])
}
```

### ScheduledPost
```prisma
model ScheduledPost {
  id           String    @id @default(cuid())
  userId       String
  platforms    String    // JSON array ["instagram", "facebook"]
  content      String
  mediaUrls    String?   // JSON array of media URLs
  scheduledFor DateTime
  status       String    @default("draft") // draft, scheduled, posting, posted, failed
  postIds      String?   // JSON object { "instagram": "post_id" }
  analytics    String?   // JSON object with platform analytics
  error        String?
  retryCount   Int       @default(0)
  lastRetryAt  DateTime?
  createdAt    DateTime  @default(now())
  postedAt     DateTime?
  updatedAt    DateTime  @updatedAt
  
  user         User      @relation(fields: [userId], references: [id])
  
  @@index([status, scheduledFor])
  @@index([userId, status])
}
```

## 🔌 API Endpoints

### Accounts Management
- `GET /api/social/accounts` - List connected accounts
- `POST /api/social/accounts` - Add/update account
- `DELETE /api/social/accounts?id=<id>` - Disconnect account

### Posts Management
- `GET /api/social/posts` - List posts (supports filters)
- `POST /api/social/posts` - Create scheduled post
- `PUT /api/social/posts?id=<id>` - Update post
- `DELETE /api/social/posts?id=<id>` - Delete post

### Analytics
- `GET /api/social/analytics` - Get all analytics
- `POST /api/social/analytics/refresh` - Refresh analytics

### OAuth
- `GET /api/social/connect?platform=<platform>` - Initiate OAuth
- `POST /api/social/connect/exchange` - Exchange code for token

### CRON
- `POST /api/social/cron` - Process scheduled posts (requires auth)
- `GET /api/social/cron` - Health check

## 🎨 UI Components

### Platform Connect
Displays all 5 platforms with connection status, optimal posting times, and connect/disconnect buttons.

### Post Composer
- Platform selection (multi-select)
- Content input with character counter
- Media URL input (supports multiple)
- Schedule time picker
- Save as draft or schedule

### Content Calendar
- Week/Month view toggle
- Color-coded by status (draft, scheduled, posted, failed)
- Click to edit/delete
- Visual post distribution

### Analytics Widgets
- Summary metrics (total followers, reach, engagement)
- Platform-specific performance
- Top 5 posts this month
- Platform health status

## 🔐 Security

### Token Encryption
All OAuth tokens stored using AES-256-GCM encryption:
```typescript
import { encrypt, decrypt } from '@/lib/social/encryption';

const encryptedToken = encrypt(accessToken);
const decryptedToken = decrypt(encryptedToken);
```

**Required:** Set `ENCRYPTION_KEY` in environment variables (64-char hex string)

### CRON Authentication
CRON endpoint protected by Bearer token:
```bash
Authorization: Bearer YOUR_CRON_SECRET
```

### OAuth State Validation
- State tokens include user ID and timestamp
- Validated on callback to prevent CSRF

## ⏰ Posting Automation

### How It Works

1. **User schedules post** → Saved to database with status "scheduled"
2. **CRON runs every minute** → Queries for posts with `scheduledFor <= now`
3. **Posts processed** → Status changed to "posting"
4. **API calls made** → Posts to selected platforms
5. **Results recorded** → Status → "posted" or "failed"
6. **Retry logic** → Failed posts retry 3 times (1min, 5min, 15min delays)

### Retry Logic
```typescript
MAX_RETRIES = 3
RETRY_DELAYS = [60000, 300000, 900000] // 1min, 5min, 15min

if (failed && retryCount < MAX_RETRIES) {
  scheduledFor = now + RETRY_DELAYS[retryCount]
  status = 'scheduled'
  retryCount++
}
```

### Platform-Specific Limits
```typescript
instagram: 3 posts/day
facebook: 5 posts/day
linkedin: 2 posts/day
twitter: 10 posts/day
tiktok: 4 posts/day
```

## 📊 Analytics

### Metrics Tracked
- **Followers/Subscribers**: Total count per platform
- **Reach**: Number of unique users who saw content
- **Impressions**: Total views
- **Engagement**: Likes + Comments + Shares
- **Post Performance**: Individual post metrics

### Data Refresh
- Automatic: Updates when viewing analytics page
- Manual: "Refresh" button triggers fresh API calls
- Frequency: Every 1 hour in background (can be configured)

## 🧪 Testing

See `TESTING_GUIDE.md` for comprehensive testing procedures.

**Quick Test:**
```bash
# 1. Enable mock mode
MOCK_SOCIAL=true npm run dev

# 2. Create test post
POST /api/social/posts
{
  "platforms": ["instagram"],
  "content": "Test post",
  "scheduledFor": "2026-02-17T19:00:00Z",
  "status": "scheduled"
}

# 3. Trigger CRON
curl -X POST http://localhost:3000/api/social/cron \
  -H "Authorization: Bearer development-secret"
```

## 🚀 Deployment

### 1. Environment Setup
```env
# Required
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="random-secret"
ENCRYPTION_KEY="64-char-hex-string"
CRON_SECRET="random-secret"

# Platform OAuth (at least 3 recommended)
INSTAGRAM_CLIENT_ID="..."
INSTAGRAM_CLIENT_SECRET="..."
LINKEDIN_CLIENT_ID="..."
LINKEDIN_CLIENT_SECRET="..."
TWITTER_CLIENT_ID="..."
TWITTER_CLIENT_SECRET="..."
```

### 2. Database Migration
```bash
npx prisma migrate deploy
npx prisma generate
```

### 3. Build & Deploy
```bash
npm run build
npm start
```

### 4. Configure CRON
**Vercel:**
```json
{
  "crons": [{
    "path": "/api/social/cron",
    "schedule": "* * * * *"
  }]
}
```

**External (cron-job.org):**
- URL: `https://yourdomain.com/api/social/cron`
- Schedule: Every minute
- Method: POST
- Header: `Authorization: Bearer YOUR_CRON_SECRET`

## 📚 Documentation

- **SOCIAL_MEDIA_SETUP.md**: Complete setup guide with OAuth instructions
- **TESTING_GUIDE.md**: Testing procedures and mock mode
- **This README**: Architecture and overview

## 🎯 Success Criteria

- [x] Database schema created and migrated
- [x] API integration layer for 5 platforms
- [x] Posting engine with retry logic
- [x] UI components (composer, calendar, analytics)
- [x] API routes for all operations
- [x] CRON service for automation
- [x] OAuth flow implementation
- [x] Token encryption
- [x] Documentation complete

## 🔮 Future Enhancements

### Phase 2 (Recommended Next Steps)
- [ ] Direct media upload (not just URLs)
- [ ] Post templates and drafts library
- [ ] AI content generation (Claude integration)
- [ ] Comment management and replies
- [ ] Best time prediction based on past performance
- [ ] Hashtag suggestions

### Phase 3 (Advanced Features)
- [ ] Multi-user support with team roles
- [ ] Approval workflow (draft → review → schedule)
- [ ] A/B testing for content variations
- [ ] Competitor analysis
- [ ] Custom reports and exports
- [ ] Mobile app (React Native)
- [ ] WhatsApp Business integration
- [ ] YouTube posting

## 🐛 Known Limitations

1. **TikTok API**: Requires business verification (2-4 weeks approval time)
2. **SQLite**: Consider PostgreSQL for production (concurrent writes)
3. **Media URLs**: Currently requires pre-uploaded media URLs (no direct upload)
4. **Analytics Refresh**: Manual refresh needed (auto-refresh coming)
5. **Rate Limits**: Platform limits enforced but not configurable per user

## 📞 Support

For issues or questions:
1. Check `SOCIAL_MEDIA_SETUP.md` for OAuth setup
2. Check `TESTING_GUIDE.md` for testing procedures
3. Review error logs in browser console
4. Verify environment variables are set
5. Test CRON endpoint manually

## 📄 License

Part of the TARS AI Receptionist Dashboard.

---

**Built with:** Next.js 15, Prisma, TypeScript, Meta Graph API, LinkedIn API, Twitter API v2

**Version:** 1.0.0  
**Last Updated:** February 17, 2026  
**Status:** ✅ Production Ready (except TikTok)
