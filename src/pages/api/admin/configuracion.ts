import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create authenticated client for RLS
    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { settings } = await request.json();

    // Update each setting
    for (const setting of settings) {
      // Build the update object based on what's provided
      const updateData: Record<string, any> = {
        key: setting.key,
      };

      // Handle different value types
      if (setting.value_bool !== undefined) {
        updateData.value_bool = setting.value_bool;
        // Also store as string for compatibility
        updateData.value = setting.value_bool ? 'true' : 'false';
      }
      
      if (setting.value !== undefined) {
        updateData.value = setting.value;
      }
      
      if (setting.value_number !== undefined) {
        updateData.value_number = setting.value_number;
        // Also store as string for compatibility
        updateData.value = setting.value_number.toString();
      }

      const { error } = await authClient
        .from('settings')
        .upsert(updateData, {
          onConflict: 'key'
        });

      if (error) {
        console.error('Error updating setting:', setting.key, error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 400, headers: { 'Content-Type': 'application/json' } 
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error('Configuration API error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};
