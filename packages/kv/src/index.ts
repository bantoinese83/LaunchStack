import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client safely with env vars or a mock fallback for dev/testing
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;

/**
 * Creates a rate limiter instance. If Redis keys are missing, returns a mock limiter that always allows requests.
 */
export function createRateLimiter(
  requests: number = 10,
  windowString: `${number} s` | `${number} m` | `${number} h` | `${number} d` = '10 s'
) {
  if (!redis) {
    return {
      limit: async (_identifier: string) => ({
        success: true,
        limit: requests,
        remaining: requests,
        reset: Date.now() + 10000,
      }),
    };
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, windowString),
    analytics: true,
    prefix: '@template/ratelimit',
  });
}

// Pre-configured rate limiters for common SaaS use cases
export const apiRateLimiter = createRateLimiter(60, '1 m'); // 60 requests per minute
export const authRateLimiter = createRateLimiter(5, '1 m'); // 5 auth attempts per minute
export const strictRateLimiter = createRateLimiter(10, '1 m'); // 10 strict action attempts per minute

/**
 * Cache helper to get JSON data
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch (error) {
    console.warn(`[KV Cache] Error getting key "${key}":`, error);
    return null;
  }
}

/**
 * Cache helper to set JSON data with optional TTL (in seconds)
 */
export async function setCache<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
  if (!redis) return false;
  try {
    if (ttlSeconds) {
      await redis.set(key, value, { ex: ttlSeconds });
    } else {
      await redis.set(key, value);
    }
    return true;
  } catch (error) {
    console.warn(`[KV Cache] Error setting key "${key}":`, error);
    return false;
  }
}

/**
 * Helper to delete a cached key
 */
export async function deleteCache(key: string): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.warn(`[KV Cache] Error deleting key "${key}":`, error);
    return false;
  }
}
