# Infrastructure Cleanup Checklist

## Overview
Consolidate all services onto single Hostinger VPS and retire scattered infrastructure.

**Goal:** Reduce costs, simplify management, single point of control via Coolify.

## Current State (Before Cleanup)

### Active Services - TO RETIRE
| Service | Provider | URL/Endpoint | Monthly Cost | Status |
|---------|----------|--------------|--------------|--------|
| Old VPS | Hostinger | srv1378974.hstgr.cloud (77.37.67.2) | ~$10-15 | ⏳ Decommission after n8n migration |
| PostgreSQL | Railway | switchyard.proxy.rlwy.net:29390 | ~$5-10 | ⏳ Decommission after app migration |
| Next.js App | Vercel | aimforce-21tko95lk-aim-force.vercel.app | $0 (free tier) | ⏳ Decommission after app deployment |

### New Consolidated Infrastructure
| Service | Provider | URL/Endpoint | Monthly Cost | Status |
|---------|----------|--------------|--------------|--------|
| VPS | Hostinger | 77.37.67.2 (KVM 4: 4 CPU, 16GB RAM, 200GB) | $25 | ✅ ACTIVE |
| Coolify | Self-hosted | coolify.aimforce.cloud | $0 (included) | ✅ RUNNING |
| PostgreSQL | Coolify/Docker | main-db:5432 | $0 (included) | ✅ RUNNING |
| n8n | Coolify/Docker | n8n.aimforce.cloud | $0 (included) | ✅ OPERATIONAL |
| AimForce App | Coolify/Docker | app.aimforce.cloud | $0 (included) | ⏳ PENDING DEPLOYMENT |

**Cost Savings:** ~$15-25/month → $25/month (all-in-one, better specs)

## Migration Status

### ✅ Phase 1: Infrastructure Setup (COMPLETE)
- [x] New VPS provisioned (77.37.67.2)
- [x] Coolify installed and configured
- [x] DNS records configured (aimforce.cloud subdomains)
- [x] PostgreSQL deployed
- [x] n8n deployed and operational with HTTPS

### ⏳ Phase 2: Service Migration (IN PROGRESS)
- [x] n8n container fixed and HTTPS enabled
- [ ] n8n workflows migrated from old VPS
- [ ] AimForce app deployed to Coolify
- [ ] Database migration from Railway to new PostgreSQL
- [ ] Verify all services operational

### ⏳ Phase 3: External Service Updates (PENDING)
- [ ] Update ElevenLabs webhook URLs (n8n)
- [ ] Update Twilio webhook URLs (if configured)
- [ ] Update OAuth callback URLs (new app domain)
- [ ] Update any hardcoded URLs in code/configs

### ⏳ Phase 4: Decommissioning (PENDING)
- [ ] Parallel run for 1 week (both old and new)
- [ ] Monitor new infrastructure stability
- [ ] Final data export from old services
- [ ] Cancel old VPS (srv1378974)
- [ ] Pause/cancel Railway PostgreSQL
- [ ] Remove Vercel deployment

## Detailed Migration Tasks

### A. n8n Migration
**Goal:** Move workflows from srv1378974 to new n8n

**Steps:**
1. [ ] Access old n8n instance
2. [ ] Export all workflows (JSON)
3. [ ] Document all credentials
4. [ ] Import workflows to new n8n
5. [ ] Re-create credentials
6. [ ] Update webhook URLs
7. [ ] Test all workflows
8. [ ] Activate workflows
9. [ ] Update ElevenLabs agent config
10. [ ] Monitor for 48 hours

**Blockers:**
- Need old VPS SSH access or n8n login credentials
- ElevenLabs dashboard access to update webhooks

**Guide:** See `N8N-MIGRATION-GUIDE.md`

### B. AimForce App Deployment
**Goal:** Deploy Next.js app to Coolify, replace Vercel

**Steps:**
1. [x] Create Dockerfile
2. [x] Push to GitHub
3. [ ] Deploy via Coolify UI
4. [ ] Configure environment variables
5. [ ] Run database migrations
6. [ ] Test application functionality
7. [ ] Update DNS/domain (if needed)
8. [ ] Verify HTTPS certificate
9. [ ] Update OAuth callback URLs
10. [ ] Monitor for issues

**Files Ready:**
- `Dockerfile` ✅
- `.dockerignore` ✅
- `COOLIFY-DEPLOY-GUIDE.md` ✅
- Environment variables prepared ✅

**Next Action:** Deploy via Coolify dashboard at https://coolify.aimforce.cloud

**Guide:** See `COOLIFY-DEPLOY-GUIDE.md`

### C. Database Migration
**Goal:** Move data from Railway to new PostgreSQL

**Current State:**
- Railway DB: `switchyard.proxy.rlwy.net:29390/railway`
- New DB: `main-db:5432/aimforce`

**Options:**

**Option 1: Fresh Start (Recommended if minimal data)**
```bash
# Just run Prisma migrations on new DB
npx prisma db push

# Re-seed demo data
npx prisma db seed
```

**Option 2: Data Export/Import (If production data exists)**
```bash
# Export from Railway
pg_dump postgresql://postgres:PASSWORD@switchyard.proxy.rlwy.net:29390/railway > backup.sql

# Import to new DB
psql postgresql://aimforce:PASSWORD@77.37.67.2:5432/aimforce < backup.sql
```

**Steps:**
1. [ ] Determine if data migration needed
2. [ ] If yes: Export from Railway
3. [ ] Import to new PostgreSQL
4. [ ] Verify data integrity
5. [ ] Update app DATABASE_URL
6. [ ] Test application with new DB
7. [ ] Parallel run (optional)
8. [ ] Switch fully to new DB

### D. External Service Updates

**ElevenLabs Agent:**
- [ ] Login to ElevenLabs dashboard
- [ ] Find agent: `agent_2501kh7k6xt8e5rv1tqqsxje2c9c`
- [ ] Update webhook URL: `https://n8n.aimforce.cloud/webhook/...`
- [ ] Test phone call flow

**OAuth Providers (when ready):**
- [ ] Google: Update redirect URI to `https://app.aimforce.cloud/api/auth/callback/google`
- [ ] Facebook: Update callback URL
- [ ] LinkedIn: Update callback URL
- [ ] Twitter: Update callback URL
- [ ] TikTok: Update callback URL

**Twilio (if configured):**
- [ ] Update webhook URLs to new n8n domain
- [ ] Test SMS/voice flows

### E. Code Updates
**Search and replace old URLs:**
```bash
cd ~/Desktop/Tars/Projects/

# Find old domain references
grep -r "srv1378974.hstgr.cloud" .
grep -r "vercel.app" .
grep -r "railway" .

# Update to new domains
# n8n: srv1378974.hstgr.cloud → n8n.aimforce.cloud
# app: vercel.app → app.aimforce.cloud
```

**Files to check:**
- HANDOFF.md
- README.md files
- .env files (local copies)
- Documentation
- Hardcoded URLs in code

### F. Monitoring Period
**Run both old and new in parallel for 1 week:**

**Daily Checks:**
- [ ] New n8n: Check execution logs
- [ ] New app: Check error logs
- [ ] New PostgreSQL: Verify backups
- [ ] DNS: Confirm propagation
- [ ] SSL: Verify certificates valid
- [ ] Performance: Monitor response times

**Success Criteria:**
- Zero critical errors for 7 days
- All workflows executing successfully
- App functioning normally
- Database stable
- No user-reported issues

### G. Decommissioning
**After 1 week of stable operation:**

1. **Old VPS (srv1378974):**
   - [ ] Final backup of any remaining data
   - [ ] Export n8n workflows (final backup)
   - [ ] Shut down server
   - [ ] Cancel Hostinger subscription
   - [ ] Remove SSH keys

2. **Railway PostgreSQL:**
   - [ ] Final database export
   - [ ] Pause service (keeps data, stops billing)
   - [ ] After 30 days: Delete if no issues
   - [ ] Cancel subscription

3. **Vercel Deployment:**
   - [ ] Remove deployment
   - [ ] Keep free tier if no cost
   - [ ] Update project settings
   - [ ] Archive if needed

## Cost Analysis

### Before Consolidation
| Service | Monthly Cost |
|---------|--------------|
| Hostinger VPS (old) | $10-15 |
| Railway PostgreSQL | $5-10 |
| Vercel | $0 (free) |
| **Total** | **$15-25/month** |

### After Consolidation
| Service | Monthly Cost |
|---------|--------------|
| Hostinger VPS KVM 4 | $25 |
| (All services included) | - |
| **Total** | **$25/month** |

**Net Change:** -$0 to +$10/month for significantly better specs (4 CPU, 16GB RAM vs previous setup)

**Benefits:**
- Single server to manage
- Better performance (dedicated resources)
- Simplified backups
- One control panel (Coolify)
- No service juggling
- Easier monitoring

## Rollback Plan

If major issues arise:

**Week 1:**
- Old services still running
- Can revert by switching DNS/URLs back
- Zero data loss risk

**Week 2-4:**
- Old services paused but data retained
- Can re-activate if needed
- Quick recovery possible

**After 30 days:**
- Permanent migration
- Old data archived
- No rollback

## Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Setup (Phase 1) | 1 day | 2026-02-19 | 2026-02-19 ✅ |
| Migration (Phase 2) | 2-3 days | 2026-02-19 | 2026-02-22 |
| Updates (Phase 3) | 1 day | 2026-02-22 | 2026-02-23 |
| Monitoring (Phase 3.5) | 7 days | 2026-02-23 | 2026-03-02 |
| Decommission (Phase 4) | 1 day | 2026-03-02 | 2026-03-02 |

**Total Migration Time:** ~2 weeks from start to full decommission

## Quick Commands Reference

**SSH into new VPS:**
```bash
ssh root@77.37.67.2
```

**Check service status:**
```bash
docker ps | grep -E "coolify|n8n|postgres|aimforce"
```

**View logs:**
```bash
docker logs n8n-d48o0oc0owwwks88gckko848
docker logs coolify-proxy
docker logs <aimforce-container>
```

**Database access:**
```bash
docker exec -it main-db psql -U aimforce -d aimforce
```

**Restart services:**
```bash
cd /data/coolify/services/<service-id>
docker compose restart
```

## Success Metrics

### Technical
- [ ] All services responding < 500ms
- [ ] Zero 5xx errors
- [ ] HTTPS certificates valid
- [ ] Database queries performant
- [ ] Workflows executing successfully

### Business
- [ ] Cigar Shop AI Agent operational
- [ ] AimForce app accessible
- [ ] No user complaints
- [ ] Cost reduction achieved
- [ ] Management simplified

---

**Status:** Phase 1 Complete ✅ | Phase 2 In Progress ⏳
**Next:** Deploy AimForce app to Coolify
**Updated:** 2026-02-19 22:50 UTC
