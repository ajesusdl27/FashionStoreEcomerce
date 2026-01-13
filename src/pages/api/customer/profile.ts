import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';

export interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  default_address: string | null;
  default_city: string | null;
  default_postal_code: string | null;
  default_country: string | null;
}

// GET customer profile
export const GET: APIRoute = async ({ cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const authClient = createAuthenticatedClient(accessToken, refreshToken);
    const user = await validateToken(accessToken);

    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Use RPC function to get profile (SECURITY DEFINER bypasses RLS issues)
    const { data: profileData, error } = await authClient.rpc('get_customer_profile');

    if (error && error.code !== 'PGRST116') {
      // Fallback to direct query if RPC not available
      const { data: profile, error: directError } = await authClient
        .from('customer_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (directError && directError.code !== 'PGRST116') {
        return new Response(JSON.stringify({ error: directError.message }), { 
          status: 400, headers: { 'Content-Type': 'application/json' } 
        });
      }

      return new Response(JSON.stringify({ 
        profile: profile || {
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          phone: user.user_metadata?.phone || null,
          default_address: null,
          default_city: null,
          default_postal_code: null,
          default_country: 'España'
        }
      }), { 
        status: 200, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // RPC returns array, get first item
    const profile = profileData && profileData.length > 0 ? profileData[0] : null;

    return new Response(JSON.stringify({ 
      profile: profile || {
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
        phone: user.user_metadata?.phone || null,
        default_address: null,
        default_city: null,
        default_postal_code: null,
        default_country: 'España'
      }
    }), { 
      status: 200, headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};

// UPDATE customer profile
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const authClient = createAuthenticatedClient(accessToken, refreshToken);
    const user = await validateToken(accessToken);

    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const body = await request.json();
    const { full_name, phone, default_address, default_city, default_postal_code, default_country } = body;

    // Use RPC function with SECURITY DEFINER (bypasses RLS)
    const { error } = await authClient.rpc('upsert_customer_profile', {
      p_full_name: full_name || null,
      p_phone: phone || null,
      p_default_address: default_address || null,
      p_default_city: default_city || null,
      p_default_postal_code: default_postal_code || null,
      p_default_country: default_country || 'España'
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};
