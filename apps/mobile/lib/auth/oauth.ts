import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { createSessionFromUrl } from './sessionFromUrl';

WebBrowser.maybeCompleteAuthSession();

export function getMobileAuthRedirectUri() {
  return makeRedirectUri({
    scheme: 'mystichair',
    path: 'auth/callback',
  });
}

export async function startGoogleOAuth() {
  const redirectTo = getMobileAuthRedirectUri();
  const supabase = createSupabaseMobileClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error('OAuth did not return a URL');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'success' && result.url) {
    await createSessionFromUrl(result.url);
  } else if (result.type === 'cancel') {
    throw new Error('Sign-in was cancelled');
  }
}
