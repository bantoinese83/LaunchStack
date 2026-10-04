import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function requirePublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
  }
  return { url, key };
}

/** Request-scoped Supabase client for Server Components, actions, and route handlers. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, key } = requirePublicSupabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies; proxy.ts refreshes the session.
        }
      },
    },
  });
}

export async function getVerifiedServerUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) {
    return { supabase, userId: null as string | null };
  }
  return { supabase, userId: String(data.claims.sub) };
}
