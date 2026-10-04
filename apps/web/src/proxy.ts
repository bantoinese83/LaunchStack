import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { apiRateLimiter, authRateLimiter } from '@template/kv';
import { updateSession } from '@/lib/supabase/update-session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const limiter =
      pathname.includes('/auth') || pathname.includes('/stripe') || pathname.includes('/privacy')
        ? authRateLimiter
        : apiRateLimiter;

    const { success, limit, remaining, reset } = await limiter.limit(ip);

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    const response = await updateSession(request);
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());
    return response;
  }

  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
