import type { Provider } from '@supabase/supabase-js';
import { getAuthCallbackUrl, getBrowserSupabaseClient } from '@/lib/supabase/browser-session';

export const OAUTH_PROVIDERS = ['google', 'github'] as const satisfies readonly Provider[];

export async function startOAuth(provider: (typeof OAUTH_PROVIDERS)[number], next = '/dashboard') {
  const supabase = getBrowserSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getAuthCallbackUrl(next),
    },
  });
  if (error) throw error;
  if (data.url) {
    window.location.assign(data.url);
  }
}
