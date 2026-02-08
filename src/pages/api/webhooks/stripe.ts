import type { APIRoute } from 'astro';
import { stripe } from '@/lib/stripe';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { sendOrderConfirmation, sendOrderCancelled, sendAdminOrderNotification } from '@/lib/email';
import { formatOrderId } from '@/lib/order-utils';
import type Stripe from 'stripe';

const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
  console.log('🔔 [WEBHOOK] Stripe webhook received');
  console.log('🔔 [WEBHOOK] STRIPE_WEBHOOK_SECRET configured:', webhookSecret ? 'YES' : 'NO');
  
  if (!webhookSecret) {
    console.error('🔔 [WEBHOOK] ❌ Missing STRIPE_WEBHOOK_SECRET');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Get the raw body as buffer for signature verification
  const rawBody = await request.arrayBuffer();
  const body = new TextDecoder().decode(rawBody);
  const signature = request.headers.get('stripe-signature');
  console.log('🔔 [WEBHOOK] Signature present:', signature ? 'YES' : 'NO');

  if (!signature) {
    console.error('🔔 [WEBHOOK] ❌ Missing stripe-signature header');
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('🔔 [WEBHOOK] ✅ Signature verified successfully');
    console.log('🔔 [WEBHOOK] Event type:', event.type);
  } catch (err) {
    console.error('🔔 [WEBHOOK] ❌ Signature verification failed:', err);
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
      console.log(`🔔 [WEBHOOK] 💳 Processing payment for order: ${displayId} (UUID: ${orderId})`);
      console.log('🔔 [WEBHOOK] Session ID:', session.id);
      console.log('🔔 [WEBHOOK] Payment status:', session.payment_status);

      // Idempotency check: verify if order was already processed
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      let isNewPayment = false;

      if (existingOrder?.status !== 'paid') {
        console.log('🔔 [WEBHOOK] Current order status:', existingOrder?.status || 'NOT FOUND');
        console.log('🔔 [WEBHOOK] Attempting to update order status to "paid"...');
        
        // Update order status to paid using RPC function
        const { error } = await supabase.rpc('update_order_status', {
          p_stripe_session_id: session.id,
          p_status: 'paid'
        });

        if (error) {
          console.error('🔔 [WEBHOOK] ❌ Error updating order status:', error);
          console.error('🔔 [WEBHOOK] Error details:', JSON.stringify(error, null, 2));
        } else {
          console.log(`🔔 [WEBHOOK] ✅ Order ${displayId} marked as paid`);
          isNewPayment = true;
        }

        // Update total_amount with Stripe's actual charged amount (reflects coupon discount)
        if (session.amount_total != null) {
          const stripeFinalAmount = session.amount_total / 100;
          const { error: totalError } = await supabaseAdmin
            .from('orders')
            .update({ total_amount: stripeFinalAmount })
            .eq('id', orderId);
          if (totalError) {
            console.error('🔔 [WEBHOOK] ❌ Error updating total_amount:', totalError);
          } else {
            console.log(`🔔 [WEBHOOK] ✅ Order total_amount updated to ${stripeFinalAmount} (Stripe amount_total)`);
          }
        }
      } else {
        console.log(`🔔 [WEBHOOK] ℹ️ Order ${displayId} already marked as paid - checking side effects`);
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
      console.log('🔔 [WEBHOOK] isNewPayment:', isNewPayment);
      if (isNewPayment) {
        console.log('🔔 [WEBHOOK] 📧 Preparing to send confirmation email...');
        try {
          // Fetch order details using service role client (bypasses RLS)
          console.log('🔔 [WEBHOOK] Using supabaseAdmin to fetch order (bypasses RLS)');
          const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*, order_number')
            .eq('id', orderId)
            .single();
          
          if (orderError || !order) {
            console.error('Error fetching order for email:', orderError);
            break;
          }
          
          // Fetch order items with product details using service role
          const { data: items, error: itemsError } = await supabaseAdmin
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

          // Get coupon data directly from Stripe session (more reliable than DB lookups)
          let couponData: { couponCode: string; discountAmount: number } | undefined;
          if (couponId && couponId.trim() !== '') {
            // Get discount amount from Stripe session (source of truth)
            const stripeDiscount = session.total_details?.amount_discount
              ? session.total_details.amount_discount / 100
              : Number(session.metadata?.coupon_discount || 0);
            // Get coupon code from metadata, or lookup from coupons table directly
            let code = session.metadata?.coupon_code || '';
            if (!code) {
              try {
                const { data: couponRow } = await supabaseAdmin
                  .from('coupons')
                  .select('code')
                  .eq('id', couponId)
                  .single();
                code = couponRow?.code || '';
              } catch (e) { /* fallback: no code */ }
            }
            if (code && stripeDiscount > 0) {
              couponData = { couponCode: code, discountAmount: stripeDiscount };
            }
          }
          
          // Use Stripe's amount_total as source of truth for the final charged amount
          const emailTotalAmount = session.amount_total != null
            ? session.amount_total / 100
            : Number(order.total_amount);
          
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
            totalAmount: emailTotalAmount,
            items: emailItems,
            ...(couponData || {}),
          });
          
          if (emailResult.success) {
            console.log(`🔔 [WEBHOOK] ✅ Confirmation email sent to ${order.customer_email}`);
          } else {
            console.error('🔔 [WEBHOOK] ❌ Failed to send confirmation email:', emailResult.error);
          }

          // Send admin notification (non-blocking)
          console.log('🔔 [WEBHOOK] 📧 Sending admin notification...');
          sendAdminOrderNotification({
            orderId: order.id,
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            totalAmount: Number(order.total_amount),
            items: emailItems,
            shippingCity: order.shipping_city,
            shippingAddress: order.shipping_address,
          }).then(result => {
            if (result.success) {
              console.log('🔔 [WEBHOOK] ✅ Admin order notification sent');
            } else {
              console.error('🔔 [WEBHOOK] ❌ Failed to send admin notification:', result.error);
            }
          }).catch(err => console.error('🔔 [WEBHOOK] ❌ Exception sending admin notification:', err));

        } catch (emailError) {
          console.error('🔔 [WEBHOOK] ❌ Exception sending confirmation email:', emailError);
          // Don't break - order is already paid, email failure is non-critical
        }
      } else {
        console.log('🔔 [WEBHOOK] ℹ️ Skipping email (not a new payment)');
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

    // ==========================================
    // MOBILE PAYMENT HANDLERS (Payment Intents)
    // ==========================================
    
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const paymentIntentId = paymentIntent.id;
      
      console.log(`📱 [WEBHOOK] Payment Intent succeeded: ${paymentIntentId}`);
      console.log('📱 [WEBHOOK] Metadata:', JSON.stringify(paymentIntent.metadata));
      
      // Get order by Payment Intent ID (stored in stripe_session_id with pi_ prefix)
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('id, status, customer_email, customer_name, order_number')
        .eq('stripe_session_id', paymentIntentId)
        .single();
      
      if (orderError || !order) {
        console.error('📱 [WEBHOOK] ❌ Order not found for Payment Intent:', paymentIntentId);
        console.error('📱 [WEBHOOK] Error:', orderError);
        break;
      }
      
      const displayId = formatOrderId(order.order_number);
      console.log(`📱 [WEBHOOK] Found order: ${displayId} (UUID: ${order.id})`);
      
      // Idempotency check
      if (order.status === 'paid') {
        console.log(`📱 [WEBHOOK] ℹ️ Order ${displayId} already marked as paid - skipping`);
        break;
      }
      
      // Update order status to paid
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', order.id);
      
      if (updateError) {
        console.error('📱 [WEBHOOK] ❌ Error updating order status:', updateError);
        break;
      }
      
      console.log(`📱 [WEBHOOK] ✅ Order ${displayId} marked as paid`);
      
      // Record coupon usage if present in metadata
      const couponId = paymentIntent.metadata?.coupon_id;
      if (couponId && couponId.trim() !== '') {
        const customerEmail = order.customer_email;
        
        const { error: couponError } = await supabase.rpc('use_coupon', {
          p_coupon_id: couponId,
          p_customer_email: customerEmail,
          p_order_id: order.id
        });
        
        if (couponError && couponError.code !== '23505') {
          console.error('📱 [WEBHOOK] Error recording coupon usage:', couponError);
        } else {
          console.log(`📱 [WEBHOOK] ✅ Coupon ${couponId} usage recorded`);
        }
      }
      
      // Send confirmation email
      console.log('📱 [WEBHOOK] 📧 Preparing to send confirmation email...');
      try {
        // Fetch order items with product details
        const { data: items, error: itemsError } = await supabaseAdmin
          .from('order_items')
          .select(`
            quantity,
            price_at_purchase,
            products:product_id (name),
            product_variants:variant_id (size)
          `)
          .eq('order_id', order.id);
        
        if (itemsError) {
          console.error('📱 [WEBHOOK] Error fetching order items:', itemsError);
          break;
        }
        
        // Get full order details for email
        const { data: fullOrder } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('id', order.id)
          .single();
        
        // Format items for email
        const emailItems = (items || []).map(item => {
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
          return {
            productName: product?.name || 'Producto',
            size: variant?.size || '-',
            quantity: item.quantity,
            price: Number(item.price_at_purchase)
          };
        });

        // Get coupon data directly from metadata + coupons table (more reliable than coupon_usages)
        let couponData2: { couponCode: string; discountAmount: number } | undefined;
        if (couponId && couponId.trim() !== '') {
          const metaDiscount = Number(paymentIntent.metadata?.coupon_discount || 0);
          let code = paymentIntent.metadata?.coupon_code || '';
          if (!code) {
            try {
              const { data: couponRow } = await supabaseAdmin
                .from('coupons')
                .select('code')
                .eq('id', couponId)
                .single();
              code = couponRow?.code || '';
            } catch (e) { /* fallback: no code */ }
          }
          if (code && metaDiscount > 0) {
            couponData2 = { couponCode: code, discountAmount: metaDiscount };
          }
        }
        
        // Use Stripe payment amount as source of truth
        const piTotalAmount = paymentIntent.amount != null
          ? paymentIntent.amount / 100
          : Number(fullOrder?.total_amount || 0);
        
        const emailResult = await sendOrderConfirmation({
          orderId: order.id,
          orderNumber: order.order_number,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          shippingAddress: fullOrder?.shipping_address || '',
          shippingCity: fullOrder?.shipping_city || '',
          shippingPostalCode: fullOrder?.shipping_postal_code || '',
          shippingCountry: fullOrder?.shipping_country || 'España',
          totalAmount: piTotalAmount,
          items: emailItems,
          ...(couponData2 || {}),
        });
        
        if (emailResult.success) {
          console.log(`📱 [WEBHOOK] ✅ Confirmation email sent to ${order.customer_email}`);
        } else {
          console.error('📱 [WEBHOOK] ❌ Failed to send email:', emailResult.error);
        }

        // Send admin notification (non-blocking)
        console.log('📱 [WEBHOOK] 📧 Sending admin notification...');
        sendAdminOrderNotification({
          orderId: order.id,
          orderNumber: order.order_number,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          totalAmount: Number(fullOrder?.total_amount || 0),
          items: emailItems,
          shippingCity: fullOrder?.shipping_city,
          shippingAddress: fullOrder?.shipping_address,
        }).then(result => {
          if (result.success) {
            console.log('📱 [WEBHOOK] ✅ Admin order notification sent');
          } else {
            console.error('📱 [WEBHOOK] ❌ Failed to send admin notification:', result.error);
          }
        }).catch(err => console.error('📱 [WEBHOOK] ❌ Exception sending admin notification:', err));

      } catch (emailError) {
        console.error('📱 [WEBHOOK] ❌ Exception sending email:', emailError);
        // Non-critical, order is already paid
      }
      
      break;
    }
    
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const paymentIntentId = paymentIntent.id;
      const failureMessage = paymentIntent.last_payment_error?.message || 'Unknown error';
      
      console.log(`📱 [WEBHOOK] ❌ Payment Intent failed: ${paymentIntentId}`);
      console.log(`📱 [WEBHOOK] Failure reason: ${failureMessage}`);
      
      // Get order by Payment Intent ID
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('id, status, order_number')
        .eq('stripe_session_id', paymentIntentId)
        .single();
      
      if (orderError || !order) {
        console.error('📱 [WEBHOOK] Order not found for failed Payment Intent:', paymentIntentId);
        break;
      }
      
      const displayId = formatOrderId(order.order_number);
      console.log(`📱 [WEBHOOK] Found order: ${displayId}`);
      
      // Only process if order is still pending
      if (order.status !== 'pending') {
        console.log(`📱 [WEBHOOK] ℹ️ Order ${displayId} status is ${order.status} - skipping`);
        break;
      }
      
      // Get order items to restore stock
      const { data: orderItems, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select('variant_id, quantity')
        .eq('order_id', order.id);
      
      if (itemsError) {
        console.error('📱 [WEBHOOK] Error fetching order items:', itemsError);
      } else {
        // Restore stock for each item
        for (const item of orderItems || []) {
          const { error: restoreError } = await supabase.rpc('restore_stock', {
            p_variant_id: item.variant_id,
            p_quantity: item.quantity
          });
          
          if (restoreError) {
            console.error(`📱 [WEBHOOK] Error restoring stock for variant ${item.variant_id}:`, restoreError);
          }
        }
        console.log(`📱 [WEBHOOK] ✅ Stock restored for order ${displayId}`);
      }
      
      // Update order status to payment_failed
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'payment_failed' })
        .eq('id', order.id);
      
      if (updateError) {
        console.error('📱 [WEBHOOK] Error updating order status:', updateError);
      } else {
        console.log(`📱 [WEBHOOK] ✅ Order ${displayId} marked as payment_failed`);
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
