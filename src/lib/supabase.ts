import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables - these are exposed to the client because they start with PUBLIC_
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

// Create a singleton to avoid multiple instances
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Export a getter for backwards compatibility
export const supabase = getSupabase();

// Helper to create authenticated client with cookies (for SSR)
export function createAuthenticatedClient(accessToken?: string, refreshToken?: string) {
  if (!accessToken || !refreshToken) {
    return getSupabase();
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return client;
}

