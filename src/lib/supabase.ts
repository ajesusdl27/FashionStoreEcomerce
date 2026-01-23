import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,        // Don't save to localStorage - we use httpOnly cookies
      autoRefreshToken: false,      // Server middleware handles token refresh
      detectSessionInUrl: true,     // Keep enabled for password recovery flows
    }
  });
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

// Service role client for server-side operations that need to bypass RLS
// WARNING: Only use this in server-side code (API routes, webhooks, etc.)
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string;

let serviceRoleInstance: SupabaseClient | null = null;

export function getServiceSupabase(): SupabaseClient {
  if (serviceRoleInstance) {
    return serviceRoleInstance;
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('⚠️ [SUPABASE] Service role key not configured, falling back to anon client');
    return getSupabase();
  }

  console.log('🔑 [SUPABASE] Creating service role client (bypasses RLS)');
  
  serviceRoleInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
  
  return serviceRoleInstance;
}

// Export service client for backwards compatibility
export const supabaseAdmin = getServiceSupabase();

/**
 * Get related products based on category
 * Excludes the current product and returns up to 6 products from the same category
 * @param categoryId - Category ID to filter by
 * @param excludeProductId - Product ID to exclude (current product)
 * @param limit - Maximum number of products to return (default: 6)
 */
export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit: number = 6
) {
  const { data, error } = await getSupabase()
    .from('products')
    .select(`
      id,
      name,
      slug,
      price,
      offer_price,
      is_offer,
      category:categories(id, name, slug),
      images:product_images(id, image_url, order),
      variants:product_variants(id, size, stock)
    `)
    .eq('category_id', categoryId)
    .eq('active', true)
    .is('deleted_at', null)
    .neq('id', excludeProductId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return data || [];
}
