# 🚀 AIMForce - Deploy to Production RIGHT NOW

**Current Status:** Code ready, APIs integrated, waiting for accounts

---

## ✅ WHAT'S DONE (By Nova)

- ✅ PostgreSQL schema ready
- ✅ OAuth integrations (Facebook, Instagram, LinkedIn, Twitter, TikTok)
- ✅ Google Drive integration  
- ✅ File upload API
- ✅ Security headers configured
- ✅ Vercel config file created
- ✅ Production environment template
- ✅ All pages functional

---

## 📋 YOUR CHECKLIST (Do These Now)

### Part 1: Create Accounts (45 min)

Follow **SETUP-ACCOUNTS.md** step by step:

1. [ ] Vercel account (5 min)
2. [ ] Railway PostgreSQL (10 min) → **COPY DATABASE_URL**
3. [ ] GitHub repo (5 min)
4. [ ] Facebook Developer (10 min) → **COPY APP_ID + SECRET**
5. [ ] LinkedIn Developer (10 min) → **COPY CLIENT_ID + SECRET**
6. [ ] Twitter Developer (15 min) → **COPY CLIENT_ID + SECRET**
7. [ ] Google Cloud Console (15 min) → **COPY CLIENT_ID + SECRET**
8. [ ] TikTok (optional, skip for now)

**When done:** Tell me "accounts created" + share credentials

---

### Part 2: Deploy to Vercel (I'll guide you)

Once you have accounts:

```bash
# 1. Push to GitHub (if not done)
cd ~/Desktop/Tars/Projects/aimforce
git add .
git commit -m "Production ready with OAuth"
git push

# 2. Deploy to Vercel
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project name? aimforce
# - Which directory? ./
# - Override settings? No

# 3. Deploy to production
vercel --prod
```

---

### Part 3: Configure Environment Variables

**In Vercel Dashboard:**

1. Go to project settings
2. Environment Variables tab
3. Add all these (I'll give you the values):

```bash
DATABASE_URL=        # From Railway
NEXTAUTH_URL=https://aimforce.cloud
NEXTAUTH_SECRET=     # I'll generate this
ANTHROPIC_API_KEY=   # Already have
ELEVENLABS_API_KEY=  # Already have  
GOOGLE_CLIENT_ID=    # From Google Cloud
GOOGLE_CLIENT_SECRET=# From Google Cloud
FACEBOOK_APP_ID=     # From Facebook
FACEBOOK_APP_SECRET= # From Facebook
LINKEDIN_CLIENT_ID=  # From LinkedIn
LINKEDIN_CLIENT_SECRET=# From LinkedIn
TWITTER_CLIENT_ID=   # From Twitter
TWITTER_CLIENT_SECRET=# From Twitter
```

4. Redeploy after adding variables

---

### Part 4: Configure Domain

**In your domain registrar (where you bought aimforce.cloud):**

1. Go to DNS settings
2. Add CNAME record:
   - Name: `@`
   - Value: `cname.vercel-dns.com`
   - TTL: 3600
3. Add CNAME for www:
   - Name: `www`
   - Value: `cname.vercel-dns.com`
4. Save

**In Vercel Dashboard:**

1. Project Settings → Domains
2. Add domain: `aimforce.cloud`
3. Add domain: `www.aimforce.cloud`
4. Wait 5-30 minutes for DNS

**✅ SSL auto-configured by Vercel!**

---

### Part 5: Database Migration

```bash
# Update local .env with Railway DATABASE_URL
DATABASE_URL="postgresql://..." # From Railway

# Run migrations on production database
npx prisma migrate deploy

# Seed production database
npx prisma db seed
```

---

### Part 6: Test Production

**URLs to test:**
- https://aimforce.cloud
- https://aimforce.cloud/login
- https://aimforce.cloud/portal
- https://aimforce.cloud/owner

**Test login:**
- owner@aimforce.cloud / aimforce2026
- demo1@company.com / demo2026

**Test OAuth:**
- Go to /portal/social
- Click "Connect Facebook"
- Should redirect to Facebook login
- After auth, should return to /portal/social with "Connected" status

---

## 🎯 Timeline

**If you start NOW:**
- 45 min: Create all accounts
- 10 min: Deploy to Vercel
- 5 min: Configure domain
- 10 min: Set environment variables
- 10 min: Database migration
- 10 min: Testing

**Total: ~90 minutes to live production!**

---

## 💡 Quick Start (Fastest Path)

**Do these 3 first (20 min):**
1. Vercel account
2. Railway database  
3. GitHub repo + push code

**Deploy immediately with just these:**
- You'll have working site (without social OAuth yet)
- Add OAuth credentials later incrementally

**Then add social media:**
4. Facebook (for FB + Instagram)
5. LinkedIn
6. Twitter
7. Google (for Drive)

---

## 🆘 If You Get Stuck

**Common issues:**

**"Failed to build"**
- Check Vercel build logs
- Usually missing environment variable

**"Database connection failed"**
- Verify DATABASE_URL is correct
- Check Railway database is running

**"OAuth redirect error"**
- Verify redirect URIs in each platform
- Must be exactly: `https://aimforce.cloud/api/oauth/callback/{platform}`

**"Domain not working"**
- Wait 30 minutes for DNS propagation
- Check DNS with: `nslookup aimforce.cloud`
- Verify CNAME points to `cname.vercel-dns.com`

---

## 📞 Next Steps After Deploy

1. **Test everything** - All logins, OAuth flows, file uploads
2. **Monitor errors** - Check Vercel logs
3. **Invite beta users** - Get real feedback
4. **Iterate** - Fix bugs, add features
5. **Scale** - Add more clients!

---

## 🎉 SUCCESS CRITERIA

**You're LIVE when:**
- ✅ https://aimforce.cloud loads
- ✅ Can login as owner
- ✅ Can login as client
- ✅ Can connect Facebook account
- ✅ Can upload files
- ✅ Can schedule posts
- ✅ SSL certificate active (🔒 in browser)

---

**Ready? Let's go!**

**Step 1:** Open SETUP-ACCOUNTS.md  
**Step 2:** Start with Vercel + Railway  
**Step 3:** Tell me when accounts are ready  

**I'll handle:** Environment setup, deployment commands, troubleshooting

**LET'S DEPLOY! 🚀**
