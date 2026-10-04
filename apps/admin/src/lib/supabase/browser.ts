import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | undefined;

export function getAdminBrowserClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
    }
    client = createBrowserClient(url, key);
  }
  return client;
}
