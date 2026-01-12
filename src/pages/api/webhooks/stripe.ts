import type { APIRoute } from 'astro';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
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

      // Update order status to paid using RPC function
      const { error } = await supabase.rpc('update_order_status', {
        p_stripe_session_id: session.id,
        p_status: 'paid'
      });

      if (error) {
        console.error('Error updating order status:', error);
      } else {
        console.log(`Order ${orderId} marked as paid`);
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
