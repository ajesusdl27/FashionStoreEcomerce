import type { APIRoute } from 'astro';
import { stripe, getShippingConfig, STOCK_RESERVATION_MINUTES } from '@/lib/stripe';
import { supabase, createAuthenticatedClient } from '@/lib/supabase';
import { formatOrderId } from '@/lib/order-utils';
import { validateEmail, validatePostalCode, validateName, validateAddress, validateCity } from '@/lib/validators';

interface CartItem {
  productId: string;
  productName: string;
  variantId: string;
  size: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface AddressData {
  address: string;
  city: string;
  postalCode: string;
  country?: string;
}

interface PaymentIntentRequest {
  items: CartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  // Support both formats: old (string) and new (object)
  shippingAddress: string | AddressData;
  shippingCity?: string;
  shippingPostalCode?: string;
  billingAddress?: string | AddressData;
  couponCode?: string;
}

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  console.log('📱 [MOBILE] Payment Intent request received');
  
  try {
    const body: PaymentIntentRequest = await request.json();
    const { items, customerName, customerEmail, customerPhone, couponCode } = body;

    // Extract shipping address - handle both object and string formats
    let shippingAddress: string;
    let shippingCity: string;
    let shippingPostalCode: string;

    if (typeof body.shippingAddress === 'object') {
      // New format from mobile (object)
      shippingAddress = body.shippingAddress.address;
      shippingCity = body.shippingAddress.city;
      shippingPostalCode = body.shippingAddress.postalCode;
    } else {
      // Old format (individual fields)
      shippingAddress = body.shippingAddress;
      shippingCity = body.shippingCity || '';
      shippingPostalCode = body.shippingPostalCode || '';
    }

    // Get authenticated user if exists
    const user = locals.user;
    const customerId = user?.id || null;
    
    // Create authenticated client for RLS compliance if user is logged in
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;
    const dbClient = customerId ? createAuthenticatedClient(accessToken, refreshToken) : supabase;
    
    if (customerId) {
      console.log(`📱 [MOBILE] Checkout for authenticated user: ${customerId}`);
    }

    // Validate required fields with detailed errors
    const validationErrors: string[] = [];
    
    if (!items?.length) {
      validationErrors.push('El carrito está vacío');
    }
    if (!validateName(customerName)) {
      validationErrors.push('El nombre debe tener al menos 2 caracteres');
    }
    if (!validateEmail(customerEmail)) {
      validationErrors.push('El email no es válido');
    }
    if (!validateAddress(shippingAddress)) {
      validationErrors.push('La dirección debe tener al menos 5 caracteres');
    }
    if (!validateCity(shippingCity)) {
      validationErrors.push('La ciudad no es válida');
    }
    if (!validatePostalCode(shippingPostalCode)) {
      validationErrors.push('El código postal no es válido (debe tener 5 dígitos)');
    }
    
    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({ error: validationErrors[0] }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get shipping configuration from DB
    const shippingConfig = await getShippingConfig();
    const { shippingCostCents, freeShippingThreshold } = shippingConfig;

    // Calculate subtotal in cents
    const subtotalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
    const shippingCents = subtotalCents >= freeShippingThreshold * 100 ? 0 : shippingCostCents;
    
    // Validate coupon if provided
    let validatedCoupon: { id: string; calculatedDiscount: number } | null = null;
    let discountCents = 0;
    
    if (couponCode) {
      const { data: couponResult, error: couponError } = await dbClient.rpc('validate_coupon', {
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
        calculatedDiscount: result.calculated_discount
      };
      discountCents = Math.round(result.calculated_discount * 100);
      console.log(`📱 [MOBILE] Coupon validated: ${couponCode}, discount: ${result.calculated_discount}€`);
    }
    
    // Calculate total (applying discount directly since we're not using Stripe Checkout)
    const totalCents = Math.max(subtotalCents + shippingCents - discountCents, 50); // Minimum 50 cents for Stripe

    // Reserve stock for each item
    const reservedItems: { variantId: string; quantity: number }[] = [];
    
    for (const item of items) {
      const { data: success, error } = await dbClient.rpc('reserve_stock', {
        p_variant_id: item.variantId,
        p_quantity: item.quantity
      });

      if (error || !success) {
        // Rollback any already reserved stock
        for (const reserved of reservedItems) {
          await dbClient.rpc('restore_stock', {
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

    const { data: orderResult, error: orderError } = await dbClient.rpc('create_checkout_order', {
      p_customer_name: customerName,
      p_customer_email: customerEmail,
      p_customer_phone: customerPhone || null,
      p_shipping_address: shippingAddress,
      p_shipping_city: shippingCity,
      p_shipping_postal_code: shippingPostalCode,
      p_shipping_country: 'España',
      p_total_amount: totalCents / 100, // Store in euros
      p_stripe_session_id: null, // Will be updated with Payment Intent ID
      p_items: orderItemsData,
      p_customer_id: customerId,
      // Financial breakdown
      p_subtotal: subtotalCents / 100,
      p_shipping_cost: shippingCents / 100,
      p_discount_amount: discountCents / 100,
      p_coupon_code: couponCode || null,
      p_coupon_id: validatedCoupon?.id || null,
    });

    if (orderError || !orderResult) {
      // Rollback stock
      for (const reserved of reservedItems) {
        await dbClient.rpc('restore_stock', {
          p_variant_id: reserved.variantId,
          p_quantity: reserved.quantity
        });
      }
      
      console.error('📱 [MOBILE] Error creating order:', orderError);
      return new Response(JSON.stringify({ error: 'Error al crear el pedido' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const orderId = orderResult.order_id;
    const orderNumber = orderResult.order_number;
    const formattedOrderId = formatOrderId(orderNumber);
    
    console.log(`📱 [MOBILE] Order created: ${formattedOrderId} (UUID: ${orderId})`);

    // Create or get Stripe Customer
    let stripeCustomerId: string;
    
    try {
      // Search for existing customer by email
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      });
      
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
        console.log(`📱 [MOBILE] Using existing Stripe customer: ${stripeCustomerId}`);
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          phone: customerPhone || undefined,
          metadata: {
            source: 'mobile',
            first_order_id: orderId
          }
        });
        stripeCustomerId = customer.id;
        console.log(`📱 [MOBILE] Created new Stripe customer: ${stripeCustomerId}`);
      }
    } catch (customerError) {
      console.error('📱 [MOBILE] Error with Stripe customer:', customerError);
      // Continue without customer - payment will still work
      stripeCustomerId = '';
    }

    // Create Payment Intent
    let paymentIntent;
    try {
      const paymentIntentConfig: any = {
        amount: totalCents,
        currency: 'eur',
        metadata: {
          order_id: orderId,
          order_number: orderNumber.toString(),
          coupon_id: validatedCoupon?.id || '',
          coupon_code: couponCode || '',
          coupon_discount: validatedCoupon?.calculatedDiscount.toString() || '0',
          source: 'mobile'
        },
        description: `Pedido #${formattedOrderId} - FashionStore Mobile`,
        automatic_payment_methods: {
          enabled: true,
        },
      };
      
      // Add customer if we have one
      if (stripeCustomerId) {
        paymentIntentConfig.customer = stripeCustomerId;
      }
      
      paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);
      console.log(`📱 [MOBILE] Payment Intent created: ${paymentIntent.id}`);
    } catch (stripeError) {
      // Stripe failed - rollback stock and delete order
      console.error('📱 [MOBILE] Error creating Payment Intent:', stripeError);
      
      for (const reserved of reservedItems) {
        await dbClient.rpc('restore_stock', {
          p_variant_id: reserved.variantId,
          p_quantity: reserved.quantity
        });
      }
      
      await dbClient.from('orders').delete().eq('id', orderId);
      
      return new Response(JSON.stringify({ 
        error: 'Error al conectar con el sistema de pagos. Por favor, inténtalo de nuevo.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update order with Payment Intent ID (stored in stripe_session_id column)
    const { error: updateError } = await dbClient
      .from('orders')
      .update({ stripe_session_id: paymentIntent.id })
      .eq('id', orderId);
    
    if (updateError) {
      console.error('📱 [MOBILE] Error updating stripe_session_id:', updateError);
    } else {
      console.log(`📱 [MOBILE] Payment Intent ${paymentIntent.id} linked to order ${formattedOrderId}`);
    }

    // Create Ephemeral Key for flutter_stripe (required for Customer Sheet)
    let ephemeralKey = '';
    if (stripeCustomerId) {
      try {
        const ephemeralKeyResponse = await stripe.ephemeralKeys.create(
          { customer: stripeCustomerId },
          { apiVersion: '2024-06-20' }
        );
        ephemeralKey = ephemeralKeyResponse.secret || '';
        console.log(`📱 [MOBILE] Ephemeral key created for customer`);
      } catch (keyError) {
        console.error('📱 [MOBILE] Error creating ephemeral key:', keyError);
        // Non-critical - payment can still work without saved payment methods
      }
    }

    // Return response for mobile Payment Sheet
    return new Response(JSON.stringify({ 
      paymentIntentClientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey,
      customer: stripeCustomerId,
      orderId: orderId,
      orderNumber: orderNumber
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('📱 [MOBILE] Checkout error:', error);
    return new Response(JSON.stringify({ error: 'Error procesando el checkout' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
