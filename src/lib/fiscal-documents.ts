import { createHash } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { formatOrderId } from '@/lib/order-utils';
import { generateInvoicePDF, generateTicketPDF } from '@/lib/pdf-generator';

type FiscalDocument = {
  id: string;
  order_id: string;
  return_id: string | null;
  document_type: 'invoice' | 'simplified' | 'rectifying';
  document_number: string;
  issued_at: string;
  customer_name: string;
  customer_email: string | null;
  customer_nif: string | null;
  customer_fiscal_address: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  pdf_url: string | null;
  pdf_storage_path: string | null;
  pdf_sha256: string | null;
  metadata: Record<string, any> | null;
};

const ELIGIBLE_DOCUMENT_STATUSES = [
  'paid',
  'shipped',
  'delivered',
  'cancelled',
  'return_requested',
  'return_approved',
  'return_shipped',
  'return_received',
  'return_completed',
  'partially_refunded',
];

async function createSimplifiedTicketDocumentFallback(orderId: string) {
  const { data: existing } = await supabaseAdmin
    .from('fiscal_documents')
    .select('id, document_number')
    .eq('order_id', orderId)
    .eq('document_type', 'simplified')
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      document_id: existing.id,
      document_number: existing.document_number,
    };
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, customer_name, customer_email, total_amount, status')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error('Pedido no encontrado');
  }

  if (!ELIGIBLE_DOCUMENT_STATUSES.includes(order.status)) {
    throw new Error('El pedido no es elegible para emitir ticket simplificado');
  }

  const vTotal = Number(order.total_amount || 0);
  const vSubtotal = Math.round((vTotal / 1.21) * 100) / 100;
  const vTaxAmount = Math.round((vTotal - vSubtotal) * 100) / 100;

  const { data: generatedNumber, error: numberError } = await supabaseAdmin.rpc('generate_fiscal_document_number', {
    p_document_type: 'simplified',
    p_issued_at: new Date().toISOString(),
  });

  if (numberError || !generatedNumber) {
    throw new Error(numberError?.message || 'No se pudo generar número de documento fiscal');
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('fiscal_documents')
    .insert({
      order_id: orderId,
      document_type: 'simplified',
      document_number: String(generatedNumber),
      customer_name: order.customer_name || 'Cliente',
      customer_email: order.customer_email,
      subtotal: vSubtotal,
      tax_rate: 21.0,
      tax_amount: vTaxAmount,
      total: vTotal,
      metadata: { order_number: order.order_number, fallback_created: true },
    })
    .select('id, document_number')
    .single();

  if (insertError) {
    if (String(insertError.message || '').toLowerCase().includes('duplicate')) {
      const { data: existingAfterConflict } = await supabaseAdmin
        .from('fiscal_documents')
        .select('id, document_number')
        .eq('order_id', orderId)
        .eq('document_type', 'simplified')
        .limit(1)
        .maybeSingle();

      if (existingAfterConflict) {
        return {
          document_id: existingAfterConflict.id,
          document_number: existingAfterConflict.document_number,
        };
      }
    }

    throw new Error(insertError.message || 'No se pudo crear el documento simplificado');
  }

  return {
    document_id: inserted.id,
    document_number: inserted.document_number,
  };
}

async function fetchOrderWithItems(orderId: string) {
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, customer_name, customer_email, total_amount, created_at, shipping_address, shipping_city, shipping_postal_code, shipping_country, shipping_cost, discount_amount, coupon_code')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error('Pedido no encontrado para generar documento fiscal');
  }

  const { data: orderItems, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select(`
      quantity,
      price_at_purchase,
      products:product_id (name),
      product_variants:variant_id (size)
    `)
    .eq('order_id', orderId);

  if (itemsError) {
    throw new Error('No se pudieron recuperar los artículos del pedido');
  }

  return { order, orderItems: orderItems || [] };
}

async function updateDocumentPdfMetadata(documentId: string, storagePath: string, pdfBuffer: Buffer) {
  const { data: publicData } = supabaseAdmin.storage.from('documents').getPublicUrl(storagePath);
  const pdfSha256 = createHash('sha256').update(pdfBuffer).digest('hex');

  await supabaseAdmin
    .from('fiscal_documents')
    .update({
      pdf_url: publicData?.publicUrl || null,
      pdf_storage_path: storagePath,
      pdf_sha256: pdfSha256,
    })
    .eq('id', documentId);

  return {
    pdfUrl: publicData?.publicUrl || null,
    pdfSha256,
  };
}

export async function ensureSimplifiedTicketDocument(orderId: string) {
  const { data: created, error: createError } = await supabaseAdmin.rpc('create_simplified_ticket_document', {
    p_order_id: orderId,
  });

  let createRow = Array.isArray(created) ? created[0] : created;

  if (createError) {
    const errorMessage = String(createError.message || '').toLowerCase();
    const isAmbiguousDocumentNumber =
      errorMessage.includes('document_number') && errorMessage.includes('ambiguous');
    const isNotEligibleError =
      errorMessage.includes('no elegible') || errorMessage.includes('no encontrado o no elegible');

    if (!isAmbiguousDocumentNumber && !isNotEligibleError) {
      throw new Error(createError.message || 'No se pudo crear el documento simplificado');
    }

    createRow = await createSimplifiedTicketDocumentFallback(orderId);
  }

  const documentId = createRow?.document_id as string;

  if (!documentId) {
    throw new Error('No se pudo resolver el documento simplificado');
  }

  const { data: document, error: docError } = await supabaseAdmin
    .from('fiscal_documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (docError || !document) {
    throw new Error('No se pudo recuperar el documento fiscal simplificado');
  }

  const fiscalDocument = document as FiscalDocument;
  if (fiscalDocument.pdf_url) {
    return fiscalDocument;
  }

  const { order, orderItems } = await fetchOrderWithItems(orderId);

  const formattedOrderId = formatOrderId(order.order_number);
  const ticketPdf = await generateTicketPDF({
    orderId: formattedOrderId,
    orderDate: new Date(order.created_at),
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    shippingAddress: order.shipping_address,
    shippingCity: order.shipping_city,
    shippingPostalCode: order.shipping_postal_code,
    shippingCountry: order.shipping_country || 'España',
    items: orderItems.map((item: any) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
      return {
        productName: product?.name || 'Producto',
        size: variant?.size || '-',
        quantity: item.quantity,
        price: Number(item.price_at_purchase),
      };
    }),
    totalAmount: Number(order.total_amount),
    ...(order.coupon_code ? { couponCode: order.coupon_code } : {}),
    ...(Number(order.discount_amount || 0) > 0 ? { discountAmount: Number(order.discount_amount) } : {}),
    ...(Number(order.shipping_cost || 0) > 0 ? { shippingCost: Number(order.shipping_cost) } : {}),
  });

  const storagePath = `fiscal/simplified/${fiscalDocument.document_number}.pdf`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from('documents')
    .upload(storagePath, ticketPdf, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError && !String(uploadError.message || '').toLowerCase().includes('already exists')) {
    throw new Error(`Error subiendo ticket simplificado: ${uploadError.message}`);
  }

  const pdfMeta = await updateDocumentPdfMetadata(fiscalDocument.id, storagePath, ticketPdf);

  return {
    ...fiscalDocument,
    pdf_url: pdfMeta.pdfUrl,
    pdf_storage_path: storagePath,
    pdf_sha256: pdfMeta.pdfSha256,
  };
}

export async function ensureRectifyingDocumentForReturn(returnId: string) {
  const { data: created, error: createError } = await supabaseAdmin.rpc('create_rectifying_document_from_return', {
    p_return_id: returnId,
    p_original_document_id: null,
  });

  if (createError) {
    throw new Error(createError.message || 'No se pudo crear la factura rectificativa');
  }

  const createRow = Array.isArray(created) ? created[0] : created;
  const documentId = createRow?.document_id as string;

  const { data: document, error: docError } = await supabaseAdmin
    .from('fiscal_documents')
    .select('*, orders:order_id(order_number, created_at), returns:return_id(refund_amount)')
    .eq('id', documentId)
    .single();

  if (docError || !document) {
    throw new Error('No se pudo recuperar la factura rectificativa');
  }

  const fiscalDocument = document as FiscalDocument & {
    orders?: { order_number: number; created_at: string } | { order_number: number; created_at: string }[];
    returns?: { refund_amount: number } | { refund_amount: number }[];
  };

  if (fiscalDocument.pdf_url) {
    return fiscalDocument;
  }

  const { order, orderItems } = await fetchOrderWithItems(fiscalDocument.order_id);

  const { data: approvedReturnItems } = await supabaseAdmin
    .from('return_items')
    .select(`
      quantity,
      refund_amount,
      inspection_status,
      products:order_item_id (
        products:product_id (name),
        product_variants:variant_id (size)
      )
    `)
    .eq('return_id', returnId)
    .eq('inspection_status', 'approved');

  const refundItems = (approvedReturnItems || [])
    .map((item: any) => {
      const orderItemData = Array.isArray(item.products) ? item.products[0] : item.products;
      const product = Array.isArray(orderItemData?.products) ? orderItemData.products[0] : orderItemData?.products;
      const variant = Array.isArray(orderItemData?.product_variants) ? orderItemData.product_variants[0] : orderItemData?.product_variants;
      const lineTotal = Number(item.refund_amount || 0);
      const quantity = Number(item.quantity || 1);
      const unitPrice = quantity > 0 ? lineTotal / quantity : 0;
      return {
        productName: `Rectificación - ${product?.name || 'Producto'}`,
        size: variant?.size || '-',
        quantity,
        unitPrice: -Math.abs(unitPrice),
      };
    })
    .filter((item) => item.quantity > 0);

  const fallbackItems = orderItems.map((item: any) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
    return {
      productName: `Rectificación - ${product?.name || 'Producto'}`,
      size: variant?.size || '-',
      quantity: item.quantity,
      unitPrice: -Math.abs(Number(item.price_at_purchase)),
    };
  });

  const orderJoin = Array.isArray(fiscalDocument.orders) ? fiscalDocument.orders[0] : fiscalDocument.orders;
  const formattedOrderId = formatOrderId(orderJoin?.order_number || order.order_number);

  const rectifyingPdf = await generateInvoicePDF({
    invoiceNumber: fiscalDocument.document_number,
    invoiceDate: new Date(fiscalDocument.issued_at),
    orderId: formattedOrderId,
    orderDate: new Date(orderJoin?.created_at || order.created_at),
    customerFiscalName: fiscalDocument.customer_name,
    customerNif: fiscalDocument.customer_nif || 'N/A',
    customerFiscalAddress: fiscalDocument.customer_fiscal_address || 'Dirección no informada',
    items: refundItems.length > 0 ? refundItems : fallbackItems,
    subtotal: Number(fiscalDocument.subtotal),
    taxRate: Number(fiscalDocument.tax_rate),
    taxAmount: Number(fiscalDocument.tax_amount),
    total: Number(fiscalDocument.total),
  });

  const storagePath = `fiscal/rectifying/${fiscalDocument.document_number}.pdf`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from('documents')
    .upload(storagePath, rectifyingPdf, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError && !String(uploadError.message || '').toLowerCase().includes('already exists')) {
    throw new Error(`Error subiendo rectificativa: ${uploadError.message}`);
  }

  const pdfMeta = await updateDocumentPdfMetadata(fiscalDocument.id, storagePath, rectifyingPdf);

  return {
    ...fiscalDocument,
    pdf_url: pdfMeta.pdfUrl,
    pdf_storage_path: storagePath,
    pdf_sha256: pdfMeta.pdfSha256,
  };
}

export async function getFiscalDocumentById(documentId: string) {
  const { data, error } = await supabaseAdmin
    .from('fiscal_documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as FiscalDocument;
}

export async function getFiscalDocumentByOrderAndType(
  orderId: string,
  documentType: FiscalDocument['document_type']
) {
  const { data, error } = await supabaseAdmin
    .from('fiscal_documents')
    .select('*')
    .eq('order_id', orderId)
    .eq('document_type', documentType)
    .order('issued_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as FiscalDocument;
}

type CancellationRectifyingInput = {
  orderId: string;
  refundAmount: number;
  requestedBy: 'customer' | 'admin';
  customerUserId?: string | null;
};

type CancellationRectifyingResult = {
  id: string;
  number: string;
  pdfUrl: string | null;
  returnId: string;
};

const AUTO_CANCEL_RETURN_MARKER_PREFIX = 'AUTO_CANCEL_RECTIFY';

async function ensureTechnicalReturnForCancellation(
  input: CancellationRectifyingInput,
): Promise<string> {
  const marker = `${AUTO_CANCEL_RETURN_MARKER_PREFIX}:${input.orderId}`;
  const nowIso = new Date().toISOString();

  const { data: existingReturn, error: existingReturnError } = await supabaseAdmin
    .from('returns')
    .select('id, status, refund_amount')
    .eq('order_id', input.orderId)
    .eq('admin_notes', marker)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingReturnError) {
    throw new Error(existingReturnError.message || 'No se pudo consultar la devolución técnica');
  }

  if (!existingReturn) {
    const { data: insertedReturn, error: insertError } = await supabaseAdmin
      .from('returns')
      .insert({
        order_id: input.orderId,
        user_id: input.customerUserId ?? null,
        status: 'completed',
        refund_amount: input.refundAmount,
        refund_method: 'original_payment',
        customer_notes: `Cancelación automática (${input.requestedBy})`,
        admin_notes: marker,
        approved_at: nowIso,
        received_at: nowIso,
        completed_at: nowIso,
      })
      .select('id')
      .single();

    if (insertError || !insertedReturn) {
      throw new Error(insertError?.message || 'No se pudo crear la devolución técnica');
    }

    return insertedReturn.id;
  }

  const existingRefundAmount = Number(existingReturn.refund_amount || 0);
  const needsUpdate =
    existingReturn.status !== 'completed' || Math.abs(existingRefundAmount - input.refundAmount) > 0.009;

  if (needsUpdate) {
    const { error: updateError } = await supabaseAdmin
      .from('returns')
      .update({
        status: 'completed',
        refund_amount: input.refundAmount,
        refund_method: 'original_payment',
        approved_at: nowIso,
        received_at: nowIso,
        completed_at: nowIso,
      })
      .eq('id', existingReturn.id);

    if (updateError) {
      throw new Error(updateError.message || 'No se pudo actualizar la devolución técnica');
    }
  }

  return existingReturn.id;
}

export async function ensureRectifyingDocumentForOrderCancellation(
  input: CancellationRectifyingInput,
): Promise<CancellationRectifyingResult> {
  const normalizedRefundAmount = Math.round(Number(input.refundAmount || 0) * 100) / 100;

  if (normalizedRefundAmount <= 0) {
    throw new Error('El importe de reembolso debe ser mayor que cero para emitir rectificativa');
  }

  try {
    await ensureSimplifiedTicketDocument(input.orderId);
  } catch (simplifiedError) {
    console.warn('⚠️ Could not ensure simplified document before rectifying creation:', simplifiedError);
  }

  const technicalReturnId = await ensureTechnicalReturnForCancellation({
    ...input,
    refundAmount: normalizedRefundAmount,
  });

  const rectifying = await ensureRectifyingDocumentForReturn(technicalReturnId);

  return {
    id: rectifying.id,
    number: rectifying.document_number,
    pdfUrl: rectifying.pdf_url || null,
    returnId: technicalReturnId,
  };
}