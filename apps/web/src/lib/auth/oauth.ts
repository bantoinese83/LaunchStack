import type { Provider } from '@supabase/supabase-js';
import { getAuthCallbackUrl, getBrowserSupabaseClient } from '@/lib/supabase/browser-session';

export const OAUTH_PROVIDERS = ['google'] as const satisfies readonly Provider[];

export async function startOAuth(provider: (typeof OAUTH_PROVIDERS)[number], next = '/account') {
  const supabase = getBrowserSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getAuthCallbackUrl(next),
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
  if (error) throw error;
  if (data.url) {
    window.location.assign(data.url);
  }
}
