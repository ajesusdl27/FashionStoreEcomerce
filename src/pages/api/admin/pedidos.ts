import type { APIRoute } from 'astro';
import { createAuthenticatedClient, supabaseAdmin } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { sendOrderShipped, sendOrderCancelled } from '@/lib/email';
import { ensureRectifyingDocumentForOrderCancellation } from '@/lib/fiscal-documents';

// UPDATE order status
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    
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


    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create authenticated client for RLS
    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    const user = await validateToken(accessToken);

    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado - requiere permisos de administrador' }), { 
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

      // Get order details before updating
      const { data: order, error: orderError } = await authClient
        .from('orders')
        .select('id, order_number, customer_name, customer_email, shipping_address, shipping_city, shipping_postal_code, shipping_country')
        .eq('id', id)
        .single();

      if (orderError || !order) {
        return new Response(JSON.stringify({ error: 'Pedido no encontrado' }), { 
          status: 404, headers: { 'Content-Type': 'application/json' } 
        });
      }

      // Insert shipment record using service role to bypass RLS
      const { error: shipmentError } = await supabaseAdmin
        .from('order_shipments')
        .upsert({
          order_id: id,
          carrier: tracking.carrier,
          tracking_number: tracking.trackingNumber || null,
          tracking_url: tracking.trackingUrl || null,
          shipped_at: new Date().toISOString()
        }, { onConflict: 'order_id' });

      if (shipmentError) {
        return new Response(JSON.stringify({ error: 'Error al guardar datos de envío' }), { 
          status: 500, headers: { 'Content-Type': 'application/json' } 
        });
      }


      // Update order status using service role to bypass RLS
      const { error: updateError } = await supabaseAdmin
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
        shippingCountry: order.shipping_country
      });

      if (!emailResult.success) {
        // Don't fail the request if email fails, just log it
      }

      return new Response(JSON.stringify({ success: true, emailSent: emailResult.success }), { 
        status: 200, headers: { 'Content-Type': 'application/json' } 
      });
    }

    let orderForCancellation: {
      id: string;
      order_number: number;
      customer_id: string | null;
      customer_name: string;
      customer_email: string;
      total_amount: number;
      status: string;
    } | null = null;

    if (status === 'cancelled') {
      const { data: cancellationOrder } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, customer_id, customer_name, customer_email, total_amount, status')
        .eq('id', id)
        .single();

      if (cancellationOrder) {
        orderForCancellation = cancellationOrder;
      }
    }

    // For non-shipped status updates, use service role to bypass RLS
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Send cancellation email when admin cancels an order
    let emailSent = false;
    if (status === 'cancelled') {
      const order = orderForCancellation;

      if (order) {
        let rectifyingDocument: { id: string; number: string; pdfUrl: string | null; returnId: string } | null = null;

        if (order.status === 'paid' && Number(order.total_amount || 0) > 0) {
          try {
            rectifyingDocument = await ensureRectifyingDocumentForOrderCancellation({
              orderId: order.id,
              refundAmount: Number(order.total_amount),
              requestedBy: 'admin',
              customerUserId: order.customer_id || null,
            });
          } catch (rectifyingError) {
          }
        }

        const emailResult = await sendOrderCancelled({
          orderId: order.id,
          orderNumber: order.order_number,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          reason: 'Cancelado por el administrador',
          refundAmount: Number(order.total_amount || 0),
          rectifyingDocumentNumber: rectifyingDocument?.number,
          rectifyingDocumentUrl: rectifyingDocument?.pdfUrl || undefined,
        });
        emailSent = emailResult.success;
        if (!emailResult.success) {
        }
      }
    }

    return new Response(JSON.stringify({ success: true, emailSent }), { 
      status: 200, headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};
