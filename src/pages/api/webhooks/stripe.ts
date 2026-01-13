import type { APIRoute } from 'astro';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { sendOrderConfirmation } from '@/lib/email';
import type Stripe from 'stripe';

const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Get the raw body as buffer for signature verification
  const rawBody = await request.arrayBuffer();
  const body = new TextDecoder().decode(rawBody);
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        console.error('No order_id in session metadata');
        break;
      }

      // Idempotency check: verify if order was already processed
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (existingOrder?.status === 'paid') {
        console.log(`Order ${orderId} already marked as paid - skipping (idempotency)`);
        break;
      }

      // Update order status to paid using RPC function
      const { error } = await supabase.rpc('update_order_status', {
        p_stripe_session_id: session.id,
        p_status: 'paid'
      });

      if (error) {
        console.error('Error updating order status:', error);
      } else {
        console.log(`Order ${orderId} marked as paid`);
        
        // Send order confirmation email
        try {
          // Fetch order details
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
          
          if (orderError || !order) {
            console.error('Error fetching order for email:', orderError);
            break;
          }
          
          // Fetch order items with product details
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              quantity,
              price_at_purchase,
              products:product_id (name),
              product_variants:variant_id (size)
            `)
            .eq('order_id', orderId);
          
          if (itemsError) {
            console.error('Error fetching order items for email:', itemsError);
            break;
          }
          
          // Format items for email
          const emailItems = (items || []).map(item => {
            // Supabase returns relations as arrays, get first element
            const product = Array.isArray(item.products) ? item.products[0] : item.products;
            const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
            return {
              productName: product?.name || 'Producto',
              size: variant?.size || '-',
              quantity: item.quantity,
              price: Number(item.price_at_purchase)
            };
          });
          
          // Send confirmation email
          const emailResult = await sendOrderConfirmation({
            orderId: order.id,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            shippingAddress: order.shipping_address,
            shippingCity: order.shipping_city,
            shippingPostalCode: order.shipping_postal_code,
            shippingCountry: order.shipping_country || 'España',
            totalAmount: Number(order.total_amount),
            items: emailItems
          });
          
          if (emailResult.success) {
            console.log(`Confirmation email sent to ${order.customer_email}`);
          } else {
            console.error('Failed to send confirmation email:', emailResult.error);
          }
        } catch (emailError) {
          console.error('Exception sending confirmation email:', emailError);
          // Don't break - order is already paid, email failure is non-critical
        }
      }

      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        console.error('No order_id in session metadata');
        break;
      }

      // Get order items to restore stock using RPC function
      const { data: orderItems, error: itemsError } = await supabase.rpc('get_order_items', {
        p_order_id: orderId
      });

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        break;
      }

      // Restore stock for each item
      for (const item of orderItems || []) {
        const { error: restoreError } = await supabase.rpc('restore_stock', {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity
        });

        if (restoreError) {
          console.error(`Error restoring stock for variant ${item.variant_id}:`, restoreError);
        }
      }

      // Update order status to cancelled using RPC function
      const { error: updateError } = await supabase.rpc('update_order_status', {
        p_stripe_session_id: session.id,
        p_status: 'cancelled'
      });

      if (updateError) {
        console.error('Error updating order status to cancelled:', updateError);
      } else {
        console.log(`Order ${orderId} cancelled and stock restored`);
      }

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
