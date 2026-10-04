import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(() =>
  new Response(JSON.stringify({ ok: true, service: 'launchstack-edge' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
);
