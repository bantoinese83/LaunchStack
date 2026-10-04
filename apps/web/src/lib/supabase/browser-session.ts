import { createBrowserClient } from '@supabase/ssr';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { useRouter } from 'next/navigation';

export type AuthenticatedBrowserSession = {
  supabase: SupabaseClient;
  session: Session;
  user: User;
};

let browserClient: SupabaseClient | undefined;

function requirePublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
  }
  return { url, key };
}

/** Cookie-backed browser client so Server Components and proxy share one session. */
export function getBrowserSupabaseClient(): SupabaseClient {
  if (!browserClient) {
    const { url, key } = requirePublicSupabaseEnv();
    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}

export async function signOutFromBrowser(): Promise<void> {
  await getBrowserSupabaseClient().auth.signOut();
}

export async function requireBrowserSession(): Promise<AuthenticatedBrowserSession | null> {
  const supabase = getBrowserSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return null;
  }
  return { supabase, session, user: session.user };
}

type LoginRedirectRouter = Pick<ReturnType<typeof useRouter>, 'push'>;

/** Returns null after sending unauthenticated users to `/login`. */
export async function requireBrowserSessionOrRedirect(
  router: LoginRedirectRouter
): Promise<AuthenticatedBrowserSession | null> {
  const auth = await requireBrowserSession();
  if (!auth) {
    router.push('/login');
    return null;
  }
  return auth;
}

export function getAuthCallbackUrl(next = '/dashboard') {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || '';
  const url = new URL('/auth/callback', origin);
  url.searchParams.set('next', next);
  return url.toString();
}
