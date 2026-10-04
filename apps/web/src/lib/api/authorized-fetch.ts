import { requireBrowserSession } from '@/lib/supabase/browser-session';

/** Browser fetch with the current Supabase session attached as Bearer auth. */
export async function authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const auth = await requireBrowserSession();
  const token = auth?.session.access_token;
  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body != null && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(input, { ...init, headers });
}
