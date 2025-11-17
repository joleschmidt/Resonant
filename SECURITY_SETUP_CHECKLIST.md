# Security Setup Checklist

Quick checklist for setting up security features in production.

## Pre-Deployment Checklist

### 1. Environment Variables ✅

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Recommended for Production
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

**Action Items:**
- [ ] Set all Supabase environment variables
- [ ] Create Upstash Redis account (free tier available)
- [ ] Add Upstash credentials to environment

### 2. Database Migration ✅

```bash
# Run audit logging migration
supabase migration up
```

**Action Items:**
- [ ] Run migration in staging
- [ ] Verify audit_logs table created
- [ ] Test audit logging function
- [ ] Run migration in production

### 3. Security Headers ✅

Already configured in `next.config.js`

**Action Items:**
- [ ] Verify headers in staging with browser dev tools
- [ ] Check CSP is not blocking legitimate resources
- [ ] Adjust CSP if needed for your domain
- [ ] Verify HSTS in production

### 4. Rate Limiting ✅

Automatically enabled, uses in-memory fallback without Redis.

**Action Items:**
- [ ] Test rate limiting in staging
- [ ] Verify 429 responses work correctly
- [ ] Check audit logs for rate limit violations
- [ ] Set up Upstash for production (recommended)

### 5. File Upload Security ✅

Already integrated into upload endpoints.

**Action Items:**
- [ ] Test valid image uploads
- [ ] Try uploading renamed executables (should fail)
- [ ] Verify file signature validation works
- [ ] Check audit logs for failed uploads

### 6. Audit Logging ✅

Automatically logging critical events.

**Action Items:**
- [ ] Verify automatic triggers work
- [ ] Check you can query audit logs as admin
- [ ] Set up monitoring dashboard (optional)
- [ ] Create alert for critical severity events

## Testing Checklist

### Rate Limiting
```bash
# Test with rapid requests
for i in {1..25}; do
  curl -X POST https://your-domain.com/api/messages \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"content":"test"}' &
done
```
- [ ] Verify 429 error after limit
- [ ] Check audit log entry created

### File Upload
- [ ] Upload valid JPEG → Should succeed
- [ ] Upload .exe renamed to .jpg → Should fail
- [ ] Upload .png with .jpg extension → Should fail
- [ ] Check audit logs for failures

### HTML Sanitization
```typescript
// Test in message sending
const input = '<script>alert("xss")</script>Hello';
// Should only save: 'Hello'
```
- [ ] Verify script tags stripped
- [ ] Check formatted text preserved where appropriate

### Security Headers
- [ ] Open dev tools → Network tab
- [ ] Check any response has all security headers
- [ ] Verify CSP header present
- [ ] Confirm HSTS header in production

### Audit Logging
```sql
-- As admin, check recent events
SELECT * FROM audit_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```
- [ ] See listing creation events
- [ ] See transaction events
- [ ] See rate limit violations (if any)
- [ ] See file upload failures (if any)

## Monitoring Setup

### Required Monitoring
1. **Rate Limit Violations**
   ```sql
   SELECT user_id, COUNT(*) as violations
   FROM audit_logs
   WHERE event_type = 'rate_limit_exceeded'
   AND created_at > NOW() - INTERVAL '24 hours'
   GROUP BY user_id
   HAVING COUNT(*) > 50;
   ```

2. **Failed Authentication Attempts**
   ```sql
   SELECT ip_address, COUNT(*) as attempts
   FROM audit_logs
   WHERE event_type = 'auth_login_failed'
   AND created_at > NOW() - INTERVAL '1 hour'
   GROUP BY ip_address
   HAVING COUNT(*) > 10;
   ```

3. **Suspicious Activity**
   ```sql
   SELECT * FROM audit_logs
   WHERE severity = 'critical'
   ORDER BY created_at DESC
   LIMIT 100;
   ```

### Action Items
- [ ] Set up weekly audit log review process
- [ ] Create dashboard for security metrics (optional)
- [ ] Set up alerts for critical events (optional)
- [ ] Document incident response procedures

## Production Deployment

### Before Deploy
- [ ] All environment variables set
- [ ] Audit logging migration run
- [ ] Security features tested in staging
- [ ] CSP policy reviewed and adjusted
- [ ] Monitoring setup complete

### During Deploy
- [ ] Deploy to production
- [ ] Verify security headers in production
- [ ] Test rate limiting works
- [ ] Check audit logs are being created

### After Deploy
- [ ] Monitor for any CSP violations
- [ ] Check rate limiting is effective
- [ ] Review first day of audit logs
- [ ] Verify all features working correctly

## Maintenance Schedule

### Daily
- Monitor critical audit events

### Weekly
- Review audit logs for patterns
- Check rate limit effectiveness
- Monitor file upload rejections

### Monthly
- Review and update CSP policy
- Run `npm audit` and fix vulnerabilities
- Review security metrics
- Archive old audit logs

### Quarterly
- Security assessment
- Penetration testing
- Update security policies
- Team security training

## Emergency Contacts

**Security Issues:**
- [ ] Document security contact email
- [ ] Document escalation procedure
- [ ] Document incident response team

**Support Resources:**
- Implementation Guide: `docs/SECURITY_IMPLEMENTATION_GUIDE.md`
- Audit Report: `reports/SECURITY_AUDIT_REPORT-2025-11-12.md`
- Status Report: `reports/SECURITY_IMPLEMENTATION_STATUS.md`

---

## Quick Start (Development)

No setup required! All features work with in-memory fallbacks:

```bash
npm install
npm run dev
```

Everything works out of the box for development.

## Quick Start (Production)

Minimal setup for production:

```bash
# 1. Set environment variables (Supabase required)
# 2. Run audit logging migration
supabase migration up

# 3. (Optional but recommended) Add Upstash Redis
# Add to .env:
# UPSTASH_REDIS_REST_URL=...
# UPSTASH_REDIS_REST_TOKEN=...

# 4. Deploy
npm run build
```

That's it! Security features are now active.

---

**Status:** All security features implemented and tested  
**Ready for Production:** ✅ Yes (after completing checklist)  
**Documentation:** Complete

