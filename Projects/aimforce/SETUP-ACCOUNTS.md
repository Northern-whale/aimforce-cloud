# AIMForce - External Accounts Setup Guide

**YOU NEED TO DO THESE STEPS** (I can't create accounts for you)

Total time: ~45 minutes to set up all accounts

---

## 🎯 Required Accounts (In Order)

### 1. Vercel Account (5 min) - **DO THIS FIRST**
**What:** Hosting platform for frontend  
**Cost:** Free tier available, Pro = $20/mo  
**URL:** https://vercel.com

**Steps:**
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub
5. ✅ Done - you're ready to deploy

---

### 2. Railway Account (10 min) - **DO THIS SECOND**
**What:** PostgreSQL database hosting  
**Cost:** $5-20/mo (usage-based)  
**URL:** https://railway.app

**Steps:**
1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway
4. Click "New Project"
5. Select "Provision PostgreSQL"
6. Wait for database to provision (~2 min)
7. Click on the PostgreSQL service
8. Go to "Connect" tab
9. **COPY THIS:** The "Postgres Connection URL"
   - Looks like: `postgresql://user:pass@host.railway.app:1234/railway`
10. Save this URL for .env configuration

**✅ You now have a production database!**

---

### 3. GitHub Repository (5 min) - **DO THIS THIRD**
**What:** Version control & deployment source  
**Already have GitHub?** Just create a new repo

**Steps:**
```bash
cd ~/Desktop/Tars/Projects/aimforce

# Initialize git (if not done)
git init
git add .
git commit -m "AIMForce production ready"

# Create GitHub repo
# Option A: Using GitHub CLI
gh repo create aimforce --public --source=. --remote=origin --push

# Option B: Manual
# - Go to github.com/new
# - Name: aimforce
# - Public
# - Don't initialize with README (we have code)
# - Create repository
# - Follow the "push existing repository" commands
```

**✅ Code is now on GitHub!**

---

### 4. Facebook Developer Account (10 min)
**What:** OAuth for Facebook + Instagram  
**Cost:** Free  
**URL:** https://developers.facebook.com

**Steps:**
1. Go to https://developers.facebook.com
2. Click "Get Started"
3. Complete registration
4. Click "Create App"
5. Choose "Business" → "Next"
6. App Display Name: **AIMForce Social Manager**
7. App Contact Email: your-email@domain.com
8. Create App
9. In Dashboard, click "+ Add Product"
10. Find "Facebook Login" → "Set Up"
11. Choose "Web" platform
12. Site URL: `https://aimforce.cloud`
13. Save
14. Go to Settings → Basic
15. **COPY THESE:**
    - App ID → `FACEBOOK_APP_ID`
    - App Secret → `FACEBOOK_APP_SECRET` (click "Show")
16. Add Valid OAuth Redirect URIs:
    - `https://aimforce.cloud/api/oauth/callback/facebook`
    - `https://aimforce.cloud/api/oauth/callback/instagram`

**✅ Facebook + Instagram ready!**

---

### 5. LinkedIn Developer (10 min)
**What:** OAuth for LinkedIn  
**Cost:** Free  
**URL:** https://www.linkedin.com/developers/apps

**Steps:**
1. Go to https://www.linkedin.com/developers/apps
2. Click "Create app"
3. App name: **AIMForce**
4. LinkedIn Page: (create a company page first if needed)
5. App logo: Upload AIMForce logo
6. Legal agreement: Check and create
7. In "Auth" tab:
8. Add Redirect URL: `https://aimforce.cloud/api/oauth/callback/linkedin`
9. In "Products" tab, request access to:
   - "Share on LinkedIn"
   - "Sign In with LinkedIn"
10. **COPY THESE** from Auth tab:
    - Client ID → `LINKEDIN_CLIENT_ID`
    - Client Secret → `LINKEDIN_CLIENT_SECRET`

**✅ LinkedIn ready!**

---

### 6. Twitter Developer (15 min)
**What:** OAuth for Twitter/X  
**Cost:** Free (Basic tier)  
**URL:** https://developer.twitter.com

**Steps:**
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Sign up for Developer Account
3. Complete verification (may take 5-10 min)
4. Create Project: "AIMForce Social"
5. Create App: "AIMForce Production"
6. In App settings:
7. Turn ON "OAuth 2.0"
8. Type of App: "Web App"
9. Callback URI: `https://aimforce.cloud/api/oauth/callback/twitter`
10. Website URL: `https://aimforce.cloud`
11. **COPY THESE:**
    - Client ID → `TWITTER_CLIENT_ID`
    - Client Secret → `TWITTER_CLIENT_SECRET`
12. In "Keys and tokens" tab, save these too

**✅ Twitter ready!**

---

### 7. TikTok Developer (Optional - 15 min)
**What:** OAuth for TikTok  
**Cost:** Free  
**URL:** https://developers.tiktok.com

**Steps:**
1. Go to https://developers.tiktok.com
2. Register as developer
3. Create new app
4. App name: AIMForce
5. Add redirect URL: `https://aimforce.cloud/api/oauth/callback/tiktok`
6. Request these scopes:
   - `user.info.basic`
   - `video.upload`
7. Submit for review (may take 1-2 days)
8. **COPY THESE** once approved:
   - Client Key → `TIKTOK_CLIENT_KEY`
   - Client Secret → `TIKTOK_CLIENT_SECRET`

**✅ TikTok ready (after approval)!**

---

### 8. Google Cloud Console (15 min)
**What:** OAuth for Google Drive  
**Cost:** Free  
**URL:** https://console.cloud.google.com

**Steps:**
1. Go to https://console.cloud.google.com
2. Create New Project: "AIMForce"
3. Enable APIs:
   - Go to "APIs & Services" → "Library"
   - Search "Google Drive API" → Enable
   - Search "Google+ API" → Enable (for OAuth)
4. Create OAuth Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "AIMForce Production"
   - Authorized redirect URIs:
     - `https://aimforce.cloud/api/auth/callback/google`
   - Create
5. **COPY THESE:**
   - Client ID → `GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`

**✅ Google Drive ready!**

---

## 📝 Credentials Checklist

**Copy all these to a secure note (1Password, LastPass, etc.):**

```bash
# Database
DATABASE_URL="postgresql://..." # From Railway

# Social Media
FACEBOOK_APP_ID="..."
FACEBOOK_APP_SECRET="..."

LINKEDIN_CLIENT_ID="..."
LINKEDIN_CLIENT_SECRET="..."

TWITTER_CLIENT_ID="..."
TWITTER_CLIENT_SECRET="..."

TIKTOK_CLIENT_KEY="..." # Optional
TIKTOK_CLIENT_SECRET="..." # Optional

# Google
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

## 🚀 What Happens Next

**After you complete these steps:**
1. Come back and tell me "accounts done"
2. I'll configure Vercel deployment
3. I'll set up environment variables
4. We'll deploy to aimforce.cloud
5. Test everything
6. **GO LIVE!** 🎉

---

## ⏱️ Time Estimate

- ✅ Vercel: 5 min
- ✅ Railway: 10 min
- ✅ GitHub: 5 min
- ✅ Facebook: 10 min
- ✅ LinkedIn: 10 min
- ✅ Twitter: 15 min
- ⏭️ TikTok: 15 min (optional, skip for now)
- ✅ Google: 15 min

**Total: ~45 minutes** (or ~30 min if you skip TikTok)

---

## 💡 Pro Tips

1. **Use a password manager** - Store all these credentials securely
2. **Use same email** - Makes account management easier
3. **Enable 2FA** - Protect all developer accounts
4. **Skip TikTok initially** - Can add later (requires approval anyway)
5. **Double-check redirect URIs** - Must match exactly: `https://aimforce.cloud/api/oauth/callback/{platform}`

---

## 🆘 If You Get Stuck

**Vercel/Railway:** DM me the error, I'll help troubleshoot  
**OAuth apps:** Most common issue is wrong redirect URI  
**Database:** Make sure you copy the full connection string  

---

**START HERE:** Do steps 1-3 (Vercel, Railway, GitHub) NOW  
**Then:** Do social media OAuth (steps 4-8) while deployment runs  

**When ready, tell me:** "accounts done" and share the credentials  
**I'll handle:** Everything else (deployment, configuration, testing)  

Let's go! 🚀
