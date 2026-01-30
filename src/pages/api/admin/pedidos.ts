import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { sendOrderShipped } from '@/lib/email';

// UPDATE order status
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('🔐 [ADMIN PEDIDOS] Starting PUT request');
    
    // Read token from Authorization header (Flutter/mobile) or cookies (web)
    let accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    let refreshToken: string | undefined;
    let tokenSource = 'header';

    if (!accessToken) {
      // Fallback to cookies for web client
      tokenSource = 'cookies';
      accessToken = cookies.get('sb-access-token')?.value;
      refreshToken = cookies.get('sb-refresh-token')?.value;
    }

    console.log('🔐 [ADMIN PEDIDOS] Token source:', tokenSource);
    console.log('🔐 [ADMIN PEDIDOS] Access token present:', !!accessToken);
    console.log('🔐 [ADMIN PEDIDOS] Refresh token present:', !!refreshToken);

    if (!accessToken) {
      console.log('❌ [ADMIN PEDIDOS] No access token found');
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create authenticated client for RLS
    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    console.log('🔐 [ADMIN PEDIDOS] Validating token...');
    const user = await validateToken(accessToken);
    console.log('🔐 [ADMIN PEDIDOS] User validated:', !!user);
    console.log('🔐 [ADMIN PEDIDOS] User metadata:', user?.user_metadata);
    console.log('🔐 [ADMIN PEDIDOS] Is admin:', user?.user_metadata?.is_admin);

    if (!user?.user_metadata?.is_admin) {
      console.log('❌ [ADMIN PEDIDOS] User is not admin');
      return new Response(JSON.stringify({ error: 'No autorizado - requiere permisos de administrador' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    console.log('✅ [ADMIN PEDIDOS] User is admin, proceeding with request');

    const { id, status, tracking } = await request.json();
    console.log('📦 [ADMIN PEDIDOS] Request data:', { id, status, tracking });

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      console.log('❌ [ADMIN PEDIDOS] Invalid status:', status);
      return new Response(JSON.stringify({ error: 'Estado inválido' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // If shipping, validate carrier is provided
    if (status === 'shipped') {
      if (!tracking?.carrier) {
        return new Response(JSON.stringify({ error: 'Debes especificar el transportista' }), { 
          status: 400, headers: { 'Content-Type': 'application/json' } 
        });
      }

      console.log('📦 [ADMIN PEDIDOS] Fetching order details for shipment...');
      // Get order details before updating
      const { data: order, error: orderError } = await authClient
        .from('orders')
        .select('id, order_number, customer_name, customer_email, shipping_address, shipping_city, shipping_postal_code, shipping_country')
        .eq('id', id)
        .single();

      if (orderError || !order) {
        console.log('❌ [ADMIN PEDIDOS] Order not found or error:', orderError);
        return new Response(JSON.stringify({ error: 'Pedido no encontrado' }), { 
          status: 404, headers: { 'Content-Type': 'application/json' } 
        });
      }

      console.log('✅ [ADMIN PEDIDOS] Order found:', order.order_number);
      console.log('📦 [ADMIN PEDIDOS] Upserting shipment record...');
      // Insert shipment record
      const { error: shipmentError } = await authClient
        .from('order_shipments')
        .upsert({
          order_id: id,
          carrier: tracking.carrier,
          tracking_number: tracking.trackingNumber || null,
          tracking_url: tracking.trackingUrl || null,
          shipped_at: new Date().toISOString()
        }, { onConflict: 'order_id' });

      if (shipmentError) {
        console.error('❌ [ADMIN PEDIDOS] Error inserting shipment:', shipmentError);
        return new Response(JSON.stringify({ error: 'Error al guardar datos de envío' }), { 
          status: 500, headers: { 'Content-Type': 'application/json' } 
        });
      }

      console.log('✅ [ADMIN PEDIDOS] Shipment record saved');
      console.log('📦 [ADMIN PEDIDOS] Updating order status...');

      // Update order status
      const { error: updateError } = await authClient
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (updateError) {
        console.error('❌ [ADMIN PEDIDOS] Error updating order status:', updateError);
        return new Response(JSON.stringify({ error: updateError.message }), { 
          status: 400, headers: { 'Content-Type': 'application/json' } 
        });
      }

      console.log('✅ [ADMIN PEDIDOS] Order status updated');

      // Send shipment email
      const emailResult = await sendOrderShipped({
        orderId: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        carrier: tracking.carrier,
        trackingNumber: tracking.trackingNumber,
        trackingUrl: tracking.trackingUrl,
        shippingAddress: order.shipping_address,
        shippingCity: order.shipping_city,
        shippingPostalCode: order.shipping_postal_code,
        shippingCountry: order.shipping_country
      });

      if (!emailResult.success) {
        console.warn('Failed to send shipment email:', emailResult.error);
        // Don't fail the request if email fails, just log it
      }

      return new Response(JSON.stringify({ success: true, emailSent: emailResult.success }), { 
        status: 200, headers: { 'Content-Type': 'application/json' } 
      });
    }

    console.log('📦 [ADMIN PEDIDOS] Updating order status (non-shipped)...');
    // For non-shipped status updates, just update the status
    const { error } = await authClient
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('❌ [ADMIN PEDIDOS] Error updating order:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    console.log('✅ [ADMIN PEDIDOS] Order updated successfully');
    return new Response(JSON.stringify({ success: true }), { 
      status: 200, headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error('❌ [ADMIN PEDIDOS] Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};
