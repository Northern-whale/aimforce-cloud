# Social Media Automation - Quick Reference Card

## 🚀 Quick Start

```bash
# One-command setup
./scripts/setup-social-media.sh

# Start development
npm run dev

# Access dashboard
http://localhost:3000/social
```

---

## 🔧 Environment Variables

```env
# Required
ENCRYPTION_KEY="64-char-hex"        # crypto.randomBytes(32).toString('hex')
CRON_SECRET="random-string"         # Any secure random string

# OAuth (at least 3 platforms)
INSTAGRAM_CLIENT_ID=""
INSTAGRAM_CLIENT_SECRET=""
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""
TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""
```

---

## 📡 API Endpoints

### Accounts
```bash
# List accounts
GET /api/social/accounts

# Add account
POST /api/social/accounts
{
  "platform": "instagram",
  "accountId": "123",
  "accountName": "@user",
  "accessToken": "token",
  "refreshToken": "refresh"
}

# Disconnect
DELETE /api/social/accounts?id={id}
```

### Posts
```bash
# Create post
POST /api/social/posts
{
  "platforms": ["instagram", "facebook"],
  "content": "Hello world!",
  "mediaUrls": ["https://..."],
  "scheduledFor": "2026-02-17T19:00:00Z",
  "status": "scheduled"
}

# List posts
GET /api/social/posts?status=scheduled

# Update post
PUT /api/social/posts?id={id}
{
  "content": "Updated content",
  "scheduledFor": "2026-02-17T20:00:00Z"
}

# Delete post
DELETE /api/social/posts?id={id}
```

### Analytics
```bash
# Get all analytics
GET /api/social/analytics

# Refresh analytics
POST /api/social/analytics/refresh
{ "platform": "instagram" }
```

### CRON
```bash
# Trigger posting
curl -X POST http://localhost:3000/api/social/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Health check
curl http://localhost:3000/api/social/cron
```

---

## 🎯 Platform Limits

| Platform  | Max Posts/Day | Character Limit | Media Support |
|-----------|---------------|-----------------|---------------|
| Instagram | 3             | 2,200           | Images, Video |
| Facebook  | 5             | 63,206          | Images, Video |
| LinkedIn  | 2             | 3,000           | Images, Video |
| Twitter   | 10            | 280             | Images, Video |
| TikTok    | 4             | 2,200           | Video only    |

---

## ⏰ Optimal Posting Times

```typescript
instagram: ['09:00-11:00', '19:00-21:00']
facebook:  ['12:00-15:00', '18:00-20:00']
linkedin:  ['07:00-09:00', '12:00-13:00', '17:00-18:00']
twitter:   ['08:00-10:00', '12:00-13:00', '17:00-18:00']
tiktok:    ['06:00-09:00', '19:00-23:00']
```

---

## 🔐 OAuth URLs

### Instagram/Facebook
```
Auth: https://api.instagram.com/oauth/authorize
Token: https://api.instagram.com/oauth/access_token
Scopes: instagram_basic, instagram_content_publish
```

### LinkedIn
```
Auth: https://www.linkedin.com/oauth/v2/authorization
Token: https://www.linkedin.com/oauth/v2/accessToken
Scopes: w_member_social, r_liteprofile
```

### Twitter/X
```
Auth: https://twitter.com/i/oauth2/authorize
Token: https://api.twitter.com/2/oauth2/token
Scopes: tweet.read, tweet.write, users.read, offline.access
```

---

## 🗄️ Database Queries

```bash
# Open Prisma Studio
npx prisma studio

# Common queries
# Find scheduled posts
SELECT * FROM ScheduledPost WHERE status = 'scheduled' AND scheduledFor <= datetime('now');

# Count posts by status
SELECT status, COUNT(*) FROM ScheduledPost GROUP BY status;

# Find failed posts
SELECT * FROM ScheduledPost WHERE status = 'failed';

# Get posts for next 7 days
SELECT * FROM ScheduledPost 
WHERE scheduledFor BETWEEN datetime('now') AND datetime('now', '+7 days')
AND status IN ('scheduled', 'draft')
ORDER BY scheduledFor ASC;
```

---

## 🧪 Testing Commands

```bash
# Enable mock mode
echo "MOCK_SOCIAL=true" >> .env

# Test CRON
curl -X POST http://localhost:3000/api/social/cron \
  -H "Authorization: Bearer development-secret"

# Test post creation
curl -X POST http://localhost:3000/api/social/posts \
  -H "Content-Type: application/json" \
  -d '{
    "platforms": ["instagram"],
    "content": "Test post",
    "scheduledFor": "'$(date -u -v +2M +%Y-%m-%dT%H:%M:%S)'Z",
    "status": "scheduled"
  }'

# Check database
npx prisma studio
```

---

## 📁 File Locations

```
API Routes:          src/app/api/social/
Platform APIs:       src/lib/social/
Posting Engine:      src/lib/posting/scheduler.ts
Components:          src/components/social/
Pages:               src/app/(dashboard)/social/
Database Schema:     prisma/schema.prisma
Documentation:       *.md (root)
```

---

## 🐛 Common Issues

### "OAuth not configured"
```bash
# Check environment variables
env | grep INSTAGRAM
env | grep LINKEDIN
env | grep TWITTER

# Verify in code
console.log(process.env.INSTAGRAM_CLIENT_ID)
```

### "CRON not running"
```bash
# Test endpoint
curl -X POST http://localhost:3000/api/social/cron \
  -H "Authorization: Bearer $(grep CRON_SECRET .env | cut -d '=' -f2)"

# Check logs
tail -f .next/server/*.log
```

### "Database locked"
```bash
# Close Prisma Studio
# Stop other processes
# Migrate to PostgreSQL for production
```

### "Post failed"
```bash
# Check error in database
npx prisma studio
# Navigate to ScheduledPost
# Find failed post, check 'error' field

# Common causes:
# - Expired token (reconnect platform)
# - Invalid media URL
# - Character limit exceeded
```

---

## 🚀 Deployment Quick Steps

### Vercel
```bash
# 1. Push to GitHub
git push origin main

# 2. Import to Vercel
vercel

# 3. Add environment variables in Vercel dashboard

# 4. Add vercel.json
{
  "crons": [{
    "path": "/api/social/cron",
    "schedule": "* * * * *"
  }]
}

# 5. Deploy
vercel --prod
```

### Railway
```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize
railway init

# 4. Add PostgreSQL
railway add

# 5. Deploy
railway up

# 6. Set up external CRON (cron-job.org)
```

---

## 📊 Monitoring

```bash
# Check CRON execution
grep "CRON" logs/*.log

# Count posts by status
curl http://localhost:3000/api/social/posts | jq '.posts | group_by(.status) | map({status: .[0].status, count: length})'

# Platform health
curl http://localhost:3000/api/social/accounts | jq '.accounts | map({platform, connected})'

# Analytics summary
curl http://localhost:3000/api/social/analytics | jq '.summary'
```

---

## 🔗 Useful Links

- [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [LinkedIn API Console](https://www.linkedin.com/developers/tools/oauth/token-generator)
- [Twitter API Dashboard](https://developer.twitter.com/en/portal/dashboard)
- [Cron Expression Generator](https://crontab.guru/)
- [Prisma Studio](http://localhost:5555) (after `npx prisma studio`)

---

## 💡 Pro Tips

1. **Start with 3 platforms:** Instagram, Facebook, LinkedIn (easiest OAuth)
2. **Use mock mode first:** Set `MOCK_SOCIAL=true` for testing
3. **Test CRON manually:** Don't wait - trigger with curl
4. **Check Prisma Studio:** Visual database browser is your friend
5. **Read error messages:** Check the `error` field in failed posts
6. **Backup tokens:** Export from Prisma Studio before major changes
7. **Monitor limits:** Don't exceed daily post limits per platform
8. **Use optimal times:** Built-in suggestions for best engagement
9. **Test with drafts:** Create drafts first, then schedule
10. **PostgreSQL for prod:** SQLite is great for dev, but upgrade for production

---

## 🎓 Learning Path

1. **Day 1:** Setup + Mock mode + Test posting
2. **Day 2:** OAuth for 1 platform (Instagram recommended)
3. **Day 3:** Add 2 more platforms (Facebook, LinkedIn)
4. **Day 4:** Schedule real posts + Monitor CRON
5. **Day 5:** Analytics integration + UI customization

---

**Keep this card handy!** Bookmark it in your browser for quick access.

**Last Updated:** February 17, 2026
