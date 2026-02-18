# 🔒 TARS Security Documentation

**Generated:** 2026-02-17  
**Security Specialist Agent**

---

## 📁 Contents

This directory contains all security documentation, scripts, and audit reports for the TARS agency infrastructure.

### 📄 Documents

1. **[SECURITY-AUDIT.md](./SECURITY-AUDIT.md)** - Comprehensive security audit report
   - 5 Critical findings
   - 8 High severity issues
   - 12 Medium severity issues
   - 7 Low severity issues
   - Detailed remediation steps

2. **[SECURITY-CHECKLIST.md](./SECURITY-CHECKLIST.md)** - Pre-deployment verification
   - Authentication & Authorization checks
   - API security verification
   - Infrastructure hardening
   - Production readiness criteria

3. **[INCIDENT-RESPONSE.md](./INCIDENT-RESPONSE.md)** - Security incident procedures
   - Emergency contacts
   - Severity classification
   - Response procedures (5 phases)
   - Communication templates

### 🛠️ Scripts

**Location:** `scripts/`

1. **`harden.sh`** - Automated security hardening
   - Generates strong secrets
   - Installs security dependencies
   - Creates validation schemas
   - Sets up rate limiting
   - Runs dependency audits

   **Usage:**
   ```bash
   cd ~/Desktop/Tars/SECURITY/scripts
   ./harden.sh
   ```

2. **`backup-db.sh`** - Database backup (created by harden.sh)
   - Automated SQLite backups
   - Retention: 30 days

3. **`monitor-security.sh`** - Security monitoring (created by harden.sh)
   - Checks for exposed secrets
   - Monitors failed logins
   - Verifies security posture

---

## 🚨 CRITICAL FINDINGS SUMMARY

### Immediate Action Required

1. **API Keys Exposed** (C-1)
   - Anthropic API key in `.env` file
   - n8n API token in root `.env`
   - **Action:** Rotate ALL keys immediately

2. **Webhook Unprotected** (C-2)
   - n8n webhook has optional authentication
   - Can be bypassed if secret not set
   - **Action:** Make webhook secret mandatory

3. **Authentication Broken** (C-4)
   - API routes import non-existent `authOptions`
   - Potential authentication bypass
   - **Action:** Fix imports in all API routes

4. **Hardcoded Credentials** (C-1)
   - Owner password: `tars2026`
   - **Action:** Change to strong password (20+ chars)

5. **Weak Session Secret** (C-1)
   - NEXTAUTH_SECRET: `dev-secret-change-in-production`
   - **Action:** Generate cryptographically secure secret

---

## 🎯 Quick Start

### Step 1: Review Audit Report
```bash
cd ~/Desktop/Tars/SECURITY
open SECURITY-AUDIT.md  # or: cat SECURITY-AUDIT.md
```

### Step 2: Run Hardening Script
```bash
cd scripts
./harden.sh
```

Follow the prompts and complete manual actions.

### Step 3: Rotate API Keys

**Anthropic:**
1. Go to https://console.anthropic.com/settings/keys
2. Click "Revoke" on old key
3. Generate new key
4. Update `ANTHROPIC_API_KEY` in `.env`

**n8n:**
1. Go to https://n8n.srv1378974.hstgr.cloud/settings
2. Revoke old API token
3. Generate new token
4. Update `N8N_API_KEY` in root `.env`

### Step 4: Fix Authentication
```bash
# Find broken imports
grep -r "authOptions" ~/Desktop/Tars/Projects/agent-dashboard/apps/web/src

# Replace with correct import:
# OLD: import { getServerSession } from 'next-auth'; const session = await getServerSession(authOptions);
# NEW: import { auth } from '@/lib/auth'; const session = await auth();
```

### Step 5: Update Secrets
```bash
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web

# Generate new secrets (run harden.sh first)
# Then update .env with:
# - New NEXTAUTH_SECRET
# - New N8N_WEBHOOK_SECRET
# - New OWNER_PASSWORD
```

### Step 6: Verify Security
```bash
cd ~/Desktop/Tars/SECURITY/scripts
./monitor-security.sh
```

---

## 📊 Severity Breakdown by Project

### Agent Dashboard
- 🔴 **Critical:** 4 issues
- 🟠 **High:** 7 issues
- 🟡 **Medium:** 10 issues
- 🟢 **Low:** 5 issues

**Most Critical:** API key exposure, authentication bypass, webhook security

### Polymarket Agents
- 🔴 **Critical:** 1 issue (future risk when live)
- 🟠 **High:** 0 issues
- 🟡 **Medium:** 2 issues
- 🟢 **Low:** 1 issue

**Status:** Relatively secure in mock mode

### Cigar Shop AI Agent
- 🔴 **Critical:** 1 issue
- 🟠 **High:** 1 issue
- 🟡 **Medium:** 0 issues
- 🟢 **Low:** 1 issue

**Status:** Minimal attack surface, needs webhook auth

---

## 🗺️ Remediation Roadmap

### Phase 1: IMMEDIATE (Today) ✅
- [ ] Rotate all exposed API keys
- [ ] Change OWNER_PASSWORD
- [ ] Generate strong NEXTAUTH_SECRET
- [ ] Fix authentication imports
- [ ] Make webhook secret mandatory

### Phase 2: THIS WEEK
- [ ] Implement input validation (Zod)
- [ ] Add rate limiting
- [ ] Configure security headers
- [ ] Enable HTTPS enforcement
- [ ] Proper error handling

### Phase 3: BEFORE PRODUCTION
- [ ] Migrate to PostgreSQL
- [ ] Set up automated backups
- [ ] Implement monitoring/alerting
- [ ] Configure CORS properly
- [ ] Scan and clean git history

### Phase 4: ONGOING
- [ ] Regular dependency audits
- [ ] Security training
- [ ] Penetration testing
- [ ] Code reviews with security focus

---

## 📈 Security Metrics

Track these metrics monthly:

| Metric | Target | Status |
|--------|--------|--------|
| Critical Vulnerabilities | 0 | 🔴 5 |
| High Vulnerabilities | 0 | 🔴 8 |
| API Keys Exposed | 0 | 🔴 2 |
| npm Audit (High+) | 0 | ⚠️ Check |
| Backup Success Rate | 100% | 🟡 Setup |
| Mean Time to Patch | < 24h | 🟡 TBD |

---

## 🔐 Security Best Practices

### DO:
- ✅ Store secrets in environment variables
- ✅ Use strong, unique passwords (20+ chars)
- ✅ Validate all user input
- ✅ Rate limit all endpoints
- ✅ Enable HTTPS in production
- ✅ Audit dependencies regularly
- ✅ Review git history for secrets
- ✅ Implement proper error handling
- ✅ Use security headers
- ✅ Encrypt sensitive data

### DON'T:
- ❌ Commit `.env` files to git
- ❌ Use weak/default secrets
- ❌ Trust user input
- ❌ Expose internal errors to clients
- ❌ Use HTTP in production
- ❌ Ignore security warnings
- ❌ Skip authentication on APIs
- ❌ Log sensitive data
- ❌ Use SQLite in production
- ❌ Disable rate limiting

---

## 📚 Additional Resources

### Security Tools
- **npm audit** - Node.js dependency scanner
- **pip-audit** - Python dependency scanner
- **Zod** - Runtime schema validation
- **@upstash/ratelimit** - Distributed rate limiting
- **BFG Repo-Cleaner** - Remove secrets from git history

### External References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Anthropic API Security](https://docs.anthropic.com/en/api/getting-started#authentication)
- [Prisma Security](https://www.prisma.io/docs/guides/security)

### Monitoring & Alerting
- [Sentry](https://sentry.io) - Error tracking
- [Vercel Analytics](https://vercel.com/analytics) - Performance monitoring
- [Upstash](https://upstash.com) - Redis for rate limiting

---

## 🆘 Need Help?

### For Security Incidents
1. Follow procedures in [INCIDENT-RESPONSE.md](./INCIDENT-RESPONSE.md)
2. Notify Incident Commander immediately
3. Preserve evidence
4. Contain the threat

### For Questions
- Review audit report: `SECURITY-AUDIT.md`
- Check checklist: `SECURITY-CHECKLIST.md`
- Run hardening script: `scripts/harden.sh`

### For Updates
Security documentation should be reviewed quarterly and updated whenever:
- New vulnerabilities discovered
- New systems deployed
- Incidents occur
- Best practices change

---

## ✅ Completion Status

**Audit Status:** ✅ COMPLETE  
**Deliverables:**
- ✅ Security Audit Report (SECURITY-AUDIT.md)
- ✅ Hardening Script (scripts/harden.sh)
- ✅ Security Checklist (SECURITY-CHECKLIST.md)
- ✅ Incident Response Plan (INCIDENT-RESPONSE.md)

**Next Steps:**
1. Review all findings with main agent
2. Approve remediation plan
3. Execute Phase 1 (immediate fixes)
4. Schedule Phase 2-4 work

---

**Security is a journey, not a destination. Stay vigilant! 🛡️**

---

**Generated by:** TARS Security Specialist Agent  
**Contact:** Via main TARS agent  
**Last Updated:** 2026-02-17
