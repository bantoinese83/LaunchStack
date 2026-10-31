/**
 * Legacy edge entry — prefer Vercel Cron → POST /api/mystic/cron/door-timer-expire
 * with Authorization: Bearer CRON_SECRET (Stripe deposit capture included).
 */
Deno.serve(async () => {
  const appUrl = Deno.env.get('MYSTIC_APP_URL') ?? Deno.env.get('NEXT_PUBLIC_APP_URL');
  const secret = Deno.env.get('CRON_SECRET') ?? Deno.env.get('MYSTIC_CRON_SECRET');
  if (!appUrl || !secret) {
    return new Response(JSON.stringify({ error: 'MYSTIC_APP_URL and CRON_SECRET required' }), {
      status: 500,
    });
  }

  const res = await fetch(`${appUrl.replace(/\/$/, '')}/api/mystic/cron/door-timer-expire`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.text();
  return new Response(body, { status: res.status, headers: { 'Content-Type': 'application/json' } });
});
