/**
 * Audit Logging Utilities
 * Logs security-relevant events for monitoring and compliance
 */

import { createClient } from '@/lib/supabase/server';

export type AuditEventType =
  | 'auth_login_success'
  | 'auth_login_failed'
  | 'auth_signup'
  | 'auth_logout'
  | 'listing_created'
  | 'listing_updated'
  | 'listing_deleted'
  | 'transaction_created'
  | 'transaction_completed'
  | 'transaction_cancelled'
  | 'message_sent'
  | 'rating_created'
  | 'profile_updated'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'file_upload_failed'
  | 'unauthorized_access';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

interface AuditLogParams {
  eventType: AuditEventType;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  eventData?: Record<string, any>;
  severity?: AuditSeverity;
}

/**
 * Logs an audit event
 */
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase.rpc('log_audit_event', {
      p_event_type: params.eventType,
      p_user_id: params.userId || null,
      p_ip_address: params.ipAddress || null,
      p_user_agent: params.userAgent || null,
      p_resource_type: params.resourceType || null,
      p_resource_id: params.resourceId || null,
      p_event_data: params.eventData || {},
      p_severity: params.severity || 'info',
    });

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}

/**
 * Helper to extract IP address from request
 */
export function getIpAddress(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

/**
 * Helper to extract user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Logs a failed authentication attempt
 */
export async function logFailedAuth(request: Request, email?: string): Promise<void> {
  await logAuditEvent({
    eventType: 'auth_login_failed',
    ipAddress: getIpAddress(request),
    userAgent: getUserAgent(request),
    eventData: { email },
    severity: 'warning',
  });
}

/**
 * Logs a rate limit exceeded event
 */
export async function logRateLimitExceeded(
  request: Request,
  userId?: string,
  endpoint?: string
): Promise<void> {
  await logAuditEvent({
    eventType: 'rate_limit_exceeded',
    userId,
    ipAddress: getIpAddress(request),
    userAgent: getUserAgent(request),
    eventData: { endpoint },
    severity: 'warning',
  });
}

/**
 * Logs an unauthorized access attempt
 */
export async function logUnauthorizedAccess(
  request: Request,
  userId?: string,
  resourceType?: string,
  resourceId?: string
): Promise<void> {
  await logAuditEvent({
    eventType: 'unauthorized_access',
    userId,
    ipAddress: getIpAddress(request),
    userAgent: getUserAgent(request),
    resourceType,
    resourceId,
    severity: 'error',
  });
}

/**
 * Logs a suspicious activity event
 */
export async function logSuspiciousActivity(
  userId: string,
  reason: string,
  details?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    eventType: 'suspicious_activity',
    userId,
    eventData: { reason, ...details },
    severity: 'critical',
  });
}

