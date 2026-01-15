import { F as FREE_SHIPPING_THRESHOLD, S as SHIPPING_COST, a as STOCK_RESERVATION_MINUTES, s as stripe } from '../../../chunks/stripe_B3_Fgp7U.mjs';
import { s as supabase } from '../../../chunks/supabase_COljrJv9.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, url }) => {
  try {
    const body = await request.json();
    const { items, customerName, customerEmail, customerPhone, shippingAddress, shippingCity, shippingPostalCode, couponCode } = body;
    if (!items?.length || !customerName || !customerEmail || !shippingAddress || !shippingCity || !shippingPostalCode) {
      return new Response(JSON.stringify({ error: "Faltan campos requeridos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const subtotalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
    const shippingCents = subtotalCents >= FREE_SHIPPING_THRESHOLD * 100 ? 0 : SHIPPING_COST;
    let validatedCoupon = null;
    if (couponCode) {
      const { data: couponResult, error: couponError } = await supabase.rpc("validate_coupon", {
        p_code: couponCode,
        p_cart_total: subtotalCents / 100,
        p_customer_email: customerEmail
      });
      const result = Array.isArray(couponResult) ? couponResult[0] : couponResult;
      if (couponError || !result?.is_valid) {
        return new Response(JSON.stringify({
          error: result?.error_message || "Código promocional no válido"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      validatedCoupon = {
        id: result.coupon_id,
        stripeCouponId: result.stripe_coupon_id,
        calculatedDiscount: result.calculated_discount
      };
    }
    const totalCents = subtotalCents + shippingCents;
    const reservedItems = [];
    for (const item of items) {
      const { data: success, error } = await supabase.rpc("reserve_stock", {
        p_variant_id: item.variantId,
        p_quantity: item.quantity
      });
      if (error || !success) {
        for (const reserved of reservedItems) {
          await supabase.rpc("restore_stock", {
            p_variant_id: reserved.variantId,
            p_quantity: reserved.quantity
          });
        }
        return new Response(JSON.stringify({
          error: `Stock insuficiente para ${item.productName} (Talla ${item.size})`
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      reservedItems.push({ variantId: item.variantId, quantity: item.quantity });
    }
    const orderItemsData = items.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      price_at_purchase: item.price
    }));
    const { data: orderId, error: orderError } = await supabase.rpc("create_checkout_order", {
      p_customer_name: customerName,
      p_customer_email: customerEmail,
      p_customer_phone: customerPhone || null,
      p_shipping_address: shippingAddress,
      p_shipping_city: shippingCity,
      p_shipping_postal_code: shippingPostalCode,
      p_shipping_country: "España",
      p_total_amount: totalCents / 100,
      p_stripe_session_id: null,
      // Will be updated after Stripe session creation
      p_items: orderItemsData
    });
    if (orderError || !orderId) {
      for (const reserved of reservedItems) {
        await supabase.rpc("restore_stock", {
          p_variant_id: reserved.variantId,
          p_quantity: reserved.quantity
        });
      }
      console.error("Error creating order:", orderError);
      return new Response(JSON.stringify({ error: "Error al crear el pedido" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.productName,
          description: `Talla: ${item.size}`,
          ...item.imageUrl && { images: [item.imageUrl] }
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }));
    if (shippingCents > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Gastos de envío",
            description: "Envío estándar a España"
          },
          unit_amount: SHIPPING_COST
        },
        quantity: 1
      });
    }
    const expiresAt = Math.floor(Date.now() / 1e3) + STOCK_RESERVATION_MINUTES * 60;
    let session;
    try {
      const sessionConfig = {
        mode: "payment",
        line_items: lineItems,
        success_url: `${url.origin}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url.origin}/checkout/cancelado?order_id=${orderId}`,
        expires_at: expiresAt,
        customer_email: customerEmail,
        metadata: {
          order_id: orderId,
          // Always include coupon_id in metadata, even if empty string for consistency
          coupon_id: validatedCoupon?.id || ""
        },
        locale: "es",
        billing_address_collection: "auto"
      };
      if (validatedCoupon) {
        sessionConfig.discounts = [{ coupon: validatedCoupon.stripeCouponId }];
      }
      session = await stripe.checkout.sessions.create(sessionConfig);
    } catch (stripeError) {
      console.error("Error creating Stripe session:", stripeError);
      for (const reserved of reservedItems) {
        await supabase.rpc("restore_stock", {
          p_variant_id: reserved.variantId,
          p_quantity: reserved.quantity
        });
      }
      await supabase.from("orders").delete().eq("id", orderId);
      return new Response(JSON.stringify({
        error: "Error al conectar con el sistema de pagos. Por favor, inténtalo de nuevo."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", orderId);
    return new Response(JSON.stringify({
      url: session.url,
      sessionId: session.id,
      orderId
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: "Error procesando el checkout" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
