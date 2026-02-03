import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { sendOrderConfirmation } from '@/lib/email';

/**
 * Endpoint para enviar email de confirmación de pedido
 * Usado por la app móvil después de completar el pago
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Autenticación
    const accessToken = cookies.get('sb-access-token')?.value;
    
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

    console.log('📧 Sending confirmation email for order:', orderId);

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
      console.error('Error fetching order:', orderError);
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

    // 5. Verificar que el pedido está en estado 'paid' o superior
    if (!['paid', 'shipped', 'delivered'].includes(order.order_status)) {
      return new Response(
        JSON.stringify({ 
          error: 'El pedido no está en estado pagado',
          status: order.order_status 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. Preparar datos para el email
    const items = order.order_items.map((item: any) => ({
      productName: item.product?.name || 'Producto',
      size: item.variant?.size || '-',
      quantity: item.quantity,
      price: Number(item.price_at_purchase)
    }));

    const shippingAddress = {
      fullName: order.customer_name,
      address: order.shipping_address,
      city: order.shipping_city,
      postalCode: order.shipping_postal_code,
      phone: order.customer_phone || ''
    };

    // 7. Enviar email
    const emailResult = await sendOrderConfirmation({
      orderId: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      items,
      shippingAddress,
      subtotal: Number(order.total_amount),
      shippingCost: 0, // Envío gratis
      total: Number(order.total_amount),
      orderDate: new Date(order.created_at)
    });

    if (!emailResult.success) {
      console.error('Error sending email:', emailResult.error);
      return new Response(
        JSON.stringify({ 
          error: 'Error al enviar el correo',
          details: emailResult.error 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Confirmation email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email de confirmación enviado'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-confirmation-email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
