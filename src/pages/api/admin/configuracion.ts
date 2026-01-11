import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { settings } = await request.json();

    // Update each setting
    for (const setting of settings) {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: setting.key,
          value_bool: setting.value_bool,
        }, {
          onConflict: 'key'
        });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 400, headers: { 'Content-Type': 'application/json' } 
        });
      }
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
