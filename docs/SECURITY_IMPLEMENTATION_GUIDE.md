# Security Implementation Guide

This guide explains how the security enhancements have been implemented in the Resonant marketplace.

## Overview

All critical and high-priority recommendations from the security audit have been implemented:

1. ✅ Rate Limiting
2. ✅ Content Security Policy (CSP)  
3. ✅ File Signature Validation
4. ✅ Security Headers
5. ✅ Request Size Limits
6. ✅ HTML Sanitization
7. ✅ Audit Logging

## 1. Rate Limiting

### Implementation

**File:** `src/lib/ratelimit.ts`

Uses Upstash Redis for distributed rate limiting in production, with in-memory fallback for development.

**Rate Limits:**
- Public endpoints: 100 requests/minute
- Authenticated endpoints: 200 requests/minute
- Sensitive operations (transactions): 20 requests/minute
- File uploads: 10 requests/minute

### Setup

1. Sign up for free Upstash Redis at https://upstash.com/
2. Create a Redis database
3. Add credentials to `.env`:
```bash
UPSTASH_REDIS_REST_URL=your-url
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Usage Example

```typescript
import { checkRateLimit, authenticatedRatelimit, getRateLimitIdentifier } from '@/lib/ratelimit';

// In your API route
const identifier = getRateLimitIdentifier(request, user.id);
const result = await checkRateLimit(authenticatedRatelimit, identifier, 200, 60000);

if (!result.success) {
    return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
    );
}
```

## 2. Security Headers

### Implementation

**File:** `next.config.js`

All security headers are automatically applied to every response:

- **HSTS**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Legacy XSS protection
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features
- **Content-Security-Policy**: Prevents XSS attacks

### Customization

To modify CSP for your needs, edit `next.config.js`:

```javascript
"connect-src 'self' https://your-api.com"
```

## 3. File Signature Validation

### Implementation

**File:** `src/lib/security/fileValidation.ts`

Validates actual file content (magic numbers), not just MIME types.

### Features

- Detects file type from binary signature
- Verifies MIME type matches content
- Prevents malicious file uploads
- Supports: JPEG, PNG, WebP, GIF

### Usage Example

```typescript
import { validateImageUpload, MAX_AVATAR_SIZE } from '@/lib/security/fileValidation';

const validation = await validateImageUpload(file, MAX_AVATAR_SIZE);

if (!validation.valid) {
    return { error: validation.error };
}
```

## 4. HTML Sanitization

### Implementation

**File:** `src/lib/security/sanitize.ts`

Prevents XSS attacks in user-generated content.

### Functions

**sanitizeText()** - Removes all HTML
```typescript
const clean = sanitizeText(userInput);
// "<script>alert('xss')</script>" → ""
```

**sanitizeDescription()** - Allows basic formatting
```typescript
const clean = sanitizeDescription(description);
// Allows: <b>, <i>, <em>, <strong>, <p>, <br>, <ul>, <ol>, <li>
```

**sanitizeBio()** - Allows links and formatting
```typescript
const clean = sanitizeBio(bio);
// Allows links with forced target="_blank" and rel="noopener"
```

### Usage in API Routes

```typescript
import { sanitizeText, sanitizeDescription } from '@/lib/security/sanitize';

// Sanitize before saving to database
const title = sanitizeText(body.title);
const description = sanitizeDescription(body.description);
```

## 5. Audit Logging

### Implementation

**Database:** `supabase/migrations/008_audit_logging.sql`  
**Library:** `src/lib/security/auditLog.ts`

### Features

- Logs security-relevant events
- Tracks failed authentications
- Records suspicious activity
- Monitors rate limit violations
- Automatic triggers for listings and transactions

### Event Types

- `auth_login_success` / `auth_login_failed`
- `auth_signup` / `auth_logout`
- `listing_created` / `listing_updated` / `listing_deleted`
- `transaction_created` / `transaction_completed`
- `message_sent`
- `rating_created`
- `suspicious_activity`
- `rate_limit_exceeded`
- `file_upload_failed`
- `unauthorized_access`

### Usage Example

```typescript
import { logAuditEvent, getIpAddress, getUserAgent } from '@/lib/security/auditLog';

// Log failed authentication
await logAuditEvent({
    eventType: 'auth_login_failed',
    ipAddress: getIpAddress(request),
    userAgent: getUserAgent(request),
    eventData: { email },
    severity: 'warning',
});

// Log suspicious activity
await logAuditEvent({
    eventType: 'suspicious_activity',
    userId: user.id,
    eventData: { reason: 'Multiple failed transactions' },
    severity: 'critical',
});
```

### Querying Audit Logs (Admin Only)

```sql
-- Recent failed auth attempts
SELECT * FROM audit_logs 
WHERE event_type = 'auth_login_failed' 
ORDER BY created_at DESC 
LIMIT 100;

-- Suspicious activity
SELECT * FROM audit_logs 
WHERE severity = 'critical' 
ORDER BY created_at DESC;

-- Rate limit violations by user
SELECT user_id, COUNT(*) as violations
FROM audit_logs 
WHERE event_type = 'rate_limit_exceeded'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
ORDER BY violations DESC;
```

## 6. Request Size Limits

### Implementation

**File:** `next.config.js`

```javascript
experimental: {
    serverActions: {
        bodySizeLimit: '2mb',
    },
}
```

Prevents DoS attacks via large payloads.

## Applied to Endpoints

### Transactions API
- `/api/transactions/create` - Rate limiting (20/min), audit logging
- Transaction amount validation against listing price

### Messages API
- `/api/messages` - Rate limiting (200/min), content sanitization, audit logging

### Upload APIs
- `/api/upload/avatar` - Rate limiting (10/min), file signature validation, audit logging
- `/api/upload/listing-images` - Rate limiting (10/min), file signature validation, audit logging

### Listings API
- Account verification enforcement
- HTML sanitization recommended for descriptions (apply as needed)

## Testing Security Features

### Test Rate Limiting

```bash
# Send rapid requests to test rate limiting
for i in {1..25}; do
  curl -X POST http://localhost:3000/api/messages \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"content":"test"}' &
done
```

Expected: 429 error after 20 requests

### Test File Validation

Try uploading:
- A `.jpg` file renamed to `.png` → Should be rejected (signature mismatch)
- An `.exe` file renamed to `.jpg` → Should be rejected (invalid signature)
- A valid image → Should succeed

### Test HTML Sanitization

```typescript
const input = '<script>alert("xss")</script><b>Bold text</b>';
const output = sanitizeDescription(input);
// Output: "<b>Bold text</b>"
```

### Check Audit Logs

```sql
-- As admin, check recent events
SELECT * FROM audit_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

## Production Checklist

Before deploying to production:

- [ ] Set up Upstash Redis for rate limiting
- [ ] Configure all environment variables
- [ ] Run audit logging migration: `supabase migration up`
- [ ] Test rate limiting with production Redis
- [ ] Verify security headers in production
- [ ] Test file upload validation
- [ ] Review CSP policy and adjust for your domain
- [ ] Set up monitoring for critical audit events
- [ ] Configure alerts for suspicious activity
- [ ] Document incident response procedures

## Monitoring & Alerts

### Recommended Monitoring

1. **Rate Limit Violations**
   - Alert if user exceeds limits repeatedly
   - Track IPs with high violation rates

2. **Failed Authentications**
   - Alert on multiple failed attempts from same IP
   - Track unusual authentication patterns

3. **Suspicious Activity**
   - Monitor critical severity audit logs
   - Alert on rapid transaction patterns

4. **File Upload Failures**
   - Track rejected uploads by type
   - Identify potential attack patterns

### Example Alert Query

```sql
-- Users with excessive rate limit violations (past hour)
SELECT 
    user_id,
    COUNT(*) as violations,
    COUNT(DISTINCT ip_address) as unique_ips
FROM audit_logs
WHERE event_type = 'rate_limit_exceeded'
AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 50;
```

## Maintenance

### Weekly
- Review audit logs for suspicious patterns
- Check rate limit effectiveness
- Monitor file upload rejections

### Monthly
- Review and update CSP policy
- Audit security header effectiveness
- Update security dependencies: `npm audit fix`
- Review and archive old audit logs

### Quarterly
- Security assessment and penetration testing
- Review and update security policies
- Train team on new security features

## Support

For security issues:
- Report vulnerabilities privately
- Review audit logs regularly
- Keep dependencies updated
- Follow security best practices

## Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

