# 🔐 TARS Security Checklist

**Purpose:** Pre-deployment verification and ongoing security monitoring  
**Last Updated:** 2026-02-17  
**Version:** 1.0

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Authentication & Authorization

- [ ] **Strong Secrets Generated**
  - [ ] `NEXTAUTH_SECRET` is 32+ random characters
  - [ ] `N8N_WEBHOOK_SECRET` is 32+ random characters
  - [ ] All secrets different from template values
  - [ ] No secrets hardcoded in code

- [ ] **Password Security**
  - [ ] Owner password is 20+ characters
  - [ ] Password contains uppercase, lowercase, numbers, symbols
  - [ ] Password is NOT `tars2026` or any common password
  - [ ] Password stored as bcrypt hash only

- [ ] **Session Management**
  - [ ] JWT secret is cryptographically secure
  - [ ] Session expiration configured (7 days max)
  - [ ] Session invalidation on password change works
  - [ ] Concurrent session limits in place

- [ ] **API Authentication**
  - [ ] All API routes check authentication
  - [ ] No `authOptions` import errors
  - [ ] Middleware protects all authenticated routes
  - [ ] Webhook endpoints require secret header

### API Security

- [ ] **API Keys Rotated**
  - [ ] Anthropic API key rotated (old key revoked)
  - [ ] n8n API key rotated
  - [ ] All keys different from `.env.template`
  - [ ] Keys stored in environment variables only

- [ ] **Rate Limiting**
  - [ ] Rate limiting installed (`@upstash/ratelimit`)
  - [ ] Auth endpoints: 5 req/15min
  - [ ] API endpoints: 100 req/min
  - [ ] Webhook endpoints: 60 req/min
  - [ ] Rate limit headers sent to clients

- [ ] **Input Validation**
  - [ ] Zod schemas defined for all inputs
  - [ ] Webhook data validated before DB insertion
  - [ ] Product data validated
  - [ ] Phone numbers validated (E.164 format)
  - [ ] String fields sanitized (no null bytes)

- [ ] **CORS Configuration**
  - [ ] CORS headers explicitly configured
  - [ ] Only trusted origins allowed
  - [ ] Webhooks have NO CORS headers
  - [ ] Credentials flag only when needed

### Infrastructure

- [ ] **HTTPS Enforcement**
  - [ ] Production uses HTTPS only
  - [ ] HTTP → HTTPS redirect in place
  - [ ] `Strict-Transport-Security` header set
  - [ ] Cookies have `secure` flag

- [ ] **Security Headers**
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`
  - [ ] `Permissions-Policy` configured
  - [ ] CSP header configured (if applicable)

- [ ] **Database Security**
  - [ ] Production uses PostgreSQL (not SQLite)
  - [ ] Database credentials secured
  - [ ] Database encryption enabled
  - [ ] Connection pooling configured
  - [ ] Automated backups scheduled

- [ ] **Environment Variables**
  - [ ] All secrets in environment variables
  - [ ] `.env` in `.gitignore`
  - [ ] `.env` NOT committed to git
  - [ ] `.env.template` has placeholder values only
  - [ ] Production environment variables set in hosting platform

### Code Security

- [ ] **Dependencies**
  - [ ] `npm audit` shows no critical/high vulnerabilities
  - [ ] `pip-audit` shows no critical/high vulnerabilities
  - [ ] All dependencies up to date
  - [ ] Lock files committed (`package-lock.json`, `pnpm-lock.yaml`)

- [ ] **Error Handling**
  - [ ] Error messages don't leak stack traces
  - [ ] Error messages don't leak internal paths
  - [ ] Errors logged server-side only
  - [ ] Generic error codes sent to clients

- [ ] **XSS Protection**
  - [ ] All user input escaped on render
  - [ ] React auto-escaping verified
  - [ ] No `dangerouslySetInnerHTML` without sanitization
  - [ ] Content-Security-Policy configured

- [ ] **SQL Injection Protection**
  - [ ] All queries use Prisma ORM
  - [ ] No raw SQL with user input
  - [ ] Input validation before DB operations

### Git Security

- [ ] **Repository Hygiene**
  - [ ] `.env` not in git history
  - [ ] API keys not in git history
  - [ ] Git history scanned for secrets
  - [ ] Pre-commit hooks prevent secret commits (optional)
  - [ ] Commit signing enabled (optional)

### Monitoring & Logging

- [ ] **Logging**
  - [ ] Structured logging implemented
  - [ ] Security events logged (failed logins, rate limits)
  - [ ] Logs don't contain sensitive data
  - [ ] Log retention policy defined

- [ ] **Monitoring**
  - [ ] Health check endpoint (`/api/health`)
  - [ ] Uptime monitoring configured
  - [ ] Error tracking (Sentry/similar) configured
  - [ ] Performance monitoring enabled

- [ ] **Alerting**
  - [ ] Alerts for failed authentication attempts
  - [ ] Alerts for rate limit violations
  - [ ] Alerts for database errors
  - [ ] Alerts for API errors

---

## 🚀 PRODUCTION READINESS

### Agent Dashboard (Vercel Deployment)

- [ ] **Environment Configuration**
  - [ ] `DATABASE_URL` points to PostgreSQL
  - [ ] `NEXTAUTH_URL` is production domain (HTTPS)
  - [ ] All environment variables set in Vercel
  - [ ] Preview deployments use separate database

- [ ] **Database Migration**
  - [ ] Migration from SQLite completed
  - [ ] Data verified in PostgreSQL
  - [ ] Backup of SQLite database taken
  - [ ] Connection string secured

- [ ] **Performance**
  - [ ] Database connection pooling configured
  - [ ] Static assets optimized
  - [ ] Image optimization enabled
  - [ ] API response times < 500ms

- [ ] **Testing**
  - [ ] Authentication flow tested
  - [ ] All API endpoints tested
  - [ ] Webhook integration tested
  - [ ] Error scenarios tested

### Polymarket Agents (Trading System)

- [ ] **Critical Security**
  - [ ] Private key stored in KMS (NOT .env)
  - [ ] Multi-signature wallet configured
  - [ ] Withdrawal limits enforced
  - [ ] Trading approval workflow in place

- [ ] **Risk Management**
  - [ ] Mock mode tested thoroughly
  - [ ] Live mode requires manual approval
  - [ ] Circuit breakers configured
  - [ ] Maximum position size enforced

- [ ] **Monitoring**
  - [ ] Real-time balance monitoring
  - [ ] Unusual activity alerts
  - [ ] Trade approval notifications
  - [ ] Error rate monitoring

- [ ] **Compliance**
  - [ ] Trading logs maintained
  - [ ] Audit trail complete
  - [ ] Regulatory requirements met

### Cigar Shop AI Agent (n8n)

- [ ] **Webhook Security**
  - [ ] Webhook secret configured
  - [ ] IP whitelisting enabled
  - [ ] Rate limiting on webhooks
  - [ ] HMAC signature verification

- [ ] **Voice Integration**
  - [ ] Vapi.ai / Twilio credentials secured
  - [ ] ElevenLabs API key secured
  - [ ] Call transfer number verified
  - [ ] Emergency shutdown procedure defined

- [ ] **Data Privacy**
  - [ ] Call recordings encrypted
  - [ ] PII handling compliant
  - [ ] Data retention policy enforced
  - [ ] Customer consent obtained

---

## 🔄 ONGOING SECURITY MAINTENANCE

### Daily Tasks

- [ ] Run security monitoring script
  ```bash
  ~/Desktop/Tars/SECURITY/scripts/monitor-security.sh
  ```

- [ ] Review failed authentication attempts
- [ ] Check for unusual API usage patterns
- [ ] Monitor error rates

### Weekly Tasks

- [ ] Review security logs
- [ ] Check for new dependency vulnerabilities
  ```bash
  npm audit
  pip-audit
  ```
- [ ] Verify backups are running
- [ ] Review rate limit violations

### Monthly Tasks

- [ ] Rotate API keys (if policy requires)
- [ ] Review and update security policies
- [ ] Audit user access and permissions
- [ ] Test incident response procedures
- [ ] Review third-party integrations

### Quarterly Tasks

- [ ] Full security audit
- [ ] Penetration testing (if applicable)
- [ ] Review and update documentation
- [ ] Security training for team
- [ ] Disaster recovery drill

---

## 🎯 QUICK SECURITY VERIFICATION

**Run this before every production deployment:**

```bash
#!/bin/bash
# Quick security verification script

echo "🔍 Quick Security Check"
echo "======================="

# 1. Check for exposed secrets
echo "Checking for secrets in code..."
grep -r "sk-ant-api" ~/Desktop/Tars/Projects/ --exclude-dir=node_modules && echo "❌ API key found!" || echo "✅ No hardcoded API keys"

# 2. Check .env in git
echo "Checking git tracking..."
cd ~/Desktop/Tars
git ls-files | grep "\.env$" && echo "❌ .env is tracked!" || echo "✅ .env not tracked"

# 3. Check npm audit
echo "Checking npm dependencies..."
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web
npm audit --audit-level=high && echo "✅ No high/critical npm vulnerabilities" || echo "❌ Vulnerabilities found!"

# 4. Check authentication
echo "Checking authentication code..."
grep -r "authOptions" ~/Desktop/Tars/Projects/agent-dashboard/apps/web/src --exclude-dir=node_modules && echo "❌ Broken auth imports found!" || echo "✅ Auth imports correct"

# 5. Verify environment variables
echo "Checking environment variables..."
[ -z "$NEXTAUTH_SECRET" ] && echo "❌ NEXTAUTH_SECRET not set!" || echo "✅ NEXTAUTH_SECRET set"

echo ""
echo "✅ Quick check complete!"
```

Save as `quick-check.sh` and run before deployment.

---

## 📊 SECURITY METRICS TO TRACK

### Authentication
- Failed login attempts per day
- Successful logins per day
- Password reset requests
- Session duration average

### API Usage
- Requests per endpoint per hour
- Rate limit violations per day
- API error rate
- Average response time

### Infrastructure
- Uptime percentage
- Database query performance
- Backup success rate
- Alert response time

### Incidents
- Security incidents per month
- Mean time to detection (MTTD)
- Mean time to resolution (MTTR)
- False positive rate

---

## 🆘 WHEN THINGS GO WRONG

**If you detect a security incident:**

1. **STOP** - Don't panic, but act quickly
2. **CONTAIN** - Follow incident response plan
3. **NOTIFY** - Alert relevant stakeholders
4. **DOCUMENT** - Log everything
5. **REMEDIATE** - Fix the issue
6. **REVIEW** - Learn and improve

**See:** `INCIDENT-RESPONSE.md` for detailed procedures.

---

## ✅ CERTIFICATION

**I certify that all items in this checklist have been reviewed and completed:**

- Deployment Date: __________
- Deployed By: __________
- Reviewed By: __________
- Signature: __________

**Status:** ⬜ Development | ⬜ Staging | ⬜ Production Ready

---

**Version History:**
- v1.0 (2026-02-17): Initial security checklist
