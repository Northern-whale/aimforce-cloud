# 🚀 Deploy to Vercel - Step by Step

**Code is on GitHub!** https://github.com/Northern-whale/aimforce-cloud

Now let's deploy to production.

---

## Step 1: Import to Vercel (2 minutes)

### A. Go to Vercel

**Open:** https://vercel.com/new

### B. Import Repository

1. Click **"Import Git Repository"**
2. You should see: `Northern-whale/aimforce-cloud`
3. Click **"Import"**

**If you don't see it:**
- Click "Adjust GitHub App Permissions"
- Grant access to `aimforce-cloud` repository
- Return to import page

### C. Configure Project

**Framework:** Next.js ✅ (auto-detected)  
**Root Directory:** `./` (default)  
**Build Command:** (leave default)  
**Output Directory:** (leave default)

**Click "Deploy" button?** ❌ **NOT YET!**

Click **"Environment Variables"** first ⬇️

---

## Step 2: Add Environment Variables (3 minutes)

**Click the "Environment Variables" section** (expand it)

**Copy and paste these ONE BY ONE:**

### Database

**Name:** `DATABASE_URL`  
**Value:**
```
postgresql://postgres:NxCJtYhmoFdPRCPNNvvAUvcDReuSNGDC@switchyard.proxy.rlwy.net:29390/railway
```
**Environment:** Production ✅

---

### Authentication

**Name:** `NEXTAUTH_URL`  
**Value:**
```
https://aimforce.cloud
```
**Environment:** Production ✅

---

**Name:** `NEXTAUTH_SECRET`  
**Value:**
```
UUTNilL7VLkzcJYMxkQ04sJPkKTdD8LTWwmx2oZli8U=
```
**Environment:** Production ✅

---

### AI Services

**Name:** `ANTHROPIC_API_KEY`  
**Value:**
```
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
```
**Environment:** Production ✅

---

**Name:** `ELEVENLABS_API_KEY`  
**Value:**
```
sk_379a53efc52bf060f900bc6b222a52c2ae506e0a7579d92a
```
**Environment:** Production ✅

---

### OAuth Placeholders (add these for now)

**Name:** `GOOGLE_CLIENT_ID`  
**Value:** `placeholder`  
**Environment:** Production ✅

**Name:** `GOOGLE_CLIENT_SECRET`  
**Value:** `placeholder`  
**Environment:** Production ✅

**Name:** `FACEBOOK_APP_ID`  
**Value:** `placeholder`  
**Environment:** Production ✅

**Name:** `FACEBOOK_APP_SECRET`  
**Value:** `placeholder`  
**Environment:** Production ✅

**Name:** `LINKEDIN_CLIENT_ID`  
**Value:** `placeholder`  
**Environment:** Production ✅

**Name:** `LINKEDIN_CLIENT_SECRET`  
**Value:** `placeholder`  
**Environment:** Production ✅

**Name:** `TWITTER_CLIENT_ID`  
**Value:** `placeholder`  
**Environment:** Production ✅

**Name:** `TWITTER_CLIENT_SECRET`  
**Value:** `placeholder`  
**Environment:** Production ✅

---

## Step 3: Deploy! (5 minutes)

**After all environment variables are added:**

1. Scroll to bottom
2. Click **"Deploy"**
3. Wait 3-5 minutes for build

**You'll see:**
- Building... (2-3 min)
- Running checks...
- Deployment ready! ✅

---

## Step 4: Configure Domain (5 minutes)

**After deployment succeeds:**

1. Go to **Project Settings** (top right)
2. Click **"Domains"** in left sidebar
3. Click **"Add"** button
4. Enter: `aimforce.cloud`
5. Click **"Add"**

**Vercel will show DNS instructions:**

### Your DNS Records (add these to your domain registrar)

**Record 1:**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**Record 2:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

**Where to add these?**
- Go to wherever you bought `aimforce.cloud`
- Find "DNS Settings" or "Nameservers"
- Add these two records
- Save

**DNS propagation:** 5-60 minutes

---

## Step 5: Initialize Database (2 minutes)

**After deployment is live, run this locally:**

```bash
cd ~/Desktop/Tars/Projects/aimforce

# Push database schema
DATABASE_URL="postgresql://postgres:NxCJtYhmoFdPRCPNNvvAUvcDReuSNGDC@switchyard.proxy.rlwy.net:29390/railway" npx prisma db push

# Seed initial data
DATABASE_URL="postgresql://postgres:NxCJtYhmoFdPRCPNNvvAUvcDReuSNGDC@switchyard.proxy.rlwy.net:29390/railway" npx prisma db seed
```

This creates all database tables and the owner account.

---

## Step 6: Test! (3 minutes)

**Once DNS propagates (check after 10 minutes):**

### Option A: Test on Vercel URL (works immediately)

Your Vercel URL will be something like:
- `https://aimforce-cloud.vercel.app`
- Or `https://aimforce-cloud-git-main-northern-whale.vercel.app`

Find it in Vercel dashboard, click "Visit".

### Option B: Test on Custom Domain (after DNS)

Go to: https://aimforce.cloud

**Login:**
- Email: `owner@aimforce.cloud`
- Password: `aimforce2026`

**You should see:**
- ✅ Login page
- ✅ Owner dashboard after login
- ✅ Navigation menu
- ✅ AIMForce logo

---

## 🎉 YOU'RE LIVE!

**What works now:**
- ✅ Authentication
- ✅ Owner dashboard
- ✅ Client management
- ✅ Content uploads
- ✅ Voice recording
- ✅ Calendar scheduling

**What to add later:**
- 🔄 Social media OAuth
- 🔄 Actual posting
- 🔄 Analytics

---

## 🆘 Troubleshooting

### Build Failed

**Check:** Vercel build logs for errors  
**Common fix:** Make sure all environment variables are set

### Can't Login

**Fix:** Run database seed command again:
```bash
DATABASE_URL="postgresql://postgres:NxCJtYhmoFdPRCPNNvvAUvcDReuSNGDC@switchyard.proxy.rlwy.net:29390/railway" npx prisma db seed
```

### Domain Not Working

**Wait:** DNS can take up to 1 hour  
**Check:** Use Vercel URL first (works immediately)  
**Verify:** DNS records are correct in domain registrar

---

## ⏱️ Total Time

- Import to Vercel: 2 min
- Environment variables: 3 min
- Deploy build: 5 min
- Domain config: 5 min
- Database init: 2 min
- DNS wait: 5-60 min
- Testing: 3 min

**Active time: ~20 minutes**  
**Wait time: ~10-60 minutes for DNS**

---

## 📋 Checklist

- [ ] Import GitHub repo to Vercel
- [ ] Add all environment variables
- [ ] Click Deploy
- [ ] Wait for build to complete
- [ ] Add custom domain
- [ ] Configure DNS records
- [ ] Initialize database
- [ ] Test login
- [ ] **GO LIVE!** 🚀

---

**START NOW:** https://vercel.com/new

**Tell me when:** "Deploying" (so I can track progress)  
**Or if stuck:** Screenshot the error and I'll help
