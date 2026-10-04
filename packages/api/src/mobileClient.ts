import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Mobile-only Supabase client factory.
 *
 * Uses `expo-secure-store` as the auth storage adapter so sessions survive
 * app restarts. Must only be called in React Native — will throw if
 * `expo-secure-store` is not available (i.e., in web/Node environments).
 *
 * This module is intentionally separate from the package entrypoint's
 * web/Node client factories so that web/Node bundlers never need to resolve
 * `expo-secure-store`. It is re-exported from the main entrypoint, but only
 * Expo's bundler (Metro) ever pulls this file into a graph.
 *
 * Fix for H3: https://github.com/supabase/supabase-js#custom-storage-adapter
 */

// `expo-secure-store` is a peer dependency that only resolves inside Expo.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SecureStore = require('expo-secure-store') as {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const createSupabaseMobileClient = (
  supabaseUrl?: string,
  supabaseKey?: string
): SupabaseClient => {
  const url = supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const key = supabaseKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    throw new Error(
      'Supabase URL and anon key are required. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createClient(url, key, {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};
