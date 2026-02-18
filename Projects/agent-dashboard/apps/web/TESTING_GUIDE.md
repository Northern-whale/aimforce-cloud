# Social Media Automation - Testing Guide

## Quick Test Workflow (Without Real OAuth)

### 1. Test with Mock Data

For initial testing without setting up OAuth:

**Create test social accounts manually in database:**

```bash
cd ~/Desktop/Tars/Projects/agent-dashboard/apps/web
npx prisma studio
```

**Add Mock Account:**

Navigate to `SocialAccount` model and create:
- userId: (your user ID from User table)
- platform: "instagram"
- accountId: "mock_account_123"
- accountName: "test_user"
- accessToken: "mock_token_encrypted"
- connected: true

### 2. Test Posting Engine

**Schedule a test post:**

```bash
# Use Prisma Studio or create via API
POST /api/social/posts
{
  "platforms": ["instagram"],
  "content": "Test post from automation system",
  "scheduledFor": "2026-02-17T19:00:00Z",
  "status": "scheduled"
}
```

### 3. Test CRON Manually

```bash
curl -X POST http://localhost:3000/api/social/cron \
  -H "Authorization: Bearer development-secret"
```

**Expected output:**
```json
{
  "success": true,
  "results": {
    "processed": 1,
    "succeeded": 1,
    "failed": 0
  }
}
```

### 4. Enable Mock Mode

**Update platform files to use mock mode:**

Edit `src/lib/social/instagram.ts`:

```typescript
export async function postToInstagram(account, content) {
  // MOCK MODE - Remove after OAuth setup
  if (process.env.MOCK_SOCIAL === 'true') {
    console.log('[MOCK] Instagram post:', content.text);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return {
      success: true,
      postId: `ig_mock_${Date.now()}`,
      platform: 'instagram',
    };
  }
  
  // Real implementation...
}
```

Add to `.env`:
```env
MOCK_SOCIAL=true
```

## Automated Test Scripts

### Test 1: Create and Schedule Post

```bash
# test-posting.sh
#!/bin/bash

# Login and get session token (adjust based on your auth)
# Then create post

curl -X POST http://localhost:3000/api/social/posts \
  -H "Content-Type: application/json" \
  -d '{
    "platforms": ["instagram", "facebook"],
    "content": "Test automated post #testing",
    "scheduledFor": "'$(date -u -v +2M +%Y-%m-%dT%H:%M:%S)'Z",
    "status": "scheduled"
  }'
```

### Test 2: Verify Analytics

```bash
curl http://localhost:3000/api/social/analytics | jq
```

### Test 3: Calendar Data

```bash
curl "http://localhost:3000/api/social/posts?status=scheduled" | jq
```

## UI Testing Checklist

### Dashboard Page (`/social`)

- [ ] Shows summary metrics (followers, reach, engagement)
- [ ] Platform health status displays correctly
- [ ] Top posts section loads
- [ ] Post composer accepts input
- [ ] Platform selection works
- [ ] Character count updates
- [ ] Media URL input works

### Calendar Page (`/social/calendar`)

- [ ] Calendar renders for current month
- [ ] Posts appear on correct dates
- [ ] Week/Month toggle works
- [ ] Navigation (prev/next) works
- [ ] Color coding by status (draft, scheduled, posted, failed)
- [ ] Click on post shows details

### Analytics Page (`/social/analytics`)

- [ ] Summary cards display
- [ ] Platform performance metrics load
- [ ] Top posts ranked correctly
- [ ] Refresh button works

### Settings Page (`/social/settings`)

- [ ] All 5 platforms displayed
- [ ] Connect button visible for disconnected platforms
- [ ] Disconnect button visible for connected platforms
- [ ] OAuth documentation links work

## Performance Tests

### Test Concurrent Posting

Schedule 10 posts for the same time across different platforms:

```bash
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/social/posts \
    -H "Content-Type: application/json" \
    -d "{
      \"platforms\": [\"instagram\", \"facebook\"],
      \"content\": \"Concurrent test post $i\",
      \"scheduledFor\": \"$(date -u -v +1M +%Y-%m-%dT%H:%M:%S)Z\",
      \"status\": \"scheduled\"
    }"
done
```

Then trigger CRON and verify all 10 posts process correctly.

### Test Retry Logic

1. Create a post
2. Manually mark it as failed in database
3. Trigger CRON
4. Verify retry count increments
5. Verify scheduledFor updated to retry time

## Edge Cases to Test

1. **Empty content:** Should reject
2. **No platforms selected:** Should reject
3. **Character limit exceeded:** Should show warning
4. **Past schedule time:** Should post immediately or reject
5. **Invalid media URL:** Should handle gracefully
6. **Disconnected account:** Should skip that platform
7. **Expired token:** Should mark account as needs reauth

## Database Verification

After running tests, check database:

```bash
npx prisma studio
```

Verify:
- `ScheduledPost` records created
- `status` transitions (draft → scheduled → posting → posted)
- `retryCount` increments on failures
- `postIds` populated after successful posting
- `error` field populated on failures

## Integration Test Suite

Create `tests/social-media.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Social Media Automation', () => {
  it('should create a scheduled post', async () => {
    const response = await fetch('/api/social/posts', {
      method: 'POST',
      body: JSON.stringify({
        platforms: ['instagram'],
        content: 'Test post',
        scheduledFor: new Date(Date.now() + 60000),
        status: 'scheduled',
      }),
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.post.status).toBe('scheduled');
  });
  
  it('should reject empty content', async () => {
    const response = await fetch('/api/social/posts', {
      method: 'POST',
      body: JSON.stringify({
        platforms: ['instagram'],
        content: '',
        status: 'draft',
      }),
    });
    
    expect(response.ok).toBe(false);
  });
  
  it('should process scheduled posts', async () => {
    const response = await fetch('/api/social/cron', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer development-secret',
      },
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

## Visual Regression Testing

Take screenshots of each page and compare:

```bash
# Using Playwright
npx playwright test --update-snapshots
```

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Form inputs have labels
- [ ] Error messages are descriptive

## Security Testing

1. **Test CRON endpoint without auth:** Should return 401
2. **Test account disconnect:** Should not delete, only mark disconnected
3. **Test token encryption:** Tokens should not be visible in database
4. **Test OAuth state validation:** Old/invalid states should be rejected

## Monitor in Production

After deployment:

```bash
# Check CRON execution
tail -f /var/log/cron.log

# Monitor API response times
curl -w "@curl-format.txt" https://yourdomain.com/api/social/posts

# Check error rates
grep "Error" /var/log/app.log | wc -l
```

## Success Criteria

✅ All tests pass
✅ No errors in console
✅ Posts execute within 1 minute of scheduled time
✅ Retry logic works (3 attempts)
✅ Analytics data populates
✅ OAuth flows complete successfully
✅ UI responsive on mobile
✅ Database migrations clean
✅ No security vulnerabilities

---

**Ready to test!** Start with mock mode, then progressively add real OAuth credentials.
