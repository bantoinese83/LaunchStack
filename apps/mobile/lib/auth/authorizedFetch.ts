import Constants from 'expo-constants';
import { createSupabaseMobileClient } from '@template/api/mobile';

const appUrl = Constants.expoConfig?.extra?.appUrl ?? process.env.EXPO_PUBLIC_APP_URL ?? '';

export async function authorizedFetch(path: string, init: RequestInit = {}) {
  if (!appUrl) throw new Error('EXPO_PUBLIC_APP_URL not set');
  const supabase = createSupabaseMobileClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${appUrl}${path.startsWith('/') ? path : `/${path}`}`, { ...init, headers });
}
