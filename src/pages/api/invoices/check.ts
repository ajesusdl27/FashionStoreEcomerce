import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@/lib/supabase';

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

    // Obtener usuario del token (funciona con cookies y Authorization header)
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Auth error in invoice check:', authError);
      return new Response(JSON.stringify({ invoice: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar que el pedido pertenece al usuario (usar admin para bypass RLS)
    const { data: order } = await supabaseAdmin
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

    // Buscar factura existente (usar admin para bypass RLS)
    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('id, order_id, invoice_number, customer_nif, customer_fiscal_name, customer_fiscal_address, subtotal, tax_rate, tax_amount, total, pdf_url, created_at')
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
