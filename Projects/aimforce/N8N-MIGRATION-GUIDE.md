# n8n Workflow Migration Guide

## Overview
Migrate n8n workflows from old VPS to new consolidated infrastructure.

**Old Instance:** https://n8n.srv1378974.hstgr.cloud
**New Instance:** https://n8n.aimforce.cloud ✅ Ready

## Prerequisites
✅ New n8n instance operational with HTTPS
✅ PostgreSQL database connected
✅ Let's Encrypt SSL certificate active

## Migration Steps

### 1. Access Old n8n Instance
Navigate to: https://n8n.srv1378974.hstgr.cloud

**Login credentials needed:**
- Check for saved credentials in browser/password manager
- Or SSH into old server: `ssh root@srv1378974.hstgr.cloud`

### 2. Export All Workflows
In old n8n UI:
1. Click "Workflows" in sidebar
2. Select each workflow → "..." menu → "Download"
3. Or use bulk export:
   - Settings → "Data" → "Export"
   - Select "All workflows"
   - Download JSON file

**Via SSH (if you have access):**
```bash
ssh root@srv1378974.hstgr.cloud

# Find n8n container
docker ps | grep n8n

# Export workflows
docker exec <n8n-container-id> n8n export:workflow --all --output=/tmp/workflows.json

# Download to local
scp root@srv1378974.hstgr.cloud:/tmp/workflows.json ~/Desktop/n8n-workflows-backup.json
```

### 3. Export Credentials
**Important:** Credentials must be re-created manually (n8n encrypts them per instance)

In old n8n:
1. Settings → "Credentials"
2. Document all credentials:
   - Name
   - Type (HTTP, OAuth2, API Key, etc.)
   - Configuration (without exposing secrets)

**Credentials to migrate:**
- API keys (ElevenLabs, Anthropic, etc.)
- OAuth apps (Google, Facebook, LinkedIn, etc.)
- Webhooks
- Database connections
- Any custom credentials

### 4. Import Workflows to New Instance
Navigate to: https://n8n.aimforce.cloud

**Initial Setup (First Time):**
1. Create admin user account
2. Set organization name
3. Configure basic settings

**Import workflows:**
1. Workflows → "Import from File"
2. Select downloaded JSON file
3. Review imported workflows

**Or via URL:**
1. Workflows → "Import from URL"
2. Paste workflow JSON URL

### 5. Re-create Credentials
For each credential used in workflows:
1. Credentials → "Add Credential"
2. Select credential type
3. Enter configuration:
   - API keys
   - OAuth client IDs/secrets
   - Connection strings
4. Save and test

**Key credentials:**
```
ElevenLabs API:
- API Key: (from .env - sk_379a53efc52bf060f900bc6b222a52c2ae506e0a7579d92a)

Anthropic API:
- API Key: (from .env - sk-ant-oat01-...)

PostgreSQL (if used in workflows):
- Host: main-db
- Port: 5432
- Database: aimforce
- User: aimforce
- Password: GrDKRpDRQSvYjOhWOb5rQEHah038Tvpm0isbtdKpz95G7ECcfbMaL6bSODgmvfz6
```

### 6. Update Webhook URLs
For each workflow with webhooks:
1. Open workflow
2. Locate "Webhook" nodes
3. Update Webhook URLs:
   - Old: `https://n8n.srv1378974.hstgr.cloud/webhook/...`
   - New: `https://n8n.aimforce.cloud/webhook/...`
4. Copy new webhook URL

### 7. Update External Services
Services that call n8n webhooks need updating:

**ElevenLabs Agent:**
- Login to ElevenLabs dashboard
- Find agent: `agent_2501kh7k6xt8e5rv1tqqsxje2c9c`
- Update webhook URLs to new n8n domain
- Test webhook delivery

**Other integrations:**
- Twilio (if webhooks configured)
- Any third-party services calling n8n
- Scheduled tasks/cron jobs

### 8. Test Workflows
For each imported workflow:
1. Open workflow in editor
2. Click "Execute Workflow" (test button)
3. Verify:
   - All nodes execute successfully
   - Credentials work
   - Data flows correctly
   - Webhooks are reachable

**Critical workflows to test:**
- Cigar Shop AI Agent workflow
- Any customer-facing automations
- Scheduled/recurring workflows

### 9. Activate Workflows
After testing:
1. Toggle "Active" switch on each workflow
2. Monitor execution logs
3. Test live triggers (webhooks, schedules)

### 10. Monitor & Validate
First 24-48 hours:
- Check execution history regularly
- Monitor error logs
- Verify scheduled workflows run
- Test webhook endpoints externally

## Known Workflows to Migrate

### Cigar Shop AI Agent
- **Purpose:** ElevenLabs voice agent integration
- **Components:** Webhook receiver, API caller, response handler
- **Credentials:** ElevenLabs API key
- **External dependency:** Phone number +18337733584 (Twilio)

**Post-migration:**
- Update ElevenLabs agent webhook URL
- Test phone call flow
- Verify voice responses

## Rollback Plan

If migration has issues:
1. Keep old n8n instance running
2. Can switch back by reverting webhook URLs
3. Old instance available until new one is validated

**Timeline:**
- Run both instances in parallel for 1 week
- After validation, decommission old instance
- Cancel old VPS subscription

## Post-Migration Cleanup

After successful migration (1+ week):
1. Export final backup from old n8n
2. Document any custom configurations
3. Shut down old n8n instance
4. Cancel old VPS: srv1378974.hstgr.cloud
5. Update documentation with new URLs only

## Quick Reference

| Item | Old Value | New Value |
|------|-----------|-----------|
| n8n URL | n8n.srv1378974.hstgr.cloud | n8n.aimforce.cloud |
| Webhook Base | https://n8n.srv1378974.hstgr.cloud/webhook/ | https://n8n.aimforce.cloud/webhook/ |
| Database | (old instance internal) | main-db:5432/n8n |
| Admin Access | (SSH: srv1378974) | (SSH: 77.37.67.2) |

## Troubleshooting

### Can't access old n8n
- Try SSH: `ssh root@srv1378974.hstgr.cloud`
- Check browser saved passwords
- Contact Hostinger support for VPS access

### Import fails
- Check JSON format validity
- Ensure compatible n8n versions
- Import workflows individually if bulk fails

### Webhooks not working
- Verify DNS: `dig n8n.aimforce.cloud`
- Test webhook URL directly in browser
- Check n8n logs: `docker logs n8n-d48o0oc0owwwks88gckko848`

### Credentials not working
- Re-create from scratch (can't export encrypted credentials)
- Test each credential independently
- Check API keys are still valid

---

**Status:** Ready for manual execution ⏳
**Blockers:** Need old n8n access credentials
**Next Step:** Access old n8n and begin export
