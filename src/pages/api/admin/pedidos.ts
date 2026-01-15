import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { sendOrderShipped } from '@/lib/email';

// UPDATE order status
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

    const { id, status, tracking } = await request.json();

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
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

      // Get order details before updating with items and images
      const { data: order, error: orderError } = await authClient
        .from('orders')
        .select(`
          id, 
          order_number, 
          customer_name, 
          customer_email, 
          shipping_address, 
          shipping_city, 
          shipping_postal_code, 
          shipping_country,
          items:order_items(
            quantity,
            product:products(
              name,
              images:product_images(image_url)
            ),
            variant:product_variants(size)
          )
        `)
        .eq('id', id)
        .single();

      if (orderError || !order) {
        return new Response(JSON.stringify({ error: 'Pedido no encontrado' }), { 
          status: 404, headers: { 'Content-Type': 'application/json' } 
        });
      }

      // Format items for email
      const emailItems = order.items.map((item: any) => ({
        productName: item.product?.name || 'Producto desconocido',
        size: item.variant?.size || 'N/A',
        quantity: item.quantity,
        image_url: item.product?.images?.[0]?.image_url // Get first image
      }));

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
        console.error('Error inserting shipment:', shipmentError);
        return new Response(JSON.stringify({ error: 'Error al guardar datos de envío' }), { 
          status: 500, headers: { 'Content-Type': 'application/json' } 
        });
      }

      // Update order status
      const { error: updateError } = await authClient
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), { 
          status: 400, headers: { 'Content-Type': 'application/json' } 
        });
      }

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
        shippingCountry: order.shipping_country,
        items: emailItems
      });

      if (!emailResult.success) {
        console.warn('Failed to send shipment email:', emailResult.error);
        // Don't fail the request if email fails, just log it
      }

      return new Response(JSON.stringify({ success: true, emailSent: emailResult.success }), { 
        status: 200, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // For non-shipped status updates, just update the status
    const { error } = await authClient
      .from('orders')
      .update({ status })
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
