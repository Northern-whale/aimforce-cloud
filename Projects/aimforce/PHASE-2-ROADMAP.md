# AIMForce Phase 2 - Complete Roadmap

## 🎯 Vision

Transform AIMForce from MVP → **Complete AI Business Operations Platform**

**Core Features Added:**
1. Social media automation & scheduling
2. Content distribution system
3. API/subscription management
4. Production deployment (aimforce.cloud)
5. Enterprise branding
6. AI-powered optimal timing
7. Multi-platform integration

---

## 📋 Phase 2A: Core Social Media Features (Week 1)

### 1. Social Media Account Linking

**New Database Tables:**
```prisma
model SocialAccount {
  id              String   @id @default(cuid())
  clientId        String
  platform        String   // FACEBOOK, INSTAGRAM, LINKEDIN, TWITTER, TIKTOK
  accountName     String
  accountId       String   // Platform-specific ID
  accessToken     String   // Encrypted
  refreshToken    String?  // Encrypted
  tokenExpiresAt  DateTime?
  isActive        Boolean  @default(true)
  connectedAt     DateTime @default(now())
  lastUsed        DateTime?
  
  client          Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  posts           ScheduledPost[]
}

model ScheduledPost {
  id              String   @id @default(cuid())
  clientId        String
  socialAccountId String
  content         String
  mediaUrls       String?  // JSON array of media URLs
  scheduledFor    DateTime
  status          String   // SCHEDULED, POSTED, FAILED, CANCELLED
  platform        String   // FACEBOOK, INSTAGRAM, etc.
  postId          String?  // Platform post ID after publishing
  aiOptimized     Boolean  @default(false)
  engagementScore Float?
  createdAt       DateTime @default(now())
  postedAt        DateTime?
  
  client          Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  socialAccount   SocialAccount @relation(fields: [socialAccountId], references: [id], onDelete: Cascade)
}

model ContentLibrary {
  id          String   @id @default(cuid())
  clientId    String
  fileName    String
  fileType    String   // IMAGE, VIDEO, DOCUMENT
  fileUrl     String   // Google Drive URL
  fileSize    Int
  caption     String?
  tags        String?  // JSON array
  aiGenerated Boolean  @default(false)
  uploadedAt  DateTime @default(now())
  
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
}

model APICredential {
  id          String   @id @default(cuid())
  clientId    String
  service     String   // GOOGLE, FACEBOOK, STRIPE, etc.
  apiKey      String   // Encrypted
  apiSecret   String?  // Encrypted
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  lastUsed    DateTime?
  
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
}
```

### 2. Social Media Connection UI

**New Pages:**
- `/portal/social` - Social account management
- `/portal/social/connect` - OAuth flow for each platform
- `/portal/content` - Content library & upload
- `/portal/schedule` - Content scheduling interface
- `/portal/api-keys` - API credential management

**Features:**
- One-click OAuth connection (Facebook, Instagram, LinkedIn, Twitter, TikTok)
- Account status dashboard (connected, expired, disconnected)
- Reconnect flows
- Multi-account support per platform

### 3. Content Upload & Management

**Features:**
- Drag-and-drop file upload
- Google Drive integration
- Auto-tagging with AI
- Caption generation (Anthropic Claude)
- Media preview
- Bulk upload support
- File organization by campaign

### 4. AI-Powered Scheduling

**Smart Timing Algorithm:**
```typescript
// Analyze historical engagement data
// Recommend optimal posting times per platform
// Consider:
// - Audience timezone
// - Platform-specific best times
// - Industry benchmarks
// - Client's past performance
```

**Scheduling Features:**
- Calendar view (monthly, weekly, daily)
- Drag-and-drop rescheduling
- Batch scheduling
- Recurring posts
- AI recommendations for timing
- Preview before posting

---

## 📋 Phase 2B: API Integration Layer (Week 2)

### Social Platform APIs to Integrate

**1. Facebook/Instagram (Meta Graph API)**
- OAuth 2.0 authentication
- Post text, images, videos
- Schedule posts
- Fetch analytics
- Manage comments

**2. LinkedIn API**
- OAuth 2.0 authentication
- Share updates (text, images, articles)
- Company page posting
- Analytics

**3. Twitter API v2**
- OAuth 2.0 authentication
- Tweet posting
- Media upload
- Thread creation
- Analytics

**4. TikTok for Business API**
- OAuth 2.0 authentication
- Video upload
- Post scheduling
- Analytics

**5. Google Drive API**
- OAuth 2.0 authentication
- File upload
- Folder management
- File sharing

---

## 📋 Phase 2C: Background Job Processing

### Implement Job Queue

**Technology:** BullMQ (Redis-based)

**Job Types:**
1. **Post Scheduler** - Check every minute for due posts
2. **Post Publisher** - Execute posting to platforms
3. **Analytics Fetcher** - Pull engagement metrics
4. **Content Optimizer** - AI analysis of performance
5. **Notification Sender** - Alert clients of results

**Infrastructure:**
- Redis instance (Railway or Upstash)
- Worker processes
- Retry logic
- Error handling
- Logging

---

## 📋 Phase 2D: Branding Implementation (Ongoing)

### Update All Pages

**Apply New Brand:**
- Inter + Space Grotesk fonts
- Deep Blue + Cyan color system
- Professional gradients
- Logo (once designed)
- Consistent spacing
- Shadow system
- Border radius

**Pages to Update:**
1. Login page
2. Owner dashboard
3. Client portal
4. All sub-pages
5. Email templates
6. Loading states
7. Error pages

### Create Logo

**Design Options:**
- Option 1: Neural Spark (lightning + network)
- Option 2: Force Field (hexagonal shield)
- Option 3: Agent Network (connected nodes)

**Deliverables:**
- SVG (scalable)
- PNG (multiple sizes: 16px, 32px, 64px, 128px, 256px, 512px)
- Favicon (ICO + SVG)
- Social media profile images
- App icons (iOS, Android)

---

## 📋 Phase 2E: Production Deployment

### Infrastructure Setup

**Hosting:**
- **Frontend:** Vercel (automatic deployments from GitHub)
- **Database:** Railway PostgreSQL (automatic backups)
- **Redis:** Upstash (for job queue)
- **File Storage:** Google Drive API (free 15GB per account)

**Domain Configuration:**
- Domain: aimforce.cloud
- DNS: Point to Vercel
- SSL: Auto via Vercel (Let's Encrypt)

**Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_URL=https://aimforce.cloud
NEXTAUTH_SECRET=...

# AI Services
ANTHROPIC_API_KEY=...
ELEVENLABS_API_KEY=...

# Social Media APIs
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...

# Google Services
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_DRIVE_CREDENTIALS=...

# Redis
REDIS_URL=...

# Email (SendGrid or Resend)
EMAIL_SERVER=...
EMAIL_FROM=...
```

### Migration Plan

**SQLite → PostgreSQL:**
1. Export data from SQLite
2. Create PostgreSQL instance on Railway
3. Run Prisma migrations
4. Import data
5. Test thoroughly
6. Switch DATABASE_URL

**Deployment Steps:**
1. Create Vercel project
2. Connect GitHub repo
3. Configure environment variables
4. Deploy
5. Test production build
6. Point domain

---

## 📋 Phase 2F: Advanced Features

### Analytics Dashboard

**Metrics to Track:**
- Total posts scheduled/published
- Engagement rate per platform
- Best performing content
- Optimal posting times (learned)
- Audience growth
- ROI metrics

**Visualizations:**
- Line charts (engagement over time)
- Bar charts (performance by platform)
- Heatmaps (best times to post)
- Pie charts (content type distribution)

### AI Content Suggestions

**Features:**
- Caption generation from images
- Hashtag recommendations
- Content ideas based on trends
- Performance predictions
- A/B testing suggestions

### Notifications

**Channels:**
- In-app notifications
- Email summaries
- SMS alerts (urgent only)
- Slack/Discord webhooks

**Triggers:**
- Post published successfully
- Post failed to publish
- High engagement detected
- Account disconnected
- AI recommendation available

---

## 📋 Success Metrics

### Technical KPIs
- ✅ 99.9% uptime
- ✅ < 2s page load time
- ✅ < 100ms API response time
- ✅ Zero data loss
- ✅ < 1% post failure rate

### Business KPIs
- 10 paying customers in Month 1
- 50 paying customers by Month 3
- $5K MRR by Month 3
- 95% customer satisfaction
- < 5% monthly churn

---

## 📅 Timeline

### Week 1: Social Media Foundation
- Day 1-2: Database schema & API setup
- Day 3-4: Social connection UI
- Day 5-6: Content upload system
- Day 7: Scheduling interface

### Week 2: Integration & Polish
- Day 1-2: Platform API integrations
- Day 3-4: Job queue implementation
- Day 5-6: Branding updates
- Day 7: Testing

### Week 3: Deployment & Launch
- Day 1-2: Production setup
- Day 3-4: Migration & testing
- Day 5: Deploy to aimforce.cloud
- Day 6-7: Monitoring & optimization

---

## 💰 Cost Breakdown (Monthly)

**Infrastructure:**
- Vercel Pro: $20
- Railway PostgreSQL: $20
- Upstash Redis: $10
- Domain: $1

**APIs (usage-based):**
- Anthropic Claude: ~$50
- ElevenLabs: Included
- Social Media APIs: Free
- Google Drive: Free (15GB)

**Total:** ~$100-150/mo to run

---

## 🚀 Launch Strategy

### Soft Launch (Week 3)
- Invite 5 beta testers
- Collect feedback
- Fix critical bugs
- Refine UX

### Public Launch (Week 4)
- Product Hunt submission
- Social media announcement
- Email to waitlist
- Press release

### Growth (Month 2+)
- Content marketing
- SEO optimization
- Referral program
- Partner integrations

---

## 🔐 Security Considerations

**Data Protection:**
- All API keys encrypted at rest (AES-256)
- OAuth tokens stored securely
- HTTPS only (no HTTP)
- CSRF protection
- Rate limiting
- SQL injection prevention (Prisma)

**Compliance:**
- GDPR ready (data export, deletion)
- SOC 2 Type II (future)
- Privacy policy
- Terms of service
- Cookie consent

---

## 📱 Future Phases (3-6 months)

### Phase 3: Mobile Apps
- iOS app (React Native)
- Android app (React Native)
- Push notifications
- Offline mode

### Phase 4: Team Collaboration
- Multi-user workspaces
- Role-based permissions
- Comment threads
- Approval workflows

### Phase 5: Advanced AI
- Content generation (full posts)
- Image creation (DALL-E)
- Video editing automation
- Voice-to-post workflows

### Phase 6: White Label
- Custom branding
- Reseller program
- API access for partners
- Enterprise features

---

**Status:** Ready to Execute  
**Next:** Start building Week 1 features NOW
