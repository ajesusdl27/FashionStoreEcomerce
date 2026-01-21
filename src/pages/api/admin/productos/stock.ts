import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';

/**
 * API endpoint to update variant stock inline
 * PUT /api/admin/productos/stock
 */
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create authenticated client for RLS
    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { variantId, productId, stock } = await request.json();

    if (!variantId || stock === undefined) {
      return new Response(JSON.stringify({ error: 'variantId y stock son requeridos' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    if (stock < 0) {
      return new Response(JSON.stringify({ error: 'El stock no puede ser negativo' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Update the variant stock
    const { data, error } = await authClient
      .from('product_variants')
      .update({ stock: parseInt(stock) })
      .eq('id', variantId)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      variant: data,
      message: 'Stock actualizado correctamente'
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
