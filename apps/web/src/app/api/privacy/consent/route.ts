import { NextResponse } from 'next/server';
import { consentSchema, firstZodIssueMessage } from '@template/validation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const validation = consentSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json({ error: firstZodIssueMessage(validation.error) }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('consent_records').upsert({
      user_id: auth.user.id,
      necessary: true,
      analytics: validation.data.analytics,
      marketing: validation.data.marketing,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return routeErrorResponse(err, '[Consent Route Error]');
  }
}
