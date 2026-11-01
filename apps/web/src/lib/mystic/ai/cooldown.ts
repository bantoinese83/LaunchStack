import { aiCooldownLimiter, aiRateLimiter, getCache, setCache } from '@template/kv';
import { NextResponse } from 'next/server';

export type AiCooldownResult = { ok: true } | { ok: false; response: NextResponse };

/** Enforce per-user AI budget + per-action cooldown. */
export async function enforceAiCooldown(userId: string, action: string): Promise<AiCooldownResult> {
  const budget = await aiRateLimiter.limit(`ai:budget:${userId}`);
  if (!budget.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'AI assist is cooling down — try again in a minute.',
          retryAfterMs: Math.max(0, budget.reset - Date.now()),
        },
        { status: 429 }
      ),
    };
  }

  const cool = await aiCooldownLimiter.limit(`ai:cd:${action}:${userId}`);
  if (!cool.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'Give it a beat — regenerating too fast.',
          retryAfterMs: Math.max(0, cool.reset - Date.now()),
        },
        { status: 429 }
      ),
    };
  }

  return { ok: true };
}

export async function readAiCache<T>(key: string): Promise<T | null> {
  return getCache<T>(key);
}

export async function writeAiCache<T>(key: string, value: T, ttlSeconds = 900) {
  await setCache(key, value, ttlSeconds);
}
