import { NextResponse } from 'next/server';
import { createAdminSupabaseServerClient } from '@/lib/supabase/server';

export async function requireSuperAdmin() {
  const supabase = await createAdminSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub ? String(data.claims.sub) : null;
  if (error || !userId) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('system_role')
    .eq('id', userId)
    .single();
  if (profile?.system_role !== 'super_admin') {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { userId, supabase };
}
