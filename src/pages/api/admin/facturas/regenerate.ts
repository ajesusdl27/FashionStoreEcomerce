import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { formatOrderId } from '@/lib/order-utils';

/**
 * POST /api/admin/facturas/regenerate
 * Regenerar PDF de una factura existente
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Auth admin
    let accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!accessToken) {
      accessToken = cookies.get('sb-access-token')?.value || undefined;
    }
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { invoiceId, customerNif, customerFiscalName, customerFiscalAddress } = await request.json();

    if (!invoiceId) {
      return new Response(JSON.stringify({ error: 'Falta invoiceId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch factura existente
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('id, invoice_number, order_id, customer_nif, customer_fiscal_name, customer_fiscal_address')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return new Response(JSON.stringify({ error: 'Factura no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Si se proporcionaron datos fiscales nuevos, actualizar
    const fiscalName = customerFiscalName || invoice.customer_fiscal_name;
    const fiscalNif = customerNif || invoice.customer_nif;
    const fiscalAddress = customerFiscalAddress || invoice.customer_fiscal_address;

    if (customerNif || customerFiscalName || customerFiscalAddress) {
      await supabaseAdmin
        .from('invoices')
        .update({
          customer_nif: fiscalNif,
          customer_fiscal_name: fiscalName,
          customer_fiscal_address: fiscalAddress,
        })
        .eq('id', invoiceId);
    }

    // Fetch orden asociada
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total_amount, created_at, shipping_cost, discount_amount, coupon_code')
      .eq('id', invoice.order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Pedido asociado no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formattedOrderId = formatOrderId(order.order_number);

    // Fetch order_items
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select(`
        quantity,
        price_at_purchase,
        products:product_id (name),
        product_variants:variant_id (size)
      `)
      .eq('order_id', invoice.order_id);

    // Calcular descuento/cupon
    let couponCode: string | undefined;
    let discountAmount: number | undefined;
    const shippingCost = Number(order.shipping_cost || 0);

    if (order.coupon_code && Number(order.discount_amount || 0) > 0) {
      couponCode = order.coupon_code;
      discountAmount = Number(order.discount_amount);
    } else {
      try {
        const { data: couponUsage } = await supabaseAdmin
          .from('coupon_usages')
          .select('coupons:coupon_id (code, discount_type, discount_value)')
          .eq('order_id', invoice.order_id)
          .limit(1)
          .single();

        if (couponUsage?.coupons) {
          const coupon = Array.isArray(couponUsage.coupons) ? couponUsage.coupons[0] : couponUsage.coupons;
          if (coupon) {
            couponCode = coupon.code;
            const itemsSubtotal = (orderItems || []).reduce(
              (sum: number, item: any) => sum + Number(item.price_at_purchase) * item.quantity,
              0
            );
            if (coupon.discount_type === 'fixed') {
              discountAmount = coupon.discount_value;
            } else if (coupon.discount_type === 'percentage') {
              discountAmount = Math.round(itemsSubtotal * coupon.discount_value) / 100;
            }
          }
        }
      } catch {
        // Sin cupon
      }
    }

    // Calcular importes
    const total = Number(order.total_amount);
    const subtotal = Math.round((total / 1.21) * 100) / 100;
    const taxAmount = Math.round((total - subtotal) * 100) / 100;

    // Regenerar PDF
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: invoice.invoice_number,
      invoiceDate: new Date(),
      orderId: formattedOrderId,
      orderDate: new Date(order.created_at),
      customerFiscalName: fiscalName,
      customerNif: fiscalNif,
      customerFiscalAddress: fiscalAddress,
      items: (orderItems || []).map((item: any) => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
        const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
        return {
          productName: product?.name || 'Producto',
          size: variant?.size || '-',
          quantity: item.quantity,
          unitPrice: Number(item.price_at_purchase),
        };
      }),
      subtotal,
      taxRate: 21,
      taxAmount,
      total,
      ...(couponCode ? { couponCode } : {}),
      ...(discountAmount ? { discountAmount } : {}),
      ...(shippingCost > 0 ? { shippingCost } : {}),
    });

    // Subir PDF a Storage (upsert sobreesscribe)
    const fileName = `invoices/${invoice.invoice_number}.pdf`;
    await supabaseAdmin.storage.from('documents').upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

    // Obtener URL publica
    const { data: urlData } = supabaseAdmin.storage.from('documents').getPublicUrl(fileName);

    // Actualizar pdf_url
    if (urlData?.publicUrl) {
      await supabaseAdmin.from('invoices').update({ pdf_url: urlData.publicUrl }).eq('id', invoiceId);
    }

    // Retornar PDF
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
        'X-Invoice-Number': invoice.invoice_number,
      },
    });
  } catch (error: any) {
    console.error('[ADMIN FACTURAS REGENERATE] error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
