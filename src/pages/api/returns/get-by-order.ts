import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { validateToken } from '@/lib/auth-utils';

/**
 * GET /api/returns/get-by-order?order_id=xxx
 * Returns the active return (if any) for the specified order
 * Only returns data if the authenticated user owns the order
 */
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Get order_id from query params
    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id');

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'order_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate user authentication
    const accessToken = cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await validateToken(accessToken);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client (only available in server context)
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[API] Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Configuración del servidor incorrecta' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // First verify the user owns this order (orders table doesn't have user_id, only customer_email)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, customer_email')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Pedido no encontrado', debug: orderError?.message }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check ownership by email
    const isOwner = order.customer_email === user.email;

    if (!isOwner) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get active return for this order (not rejected or completed)
    const { data: returnData, error: returnError } = await supabase
      .from('returns')
      .select('id, status, return_label_url, tracking_number, admin_notes')
      .eq('order_id', orderId)
      .not('status', 'in', '(rejected,completed)')
      .maybeSingle();

    if (returnError) {
      console.error('Error fetching return:', returnError);
      return new Response(
        JSON.stringify({ error: 'Error al obtener la devolución' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return the data (can be null if no active return exists)
    return new Response(
      JSON.stringify({ return: returnData }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
