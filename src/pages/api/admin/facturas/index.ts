import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { formatOrderId } from '@/lib/order-utils';
import { ensureSimplifiedTicketDocument } from '@/lib/fiscal-documents';

function normalizeInvoicePayload(payload: any) {
  return {
    invoice_id: payload?.invoice_id ?? payload?.document_id ?? payload?.id ?? null,
    invoice_number: payload?.invoice_number ?? payload?.document_number ?? null,
  };
}

/** Helper: extraer y validar token de admin */
async function getAdminUser(request: Request, cookies: any) {
  let accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!accessToken) {
    accessToken = cookies.get('sb-access-token')?.value;
  }
  if (!accessToken) return null;

  const user = await validateToken(accessToken);
  if (!user?.user_metadata?.is_admin) return null;
  return user;
}

/**
 * GET /api/admin/facturas?action=search-orders&q=...
 * Busca pedidos elegibles para generar factura (paid/shipped/delivered sin factura)
 */
export const GET: APIRoute = async ({ request, cookies, url }) => {
  try {
    const user = await getAdminUser(request, cookies);
    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const action = url.searchParams.get('action');

    if (action === 'search-orders') {
      const q = (url.searchParams.get('q') || '').trim();
      if (!q) {
        return new Response(JSON.stringify({ orders: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Buscar pedidos elegibles
      let query = supabaseAdmin
        .from('orders')
        .select('id, order_number, customer_name, customer_email, total_amount, status, created_at')
        .in('status', ['paid', 'shipped', 'delivered'])
        .order('created_at', { ascending: false })
        .limit(20);

      // Intentar parsear como numero de pedido
      const numericQuery = parseInt(q.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(numericQuery) && numericQuery > 0) {
        query = query.eq('order_number', numericQuery);
      } else {
        query = query.ilike('customer_name', `%${q}%`);
      }

      const { data: orders, error } = await query;
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Filtrar pedidos que ya tienen factura
      if (orders && orders.length > 0) {
        const orderIds = orders.map((o) => o.id);
        const { data: existingInvoices } = await supabaseAdmin
          .from('fiscal_documents')
          .select('order_id')
          .eq('document_type', 'invoice')
          .in('order_id', orderIds);

        const invoicedOrderIds = new Set((existingInvoices || []).map((i) => i.order_id));
        const eligible = orders.filter((o) => !invoicedOrderIds.has(o.id));

        return new Response(JSON.stringify({ orders: eligible }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ orders: orders || [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'download-ticket') {
      const orderId = url.searchParams.get('orderId');
      if (!orderId) {
        return new Response(JSON.stringify({ error: 'Falta orderId' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const fiscalTicket = await ensureSimplifiedTicketDocument(orderId);

      let pdfBuffer: Uint8Array | null = null;
      if (fiscalTicket.pdf_storage_path) {
        const { data: storedPdf, error: storageError } = await supabaseAdmin.storage
          .from('documents')
          .download(fiscalTicket.pdf_storage_path);

        if (!storageError && storedPdf) {
          const arr = await storedPdf.arrayBuffer();
          pdfBuffer = new Uint8Array(arr);
        }
      }

      if (!pdfBuffer && fiscalTicket.pdf_url) {
        const response = await fetch(fiscalTicket.pdf_url);
        if (response.ok) {
          pdfBuffer = new Uint8Array(await response.arrayBuffer());
        }
      }

      if (!pdfBuffer) {
        return new Response(JSON.stringify({ error: 'Ticket simplificado no disponible' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fiscalTicket.document_number}.pdf"`,
        },
      });
    }

    if (action === 'list-invoices') {
      const page = parseInt(url.searchParams.get('page') || '0', 10);
      const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
      const search = url.searchParams.get('search') || '';
      const startDate = url.searchParams.get('startDate') || '';
      const endDate = url.searchParams.get('endDate') || '';
      const offset = page * pageSize;

      let query = supabaseAdmin
        .from('fiscal_documents')
        .select('id, order_id, document_number, customer_name, customer_nif, customer_fiscal_address, total, issued_at, pdf_url, document_type, orders!inner(order_number)')
        .in('document_type', ['invoice', 'rectifying']);

      if (search) {
        const s = search.toLowerCase();
        query = query.or(
          `document_number.ilike.%${s}%,customer_nif.ilike.%${s}%,customer_name.ilike.%${s}%`
        );
      }

      if (startDate) {
        query = query.gte('issued_at', startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query = query.lt('issued_at', end.toISOString());
      }

      const { data, error } = await query
        .order('issued_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Flatten joined order data
      const invoices = (data || []).map((inv: any) => {
        const { orders, ...rest } = inv;
        return {
          ...rest,
          invoice_number: rest.document_number,
          order_number: orders?.order_number,
          customer_name: rest.customer_name,
        };
      });

      return new Response(JSON.stringify({ invoices }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'list-tickets') {
      const page = parseInt(url.searchParams.get('page') || '0', 10);
      const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
      const search = url.searchParams.get('search') || '';
      const startDate = url.searchParams.get('startDate') || '';
      const endDate = url.searchParams.get('endDate') || '';
      const offset = page * pageSize;

      let query = supabaseAdmin
        .from('fiscal_documents')
        .select('id, order_id, document_number, customer_name, customer_email, total, issued_at, pdf_url, pdf_storage_path, metadata, orders!inner(order_number, status, created_at)')
        .eq('document_type', 'simplified');

      if (search) {
        const s = search.toLowerCase();
        const numericQuery = parseInt(s.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(numericQuery) && numericQuery > 0) {
          query = query.contains('metadata', { order_number: numericQuery });
        } else {
          query = query.or(`document_number.ilike.%${s}%,customer_name.ilike.%${s}%,customer_email.ilike.%${s}%`);
        }
      }

      if (startDate) {
        query = query.gte('issued_at', startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query = query.lt('issued_at', end.toISOString());
      }

      const { data, error } = await query
        .order('issued_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const orders = (data || []).map((ticket: any) => {
        const order = Array.isArray(ticket.orders) ? ticket.orders[0] : ticket.orders;
        return {
          id: ticket.order_id,
          order_number: order?.order_number ?? ticket.metadata?.order_number,
          customer_name: ticket.customer_name,
          customer_email: ticket.customer_email,
          total_amount: ticket.total,
          status: order?.status || 'paid',
          created_at: order?.created_at || ticket.issued_at,
          ticket_number: ticket.document_number,
          ticket_pdf_url: ticket.pdf_url,
          ticket_pdf_storage_path: ticket.pdf_storage_path,
          ticket_issued_at: ticket.issued_at,
        };
      });

      return new Response(JSON.stringify({ orders }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Acción no válida' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[ADMIN FACTURAS] GET error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * POST /api/admin/facturas
 * Crear factura para un pedido (admin, sin check de propiedad)
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await getAdminUser(request, cookies);
    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { orderId, customerNif, customerFiscalName, customerFiscalAddress } = await request.json();

    if (!orderId || !customerNif || !customerFiscalName || !customerFiscalAddress) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch orden (sin check de propiedad, admin puede generar para cualquier pedido)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, customer_email, total_amount, created_at, status, subtotal, shipping_cost, discount_amount, coupon_code')
      .eq('id', orderId)
      .in('status', ['paid', 'shipped', 'delivered'])
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Pedido no encontrado o no elegible' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formattedOrderId = formatOrderId(order.order_number);

    // Verificar si ya existe factura
    const { data: existingInvoice } = await supabaseAdmin
      .from('fiscal_documents')
      .select('id, document_number, pdf_url')
      .eq('order_id', orderId)
      .eq('document_type', 'invoice')
      .single();

    let invoiceData;

    if (existingInvoice) {
      // Actualizar datos fiscales si ya existe
      const { data: updatedInvoice, error: updateError } = await supabaseAdmin
        .from('fiscal_documents')
        .update({
          customer_nif: customerNif,
          customer_name: customerFiscalName,
          customer_fiscal_address: customerFiscalAddress,
        })
        .eq('id', existingInvoice.id)
        .select('document_number, id')
        .single();

      if (updateError) throw updateError;
      invoiceData = normalizeInvoicePayload(updatedInvoice);
    } else {
      // Crear factura via RPC
      const { data: invoiceResult, error: invoiceError } = await supabaseAdmin.rpc('create_invoice_fiscal_document', {
        p_order_id: orderId,
        p_customer_nif: customerNif,
        p_customer_fiscal_name: customerFiscalName,
        p_customer_fiscal_address: customerFiscalAddress,
      });

      if (invoiceError) {
        return new Response(JSON.stringify({ error: invoiceError.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      invoiceData = normalizeInvoicePayload(Array.isArray(invoiceResult) ? invoiceResult[0] : invoiceResult);
    }

    if (!invoiceData.invoice_id || !invoiceData.invoice_number) {
      throw new Error('No se pudo normalizar la factura creada');
    }

    // Obtener items del pedido
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select(`
        quantity,
        price_at_purchase,
        products:product_id (name),
        product_variants:variant_id (size)
      `)
      .eq('order_id', orderId);

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
          .eq('order_id', orderId)
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

    // Generar PDF
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: invoiceData.invoice_number,
      invoiceDate: new Date(),
      orderId: formattedOrderId,
      orderDate: new Date(order.created_at),
      customerFiscalName,
      customerNif,
      customerFiscalAddress,
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

    // Subir PDF a Storage
    const fileName = `fiscal/invoice/${invoiceData.invoice_number}.pdf`;
    await supabaseAdmin.storage.from('documents').upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

    // Obtener URL publica
    const { data: urlData } = supabaseAdmin.storage.from('documents').getPublicUrl(fileName);

    // Actualizar invoice con pdf_url
    if (urlData?.publicUrl) {
      await supabaseAdmin
        .from('fiscal_documents')
        .update({ pdf_url: urlData.publicUrl, pdf_storage_path: fileName })
        .eq('id', invoiceData.invoice_id);
    }

    // Retornar PDF como descarga
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoiceData.invoice_number}.pdf"`,
        'X-Invoice-Number': invoiceData.invoice_number,
        'X-Invoice-Url': urlData?.publicUrl || '',
      },
    });
  } catch (error: any) {
    console.error('[ADMIN FACTURAS] POST error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
