# AimForce Deployment to Coolify

## Prerequisites
✅ Docker support added (Dockerfile, .dockerignore)
✅ Code pushed to GitHub: https://github.com/Northern-whale/aimforce-cloud
✅ PostgreSQL database ready on VPS (main-db)
✅ Domain configured: app.aimforce.cloud → 77.37.67.2

## Deployment Steps

### 1. Access Coolify Dashboard
Navigate to: https://coolify.aimforce.cloud

### 2. Create New Application
1. Click "New" → "Application"
2. Select "Public Repository"
3. Enter repository URL: `https://github.com/Northern-whale/aimforce-cloud`
4. Branch: `main`
5. Build Pack: **Dockerfile** (auto-detected)

### 3. Configure Application Settings
**General:**
- Name: `aimforce`
- Domain: `app.aimforce.cloud`
- Port: `3000` (Next.js default)
- Network: Use the same network as PostgreSQL (`d48o0oc0owwwks88gckko848` or create shared network)

**Build Settings:**
- Dockerfile: `./Dockerfile`
- Build Command: (leave default)
- Install Command: (leave default)

### 4. Set Environment Variables
Click "Environment Variables" and add:

```env
DATABASE_URL=postgresql://aimforce:GrDKRpDRQSvYjOhWOb5rQEHah038Tvpm0isbtdKpz95G7ECcfbMaL6bSODgmvfz6@main-db:5432/aimforce
NEXTAUTH_URL=https://app.aimforce.cloud
NEXTAUTH_SECRET=UUTNilL7VLkzcJYMxkQ04sJPkKTdD8LTWwmx2oZli8U=
ANTHROPIC_API_KEY=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
ELEVENLABS_API_KEY=sk_379a53efc52bf060f900bc6b222a52c2ae506e0a7579d92a
GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder
GOOGLE_REDIRECT_URI=https://app.aimforce.cloud/api/auth/callback/google
FACEBOOK_APP_ID=placeholder
FACEBOOK_APP_SECRET=placeholder
INSTAGRAM_CLIENT_ID=placeholder
INSTAGRAM_CLIENT_SECRET=placeholder
LINKEDIN_CLIENT_ID=placeholder
LINKEDIN_CLIENT_SECRET=placeholder
TWITTER_CLIENT_ID=placeholder
TWITTER_CLIENT_SECRET=placeholder
TIKTOK_CLIENT_KEY=placeholder
TIKTOK_CLIENT_SECRET=placeholder
EMAIL_FROM=noreply@aimforce.cloud
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 5. Configure Health Check
- Path: `/api/health` (if you have one, otherwise `/`)
- Interval: 30s
- Timeout: 10s
- Retries: 3

### 6. Database Migration (Before First Deployment)
After environment variables are set but **before deploying**, run database migrations:

```bash
# SSH into VPS
ssh root@77.37.67.2

# Run migrations in a temporary container
docker run --rm --network d48o0oc0owwwks88gckko848 \
  -e DATABASE_URL="postgresql://aimforce:GrDKRpDRQSvYjOhWOb5rQEHah038Tvpm0isbtdKpz95G7ECcfbMaL6bSODgmvfz6@main-db:5432/aimforce" \
  -v /tmp/aimforce-code:/app \
  node:20-alpine sh -c "
    cd /app && 
    npm install && 
    npx prisma generate && 
    npx prisma db push
  "
```

Alternatively, deploy first and run migrations via Coolify's console:
1. After deployment, go to Application → Console
2. Run: `npx prisma db push`

### 7. Deploy
Click "Deploy" button

### 8. Monitor Deployment
Watch the build logs:
- Should see: Dockerfile build stages (deps, builder, runner)
- Container starting on port 3000
- Health checks passing

### 9. Configure HTTPS
Coolify will automatically:
- Configure Traefik reverse proxy
- Issue Let's Encrypt SSL certificate
- Set up HTTP → HTTPS redirect

### 10. Verify Deployment
- Visit: https://app.aimforce.cloud
- Login with: owner@aimforce.cloud / aimforce2026
- Check database connection (should see dashboard data)

## Troubleshooting

### Build Fails
- Check logs for missing dependencies
- Verify Prisma schema is valid
- Ensure Dockerfile is correct

### Database Connection Error
- Verify `main-db` hostname is correct (check PostgreSQL service name in Coolify)
- Ensure both services are on the same Docker network
- Test connection: `docker exec <aimforce-container> sh -c "nc -zv main-db 5432"`

### 404 or Can't Connect
- Check domain DNS propagation: `dig app.aimforce.cloud`
- Verify Traefik labels are set correctly
- Check container is running: `docker ps | grep aimforce`

### HTTPS Certificate Issues
- Wait 1-2 minutes for Let's Encrypt to issue certificate
- Check Traefik logs: `docker logs coolify-proxy`
- Verify domain points to correct IP

## Post-Deployment Tasks

1. **Update Vercel** - Remove old deployment once new one is verified
2. **Update Railway** - Can stop Railway PostgreSQL after migration verified
3. **Test OAuth flows** - Update OAuth callback URLs to new domain
4. **Monitor logs** - Check for any runtime errors
5. **Set up backups** - Configure Coolify database backups

## Quick Reference

| Resource | Value |
|----------|-------|
| GitHub Repo | https://github.com/Northern-whale/aimforce-cloud |
| Domain | app.aimforce.cloud |
| Database Host | main-db (internal) |
| Database Port | 5432 |
| App Port | 3000 |
| Health Check | / or /api/health |

---

**Note:** Environment file with secrets is available at: `/tmp/aimforce-production.env` (on local machine)
**Status:** Ready to deploy ✅
