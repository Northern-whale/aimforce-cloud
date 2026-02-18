# IMMEDIATE ACTION ITEMS - TARS AI Agency

**Date:** February 17, 2026  
**Priority:** Complete these before any production deployment

---

## 🚨 CRITICAL - DO TODAY (4 hours)

### 1. Rotate All Exposed API Keys ⏱️ 1 hour

**Why:** API keys were accidentally included in audit report and need to be invalidated immediately.

**Steps:**
```bash
# 1. Anthropic (Claude AI)
# Go to: https://console.anthropic.com/settings/keys
# Click: "Create Key" → Copy new key
# Delete old key: sk-ant-api03-MW3QSiKTQXaY5G...

# 2. ElevenLabs (Voice)
# Go to: https://elevenlabs.io/api
# Generate new API key
# Delete old key: sk_379a53efc52bf060...

# 3. n8n
# Go to: https://n8n.srv1378974.hstgr.cloud
# Settings → API Keys → Generate new
# Delete old key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 4. Update all .env files
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web
nano .env
# Replace ANTHROPIC_API_KEY with new value

cd ~/Desktop/Tars/Projects/ai-content-studio
nano .env
# Replace ANTHROPIC_API_KEY and ELEVENLABS_API_KEY

cd ~/Desktop/Tars
nano .env
# Replace N8N_API_KEY

# 5. Test that everything still works
cd ~/Desktop/Tars/Projects/agent-dashboard
pnpm dev
# Open http://localhost:3001 and test chat
```

**Verification:**
- [ ] New Anthropic key works in AI Receptionist chat
- [ ] Old keys are deleted from provider dashboards
- [ ] All .env files updated

### 2. Fix ENCRYPTION_KEY Security Flaw ⏱️ 30 minutes

**Why:** Random key generation breaks social media OAuth after server restart.

**File:** `~/Desktop/Tars/Projects/agent-dashboard/apps/web/src/lib/social/encryption.ts`

**Change:**
```typescript
// OLD (BROKEN):
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// NEW (FIXED):
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error(
    'ENCRYPTION_KEY environment variable is required. ' +
    'Generate one with: openssl rand -hex 32'
  );
}
```

**Generate key:**
```bash
# Generate 32-byte hex key
openssl rand -hex 32

# Output example: 
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# Add to .env
echo "ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2" >> ~/Desktop/Tars/Projects/agent-dashboard/apps/web/.env
```

**Test:**
```bash
cd ~/Desktop/Tars/Projects/agent-dashboard
pnpm dev
# Try connecting a social media account
# Restart server
# Verify account is still connected
```

**Verification:**
- [ ] ENCRYPTION_KEY set in .env
- [ ] Code throws error if key missing
- [ ] Social media tokens persist after restart

### 3. Secure Git Repository ⏱️ 1 hour

**Why:** .env files with secrets were committed to git.

**Steps:**
```bash
cd ~/Desktop/Tars/Projects/agent-dashboard

# 1. Add .env to .gitignore (if not already)
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "*.key" >> .gitignore

# 2. Remove .env from git history
git rm --cached apps/web/.env
git rm --cached apps/web/.env.local
git commit -m "Remove .env files from git"

# 3. Do the same for other projects
cd ~/Desktop/Tars/Projects/ai-content-studio
echo ".env" >> .gitignore
git rm --cached .env
git commit -m "Remove .env from git"

# 4. Force push to rewrite history (if repo is private and you're the only developer)
# WARNING: Only do this if no one else is using the repo
git push --force

# 5. Verify no secrets in GitHub
# Go to repository on GitHub
# Search for "sk-ant" or "API_KEY"
# Should find nothing
```

**Verification:**
- [ ] .env files in .gitignore
- [ ] No .env files in git history
- [ ] No API keys visible on GitHub

### 4. Generate Production Secrets ⏱️ 30 minutes

**Why:** Development secrets are weak and predictable.

**Steps:**
```bash
# 1. Generate NEXTAUTH_SECRET
openssl rand -base64 32
# Output: abc123def456ghi789jkl012mno345pqr678stu901vwx234

# 2. Add to .env (DO NOT COMMIT)
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web
echo "NEXTAUTH_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234" >> .env.local

# 3. Verify old .env doesn't have production secrets
cat .env
# Should NOT contain actual secrets, only placeholders

# 4. Create .env.example for reference
cat > .env.example << EOF
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=http://localhost:3000
OWNER_EMAIL=owner@tars.ai
OWNER_PASSWORD=<set-your-password>
ANTHROPIC_API_KEY=<your-key-here>
ENCRYPTION_KEY=<generate-with-openssl-rand-hex-32>
EOF

git add .env.example
git commit -m "Add .env.example template"
```

**Verification:**
- [ ] NEXTAUTH_SECRET is 32+ characters
- [ ] .env.example has placeholders only
- [ ] .env.local (not tracked) has real secrets

### 5. Add Error Monitoring ⏱️ 1 hour

**Why:** Need to know when things break in production.

**Steps:**
```bash
# 1. Sign up for Sentry (free tier)
# Go to: https://sentry.io/signup/
# Create account
# Create new project: "tars-ai-receptionist"
# Copy DSN: https://abc123@o123456.ingest.sentry.io/123456

# 2. Install Sentry
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web
pnpm add @sentry/nextjs

# 3. Initialize Sentry
npx @sentry/wizard@latest -i nextjs

# 4. Add DSN to .env.local
echo "NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456" >> .env.local

# 5. Test error tracking
# Add to any page:
# throw new Error("Test error");
# Check Sentry dashboard for error

# 6. Remove test error
```

**Verification:**
- [ ] Sentry account created
- [ ] Project initialized
- [ ] Test error appears in dashboard
- [ ] DSN in .env.local (not committed)

---

## 🟡 HIGH PRIORITY - DO THIS WEEK (20 hours)

### 6. Add Input Validation ⏱️ 4 hours

**File:** All API routes in `apps/web/src/app/api/`

**Steps:**
```bash
# 1. Install Zod
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web
pnpm add zod

# 2. Create validation schemas
cat > src/lib/validation.ts << 'EOF'
import { z } from 'zod';

export const PostSchema = z.object({
  content: z.string().min(1).max(2200),
  platforms: z.array(z.enum(['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'])),
  mediaUrls: z.array(z.string().url()).optional(),
  scheduledFor: z.string().datetime().optional(),
  status: z.enum(['draft', 'scheduled', 'posting', 'posted', 'failed']).default('draft'),
});

export const ChatSchema = z.object({
  conversationId: z.string().cuid(),
  content: z.string().min(1).max(10000),
  inputMethod: z.enum(['text', 'voice']).default('text'),
});
EOF

# 3. Update API routes to use schemas
# Example for /api/social/posts/route.ts:
# const validated = PostSchema.parse(body);

# 4. Add error handling for validation errors
# try {
#   const validated = PostSchema.parse(body);
# } catch (error) {
#   if (error instanceof z.ZodError) {
#     return NextResponse.json({ error: error.errors }, { status: 400 });
#   }
# }
```

**Files to update:**
- [ ] `apps/web/src/app/api/social/posts/route.ts`
- [ ] `apps/web/src/app/api/chat/stream/route.ts`
- [ ] `apps/web/src/app/api/social/accounts/route.ts`
- [ ] `apps/web/src/app/api/products/route.ts`

### 7. Fix Middleware Deprecation ⏱️ 2 hours

**File:** `apps/web/src/middleware.ts`

**Research Next.js 16 proxy pattern:**
```bash
# Read migration guide
open https://nextjs.org/docs/messages/middleware-to-proxy

# Update middleware.ts to use new proxy pattern
# (Specific changes depend on Next.js documentation)
```

### 8. Add Rate Limiting ⏱️ 2 hours

**Steps:**
```bash
# 1. Install rate limiting library
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web
pnpm add next-rate-limit

# 2. Create rate limit middleware
cat > src/lib/rate-limit.ts << 'EOF'
import rateLimit from 'next-rate-limit';

export const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per interval
});

export const authLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 100,
});
EOF

# 3. Apply to API routes
# Add to each route:
# const rateLimitResult = await limiter.check(req, 10, 'CACHE_TOKEN');
# if (!rateLimitResult.success) {
#   return new Response('Too Many Requests', { status: 429 });
# }
```

**Apply to:**
- [ ] `/api/auth/*` - 5 requests/minute
- [ ] `/api/social/posts` - 20 requests/hour
- [ ] `/api/chat/stream` - 100 requests/hour

### 9. Write Critical Tests ⏱️ 8 hours

**Steps:**
```bash
# 1. Install testing libraries
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom

# 2. Create test config
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
EOF

# 3. Write tests
mkdir -p src/__tests__

# Test auth
cat > src/__tests__/auth.test.ts << 'EOF'
import { describe, it, expect } from 'vitest';
import { signIn } from '@/lib/auth';

describe('Authentication', () => {
  it('should authenticate valid user', async () => {
    // Test login
  });
  
  it('should reject invalid credentials', async () => {
    // Test failed login
  });
});
EOF

# Test API routes
cat > src/__tests__/api.test.ts << 'EOF'
import { describe, it, expect } from 'vitest';

describe('API Routes', () => {
  it('should create scheduled post', async () => {
    // Test POST /api/social/posts
  });
});
EOF
```

**Priority tests:**
- [ ] Auth: login, logout, session validation
- [ ] Chat: message creation, streaming
- [ ] Social: post creation, scheduling
- [ ] Database: Prisma queries

### 10. Deploy to Staging ⏱️ 4 hours

**Steps:**
```bash
# 1. Create Vercel account (if needed)
# Go to: https://vercel.com/signup

# 2. Install Vercel CLI
npm i -g vercel

# 3. Login
vercel login

# 4. Deploy to staging
cd ~/Desktop/Tars/Projects/agent-dashboard
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? tars-ai-receptionist
# - Directory? ./
# - Override settings? No

# 5. Add environment variables in Vercel dashboard
# Go to: https://vercel.com/your-account/tars-ai-receptionist/settings/environment-variables
# Add all variables from .env.local

# 6. Set up PostgreSQL
# Go to: Storage → Create Database → PostgreSQL
# Copy DATABASE_URL
# Add to environment variables

# 7. Deploy to production
vercel --prod
```

**Verification:**
- [ ] Staging deployment works
- [ ] Database connected
- [ ] Environment variables set
- [ ] SSL certificate active
- [ ] No errors in logs

---

## 🟢 MEDIUM PRIORITY - DO IN 2 WEEKS (16 hours)

### 11. Install AI Content Studio Dependencies ⏱️ 1 hour

```bash
cd ~/Desktop/Tars/Projects/ai-content-studio
pip install elevenlabs==0.2.27
python main_demo.py --generate-audio
# Verify voice synthesis works
```

### 12. Set Up Social Media API Credentials ⏱️ 8 hours

**For each platform:**

**Instagram:**
```bash
# 1. Go to: https://developers.facebook.com/
# 2. Create App
# 3. Add Instagram Basic Display
# 4. Get App ID & Secret
# 5. Add to .env
```

**Facebook:**
```bash
# (Same as Instagram - shared app)
```

**LinkedIn:**
```bash
# 1. Go to: https://www.linkedin.com/developers/
# 2. Create App
# 3. Request access to Marketing API
# 4. Get Client ID & Secret
# 5. Add to .env
```

**Twitter/X:**
```bash
# 1. Go to: https://developer.twitter.com/
# 2. Create App
# 3. Get API Key & Secret
# 4. Get Bearer Token
# 5. Add to .env
```

**TikTok:**
```bash
# 1. Go to: https://developers.tiktok.com/
# 2. Create App
# 3. Request Marketing API access
# 4. Get Client Key & Secret
# 5. Add to .env
```

### 13. Test Social Media Posting ⏱️ 4 hours

```bash
# For each platform:
# 1. Test OAuth connection
# 2. Test post creation
# 3. Test media upload
# 4. Test scheduled posting
# 5. Test analytics retrieval
```

### 14. Import n8n Workflows ⏱️ 2 hours

```bash
# 1. Go to: https://n8n.srv1378974.hstgr.cloud
# 2. Click "Import from File"
# 3. Upload: ~/Desktop/Tars/Projects/Cigar-Shop-AI-Agent/workflow-demo-elevenlabs.json
# 4. Configure credentials
# 5. Activate workflow
# 6. Test with sample call
```

### 15. Add Monitoring Dashboard ⏱️ 1 hour

```bash
# 1. Set up Uptime monitoring
# Go to: https://uptimerobot.com
# Add monitor for production URL

# 2. Set up status page
# Create public status page
# Share with clients

# 3. Configure alerts
# Email alerts for downtime
# Slack integration (optional)
```

---

## 📋 CHECKLIST SUMMARY

### Security (Critical - Today)
- [ ] Rotate Anthropic API key
- [ ] Rotate ElevenLabs API key  
- [ ] Rotate n8n API key
- [ ] Fix ENCRYPTION_KEY flaw
- [ ] Remove .env from git
- [ ] Generate production secrets
- [ ] Add error monitoring

### Code Quality (This Week)
- [ ] Add Zod validation
- [ ] Fix middleware deprecation
- [ ] Add rate limiting
- [ ] Write critical tests
- [ ] Deploy to staging

### Infrastructure (2 Weeks)
- [ ] Set up PostgreSQL
- [ ] Configure production environment
- [ ] Add monitoring dashboard
- [ ] Set up backup system
- [ ] Configure CI/CD

### Product Readiness (2-3 Weeks)
- [ ] Install AI Content Studio deps
- [ ] Get social media API credentials
- [ ] Test all platforms
- [ ] Import n8n workflows
- [ ] Beta test with clients

---

## ⏱️ TIME ESTIMATES

**Critical (Today):** 4 hours  
**High Priority (This Week):** 20 hours  
**Medium Priority (2 Weeks):** 16 hours  
**Total:** 40 hours (1 full work week)

---

## 🚦 LAUNCH READINESS

**After Critical Items (Today):**
- Security: ✅ Fixed
- Can demo: ✅ Yes
- Ready for production: ❌ Not yet

**After High Priority (1 Week):**
- Security: ✅ Fixed
- Can demo: ✅ Yes
- Ready for production: ✅ YES (AI Receptionist)

**After Medium Priority (2-3 Weeks):**
- Security: ✅ Fixed
- Can demo: ✅ Yes
- Ready for production: ✅ YES (All projects)

---

## 📞 SUPPORT

**Questions?** Contact TARS Development Team

**Blocked?** Don't wait - reach out immediately

**Need Help?** We can pair program any of these tasks

---

**Created:** February 17, 2026  
**Last Updated:** February 17, 2026  
**Status:** Ready for execution
