import type { APIRoute } from 'astro';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { sendOrderConfirmation, sendOrderCancelled } from '@/lib/email';
import { formatOrderId } from '@/lib/order-utils';
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
      const orderNumber = session.metadata?.order_number;

      if (!orderId) {
        console.error('No order_id in session metadata');
        break;
      }

      // Log con formato legible
      const displayId = orderNumber ? formatOrderId(Number(orderNumber)) : `#${orderId.slice(0, 8)}`;
      console.log(`Processing payment for order: ${displayId} (UUID: ${orderId})`);

      // Idempotency check: verify if order was already processed
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      let isNewPayment = false;

      if (existingOrder?.status !== 'paid') {
        // Update order status to paid using RPC function
        const { error } = await supabase.rpc('update_order_status', {
          p_stripe_session_id: session.id,
          p_status: 'paid'
        });

        if (error) {
          console.error('Error updating order status:', error);
        } else {
          console.log(`Order ${displayId} marked as paid`);
          isNewPayment = true;
        }
      } else {
        console.log(`Order ${displayId} already marked as paid - checking side effects`);
      }

      // Record coupon usage if present (regardless of whether we just updated the status or it was already paid)
      // The unique constraint on coupon_usages(coupon_id, customer_email, order_id) handles idempotency
      const couponId = session.metadata?.coupon_id;
      if (couponId && couponId.trim() !== '') {
        const customerEmail = session.customer_details?.email || session.customer_email || '';
        
        if (!customerEmail) {
          console.error(`Cannot record coupon usage: missing customer email for order ${orderId}`);
        } else {
          // We use a separate try/catch block or just handle the error to avoid crashing the whole webhook if this fails (e.g. already recorded)
          const { data: couponUsed, error: couponError } = await supabase.rpc('use_coupon', {
            p_coupon_id: couponId,
            p_customer_email: customerEmail,
            p_order_id: orderId
          });

          if (couponError) {
            // Ignore unique constraint errors (code 23505 in Postgres) which mean it was already recorded
            if (couponError.code === '23505') {
              console.log(`Coupon ${couponId} already recorded for order ${orderId}`);
            } else {
              // Log detailed error information for debugging
              console.error('Error recording coupon usage:', {
                couponId,
                orderId,
                customerEmail,
                errorCode: couponError.code,
                errorMessage: couponError.message,
                errorDetails: couponError.details,
                errorHint: couponError.hint
              });
            }
          } else if (couponUsed === false) {
            // Function returned FALSE (validation failed)
            console.error(`Coupon ${couponId} validation failed for order ${orderId}`);
          } else {
            console.log(`Coupon ${couponId} usage recorded successfully for order ${orderId}`);
          }
        }
      }
      
      // Send order confirmation email only if we just marked it as paid (to avoid duplicate emails)
      // OR if we want to be safe, we could check if an email was sent, but we don't track that easily.
      // The success page also sends emails. To be safe, we usually prefer the webhook to be the source of truth, 
      // but if the success page beat us, the user might get two emails if we are not careful.
      // However, the success page checks `!wasAlreadyPaid` before sending.
      // If the webhook runs AFTER success page, `isNewPayment` will be false, so we SKIP email.
      // If the webhook runs BEFORE success page, `isNewPayment` will be true, so we SEND email.
      // This seems correct to prevent duplicates.
      if (isNewPayment) {
        try {
          // Fetch order details
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*, order_number')
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
            orderNumber: order.order_number,
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
        
        // Send expiration notification email to customer
        try {
          const { data: order } = await supabase
            .from('orders')
            .select('customer_email, customer_name, order_number')
            .eq('id', orderId)
            .single();
          
          if (order?.customer_email) {
            await sendOrderCancelled({
              orderId,
              orderNumber: order.order_number,
              customerName: order.customer_name,
              customerEmail: order.customer_email,
              reason: 'El tiempo para completar el pago ha expirado (30 minutos)'
            });
            console.log(`Expiration email sent to ${order.customer_email}`);
          }
        } catch (emailError) {
          console.error('Error sending expiration email:', emailError);
          // Non-critical, don't break
        }
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
