import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Export domain services
export { ProfileService } from './services/ProfileService';
export { WorkspaceService } from './services/WorkspaceService';
export { FeedbackService } from './services/FeedbackService';
export { SubscriptionService } from './services/SubscriptionService';
export { AuditService } from './services/AuditService';

// CLIENT FACTORIES
export const createSupabaseBrowserClient = (
  supabaseUrl?: string,
  supabaseKey?: string
): SupabaseClient => {
  const url =
    supabaseUrl ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const key =
    supabaseKey ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  if (!url || !key) {
    throw new Error(
      'Supabase URL and anon key are required. Set NEXT_PUBLIC_SUPABASE_* (web) or EXPO_PUBLIC_SUPABASE_* (mobile).'
    );
  }
  return createClient(url, key);
};

export const createSupabaseAdminClient = (
  supabaseUrl?: string,
  serviceRoleKey?: string
): SupabaseClient => {
  const url =
    supabaseUrl ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const key = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) {
    throw new Error('[SECURITY ALERT] Service role key missing for admin client');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};
