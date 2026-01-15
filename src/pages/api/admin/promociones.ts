import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';

// GET - List all promotions
export const GET: APIRoute = async ({ cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    // Fetch promotions with coupon code if linked
    const { data, error } = await authClient
      .from('promotions')
      .select('*, coupons(code)')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ promotions: data }), { 
      status: 200, headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};

// POST - Create new promotion
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    const body = await request.json();
    const { 
      title, 
      description, 
      image_url,
      mobile_image_url,
      cta_text,
      cta_link,
      coupon_id, 
      locations, 
      priority, 
      style_config, 
      start_date, 
      end_date 
    } = body;

    // Validate required fields
    if (!title || !image_url) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos (Título, Imagen)' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { data, error } = await authClient
      .from('promotions')
      .insert({
        title,
        description,
        image_url,
        mobile_image_url: mobile_image_url || null,
        cta_text: cta_text || null,
        cta_link: cta_link || null,
        coupon_id: coupon_id || null,
        locations: locations || ['home_hero'],
        priority: priority || 10,
        style_config: style_config || {},
        start_date: start_date || new Date().toISOString(),
        end_date: end_date || null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ success: true, promotion: data }), { 
      status: 201, headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error('Promotion creation error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};

// PUT - Update promotion
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const authClient = createAuthenticatedClient(accessToken, refreshToken);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID de promoción requerido' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Clean up updates object (remove undefined/null if strict update needed, but Supabase handles partial updates well)
    const { error } = await authClient
      .from('promotions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

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

// DELETE - Delete promotion
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const authClient = createAuthenticatedClient(accessToken, refreshToken);
    const { id } = await request.json();

    const { error } = await authClient
      .from('promotions')
      .delete()
      .eq('id', id);

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
