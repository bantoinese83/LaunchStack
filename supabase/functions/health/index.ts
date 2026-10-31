import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(() =>
  new Response(JSON.stringify({ ok: true, service: 'mystic-edge' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
);
