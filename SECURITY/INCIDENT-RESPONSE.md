# 🚨 TARS Incident Response Plan

**Purpose:** Rapid response procedures for security incidents  
**Last Updated:** 2026-02-17  
**Version:** 1.0  
**Status:** ACTIVE

---

## 📞 EMERGENCY CONTACTS

**Incident Response Team:**

| Role | Name | Contact | Responsibility |
|------|------|---------|----------------|
| **Incident Commander** | Owner | [PHONE] | Final decision-maker |
| **Technical Lead** | TARS Agent | Telegram | Investigation & remediation |
| **Communications** | [TBD] | [CONTACT] | Stakeholder notifications |
| **Legal** | [TBD] | [CONTACT] | Compliance & reporting |

**External Contacts:**

| Service | Contact | Purpose |
|---------|---------|---------|
| Anthropic Support | support@anthropic.com | API key compromise |
| Vercel Support | support@vercel.com | Infrastructure issues |
| n8n Support | support@n8n.io | Workflow compromise |
| Hosting Provider | [PROVIDER] | Server compromise |

---

## 🎯 INCIDENT SEVERITY LEVELS

### P0 - CRITICAL (Immediate Response)
**Examples:**
- Production database compromised
- API keys exposed publicly
- Customer data breach
- Trading system compromise (Polymarket)
- Complete service outage

**Response Time:** < 15 minutes  
**Escalation:** Immediate notification to all stakeholders

---

### P1 - HIGH (Urgent Response)
**Examples:**
- Unauthorized access attempt detected
- DDoS attack in progress
- Authentication bypass discovered
- Payment system issues
- Data integrity concerns

**Response Time:** < 1 hour  
**Escalation:** Notify Incident Commander

---

### P2 - MEDIUM (Scheduled Response)
**Examples:**
- Suspected brute-force attempts
- Rate limiting violations
- Minor security misconfigurations
- Non-critical dependency vulnerabilities

**Response Time:** < 4 hours  
**Escalation:** Log and review during business hours

---

### P3 - LOW (Best Effort)
**Examples:**
- Security scan findings
- Documentation updates needed
- Low-severity dependency updates

**Response Time:** < 24 hours  
**Escalation:** Track in issue tracker

---

## 🔍 INCIDENT DETECTION

### Automated Detection Triggers

1. **Failed Authentication**
   - More than 5 failed logins from same IP in 15 minutes
   - Login from unusual location/device

2. **API Abuse**
   - Rate limit exceeded by 10x
   - Unusual API usage patterns
   - Anthropic usage spike (>$100/hour)

3. **Database Anomalies**
   - Unexpected data modifications
   - Large data exports
   - Database connection failures

4. **Infrastructure**
   - Server CPU/memory spikes
   - Unusual network traffic
   - SSL certificate expiration warnings

### Manual Detection

- User reports suspicious activity
- Monitoring alerts
- Security scan findings
- Third-party notifications

---

## 📋 INCIDENT RESPONSE PROCEDURES

### PHASE 1: IDENTIFICATION (0-15 min)

**Goal:** Confirm the incident and assess severity

1. **Receive Alert**
   - Log incident in tracking system
   - Note date/time, reporter, initial description

2. **Initial Assessment**
   - What happened? (symptoms observed)
   - When did it start? (timeline)
   - Where is it happening? (affected systems)
   - Who is affected? (users, data, systems)

3. **Severity Classification**
   - Assign severity level (P0-P3)
   - Determine if escalation needed

4. **Assemble Team**
   - Notify Incident Commander if P0/P1
   - Assign roles (investigator, communicator, remediator)

**Checklist:**
- [ ] Incident logged
- [ ] Severity assigned
- [ ] Team notified
- [ ] Timeline started

---

### PHASE 2: CONTAINMENT (15-60 min)

**Goal:** Stop the damage from spreading

#### Immediate Actions (P0/P1)

1. **Isolate Affected Systems**
   ```bash
   # If production compromised:
   # - Disable affected API routes via Vercel
   # - Revoke compromised API keys
   # - Terminate suspicious sessions
   # - Block malicious IPs
   ```

2. **Preserve Evidence**
   ```bash
   # Capture logs before they rotate
   cp /var/log/app.log /evidence/app.log.$(date +%Y%m%d_%H%M%S)
   
   # Database snapshot
   pg_dump -h localhost -U user -d database > /evidence/db_dump_$(date +%Y%m%d_%H%M%S).sql
   
   # Git commit state
   git log -1 > /evidence/git_state.txt
   ```

3. **Prevent Further Access**
   - Rotate compromised credentials immediately
   - Enable temporary IP whitelisting
   - Increase rate limits
   - Enable maintenance mode if needed

#### Containment Scenarios

**Scenario 1: API Key Exposed**
```bash
# IMMEDIATE ACTIONS:
# 1. Revoke old key via provider dashboard
# 2. Generate new key
# 3. Update environment variables
# 4. Restart affected services
# 5. Monitor for unusual API usage

# For Anthropic:
# https://console.anthropic.com/settings/keys
# Click "Revoke" on compromised key
# Generate new key → Update ANTHROPIC_API_KEY

# For n8n:
# https://n8n.srv1378974.hstgr.cloud/settings
# Revoke old API token → Generate new → Update N8N_API_KEY
```

**Scenario 2: Database Breach**
```bash
# IMMEDIATE ACTIONS:
# 1. Snapshot current database state
pg_dump production_db > /evidence/production_$(date +%Y%m%d_%H%M%S).sql

# 2. Identify compromised data
psql -d production_db -c "SELECT * FROM audit_log WHERE created_at > '2026-02-17 10:00:00' ORDER BY created_at DESC;"

# 3. Rotate database credentials
# 4. Review and close unauthorized connections
# 5. Enable read-only mode temporarily (if safe)
```

**Scenario 3: Unauthorized Access**
```bash
# IMMEDIATE ACTIONS:
# 1. Terminate all sessions
# DELETE FROM sessions WHERE user_id = 'compromised_user_id';

# 2. Force password reset
# UPDATE users SET password_must_change = true WHERE email = 'user@example.com';

# 3. Review access logs
# Check who accessed what and when

# 4. Notify affected users (if customer accounts)
```

**Scenario 4: DDoS Attack**
```bash
# IMMEDIATE ACTIONS:
# 1. Enable Cloudflare DDoS protection (if available)
# 2. Implement emergency rate limiting
# 3. Block attack source IPs
# 4. Contact hosting provider for upstream filtering

# Vercel: Enable "Attack Challenge Mode"
# n8n: Cloudflare → Security → DDoS
```

**Checklist:**
- [ ] Affected systems isolated
- [ ] Evidence preserved
- [ ] Further access prevented
- [ ] Stakeholders notified

---

### PHASE 3: ERADICATION (1-4 hours)

**Goal:** Remove the threat completely

1. **Root Cause Analysis**
   - How did the attacker gain access?
   - What vulnerabilities were exploited?
   - Were there warning signs missed?

2. **Remove Threat**
   - Delete malicious code/data
   - Close exploited vulnerabilities
   - Remove backdoors/persistence mechanisms
   - Patch affected systems

3. **Verify Clean State**
   - Scan for additional compromises
   - Verify no lateral movement occurred
   - Check for data exfiltration

**Example: Removing Injected Code**
```bash
# Search for suspicious files
find ~/Desktop/Tars -type f -name "*.php" -o -name "*.jsp"  # Should be none in Next.js app
find ~/Desktop/Tars -type f -mtime -1  # Files modified in last 24h

# Check for unauthorized git commits
git log --all --since="2026-02-17 00:00" --author=".*" --oneline

# Review database for injected data
SELECT * FROM call_logs WHERE created_at > NOW() - INTERVAL '24 hours' AND summary LIKE '%<script%';
```

**Checklist:**
- [ ] Root cause identified
- [ ] Threat removed
- [ ] System verified clean
- [ ] Patches applied

---

### PHASE 4: RECOVERY (4-24 hours)

**Goal:** Restore normal operations safely

1. **System Restoration**
   - Restore from clean backup (if needed)
   - Re-deploy applications
   - Verify all services operational

2. **Credential Rotation**
   ```bash
   # Rotate ALL credentials:
   # - NEXTAUTH_SECRET
   # - N8N_API_KEY
   # - ANTHROPIC_API_KEY
   # - Database passwords
   # - SSH keys
   # - Webhook secrets
   ```

3. **Monitoring Enhancement**
   - Enable additional logging
   - Set up new alerts for similar attacks
   - Increase monitoring frequency temporarily

4. **Gradual Service Restoration**
   - Start with read-only mode
   - Enable core functionality
   - Gradually restore full service
   - Monitor closely for 24-48 hours

**Recovery Verification Tests:**
```bash
# Test authentication
curl -X POST https://app/api/auth/signin -d '{"email":"test@example.com","password":"test"}'

# Test API endpoints
curl -H "Authorization: Bearer $TOKEN" https://app/api/products

# Test webhook
curl -X POST https://app/api/webhooks/n8n \
  -H "x-webhook-secret: $SECRET" \
  -d '{"type":"test","data":{}}'

# Verify database integrity
psql -d production -c "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM products;"
```

**Checklist:**
- [ ] Services restored
- [ ] All credentials rotated
- [ ] Functionality verified
- [ ] Monitoring enhanced

---

### PHASE 5: POST-INCIDENT (24-72 hours)

**Goal:** Learn and improve

1. **Incident Report**
   - Timeline of events
   - Root cause analysis
   - Impact assessment
   - Response effectiveness

2. **Lessons Learned Meeting**
   - What went well?
   - What went poorly?
   - What would we do differently?
   - What preventive measures needed?

3. **Action Items**
   - Update security policies
   - Implement new controls
   - Update documentation
   - Schedule follow-up training

4. **Customer Communication (if applicable)**
   - Transparent disclosure
   - Impact explanation
   - Remediation steps taken
   - Prevention measures implemented

**Incident Report Template:**
```markdown
# Incident Report: [TITLE]

**Date:** YYYY-MM-DD  
**Severity:** P0/P1/P2/P3  
**Duration:** X hours  
**Status:** RESOLVED

## Summary
Brief description of the incident.

## Timeline
- HH:MM - Incident detected
- HH:MM - Team assembled
- HH:MM - Containment achieved
- HH:MM - Threat eradicated
- HH:MM - Services restored

## Root Cause
Detailed explanation of how the incident occurred.

## Impact
- Systems affected: [list]
- Users affected: [number/description]
- Data compromised: [yes/no, details]
- Financial impact: [amount]
- Downtime: [duration]

## Response Actions Taken
1. [Action 1]
2. [Action 2]
...

## Lessons Learned
### What Went Well:
- [Item 1]

### What Needs Improvement:
- [Item 1]

### Preventive Measures:
- [ ] [Action item 1]
- [ ] [Action item 2]

## Follow-up
- Responsible: [Name]
- Due Date: [Date]
- Status: [Open/In Progress/Complete]
```

**Checklist:**
- [ ] Incident report completed
- [ ] Lessons learned documented
- [ ] Action items assigned
- [ ] Stakeholders informed

---

## 🛠️ INCIDENT RESPONSE TOOLS

### Pre-Installed Tools

```bash
# Create incident workspace
mkdir -p ~/Desktop/Tars/SECURITY/incidents/$(date +%Y%m%d_%H%M%S)
cd ~/Desktop/Tars/SECURITY/incidents/$(date +%Y%m%d_%H%M%S)

# Log collection script
cat > collect-logs.sh << 'EOF'
#!/bin/bash
# Collect all relevant logs for incident investigation

INCIDENT_DIR=$(pwd)

# Application logs
cp ~/Desktop/Tars/Projects/agent-dashboard/apps/web/.next/*.log "$INCIDENT_DIR/" 2>/dev/null

# Git state
git -C ~/Desktop/Tars log --oneline -20 > "$INCIDENT_DIR/git_recent.txt"

# Database snapshot (if small enough)
cp ~/Desktop/Tars/Projects/agent-dashboard/apps/web/prisma/dev.db "$INCIDENT_DIR/" 2>/dev/null

# Environment info (REDACTED - no secrets)
env | grep -v "KEY\|SECRET\|PASSWORD" > "$INCIDENT_DIR/env_vars.txt"

# Network connections
netstat -tuln > "$INCIDENT_DIR/network.txt" 2>/dev/null || ss -tuln > "$INCIDENT_DIR/network.txt"

echo "✅ Logs collected in $INCIDENT_DIR"
EOF

chmod +x collect-logs.sh
```

### Emergency Scripts

**Lockdown Mode:**
```bash
#!/bin/bash
# emergency-lockdown.sh
# Immediately locks down the system

echo "🚨 EMERGENCY LOCKDOWN INITIATED"

# 1. Enable maintenance mode (create flag file)
touch ~/Desktop/Tars/MAINTENANCE_MODE

# 2. Terminate all sessions (example for Next.js)
# DELETE FROM sessions WHERE 1=1;

# 3. Block all non-admin IPs (example - adapt to your firewall)
# iptables -A INPUT -s YOUR_ADMIN_IP -j ACCEPT
# iptables -A INPUT -j DROP

# 4. Notify team
echo "System locked down at $(date)" | # Send notification here

echo "✅ Lockdown complete. System in maintenance mode."
```

**Emergency Rollback:**
```bash
#!/bin/bash
# emergency-rollback.sh
# Rollback to last known good state

echo "🔄 EMERGENCY ROLLBACK INITIATED"

cd ~/Desktop/Tars

# 1. Rollback git to last stable commit
git log --oneline -5
read -p "Enter commit hash to rollback to: " COMMIT
git reset --hard $COMMIT

# 2. Restore database from backup
read -p "Enter backup file to restore: " BACKUP_FILE
cp "$BACKUP_FILE" ~/Desktop/Tars/Projects/agent-dashboard/apps/web/prisma/dev.db

# 3. Rebuild application
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web
npm install
npm run build

echo "✅ Rollback complete. Verify functionality."
```

---

## 📊 INCIDENT METRICS

Track these metrics for continuous improvement:

| Metric | Target | Current |
|--------|--------|---------|
| Mean Time to Detect (MTTD) | < 15 min | - |
| Mean Time to Contain (MTTC) | < 1 hour | - |
| Mean Time to Resolve (MTTR) | < 4 hours | - |
| False Positive Rate | < 5% | - |
| Incidents per Month | 0 (goal) | - |

---

## 🎓 TRAINING & DRILLS

### Quarterly Incident Response Drills

**Drill Scenarios:**

1. **API Key Leak Simulation**
   - Simulate discovery of API key in public repository
   - Practice rotation and revocation procedures
   - Test notification workflows

2. **Database Breach Simulation**
   - Simulate unauthorized database access
   - Practice evidence preservation
   - Test backup restoration

3. **DDoS Attack Simulation**
   - Simulate traffic spike
   - Practice rate limiting and IP blocking
   - Test communication procedures

**Drill Schedule:**
- Q1: API Key Leak
- Q2: Database Breach
- Q3: DDoS Attack
- Q4: Comprehensive Tabletop Exercise

---

## 📞 COMMUNICATION TEMPLATES

### Internal Alert (P0/P1)

```
🚨 SECURITY INCIDENT ALERT

Severity: [P0/P1/P2/P3]
Status: [INVESTIGATING / CONTAINED / RESOLVED]
Incident Commander: [NAME]

Summary:
[Brief description of incident]

Current Actions:
- [Action 1]
- [Action 2]

Impact:
- Systems affected: [list]
- User impact: [description]
- ETA for resolution: [time]

Next Update: [time]
```

### Customer Notification (if applicable)

```
Subject: Security Notice - [Brief Description]

Dear Customer,

We are writing to inform you of a security incident that may have affected your account.

What Happened:
[Clear, non-technical explanation]

What Information Was Involved:
[Specific data types, NO speculation]

What We're Doing:
[Actions taken to contain and prevent]

What You Should Do:
[Specific action items for users]

Questions:
[Contact information]

We sincerely apologize for this incident and are committed to preventing future occurrences.

Sincerely,
[TARS Team]
```

---

## ✅ INCIDENT RESPONSE READINESS

**Verify readiness monthly:**

- [ ] Emergency contact list up to date
- [ ] Incident response tools installed
- [ ] Backup systems verified functional
- [ ] Team trained on procedures
- [ ] Communication templates current
- [ ] Evidence preservation process tested
- [ ] Rollback procedures documented

---

## 📚 REFERENCES

- NIST Incident Response Guide: https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final
- OWASP Incident Response: https://owasp.org/www-community/Incident_Response
- SANS Incident Response: https://www.sans.org/incident-response/

---

**Version History:**
- v1.0 (2026-02-17): Initial incident response plan

**Review Schedule:** Quarterly  
**Next Review:** 2026-05-17
