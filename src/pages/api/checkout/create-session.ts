import type { APIRoute } from 'astro';
import { stripe, FREE_SHIPPING_THRESHOLD, SHIPPING_COST, STOCK_RESERVATION_MINUTES } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  size: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CheckoutRequest {
  items: CartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  couponCode?: string;
}

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const body: CheckoutRequest = await request.json();
    const { items, customerName, customerEmail, customerPhone, shippingAddress, shippingCity, shippingPostalCode, couponCode } = body;

    // Validate required fields
    if (!items?.length || !customerName || !customerEmail || !shippingAddress || !shippingCity || !shippingPostalCode) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calculate subtotal in cents
    const subtotalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
    const shippingCents = subtotalCents >= FREE_SHIPPING_THRESHOLD * 100 ? 0 : SHIPPING_COST;
    
    // Validate coupon if provided
    let validatedCoupon: { id: string; stripeCouponId: string; calculatedDiscount: number } | null = null;
    
    if (couponCode) {
      const { data: couponResult, error: couponError } = await supabase.rpc('validate_coupon', {
        p_code: couponCode,
        p_cart_total: subtotalCents / 100,
        p_customer_email: customerEmail
      });
      
      const result = Array.isArray(couponResult) ? couponResult[0] : couponResult;
      
      if (couponError || !result?.is_valid) {
        return new Response(JSON.stringify({ 
          error: result?.error_message || 'Código promocional no válido' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      validatedCoupon = {
        id: result.coupon_id,
        stripeCouponId: result.stripe_coupon_id,
        calculatedDiscount: result.calculated_discount
      };
    }
    
    // Calculate total (discount will be applied by Stripe)
    const totalCents = subtotalCents + shippingCents;

    // Reserve stock for each item
    const reservedItems: { variantId: string; quantity: number }[] = [];
    
    for (const item of items) {
      const { data: success, error } = await supabase.rpc('reserve_stock', {
        p_variant_id: item.variantId,
        p_quantity: item.quantity
      });

      if (error || !success) {
        // Rollback any already reserved stock
        for (const reserved of reservedItems) {
          await supabase.rpc('restore_stock', {
            p_variant_id: reserved.variantId,
            p_quantity: reserved.quantity
          });
        }
        
        return new Response(JSON.stringify({ 
          error: `Stock insuficiente para ${item.productName} (Talla ${item.size})` 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      reservedItems.push({ variantId: item.variantId, quantity: item.quantity });
    }

    // Create order with items using RPC function (bypasses RLS)
    const orderItemsData = items.map(item => ({
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      price_at_purchase: item.price
    }));

    const { data: orderId, error: orderError } = await supabase.rpc('create_checkout_order', {
      p_customer_name: customerName,
      p_customer_email: customerEmail,
      p_customer_phone: customerPhone || null,
      p_shipping_address: shippingAddress,
      p_shipping_city: shippingCity,
      p_shipping_postal_code: shippingPostalCode,
      p_shipping_country: 'España',
      p_total_amount: totalCents / 100,
      p_stripe_session_id: null, // Will be updated after Stripe session creation
      p_items: orderItemsData
    });

    if (orderError || !orderId) {
      // Rollback stock
      for (const reserved of reservedItems) {
        await supabase.rpc('restore_stock', {
          p_variant_id: reserved.variantId,
          p_quantity: reserved.quantity
        });
      }
      
      console.error('Error creating order:', orderError);
      return new Response(JSON.stringify({ error: 'Error al crear el pedido' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build line items for Stripe
    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: { name: string; description: string; images?: string[] };
        unit_amount: number;
      };
      quantity: number;
    }> = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.productName,
          description: `Talla: ${item.size}`,
          ...(item.imageUrl && { images: [item.imageUrl] })
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }));

    // Add shipping as a line item if not free
    if (shippingCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Gastos de envío',
            description: 'Envío estándar a España'
          },
          unit_amount: SHIPPING_COST
        },
        quantity: 1
      });
    }

    // Calculate session expiration (30 minutes from now - minimum required by Stripe)
    const expiresAt = Math.floor(Date.now() / 1000) + (STOCK_RESERVATION_MINUTES * 60);

    // Create Stripe Checkout session
    // Payment methods are automatically determined from Stripe Dashboard settings
    let session;
    try {
      const sessionConfig: any = {
        mode: 'payment',
        line_items: lineItems,
        success_url: `${url.origin}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url.origin}/checkout/cancelado?order_id=${orderId}`,
        expires_at: expiresAt,
        customer_email: customerEmail,
        metadata: {
          order_id: orderId,
          // Always include coupon_id in metadata, even if empty string for consistency
          coupon_id: validatedCoupon?.id || ''
        },
        locale: 'es',
        billing_address_collection: 'auto'
      };

      // Add Stripe discount if coupon is validated
      if (validatedCoupon) {
        sessionConfig.discounts = [{ coupon: validatedCoupon.stripeCouponId }];
      }

      session = await stripe.checkout.sessions.create(sessionConfig);
    } catch (stripeError) {
      // Stripe session creation failed - rollback stock and delete order
      console.error('Error creating Stripe session:', stripeError);
      
      for (const reserved of reservedItems) {
        await supabase.rpc('restore_stock', {
          p_variant_id: reserved.variantId,
          p_quantity: reserved.quantity
        });
      }
      
      // Delete the orphaned order
      await supabase.from('orders').delete().eq('id', orderId);
      
      return new Response(JSON.stringify({ 
        error: 'Error al conectar con el sistema de pagos. Por favor, inténtalo de nuevo.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', orderId);

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      orderId: orderId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: 'Error procesando el checkout' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
