# ⚡ Quick Deploy Reference

**Status: Code on GitHub ✅ → Deploy to Vercel NOW**

---

## 🎯 Your Mission: 3 Steps

### Step 1: Vercel Import (2 min)
1. Go to: **https://vercel.com/new**
2. Import: `Northern-whale/aimforce-cloud`
3. Don't click Deploy yet!

### Step 2: Environment Variables (3 min)
**Add these in Vercel's Environment Variables section:**

```bash
DATABASE_URL=postgresql://postgres:NxCJtYhmoFdPRCPNNvvAUvcDReuSNGDC@switchyard.proxy.rlwy.net:29390/railway

NEXTAUTH_URL=https://aimforce.cloud

NEXTAUTH_SECRET=UUTNilL7VLkzcJYMxkQ04sJPkKTdD8LTWwmx2oZli8U=

ANTHROPIC_API_KEY=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

ELEVENLABS_API_KEY=sk_379a53efc52bf060f900bc6b222a52c2ae506e0a7579d92a

GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder
FACEBOOK_APP_ID=placeholder
FACEBOOK_APP_SECRET=placeholder
LINKEDIN_CLIENT_ID=placeholder
LINKEDIN_CLIENT_SECRET=placeholder
TWITTER_CLIENT_ID=placeholder
TWITTER_CLIENT_SECRET=placeholder
```

**Set all to "Production"**

### Step 3: Deploy (5 min)
1. Click **"Deploy"**
2. Wait 3-5 minutes
3. Get your Vercel URL (e.g., `aimforce-cloud.vercel.app`)

---

## 🗄️ After Deploy: Initialize Database

**Run this in terminal:**

```bash
cd ~/Desktop/Tars/Projects/aimforce
bash init-database.sh
```

Or manually:
```bash
cd ~/Desktop/Tars/Projects/aimforce
DATABASE_URL="postgresql://postgres:NxCJtYhmoFdPRCPNNvvAUvcDReuSNGDC@switchyard.proxy.rlwy.net:29390/railway" npx prisma db push
DATABASE_URL="postgresql://postgres:NxCJtYhmoFdPRCPNNvvAUvcDReuSNGDC@switchyard.proxy.rlwy.net:29390/railway" npx prisma db seed
```

---

## 🌐 Configure Domain (Optional)

**In Vercel Project Settings → Domains:**
1. Add: `aimforce.cloud`
2. Follow DNS instructions
3. Add A and CNAME records to your domain registrar
4. Wait 10-60 min for DNS

---

## 🧪 Test

**Vercel URL** (works immediately):
- Find in Vercel dashboard after deploy
- Something like: `aimforce-cloud.vercel.app`

**Custom domain** (after DNS):
- https://aimforce.cloud

**Login:**
- Email: `owner@aimforce.cloud`
- Password: `aimforce2026`

---

## 📍 Key Links

- **GitHub**: https://github.com/Northern-whale/aimforce-cloud
- **Vercel**: https://vercel.com/new
- **Railway**: https://railway.app (database already running)

---

## 🆘 If Stuck

**Tell me:**
- "Build failed" + screenshot
- "Can't find environment variables"
- "Domain not working"

**I'll help immediately!**

---

**START: https://vercel.com/new** 🚀
