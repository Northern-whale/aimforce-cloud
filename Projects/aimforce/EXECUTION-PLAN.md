# AIMForce Phase 2 - Execution Plan

## 🎯 10-Step Master Plan

### Step 1: Branding Upgrade (NOW - 30 min)
- [  ] Install Inter + Space Grotesk fonts
- [  ] Update color system (Deep Blue + Cyan)
- [  ] Apply to all existing pages
- [  ] Create logo placeholder
- [  ] Add professional gradients

### Step 2: Database Schema Expansion (30 min)
- [  ] Add SocialAccount model
- [  ] Add ScheduledPost model
- [  ] Add ContentLibrary model
- [  ] Add APICredential model
- [  ] Run migration
- [  ] Update Prisma client

### Step 3: Social Media Connection UI (1 hour)
- [  ] Create `/portal/social` page
- [  ] Platform connection cards (FB, IG, LinkedIn, Twitter, TikTok)
- [  ] OAuth flow placeholders
- [  ] Account status indicators
- [  ] Disconnect functionality

### Step 4: Content Library (1 hour)
- [  ] Create `/portal/content` page
- [  ] File upload interface
- [  ] Google Drive integration
- [  ] Media preview
- [  ] Tag management
- [  ] Caption editor

### Step 5: Content Scheduling (1.5 hours)
- [  ] Create `/portal/schedule` page
- [  ] Calendar view component
- [  ] Post creation modal
- [  ] Platform selector
- [  ] AI timing recommendations
- [  ] Drag-and-drop rescheduling

### Step 6: API Key Management (30 min)
- [  ] Create `/portal/api-keys` page
- [  ] Add credential form
- [  ] Encrypted storage
- [  ] Test connection button
- [  ] Usage tracking

### Step 7: Production Setup (1 hour)
- [  ] Create Vercel project
- [  ] Create Railway PostgreSQL
- [  ] Migrate SQLite → PostgreSQL
- [  ] Configure environment variables
- [  ] Point aimforce.cloud to Vercel

### Step 8: Social API Integration (2 hours)
- [  ] Facebook/Instagram OAuth
- [  ] LinkedIn OAuth
- [  ] Twitter OAuth
- [  ] Post publishing functions
- [  ] Error handling

### Step 9: Background Jobs (1.5 hours)
- [  ] Setup Upstash Redis
- [  ] Implement BullMQ
- [  ] Post scheduler worker
- [  ] Analytics fetcher
- [  ] Notification system

### Step 10: Testing & Launch (1 hour)
- [  ] End-to-end testing
- [  ] Performance optimization
- [  ] Security audit
- [  ] Go live on aimforce.cloud
- [  ] Monitor & fix issues

---

## ⚡ Immediate Actions (Next 3 Hours)

### Hour 1: Branding + Database
1. Update fonts and colors
2. Apply new branding to all pages
3. Add new database models
4. Run migrations

### Hour 2: Social Connection UI
1. Build social accounts page
2. Create connection flows
3. Add platform cards
4. Test UI/UX

### Hour 3: Content System
1. Build content library
2. File upload interface
3. Basic scheduling UI
4. Test workflows

---

## 🚀 Deployment Priority

**Production Deployment happens AFTER:**
- ✅ Branding complete
- ✅ Social connection UI built
- ✅ Content library working
- ✅ Basic scheduling functional
- ✅ Testing complete

**Timeline:** Deploy to aimforce.cloud in ~4-5 hours

---

## 💡 Smart Decisions to Make

**1. Which platforms to launch with?**
Recommend: Facebook, Instagram, LinkedIn (most business-focused)
Later: Twitter, TikTok

**2. OAuth vs API Keys?**
OAuth for social media (better UX, more secure)
API keys for third-party services (Google, Stripe)

**3. Job queue now or later?**
Start simple (cron-based), add BullMQ when scaling

**4. PostgreSQL migration timing?**
Before deployment (don't launch with SQLite)

---

## 📊 Success Criteria

**Phase 2 complete when:**
- ✅ Client can connect ≥1 social account
- ✅ Client can upload content
- ✅ Client can schedule posts
- ✅ Platform auto-posts at scheduled time
- ✅ Running live on aimforce.cloud
- ✅ Professional branding throughout
- ✅ All pages mobile-responsive
- ✅ < 2s page load time

---

## 🎨 Branding Checklist

**Fonts:**
- [  ] Inter (body text)
- [  ] Space Grotesk (headings)
- [  ] Update all typography

**Colors:**
- [  ] Deep Blue (#0F172A) primary
- [  ] Cyan (#06B6D4) accent
- [  ] Green (#10B981) success
- [  ] Gradients updated

**Components:**
- [  ] Logo (create placeholder)
- [  ] Buttons (gradient styles)
- [  ] Cards (shadows, radius)
- [  ] Forms (consistent styling)
- [  ] Navigation (professional)

---

## 🔐 Security Implementation

**Before production:**
- [  ] API key encryption (AES-256)
- [  ] OAuth token storage
- [  ] HTTPS enforcement
- [  ] Rate limiting
- [  ] CSRF protection
- [  ] Input validation
- [  ] SQL injection prevention

---

**Starting execution NOW!**

**Order:**
1. Branding upgrade
2. Database expansion
3. Social UI
4. Content system
5. Deploy production

**Estimated completion:** 4-5 hours
**Target launch:** Tonight (aimforce.cloud live)
