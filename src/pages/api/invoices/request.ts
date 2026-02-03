import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { formatOrderId, formatInvoiceNumber } from '@/lib/order-utils';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Verificar autenticación - soporte para cookies (web) y Authorization header (móvil)
    let accessToken = cookies.get('sb-access-token')?.value;
    let refreshToken = cookies.get('sb-refresh-token')?.value;

    // Si no hay cookie, intentar con Authorization header (para móvil)
    if (!accessToken) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
        refreshToken = undefined; // Mobile apps don't send refresh token in header
      }
    }

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener usuario del token (funciona con cookies y Authorization header)
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Auth error in invoice request:', authError);
      return new Response(JSON.stringify({ error: 'Sesión inválida' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener datos del body
    const body = await request.json();
    const { orderId, customerNif, customerFiscalName, customerFiscalAddress } = body;

    if (!orderId || !customerNif || !customerFiscalName || !customerFiscalAddress) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar que el pedido pertenece al usuario (usar admin para bypass RLS)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, customer_email, total_amount, created_at, status')
      .eq('id', orderId)
      .eq('customer_email', user.email)
      .in('status', ['paid', 'shipped', 'delivered'])
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(JSON.stringify({ error: 'Pedido no encontrado o no accesible' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Format order number for display
    const formattedOrderId = formatOrderId(order.order_number);

    // Verificar si ya existe una factura (usar admin para bypass RLS)
    const { data: existingInvoice } = await supabaseAdmin
      .from('invoices')
      .select('id, invoice_number, pdf_url')
      .eq('order_id', orderId)
      .single();

    let invoiceData;

    if (existingInvoice) {
      // Si existe, actualizamos los datos fiscales (por si hubo corrección) y regeneramos
      const { data: updatedInvoice, error: updateError } = await supabaseAdmin
        .from('invoices')
        .update({
          customer_nif: customerNif,
          customer_fiscal_name: customerFiscalName,
          customer_fiscal_address: customerFiscalAddress
        })
        .eq('id', existingInvoice.id)
        .select('invoice_number, id')
        .single();

      if (updateError) throw updateError;
      
      invoiceData = {
        invoice_id: updatedInvoice.id,
        invoice_number: updatedInvoice.invoice_number
      };
    } else {
      // Crear factura usando RPC si no existe (usar admin para bypass RLS)
      const { data: invoiceResult, error: invoiceError } = await supabaseAdmin.rpc('create_invoice', {
        p_order_id: orderId,
        p_customer_nif: customerNif,
        p_customer_fiscal_name: customerFiscalName,
        p_customer_fiscal_address: customerFiscalAddress
      });

      if (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        return new Response(JSON.stringify({ error: invoiceError.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      invoiceData = Array.isArray(invoiceResult) ? invoiceResult[0] : invoiceResult;
    }
    
    // Obtener los items del pedido para el PDF
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select(`
        quantity,
        price_at_purchase,
        products:product_id (name),
        product_variants:variant_id (size)
      `)
      .eq('order_id', orderId);

    // Calcular importes
    const total = Number(order.total_amount);
    const subtotal = Math.round((total / 1.21) * 100) / 100;
    const taxAmount = Math.round((total - subtotal) * 100) / 100;

    // Generar PDF
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: invoiceData.invoice_number,
      invoiceDate: new Date(),
      orderId: formattedOrderId,  // Usar formato #A000001
      orderDate: new Date(order.created_at),
      customerFiscalName,
      customerNif,
      customerFiscalAddress,
      items: (orderItems || []).map(item => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
        const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
        return {
          productName: product?.name || 'Producto',
          size: variant?.size || '-',
          quantity: item.quantity,
          unitPrice: Number(item.price_at_purchase)
        };
      }),
      subtotal,
      taxRate: 21,
      taxAmount,
      total
    });

    // Subir PDF a Supabase Storage (usar admin para bypass RLS)
    const fileName = `invoices/${invoiceData.invoice_number}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      // Continuar sin guardar URL, el PDF se puede regenerar
    }

    // Obtener URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Actualizar factura con URL del PDF (usar admin para bypass RLS)
    if (urlData?.publicUrl) {
      await supabaseAdmin
        .from('invoices')
        .update({ pdf_url: urlData.publicUrl })
        .eq('id', invoiceData.invoice_id);
    }

    // Devolver PDF como descarga
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoiceData.invoice_number}.pdf"`,
        'X-Invoice-Number': invoiceData.invoice_number,
        'X-Invoice-Url': urlData?.publicUrl || ''
      }
    });

  } catch (error) {
    console.error('Error in invoice request:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error interno' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
