/**
 * Optional cron: mark no-show + capture deposit when door_timer_ends_at passed.
 * Deploy when ready — wire to Supabase cron or external scheduler.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async () => {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(url, key);

  const now = new Date().toISOString();
  const { data: expired, error } = await supabase
    .from('mystic_appointments')
    .select('id')
    .eq('status', 'door_timer_active')
    .lt('door_timer_ends_at', now);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  for (const row of expired ?? []) {
    await supabase
      .from('mystic_appointments')
      .update({ status: 'no_show', deposit_captured: true, updated_at: now })
      .eq('id', row.id);
  }

  return new Response(JSON.stringify({ processed: expired?.length ?? 0 }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
