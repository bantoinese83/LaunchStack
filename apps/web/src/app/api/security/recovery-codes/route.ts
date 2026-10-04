import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { withRouteSpan } from '@/lib/observability';

async function hashCode(code: string) {
  const bytes = new TextEncoder().encode(code);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: Request) {
  return withRouteSpan('security.recovery.generate', async () => {
    try {
      const auth = await requireAuthenticatedUser(req);
      if (auth.response) return auth.response;
      const supabase = await createSupabaseServerClient();
      await supabase.from('mfa_recovery_codes').delete().eq('user_id', auth.user.id);
      const codes = Array.from({ length: 8 }, () => crypto.randomUUID().slice(0, 10).toUpperCase());
      const rows = await Promise.all(
        codes.map(async (code) => ({
          user_id: auth.user.id,
          code_hash: await hashCode(code),
        }))
      );
      const { error } = await supabase.from('mfa_recovery_codes').insert(rows);
      if (error) throw new Error(error.message);
      return NextResponse.json({ codes });
    } catch (err) {
      return routeErrorResponse(err, '[Recovery Codes]');
    }
  });
}
