# OVERNIGHT CODE REVIEW MISSION - AIMForce

**Date:** 2026-02-18  
**Assigned to:** Claude Code (TARS)  
**Priority:** CRITICAL  
**Deadline:** Morning (08:00 MST)

---

## Mission Brief

User reported "a lot of small bugs, little defects, errors" in the aimforce platform after deployment.

**Your mission:** Deep code review, bug hunting, testing, and fixes.

---

## Project Details

**Location:** `~/Desktop/Tars/Projects/aimforce/`  
**Type:** Next.js 16 + Prisma + PostgreSQL social media management platform  
**Status:** Deployed to Vercel (production)  
**URLs:** 
- https://aimforce-g5t72gyry-aim-force.vercel.app
- https://aimforce-18j3hym3r-aim-force.vercel.app

**Database:** Railway PostgreSQL  
**Connection:** `postgresql://postgres:NxCJtYhmoFdPRCPNNvvAUvcDReuSNGDC@switchyard.proxy.rlwy.net:29390/railway`

---

## Tasks

### 1. Complete Code Review (Every Single Line)

**Review these areas:**

#### A. API Routes
- `/app/api/auth/[...nextauth]/route.ts` - Authentication
- `/app/api/oauth/connect/[platform]/route.ts` - OAuth initiation
- `/app/api/oauth/callback/[platform]/route.ts` - OAuth callbacks
- `/app/api/content/upload/route.ts` - File uploads

**Check for:**
- Error handling gaps
- Security vulnerabilities
- Type safety issues
- Async/await bugs
- Missing try/catch blocks
- Database query errors

#### B. Frontend Pages
- `/app/login/page.tsx` - Login form
- `/app/owner/page.tsx` - Owner dashboard
- `/app/portal/page.tsx` - Client dashboard
- `/app/portal/social/page.tsx` - Social media connections
- `/app/portal/content/page.tsx` - Content library
- `/app/portal/schedule/page.tsx` - Scheduling calendar
- `/app/portal/voice/page.tsx` - Voice recording

**Check for:**
- Form validation
- Loading states
- Error messages
- Responsive design issues
- Accessibility problems
- UX bugs

#### C. Libraries & Config
- `/lib/oauth-providers.ts` - OAuth configurations
- `/lib/google-drive.ts` - Google Drive integration
- `/lib/prisma.ts` - Database client
- `/middleware.ts` - Auth middleware
- `next.config.js` - Next.js config
- `prisma/schema.prisma` - Database schema

**Check for:**
- Configuration errors
- Missing environment variables
- Type mismatches
- Security issues

#### D. Database
- Schema integrity
- Relationships
- Indexes
- Seed data quality

---

### 2. Testing (10 Runs)

**Test scenarios:**

#### Test 1: Authentication Flow
1. Login as owner
2. Create new client
3. Login as client
4. Logout and re-login
5. Check session persistence

#### Test 2: OAuth Connections
1. Attempt Facebook connection
2. Handle OAuth callback
3. Check error handling with invalid credentials
4. Verify token storage

#### Test 3: Content Upload
1. Upload image
2. Upload video
3. Upload document
4. Check file size limits
5. Verify Google Drive integration

#### Test 4: Scheduling
1. Create scheduled post
2. Edit scheduled post
3. Delete scheduled post
4. Check calendar views

#### Test 5: Voice Recording
1. Test voice input
2. Check audio processing
3. Verify save functionality

#### Test 6: Error Handling
1. Invalid login
2. Missing required fields
3. Network errors
4. Database connection issues

#### Test 7: Performance
1. Page load times
2. API response times
3. Database query speed
4. Image optimization

#### Test 8: Mobile Responsiveness
1. Test on mobile viewport
2. Check touch interactions
3. Verify layout on small screens

#### Test 9: Security
1. SQL injection attempts
2. XSS vulnerabilities
3. CSRF protection
4. Authentication bypass attempts

#### Test 10: Edge Cases
1. Very long inputs
2. Special characters
3. Concurrent users
4. Rate limiting

---

### 3. Bug Documentation

For each bug found, document:

```markdown
### Bug #X: [Title]

**Severity:** Critical / High / Medium / Low  
**Location:** /path/to/file.ts:line  
**Description:** What's wrong  
**Steps to Reproduce:**  
1. Step one
2. Step two

**Expected Behavior:** What should happen  
**Actual Behavior:** What actually happens  
**Fix Applied:** How you fixed it  
**Testing:** How you verified the fix  
```

---

### 4. Performance Optimization

**Identify and fix:**
- Slow database queries
- Missing indexes
- Unoptimized images
- Unnecessary re-renders
- Memory leaks
- Bundle size issues

---

### 5. Security Audit

**Check for:**
- Exposed API keys (should use env vars)
- SQL injection vulnerabilities
- XSS vulnerabilities
- CSRF protection
- Authentication bypass
- Authorization issues
- Data leakage
- Insecure dependencies

---

## Output Requirements

### Create These Files in `~/Desktop/Tars/OVERNIGHT-HANDOFF/`:

#### 1. `BUG-REPORT.md`
Complete list of all bugs found with details

#### 2. `FIXES-APPLIED.md`
List of all fixes with before/after code

#### 3. `TEST-RESULTS.md`
Results from all 10 test runs

#### 4. `PERFORMANCE-REPORT.md`
Performance analysis and optimizations

#### 5. `SECURITY-AUDIT.md`
Security findings and fixes

#### 6. `RECOMMENDATIONS.md`
Suggestions for improvements

#### 7. `CODE-QUALITY-SCORE.md`
Overall assessment with ratings

---

## Git Workflow

**For each fix:**

```bash
git add <files>
git commit -m "Fix: [describe fix]"
```

**At the end:**
```bash
git push origin main
```

**Then trigger Vercel redeploy** if needed

---

## Success Criteria

✅ Every file reviewed  
✅ All bugs documented  
✅ Critical bugs fixed  
✅ 10 test scenarios completed  
✅ Performance optimized  
✅ Security audit complete  
✅ All reports generated  
✅ Code pushed to GitHub  
✅ Production deployment tested  

---

## Resources

**Database:** Already initialized with seed data  
**Environment variables:** Set in Vercel  
**APIs:** Anthropic, ElevenLabs keys available  
**OAuth:** Placeholder credentials (won't fully test, check logic only)

---

## Timeline

**Start:** Now (21:45 MST)  
**Checkpoint 1:** 23:00 MST (initial review complete)  
**Checkpoint 2:** 01:00 MST (testing 50% done)  
**Checkpoint 3:** 03:00 MST (fixes applied)  
**Final:** 06:00 MST (all reports ready)

---

## Communication

**Update Nova (me) with:**
- Initial findings (first hour)
- Critical bugs discovered (immediately)
- Test results (as completed)
- Final status (before 06:00 MST)

**File handoff location:**
`~/Desktop/Tars/OVERNIGHT-HANDOFF/`

---

## Authorization

✅ Full access to codebase  
✅ Permission to make fixes  
✅ Can commit and push to GitHub  
✅ Can test on production  
✅ Can use all APIs and credentials  

---

**This is a priority mission. User needs zero bugs by morning.**

**Let's make it bulletproof.** 🎯

---

_Mission assigned by: Nova (AI Agent Manager)_  
_For: Mister O (User)_  
_Project: AIMForce Cloud Platform_
