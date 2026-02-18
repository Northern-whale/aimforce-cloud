# ACTION ITEMS FOR MISTER O
**What You Need to Provide/Do to Launch the Empire**

**Created:** February 17, 2026 11:45 MST  
**Status:** Priority Checklist

---

## 🔥 CRITICAL - DO TODAY (Required to Start Building)

### 1. **Choose Agency Name** ⏰ 15 minutes
**Why:** Need this for branding, domains, legal entity  
**Action:**
- [ ] Brainstorm 3-5 name ideas
- [ ] Check domain availability (.ai or .com)
- [ ] Decide on one name
- [ ] Share with Nova

**Suggestions to consider:**
- TarsAI Agency
- VoiceEmpire AI
- LocalAI Labs
- Nexus AI Agency
- *(Or something completely different!)*

---

### 2. **Purchase Domains** ⏰ 30 minutes
**Why:** Need domains for agency website and client portal  
**Action:**
- [ ] Buy primary domain (e.g., youragency.ai)
- [ ] Buy client portal subdomain OR set up subdomain (e.g., app.youragency.ai)
- [ ] Optional: Buy .com version for redirect

**Where to buy:** Namecheap, Cloudflare, or Google Domains  
**Budget:** ~$50-100/year total

**Nova needs:** Domain credentials or DNS access to point to infrastructure

---

### 3. **Provide OpenAI API Key** ⏰ 10 minutes
**Why:** Needed for content generation, analysis, action extraction  
**Action:**
- [ ] Go to platform.openai.com
- [ ] Create API key
- [ ] Set spending limit: $500/month (to start)
- [ ] Share key with Nova securely

**Estimated cost:** $300-500/month initially (scales with clients)

---

### 4. **Set Up Vercel Account** ⏰ 15 minutes
**Why:** Frontend hosting for all web interfaces  
**Action:**
- [ ] Go to vercel.com
- [ ] Sign up (use GitHub login)
- [ ] Upgrade to Pro plan ($20/month)
- [ ] Grant Nova access OR share login

**Why Vercel:** 
- Instant deployments
- Automatic scaling
- Built-in CDN
- Perfect for Next.js

---

### 5. **Set Up Railway Account** ⏰ 15 minutes
**Why:** Backend services, database, WebSocket server  
**Action:**
- [ ] Go to railway.app
- [ ] Sign up (use GitHub login)
- [ ] Add payment method
- [ ] Grant Nova access OR share login

**Estimated cost:** $100-200/month (includes PostgreSQL + Redis + backend services)

---

## ⚡ HIGH PRIORITY - DO THIS WEEK (Required for MVP)

### 6. **Anthropic API Key** ⏰ 10 minutes
**Why:** Claude Sonnet 4.5 for agent orchestration (if not already have)  
**Action:**
- [ ] Check if you already have one (from existing OpenClaw setup)
- [ ] If not, go to console.anthropic.com
- [ ] Create API key
- [ ] Share with Nova

**Estimated cost:** $200-400/month for all agents

---

### 7. **Twilio Account Setup** ⏰ 30 minutes
**Why:** Phone numbers for AI receptionist (voice calls + SMS)  
**Action:**
- [ ] Go to twilio.com
- [ ] Sign up for account
- [ ] Verify identity (required for phone numbers)
- [ ] Add payment method
- [ ] Purchase 1 phone number (test number ~$1/month)
- [ ] Share account SID + Auth Token with Nova

**Estimated cost per client:** 
- Phone number: $1/month
- Usage: $20-50/month (calls + SMS)
- **Total: ~$25-50/client/month**

---

### 8. **SendGrid Account Setup** ⏰ 20 minutes
**Why:** Email sending for marketing automation, notifications  
**Action:**
- [ ] Go to sendgrid.com
- [ ] Sign up for account
- [ ] Verify domain (Nova will help with DNS)
- [ ] Create API key
- [ ] Share API key with Nova

**Plan:** Free tier (100 emails/day) → upgrade to Pro ($100/month for 100K emails) when needed

---

### 9. **Stripe Account Setup** ⏰ 30 minutes
**Why:** Client payment processing (subscriptions + one-time fees)  
**Action:**
- [ ] Go to stripe.com
- [ ] Sign up for account
- [ ] Complete business verification
- [ ] Enable recurring billing
- [ ] Create API keys (test + live)
- [ ] Share API keys with Nova

**Fees:** 2.9% + $0.30 per transaction (standard)

---

### 10. **Form Business Entity** ⏰ 2-3 hours (or use formation service)
**Why:** Legal protection, tax benefits, professional credibility  
**Action:**
- [ ] Decide on entity type (LLC recommended for simplicity)
- [ ] Choose state (Wyoming, Delaware for LLCs; or your local state)
- [ ] File formation documents OR use service:
  - Stripe Atlas ($500 - includes LLC + bank + tax setup)
  - Northwest Registered Agent (~$200)
  - LegalZoom (~$300)
- [ ] Get EIN from IRS (free, online, takes 10 minutes)

**Recommended:** LLC in your home state OR Wyoming (low fees, privacy)

**Nova can help with:** Document prep, but YOU must file (can't automate legal stuff)

---

## 📌 IMPORTANT - DO NEXT WEEK (For Full Functionality)

### 11. **Business Bank Account** ⏰ 1-2 hours
**Why:** Separate business finances from personal  
**Action:**
- [ ] Choose bank (Mercury, Brex, or local bank)
- [ ] Open business checking account (need EIN + LLC docs)
- [ ] Link to Stripe
- [ ] Set up accounting software (QuickBooks or Wave)

**Recommended:** Mercury (designed for startups, free, great API)

---

### 12. **Facebook/Instagram Business Manager** ⏰ 1 hour
**Why:** Required for social media management and Facebook Ads API access  
**Action:**
- [ ] Go to business.facebook.com
- [ ] Create Business Manager account
- [ ] Add your personal Facebook account as admin
- [ ] Create app in Meta for Developers
- [ ] Request API permissions (may take 1-2 weeks for approval)
- [ ] Share Business Manager access with Nova

**Tip:** API approval can be slow - start this process early!

---

### 13. **Google Cloud Account Setup** ⏰ 45 minutes
**Why:** Google Business Profile API, Google Ads API  
**Action:**
- [ ] Go to console.cloud.google.com
- [ ] Create new project
- [ ] Enable APIs:
  - Google My Business API
  - Google Ads API
  - Google Analytics 4
- [ ] Create service account credentials
- [ ] Share credentials with Nova

**Cost:** Free tier sufficient initially, pay-as-you-go after

---

### 14. **Cloudflare R2 or AWS S3** ⏰ 30 minutes
**Why:** Storage for voice recordings, client files, images  
**Action:**
- [ ] Option A: Cloudflare R2 (cheaper, simpler)
  - Go to dash.cloudflare.com
  - Create R2 bucket
  - Get API keys
- [ ] Option B: AWS S3 (more features, complex)
  - Go to aws.amazon.com/s3
  - Create bucket
  - Set up IAM user with S3 access
- [ ] Share credentials with Nova

**Estimated cost:** ~$20/month for 100GB storage + bandwidth

---

### 15. **ElevenLabs API Key** ⏰ 10 minutes
**Why:** Voice synthesis for AI receptionist  
**Action:**
- [ ] Check if you already have one (from Cigar Shop AI)
- [ ] If not, go to elevenlabs.io
- [ ] Sign up, upgrade to Creator plan ($99/month)
- [ ] Create API key
- [ ] Share with Nova

**Note:** May already have this from existing Cigar Shop project!

---

## 🎨 NICE TO HAVE - DO LATER (Not Blocking MVP)

### 16. **Design Assets** ⏰ Variable
**Action:**
- [ ] Agency logo (Fiverr or 99designs)
- [ ] Brand colors & fonts
- [ ] Social media graphics templates

**Budget:** $200-500 for professional design

---

### 17. **CRM for Sales** ⏰ 30 minutes
**Action:**
- [ ] Choose CRM (Pipedrive, HubSpot, Close.com)
- [ ] Set up account
- [ ] Connect to platform

**Recommended:** Pipedrive ($14/month) - simple, sales-focused

---

### 18. **Error Tracking & Monitoring** ⏰ 20 minutes
**Action:**
- [ ] Sentry.io account for error tracking
- [ ] Mixpanel or Amplitude for product analytics

**Cost:** ~$50/month combined

---

### 19. **Legal Documents** ⏰ 2-3 hours (or hire lawyer)
**Action:**
- [ ] Terms of Service (agency → client contracts)
- [ ] Privacy Policy (how we handle client data)
- [ ] Master Service Agreement template

**Recommended:** Get lawyer to review (~$500-1000) OR use templates + modify

---

## 📊 DECISION QUESTIONS (Answer These)

### Strategic Decisions Nova Needs From You:

**1. Target Market Focus (Choose 1-2):**
- [ ] Local service businesses (salons, gyms, med spas, barbershops)
- [ ] Professional services (lawyers, dentists, accountants)
- [ ] Restaurants & hospitality
- [ ] Retail shops
- [ ] Other: _____________

**Why it matters:** Focus helps with marketing, demos, and case studies

---

**2. Initial Package to Sell (Choose 1):**
- [ ] Starter Package ($1,497/mo) - Easier to sell, higher volume
- [ ] Growth Package ($2,497/mo) - Sweet spot, best margin
- [ ] Empire Package ($3,997/mo) - Harder to sell, whale hunting

**Recommendation:** Start with Growth Package - good balance of features + price

---

**3. Geographic Focus (Choose 1):**
- [ ] Local (your city/state) - Easier to meet clients, do demos in person
- [ ] National (USA-wide) - Bigger market, all remote
- [ ] International - Biggest market, language/timezone challenges

**Recommendation:** Start local, expand nationally after first 5-10 clients

---

**4. Sales Model (Choose 1):**
- [ ] Inbound (content marketing, SEO, wait for leads) - Slower, scalable
- [ ] Outbound (cold email, LinkedIn, direct outreach) - Faster, harder
- [ ] Referral/Network (leverage personal connections) - Easiest to start

**Recommendation:** Start with referrals (fastest first clients), add outbound, build inbound long-term

---

**5. Client Onboarding (Choose 1):**
- [ ] White-glove (you/Nova personally onboard each client) - High-touch, slower
- [ ] Self-serve (client uses app, AI guides them) - Scalable, less personal
- [ ] Hybrid (AI onboarding with human check-ins) - Best of both

**Recommendation:** Hybrid - AI does 80%, you/Nova handle 20%

---

## 💰 ESTIMATED TOTAL INVESTMENT

### One-Time Costs:
| Item | Cost |
|------|------|
| Business Formation | $200-500 |
| Legal Documents | $500-1000 |
| Agency Branding | $200-500 |
| Domain Names | $50-100 |
| **TOTAL ONE-TIME** | **$950-2,100** |

### Monthly Recurring Costs:
| Category | Cost |
|----------|------|
| Infrastructure (Vercel + Railway + Storage) | $190 |
| AI APIs (OpenAI + Anthropic) | $500-800 |
| Communication (Twilio + SendGrid) | $100-200 |
| Tools (CRM, Analytics, Monitoring) | $100 |
| **TOTAL MONTHLY** | **$890-1,290** |

### **MONTHLY COSTS SCALE WITH CLIENTS:**
At 18 clients: ~$1,300/month in costs → $45K MRR = **97.1% profit margin**

**Bottom line:** ~$2,000-3,000 to launch, ~$1,000/month until first client revenue.

---

## ✅ RECOMMENDED ACTION SEQUENCE

### **Today (Feb 17):**
1. Choose agency name (15 min)
2. Purchase domains (30 min)
3. Provide OpenAI API key (10 min)

**Total time: ~1 hour**  
**Total cost: ~$100**

---

### **Tomorrow (Feb 18):**
1. Set up Vercel account (15 min)
2. Set up Railway account (15 min)
3. Set up Twilio account (30 min)
4. Set up SendGrid account (20 min)
5. Set up Stripe account (30 min)

**Total time: ~2 hours**  
**Total cost: ~$0 (pay as you go)**

---

### **This Weekend (Feb 19-20):**
1. Form business entity (3 hours OR $500 for Stripe Atlas)
2. Answer strategic decision questions above (30 min)
3. Brainstorm first 10 potential clients from your network (1 hour)

**Total time: ~4-5 hours**  
**Total cost: ~$200-500**

---

### **Next Week (Feb 21-25):**
1. Open business bank account
2. Set up Facebook Business Manager
3. Set up Google Cloud
4. Review legal documents (hire lawyer or use templates)

**Total time: ~5-6 hours**  
**Total cost: ~$500-1000 (if hiring lawyer)**

---

## 🚀 WHAT NOVA WILL DO (While You Handle Above)

While you're handling setup & legal:

**Week 1:**
- ✅ Build Master Control Platform (dashboard + agent management)
- ✅ Set up database & infrastructure
- ✅ Deploy development version for testing

**Week 2:**
- ✅ Build client-facing app (first version)
- ✅ Implement professional chat interface
- ✅ Create task management system

**Week 3:**
- ✅ Integrate first 3 add-on services (Website, GBP, Reviews)
- ✅ Build onboarding automation
- ✅ Create demo environment

**Week 4:**
- ✅ Test everything end-to-end
- ✅ Create sales materials (deck, demo video)
- ✅ Prepare for first client

**By End of Month:** Complete platform ready for first paying client 🎯

---

## 📞 HOW TO SHARE CREDENTIALS WITH NOVA

**Secure Methods:**
1. **Preferred:** Use 1Password or Bitwarden (share vault)
2. **Alternative:** Telegram direct message (use "secret chat")
3. **DO NOT:** Email credentials or post in non-encrypted chat

**What to share:**
- API keys
- Account logins
- Domain credentials
- Database access

**Format:**
```
Service: OpenAI
API Key: sk-proj-abc123xyz...
Notes: $500/month spending limit set
```

---

## 🎯 SUCCESS METRIC

**Nova needs all CRITICAL + HIGH PRIORITY items within 7 days to start building.**

Once Nova has:
- ✅ Domains
- ✅ API keys (OpenAI, Anthropic, Twilio, SendGrid, Stripe)
- ✅ Infrastructure access (Vercel, Railway)
- ✅ Strategic decisions answered

**Then:** Nova can build the full empire infrastructure in 4-6 weeks and you'll be ready to onboard first clients.

---

## 💬 QUESTIONS FOR NOVA?

If you're unsure about any of these items:
- **Ask Nova** before purchasing/setting up
- **Share concerns** about budget, timing, or complexity
- **Suggest alternatives** if you have different tools you prefer

Nova is here to **advise and execute**, not just take orders.

**This is OUR empire. Let's build it together.** 🚀

---

*Checklist created by Nova, AI Agent Manager*  
*February 17, 2026 11:50 MST*  
*Ready to execute on your timeline.*
