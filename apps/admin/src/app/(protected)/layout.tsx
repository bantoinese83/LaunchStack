import { redirect } from 'next/navigation';
import { createAdminSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  let supabase;
  try {
    supabase = await createAdminSupabaseServerClient();
  } catch {
    redirect('/login');
  }

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub ? String(data.claims.sub) : null;
  if (error || !userId) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('system_role')
    .eq('id', userId)
    .single();

  if (profile?.system_role !== 'super_admin') {
    redirect('/unauthorized');
  }

  return children;
}
