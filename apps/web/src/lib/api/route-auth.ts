import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createSupabaseAdminClient } from '@template/api';
import { getErrorMessage } from '@template/validation';

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization') ?? '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export type AuthenticatedUserResult =
  { user: User; response?: never } | { user?: never; response: NextResponse };

/** Validates a Bearer token or the SSR cookie session for protected API routes. */
export async function requireAuthenticatedUser(req: Request): Promise<AuthenticatedUserResult> {
  const token = extractBearerToken(req);
  if (token) {
    const adminSupabase = createSupabaseAdminClient();
    const { data: userData, error: userError } = await adminSupabase.auth.getUser(token);
    if (userError || !userData.user) {
      return { response: unauthorizedResponse() };
    }
    return { user: userData.user };
  }

  try {
    const { createSupabaseServerClient } = await import('@/lib/supabase/server');
    const supabase = await createSupabaseServerClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    if (claimsError || !claimsData?.claims?.sub) {
      return { response: unauthorizedResponse() };
    }
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { response: unauthorizedResponse() };
    }
    return { user: userData.user };
  } catch {
    return { response: unauthorizedResponse() };
  }
}

export function routeErrorResponse(err: unknown, logLabel: string) {
  const message = getErrorMessage(err, 'Internal server error');
  console.error(logLabel, err);
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err instanceof Error ? err : new Error(message), {
      tags: { route: logLabel },
    });
  }
  return NextResponse.json({ error: message }, { status: 500 });
}
