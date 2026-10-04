import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { withRouteSpan } from '@/lib/observability';

async function hashCode(code: string) {
  const bytes = new TextEncoder().encode(code.trim().toUpperCase());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: Request) {
  return withRouteSpan('security.recovery.consume', async () => {
    try {
      const auth = await requireAuthenticatedUser(req);
      if (auth.response) return auth.response;
      const body = (await req.json()) as { code?: string };
      if (!body.code) {
        return NextResponse.json({ error: 'code is required' }, { status: 400 });
      }
      const supabase = await createSupabaseServerClient();
      const codeHash = await hashCode(body.code);
      const { data, error } = await supabase
        .from('mfa_recovery_codes')
        .select('id')
        .eq('user_id', auth.user.id)
        .eq('code_hash', codeHash)
        .is('used_at', null)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) {
        return NextResponse.json({ error: 'Invalid or used recovery code' }, { status: 400 });
      }
      const { error: updateError } = await supabase
        .from('mfa_recovery_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('id', data.id);
      if (updateError) throw new Error(updateError.message);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return routeErrorResponse(err, '[Recovery Consume]');
    }
  });
}
