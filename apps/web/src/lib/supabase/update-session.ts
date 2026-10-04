import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/feedback', '/onboarding', '/settings'];

const CACHE_HEADERS = ['cache-control', 'expires', 'pragma'] as const;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers ?? {}).forEach(([headerName, headerValue]) => {
          if (typeof headerValue === 'string') {
            supabaseResponse.headers.set(headerName, headerValue);
          }
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub ? String(data.claims.sub) : null;
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!userId && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    for (const header of CACHE_HEADERS) {
      const value = supabaseResponse.headers.get(header);
      if (value) redirectResponse.headers.set(header, value);
    }
    return redirectResponse;
  }

  return supabaseResponse;
}
