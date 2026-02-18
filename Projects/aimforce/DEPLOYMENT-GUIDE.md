# AIMForce - Production Deployment Guide

## 🎯 Deployment Checklist

### Pre-Deployment (Local Preparation)
- [x] Database schema finalized
- [x] All pages built and tested
- [x] Environment variables documented
- [x] Logo and branding complete
- [ ] Database migration to PostgreSQL
- [ ] API integration testing
- [ ] Security audit
- [ ] Performance optimization

### Hosting Setup
- [ ] Vercel account created
- [ ] Railway PostgreSQL provisioned
- [ ] Domain DNS configured (aimforce.cloud)
- [ ] Environment variables set
- [ ] SSL certificate (auto via Vercel)

### Post-Deployment
- [ ] Test all authentication flows
- [ ] Verify database connections
- [ ] Test file uploads
- [ ] Monitor error logs
- [ ] Performance monitoring

---

## 📋 Step-by-Step Deployment

### Step 1: Create Vercel Account (5 min)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Install Vercel CLI: `npm i -g vercel`
4. Login: `vercel login`

### Step 2: Create Railway PostgreSQL (10 min)

1. Go to https://railway.app
2. Create new project
3. Add PostgreSQL database
4. Copy connection string
5. Save for environment variables

**Example Connection String:**
```
postgresql://user:password@host:5432/dbname
```

### Step 3: Migrate SQLite → PostgreSQL (Local)

```bash
cd ~/Desktop/Tars/Projects/aimforce

# Update prisma/schema.prisma
# Change: provider = "sqlite"
# To: provider = "postgresql"

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Generate new migration
npx prisma migrate dev --name postgresql_migration

# Apply to production
npx prisma migrate deploy
```

### Step 4: Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Phase 2 complete - ready for production"

# Create GitHub repo and push
gh repo create aimforce --public
git remote add origin https://github.com/yourusername/aimforce.git
git branch -M main
git push -u origin main
```

### Step 5: Deploy to Vercel

**Option A: CLI Deployment**
```bash
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name: aimforce
# - Override settings: No (use defaults)

# Deploy to production
vercel --prod
```

**Option B: Web Dashboard**
1. Go to vercel.com/dashboard
2. Click "Import Project"
3. Select your GitHub repo
4. Configure build settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables (see below)
6. Click "Deploy"

### Step 6: Configure Environment Variables

**In Vercel Dashboard → Settings → Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
NEXTAUTH_URL=https://aimforce.cloud
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=sk_...

# Google (Phase 2)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Social Media OAuth (Phase 2)
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 7: Configure Domain (aimforce.cloud)

**In Domain Registrar (where you bought aimforce.cloud):**

1. Go to DNS settings
2. Add CNAME record:
   - Name: `@` or `www`
   - Value: `cname.vercel-dns.com`
   - TTL: 3600

**In Vercel Dashboard:**

1. Go to Project Settings → Domains
2. Add domain: `aimforce.cloud`
3. Add domain: `www.aimforce.cloud`
4. Vercel will auto-configure SSL (Let's Encrypt)
5. Wait for DNS propagation (5-30 minutes)

### Step 8: Test Production Deployment

```bash
# Test URLs
https://aimforce.cloud
https://aimforce.cloud/login
https://aimforce.cloud/portal
https://aimforce.cloud/owner

# Test accounts
owner@aimforce.cloud / aimforce2026
demo1@company.com / demo2026
```

### Step 9: Monitor & Optimize

**Vercel Analytics:**
- Enable in Project Settings
- Monitor page load times
- Track user sessions

**Error Tracking:**
- Check Vercel Logs
- Set up alerts for errors

**Performance:**
- Use Lighthouse audit
- Optimize images
- Enable caching

---

## 🔐 Security Configuration

### Production Security Checklist

- [ ] All API keys encrypted
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection
- [ ] CSRF tokens in forms
- [ ] Secure headers configured

### Add Security Headers (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

---

## 💰 Cost Breakdown

### Monthly Costs (Production)

**Hosting:**
- Vercel Pro: $20/mo (or Free tier for MVP)
- Railway PostgreSQL: $5-20/mo (usage-based)

**APIs:**
- Anthropic Claude: ~$50/mo (usage-based)
- ElevenLabs: Included in current plan
- Social Media APIs: Free

**Domain:**
- aimforce.cloud: $12/year (~$1/mo)

**Total:** ~$75-90/mo for production

**Free Tier Option:**
- Vercel: Free (limited to 100GB bandwidth)
- Railway: $5/mo minimum
- Total: ~$55/mo

---

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Test connection
npx prisma db pull

# Reset and migrate
npx prisma migrate reset
npx prisma migrate deploy
```

### Build Failures
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Domain Not Working
- Wait 5-30 minutes for DNS propagation
- Check DNS settings with: `nslookup aimforce.cloud`
- Verify CNAME points to `cname.vercel-dns.com`

### Environment Variables Not Loading
- Redeploy after adding new variables
- Check for typos in variable names
- Ensure no trailing spaces

---

## 📊 Post-Launch Checklist

### Week 1
- [ ] Monitor error logs daily
- [ ] Check performance metrics
- [ ] Collect user feedback
- [ ] Fix critical bugs

### Week 2
- [ ] Implement user feedback
- [ ] Optimize slow pages
- [ ] Add missing features
- [ ] Update documentation

### Month 1
- [ ] Scale database if needed
- [ ] Review costs and optimize
- [ ] Add monitoring alerts
- [ ] Plan Phase 3 features

---

## 🎯 Success Metrics

**Technical:**
- ✅ 99.9% uptime
- ✅ < 2s page load time
- ✅ Zero security incidents
- ✅ < 1% error rate

**Business:**
- ✅ 10 active users in first month
- ✅ 95% user satisfaction
- ✅ < 5% churn rate

---

**Ready to deploy? Follow steps 1-9 above!**

**Estimated time:** 2-3 hours for complete deployment

**Status after deployment:** Live on aimforce.cloud with SSL certificate 🚀
