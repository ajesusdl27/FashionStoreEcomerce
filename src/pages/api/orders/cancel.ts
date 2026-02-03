import type { APIRoute } from 'astro';
import { stripe } from '@/lib/stripe';
import { createAuthenticatedClient } from '@/lib/supabase';
import { sendOrderCancelled } from '@/lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get authenticated user - support both cookies (web) and Authorization header (mobile)
    let accessToken = cookies.get('sb-access-token')?.value;
    let refreshToken = cookies.get('sb-refresh-token')?.value;

    // If no cookie, try Authorization header (for mobile apps)
    if (!accessToken) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
        refreshToken = undefined; // Mobile apps don't send refresh token in header
      }
    }

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createAuthenticatedClient(accessToken, refreshToken);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Usuario no válido' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { orderId, reason } = await request.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'ID de pedido requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get order and verify ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, customer_id, customer_name, customer_email, status, stripe_session_id, total_amount')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Pedido no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify customer owns this order (check by customer_id OR email)
    const ownsOrder = order.customer_id 
      ? order.customer_id === user.id 
      : order.customer_email === user.email;
    
    if (!ownsOrder) {
      return new Response(JSON.stringify({ error: 'No tienes permiso para cancelar este pedido' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify order can be cancelled (only 'paid' status allowed)
    if (order.status !== 'paid') {
      let errorMessage = 'No se puede cancelar el pedido';
      
      if (order.status === 'shipped' || order.status === 'delivered') {
        errorMessage = 'El pedido ya ha sido enviado. Si deseas devolverlo, utiliza el proceso de devolución.';
      } else if (order.status === 'cancelled') {
        errorMessage = 'Este pedido ya está cancelado';
      } else if (order.status === 'pending') {
        errorMessage = 'El pedido aún no ha sido pagado. No es necesario cancelarlo.';
      }
      
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Process refund via Stripe
    let refundSuccessful = false;
    let refundAmount = 0;

    if (order.stripe_session_id) {
      try {
        // Retrieve the checkout session to get payment intent
        const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
        
        if (session.payment_intent) {
          const paymentIntentId = typeof session.payment_intent === 'string' 
            ? session.payment_intent 
            : session.payment_intent.id;
          
          // Create full refund
          const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            reason: 'requested_by_customer',
          });
          
          refundSuccessful = refund.status === 'succeeded' || refund.status === 'pending';
          refundAmount = (refund.amount || 0) / 100; // Convert from cents
          
          console.log(`Refund ${refund.id} created for order ${orderId}: ${refundAmount}€`);
        }
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError);
        // Continue with cancellation even if refund fails
        // The admin can process it manually later
      }
    }

    // Get order items for stock restoration
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId);

    // Restore stock for each item
    if (orderItems && !itemsError) {
      for (const item of orderItems) {
        await supabase.rpc('restore_stock', {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity
        });
      }
      console.log(`Stock restored for ${orderItems.length} items`);
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        refunded_amount: refundSuccessful ? refundAmount : null
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return new Response(JSON.stringify({ error: 'Error al actualizar el pedido' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send cancellation email
    try {
      await sendOrderCancelled({
        orderId: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        reason: reason || 'Cancelación solicitada por el cliente',
      });
      console.log(`Cancellation email sent to ${order.customer_email}`);
    } catch (emailError) {
      console.warn('Failed to send cancellation email:', emailError);
    }

    return new Response(JSON.stringify({ 
      success: true,
      refunded: refundSuccessful,
      refundAmount,
      message: refundSuccessful 
        ? `Pedido cancelado. Se te reembolsarán ${refundAmount.toFixed(2)}€ en los próximos 5-10 días hábiles.`
        : 'Pedido cancelado. El reembolso se procesará manualmente en breve.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Order cancellation error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
