import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function safeNextPath(next: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/dashboard';
  }
  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = safeNextPath(requestUrl.searchParams.get('next'));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const login = new URL('/login', requestUrl.origin);
      login.searchParams.set('error', error.message);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
