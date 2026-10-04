import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Export domain services
export { ProfileService } from './services/ProfileService';
export { WorkspaceService } from './services/WorkspaceService';
export { FeedbackService } from './services/FeedbackService';
export { SubscriptionService } from './services/SubscriptionService';
export { AuditService } from './services/AuditService';
export { InviteService } from './services/InviteService';
export { FeatureFlagService } from './services/FeatureFlagService';

// CLIENT FACTORIES

// Shared Supabase env resolution. Mobile (Expo) reads EXPO_PUBLIC_*; web reads
// NEXT_PUBLIC_*. Explicit args always win so tests can inject values.
const resolveSupabaseUrl = (explicit?: string): string =>
  explicit || process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const resolveSupabaseAnonKey = (explicit?: string): string =>
  explicit ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const createSupabaseBrowserClient = (
  supabaseUrl?: string,
  supabaseKey?: string
): SupabaseClient => {
  const url = resolveSupabaseUrl(supabaseUrl);
  const key = resolveSupabaseAnonKey(supabaseKey);
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
  const url = resolveSupabaseUrl(supabaseUrl);
  const key = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) {
    throw new Error('[SECURITY ALERT] Service role key missing for admin client');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

// NOTE: `createSupabaseMobileClient` lives at `@template/api/mobile`
// (./mobileClient.ts), NOT here. It requires `expo-secure-store`, a React
// Native native module. Keeping it behind a subpath export means bundlers for
// web/Node (Turbopack, webpack, vitest) never even see the native require when
// importing `@template/api` — previously `next build` for apps/web failed with
// "Module not found: expo-secure-store" because the require lived in this
// shared entrypoint. Expo code should import from '@template/api/mobile'.
