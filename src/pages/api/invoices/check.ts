import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const GET: APIRoute = async ({ url, cookies, request }) => {
  const orderId = url.searchParams.get('orderId');

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'orderId requerido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Verificar autenticación - soporte para cookies (web) y Authorization header (móvil)
    let accessToken = cookies.get('sb-access-token')?.value;
    let refreshToken = cookies.get('sb-refresh-token')?.value;

    // Si no hay cookie, intentar con Authorization header (para móvil)
    if (!accessToken) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
        refreshToken = undefined; // Mobile apps don't send refresh token in header
      }
    }

    if (!accessToken) {
      return new Response(JSON.stringify({ invoice: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (authError || !user) {
      return new Response(JSON.stringify({ invoice: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar que el pedido pertenece al usuario
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .eq('customer_email', user.email)
      .single();

    if (!order) {
      return new Response(JSON.stringify({ invoice: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buscar factura existente
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, invoice_number, pdf_url')
      .eq('order_id', orderId)
      .single();

    return new Response(JSON.stringify({ invoice: invoice || null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error checking invoice:', error);
    return new Response(JSON.stringify({ invoice: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
