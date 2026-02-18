# ⚡ SECURITY QUICK START GUIDE

**🚨 CRITICAL ISSUES FOUND - IMMEDIATE ACTION REQUIRED**

---

## 🎯 30-SECOND SUMMARY

**Status:** 🔴 **5 CRITICAL vulnerabilities discovered**

**Risk:** Production deployment UNSAFE until fixed

**Time to Fix:** ~1 hour for critical issues

**Next Action:** Follow steps below ⬇️

---

## 🔥 CRITICAL ISSUES (Fix NOW)

### 1. API Keys Exposed → Rotate Immediately
- Anthropic API key visible in `.env`
- n8n API token visible in `.env`
- **Risk:** Unlimited API abuse, thousands in charges

### 2. Webhook Unprotected → Add Authentication
- n8n webhook has NO required authentication
- **Risk:** Attackers can inject fake data into database

### 3. Authentication Broken → Fix Code
- API routes import non-existent `authOptions`
- **Risk:** Complete authentication bypass possible

### 4. Hardcoded Password → Change Now
- Owner password is `tars2026`
- **Risk:** Trivial account compromise

### 5. Weak Session Secret → Regenerate
- NEXTAUTH_SECRET is `dev-secret-change-in-production`
- **Risk:** Session token forgery

---

## ⚡ 5-MINUTE EMERGENCY FIX

**Do this RIGHT NOW if you need to deploy soon:**

```bash
# 1. Rotate API keys (do this via web interfaces):
# - Anthropic: https://console.anthropic.com/settings/keys
# - n8n: https://n8n.srv1378974.hstgr.cloud/settings

# 2. Generate new secrets
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web
cat > .env.new << EOF
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL=http://localhost:3000
OWNER_EMAIL=owner@tars.ai
OWNER_PASSWORD="$(openssl rand -base64 24)"
ANTHROPIC_API_KEY=YOUR_NEW_KEY_HERE
N8N_WEBHOOK_SECRET="$(openssl rand -hex 32)"
EOF

# 3. Review and copy new values
cat .env.new

# 4. Backup old .env and replace
cp .env .env.old.$(date +%Y%m%d)
mv .env.new .env

# 5. Update root .env
cd ~/Desktop/Tars
# Manually update N8N_API_KEY with new token from n8n dashboard

echo "✅ Secrets rotated! Now fix authentication code..."
```

---

## 🛠️ 1-HOUR COMPLETE FIX

**For comprehensive security hardening:**

```bash
# Step 1: Review critical findings (2 min)
cd ~/Desktop/Tars/SECURITY
cat CRITICAL-FINDINGS-SUMMARY.md

# Step 2: Run automated hardening (30 min)
cd scripts
./harden.sh
# Follow prompts and complete manual steps

# Step 3: Fix authentication imports (15 min)
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web

# Find broken imports:
grep -r "authOptions" src/ --exclude-dir=node_modules

# Fix each file - replace:
# OLD: import { authOptions } from '@/lib/auth';
# NEW: import { auth } from '@/lib/auth';

# OLD: const session = await getServerSession(authOptions);
# NEW: const session = await auth();

# Step 4: Verify fixes (5 min)
cd ~/Desktop/Tars/SECURITY/scripts
./monitor-security.sh

# Step 5: Run tests (10 min)
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web
npm run build  # Should succeed
npm run dev    # Test locally

echo "✅ Security hardening complete!"
```

---

## 📋 VERIFICATION CHECKLIST

After completing fixes, verify:

- [ ] Old API keys revoked via provider dashboards
- [ ] New API keys updated in `.env` files
- [ ] `.env` files NOT committed to git: `git status`
- [ ] Webhook secret is set and mandatory in code
- [ ] All `authOptions` imports replaced with `auth()`
- [ ] New owner password saved securely (password manager)
- [ ] Application builds successfully: `npm run build`
- [ ] Local testing works: Login, create product, test webhook

---

## 📊 FULL REPORTS

Detailed documentation available:

| Document | Purpose | Lines |
|----------|---------|-------|
| [CRITICAL-FINDINGS-SUMMARY.md](./CRITICAL-FINDINGS-SUMMARY.md) | Urgent issues only | 365 |
| [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) | Complete audit (32 findings) | 1,045 |
| [SECURITY-CHECKLIST.md](./SECURITY-CHECKLIST.md) | Pre-deployment verification | 365 |
| [INCIDENT-RESPONSE.md](./INCIDENT-RESPONSE.md) | Security incident procedures | 653 |
| [scripts/harden.sh](./scripts/harden.sh) | Automated hardening | Executable |

---

## 🎯 DEPLOYMENT DECISION TREE

```
Are you deploying to production?
│
├─ YES → ⚠️ STOP!
│   │
│   ├─ All CRITICAL issues fixed?
│   │   ├─ YES → All HIGH issues fixed?
│   │   │   ├─ YES → ✅ Safe to deploy (with monitoring)
│   │   │   └─ NO → Fix HIGH issues first (1-2 days)
│   │   └─ NO → 🔴 DO NOT DEPLOY
│   │
│   └─ Check SECURITY-CHECKLIST.md before deployment
│
└─ NO (Development/Staging)
    │
    ├─ Fix CRITICAL issues ASAP
    └─ Schedule HIGH/MEDIUM fixes this week
```

---

## 🚀 NEXT STEPS

**Immediate (Today):**
1. ✅ Complete 1-hour fix above
2. 📖 Read CRITICAL-FINDINGS-SUMMARY.md
3. 🔄 Rotate all API keys

**This Week:**
1. 📋 Review full SECURITY-AUDIT.md
2. 🛠️ Fix all HIGH severity issues (8 issues)
3. ✅ Complete SECURITY-CHECKLIST.md

**Before Production:**
1. 🗄️ Migrate SQLite → PostgreSQL
2. 🔐 Configure all security headers
3. 📊 Set up monitoring & alerting
4. 🧪 Full security testing

---

## 💬 TLDR

**What:** 5 critical security vulnerabilities found  
**Why:** API keys exposed, auth broken, webhooks unprotected  
**When:** Fix in next 1 hour  
**How:** Run `scripts/harden.sh` + manual fixes  
**Then:** Follow SECURITY-CHECKLIST.md  

**Status after fixes:** Development-ready ✅ | Production-ready ❌ (needs HIGH issue fixes)

---

## 🆘 HELP

**Something broken?**
1. Check logs: `tail -f ~/.npm/_logs/*.log`
2. Verify `.env` syntax (no trailing spaces, quotes)
3. Restart dev server: `npm run dev`

**Still stuck?**
- Review detailed fix steps in CRITICAL-FINDINGS-SUMMARY.md
- Check INCIDENT-RESPONSE.md for emergency procedures
- Escalate to main TARS agent

---

**⚡ Quick Start: Run this one command to begin:**
```bash
cd ~/Desktop/Tars/SECURITY/scripts && ./harden.sh
```

---

**Generated:** 2026-02-17  
**Security Specialist Agent** 🛡️
