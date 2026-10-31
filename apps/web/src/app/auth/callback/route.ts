import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function safeNextPath(next: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/account';
  }
  return next;
}

function redirectToLogin(origin: string, message: string) {
  const login = new URL('/login', origin);
  login.searchParams.set('error', message);
  return NextResponse.redirect(login);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = safeNextPath(requestUrl.searchParams.get('next'));
  const oauthError =
    requestUrl.searchParams.get('error_description') ?? requestUrl.searchParams.get('error');

  if (oauthError && !code) {
    return redirectToLogin(requestUrl.origin, oauthError);
  }

  if (!code) {
    return redirectToLogin(requestUrl.origin, 'Sign-in was cancelled or the link expired.');
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return redirectToLogin(requestUrl.origin, error.message);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
