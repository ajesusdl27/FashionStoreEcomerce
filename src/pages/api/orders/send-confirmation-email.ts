import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';
import { ensureSimplifiedTicketDocument } from '@/lib/fiscal-documents';

/**
 * Endpoint para enviar email de confirmación de pedido
 * Usado por la app móvil después de completar el pago
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Autenticación - soportar tanto cookies (web) como Authorization header (móvil)
    let accessToken = cookies.get('sb-access-token')?.value;
    
    // Si no hay token en cookies, buscar en Authorization header (para móvil)
    if (!accessToken) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }
    }
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Obtener orderId del body
    const { orderId } = await request.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }


    // 3. Obtener datos del pedido con items y productos
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (
            id,
            name,
            slug
          ),
          variant:product_variants (
            id,
            size
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Pedido no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Verificar que el usuario actual es el propietario del pedido
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user || user.email !== order.customer_email) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Verificar que el pedido no está en un estado terminal inválido
    // Aceptamos 'pending' porque Flutter puede llamar este endpoint
    // antes de que el status se propague a 'paid' (race window).
    if (['cancelled', 'refunded'].includes(order.status)) {
      return new Response(
        JSON.stringify({ 
          error: 'El pedido está cancelado o reembolsado',
          status: order.status 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Skip si ya se envió el email (idempotencia)
    if (order.confirmation_email_sent === true) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email ya enviado anteriormente' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. Preparar datos para el email
    const items = order.order_items.map((item: any) => ({
      productName: item.product?.name || 'Producto',
      size: item.variant?.size || '-',
      quantity: item.quantity,
      price: Number(item.price_at_purchase)
    }));

    // Extraer datos de cupón y envío desde las columnas de la orden (migración 039)
    const couponCode = order.coupon_code;
    const discountAmount = Number(order.discount_amount || 0);
    const shippingCost = Number(order.shipping_cost || 0);

    if (couponCode) {
    }

    // 7. Enviar email
    try {
      await ensureSimplifiedTicketDocument(order.id);
    } catch (docError) {
    }

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
      items,
      orderDate: new Date(order.created_at),
      ...(couponCode && discountAmount > 0 ? { couponCode, discountAmount } : {}),
      ...(shippingCost > 0 ? { shippingCost } : {}),
    });

    if (!emailResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Error al enviar el correo',
          details: emailResult.error 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Marcar email como enviado (usando admin para bypass RLS)
    await supabaseAdmin
      .from('orders')
      .update({ confirmation_email_sent: true })
      .eq('id', orderId);

    // Notificar al admin (awaited para garantizar entrega antes de responder)
    const adminResult = await sendAdminOrderNotification({
      orderId: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      totalAmount: Number(order.total_amount),
      items,
      shippingCity: order.shipping_city,
      shippingAddress: order.shipping_address,
    });
    if (adminResult.success) {
    } else {
    }

    // Registrar uso de cupón si existe (idempotente via UNIQUE constraint)
    if (order.coupon_id) {
      const { error: couponError } = await supabaseAdmin.rpc('use_coupon', {
        p_coupon_id: order.coupon_id,
        p_customer_email: order.customer_email,
        p_order_id: order.id,
      });
      if (couponError && couponError.code !== '23505') {
      } else {
      }
    }


    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email de confirmación enviado'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
