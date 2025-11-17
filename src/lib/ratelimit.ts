/**
 * Rate Limiting Configuration
 * Using Upstash Redis for distributed rate limiting
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client (only if env vars are present)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// In-memory fallback for development (when Redis is not configured)
class MemoryRatelimit {
  private requests = new Map<string, { count: number; resetAt: number }>();

  async limit(identifier: string, limit: number, windowMs: number) {
    const now = Date.now();
    const key = identifier;
    const record = this.requests.get(key);

    if (!record || now > record.resetAt) {
      this.requests.set(key, { count: 1, resetAt: now + windowMs });
      return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
    }

    if (record.count >= limit) {
      return { success: false, limit, remaining: 0, reset: record.resetAt };
    }

    record.count++;
    return { success: true, limit, remaining: limit - record.count, reset: record.resetAt };
  }
}

// Public endpoints - 100 requests per minute
export const publicRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: '@ratelimit:public',
    })
  : new MemoryRatelimit();

// Authenticated endpoints - 200 requests per minute
export const authenticatedRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, '1 m'),
      analytics: true,
      prefix: '@ratelimit:authenticated',
    })
  : new MemoryRatelimit();

// Sensitive operations - 20 requests per minute
export const sensitiveRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
      prefix: '@ratelimit:sensitive',
    })
  : new MemoryRatelimit();

// File uploads - 10 requests per minute
export const uploadRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: '@ratelimit:upload',
    })
  : new MemoryRatelimit();

// Helper function to get identifier from request
export function getRateLimitIdentifier(request: Request, userId?: string): string {
  // Use user ID if authenticated
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `ip:${ip}`;
}

// Helper function to check rate limit
export async function checkRateLimit(
  limiter: Ratelimit | MemoryRatelimit,
  identifier: string,
  limit?: number,
  windowMs?: number
): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (limiter instanceof MemoryRatelimit) {
    return limiter.limit(identifier, limit || 100, windowMs || 60000);
  }
  
  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

