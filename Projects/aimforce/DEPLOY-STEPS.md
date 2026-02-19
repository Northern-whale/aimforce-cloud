# 🚀 AIMForce - Deploy to Production NOW

**Status: Ready to deploy!**

Database configured ✅  
Environment variables ready ✅  
Code committed ✅

---

## Step 1: Create GitHub Repository (2 minutes)

**Go to:** https://github.com/new

**Fill in:**
- Repository name: `aimforce-cloud`
- Description: `AI-powered social media management platform`
- **Public** (checked)
- **DO NOT** initialize with README (we have code already)

**Click:** Create repository

---

## Step 2: Push Code to GitHub (1 minute)

**Copy these commands and run in terminal:**

```bash
cd ~/Desktop/Tars/Projects/aimforce

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/aimforce-cloud.git

# Push code
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

---

## Step 3: Deploy to Vercel (5 minutes)

### A. Import Project

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Paste your GitHub repo URL: `https://github.com/YOUR_USERNAME/aimforce-cloud`
4. Click **"Import"**

### B. Configure Project

**Framework Preset:** Next.js (auto-detected)  
**Root Directory:** `./` (default)  
**Build Command:** `npm run build` (default)

### C. Add Environment Variables

Click **"Environment Variables"** and add these **one by one:**

```bash
# Database
DATABASE_URL = postgresql://postgres:NxCJtYhmoFdPRCPNNvvAUvcDReuSNGDC@switchyard.proxy.rlwy.net:29390/railway

# Authentication
NEXTAUTH_URL = https://aimforce.cloud
NEXTAUTH_SECRET = UUTNilL7VLkzcJYMxkQ04sJPkKTdD8LTWwmx2oZli8U=

# AI Services
ANTHROPIC_API_KEY = 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
ELEVENLABS_API_KEY = sk_379a53efc52bf060f900bc6b222a52c2ae506e0a7579d92a

# OAuth Placeholders (we'll add real values later)
GOOGLE_CLIENT_ID = placeholder
GOOGLE_CLIENT_SECRET = placeholder
FACEBOOK_APP_ID = placeholder
FACEBOOK_APP_SECRET = placeholder
LINKEDIN_CLIENT_ID = placeholder
LINKEDIN_CLIENT_SECRET = placeholder
TWITTER_CLIENT_ID = placeholder
TWITTER_CLIENT_SECRET = placeholder
```

**Important:** Select **"Production"** for all variables

### D. Deploy

Click **"Deploy"**

Wait ~3-5 minutes for build to complete.

---

## Step 4: Configure Domain (3 minutes)

After deployment succeeds:

1. Go to **Project Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `aimforce.cloud`
4. Vercel will give you DNS instructions
5. Go to your domain registrar (where you bought aimforce.cloud)
6. Add the DNS records Vercel shows you:
   - Type: `A` → Value: `76.76.21.21`
   - Type: `CNAME` → Name: `www` → Value: `cname.vercel-dns.com`

**DNS propagation takes 5-60 minutes**

---

## Step 5: Initialize Database (1 minute)

After deployment succeeds:

**In Vercel Dashboard:**
1. Go to your project
2. Click **"Functions"** tab
3. Find any function, click it
4. Click **"View Logs"**

**OR run this command locally:**

```bash
cd ~/Desktop/Tars/Projects/aimforce
DATABASE_URL="postgresql://postgres:NxCJtYhmoFdPRCPNNvvAUvcDReuSNGDC@switchyard.proxy.rlwy.net:29390/railway" npx prisma db push
DATABASE_URL="postgresql://postgres:NxCJtYhmoFdPRCPNNvvAUvcDReuSNGDC@switchyard.proxy.rlwy.net:29390/railway" npx prisma db seed
```

This creates all tables and seeds the initial owner account.

---

## Step 6: Test Production

**Once DNS propagates (5-60 min):**

1. Go to: https://aimforce.cloud
2. Login with: 
   - Email: `owner@aimforce.cloud`
   - Password: `aimforce2026`
3. **You should see:** Owner dashboard
4. **Create a test client** to verify the platform works

---

## 🎉 You're Live!

**What works NOW:**
- ✅ Authentication & user management
- ✅ Owner dashboard
- ✅ Client portal
- ✅ Voice recording
- ✅ Content library (uploads)
- ✅ Schedule calendar

**What to add LATER:**
- 🔄 Social media OAuth (Facebook, LinkedIn, Twitter, Google)
- 🔄 Actual posting functionality
- 🔄 Analytics dashboard

---

## Next: Add Social Media OAuth

After testing the platform, we'll add real OAuth credentials:

1. Create Facebook Developer app → Get credentials
2. Create LinkedIn Developer app → Get credentials
3. Create Twitter Developer app → Get credentials
4. Create Google Cloud OAuth → Get credentials
5. Update Vercel environment variables
6. Redeploy (automatically triggers)

---

## 🆘 Troubleshooting

**Build fails:**
- Check Vercel logs for errors
- Verify all environment variables are set
- Make sure DATABASE_URL is correct

**Can't login:**
- Run database seed command again
- Check that DATABASE_URL connects to Railway

**Domain not working:**
- Wait longer (DNS can take up to 1 hour)
- Verify DNS records in domain registrar
- Check Vercel domain settings

---

## ⏱️ Total Time: ~15 minutes

- GitHub: 2 min
- Code push: 1 min
- Vercel setup: 5 min
- Domain config: 3 min
- Database init: 1 min
- DNS wait: 5-60 min
- Testing: 3 min

**THEN YOU'RE LIVE! 🚀**

---

**START NOW:** Go create that GitHub repo!  
**Tell me when:** "GitHub done" and I'll help with next steps  
**Or:** "Deployed!" when everything is live
