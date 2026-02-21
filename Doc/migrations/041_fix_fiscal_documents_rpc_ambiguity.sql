-- ============================================
-- FASHIONSTORE - MIGRACIÓN 041
-- Fix ambigüedad "document_number" en RPCs fiscales
-- ============================================

CREATE OR REPLACE FUNCTION create_simplified_ticket_document(
  p_order_id UUID
)
RETURNS TABLE(
  document_id UUID,
  document_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_existing RECORD;
  v_number TEXT;
  v_id UUID;
  v_total NUMERIC(10,2);
  v_subtotal NUMERIC(10,2);
  v_tax_amount NUMERIC(10,2);
BEGIN
  SELECT id, order_number, customer_name, customer_email, total_amount, status
  INTO v_order
  FROM orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido no encontrado';
  END IF;

  IF v_order.status NOT IN ('paid', 'shipped', 'delivered', 'return_requested', 'return_approved', 'return_shipped', 'return_received', 'return_completed', 'partially_refunded') THEN
    RAISE EXCEPTION 'El pedido no es elegible para emitir ticket simplificado';
  END IF;

  SELECT fd.id, fd.document_number
  INTO v_existing
  FROM fiscal_documents fd
  WHERE fd.order_id = p_order_id
    AND fd.document_type = 'simplified'
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT v_existing.id, v_existing.document_number;
    RETURN;
  END IF;

  v_total := COALESCE(v_order.total_amount, 0);
  v_subtotal := ROUND(v_total / 1.21, 2);
  v_tax_amount := ROUND(v_total - v_subtotal, 2);
  v_number := generate_fiscal_document_number('simplified', NOW());

  INSERT INTO fiscal_documents (
    order_id,
    document_type,
    document_number,
    customer_name,
    customer_email,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    metadata
  ) VALUES (
    p_order_id,
    'simplified',
    v_number,
    COALESCE(v_order.customer_name, 'Cliente'),
    v_order.customer_email,
    v_subtotal,
    21.00,
    v_tax_amount,
    v_total,
    jsonb_build_object('order_number', v_order.order_number)
  )
  RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, v_number;
END;
$$;

CREATE OR REPLACE FUNCTION create_invoice_fiscal_document(
  p_order_id UUID,
  p_customer_nif TEXT,
  p_customer_fiscal_name TEXT,
  p_customer_fiscal_address TEXT
)
RETURNS TABLE(
  document_id UUID,
  document_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_existing RECORD;
  v_id UUID;
  v_number TEXT;
  v_total NUMERIC(10,2);
  v_subtotal NUMERIC(10,2);
  v_tax_amount NUMERIC(10,2);
BEGIN
  SELECT id, order_number, customer_name, customer_email, total_amount, status
  INTO v_order
  FROM orders
  WHERE id = p_order_id
    AND status IN ('paid', 'shipped', 'delivered', 'return_requested', 'return_approved', 'return_shipped', 'return_received', 'return_completed', 'partially_refunded');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido no encontrado o no elegible';
  END IF;

  SELECT fd.id, fd.document_number
  INTO v_existing
  FROM fiscal_documents fd
  WHERE fd.order_id = p_order_id
    AND fd.document_type = 'invoice'
  LIMIT 1;

  v_total := COALESCE(v_order.total_amount, 0);
  v_subtotal := ROUND(v_total / 1.21, 2);
  v_tax_amount := ROUND(v_total - v_subtotal, 2);

  IF FOUND THEN
    UPDATE fiscal_documents
    SET customer_name = COALESCE(p_customer_fiscal_name, customer_name),
        customer_email = COALESCE(v_order.customer_email, customer_email),
        customer_nif = p_customer_nif,
        customer_fiscal_address = p_customer_fiscal_address,
        subtotal = v_subtotal,
        tax_rate = 21.00,
        tax_amount = v_tax_amount,
        total = v_total,
        metadata = metadata || jsonb_build_object('updated_by_rpc', true, 'updated_at_rpc', NOW())
    WHERE id = v_existing.id;

    RETURN QUERY SELECT v_existing.id, v_existing.document_number;
    RETURN;
  END IF;

  v_number := generate_fiscal_document_number('invoice', NOW());

  INSERT INTO fiscal_documents (
    order_id,
    document_type,
    document_number,
    customer_name,
    customer_email,
    customer_nif,
    customer_fiscal_address,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    metadata
  ) VALUES (
    p_order_id,
    'invoice',
    v_number,
    COALESCE(p_customer_fiscal_name, v_order.customer_name, 'Cliente'),
    v_order.customer_email,
    p_customer_nif,
    p_customer_fiscal_address,
    v_subtotal,
    21.00,
    v_tax_amount,
    v_total,
    jsonb_build_object('order_number', v_order.order_number)
  ) RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, v_number;
END;
$$;

CREATE OR REPLACE FUNCTION create_rectifying_document_from_return(
  p_return_id UUID,
  p_original_document_id UUID DEFAULT NULL
)
RETURNS TABLE(
  document_id UUID,
  document_number TEXT,
  original_document UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_return RECORD;
  v_existing RECORD;
  v_original UUID;
  v_original_doc RECORD;
  v_number TEXT;
  v_id UUID;
  v_total NUMERIC(10,2);
  v_subtotal NUMERIC(10,2);
  v_tax_amount NUMERIC(10,2);
BEGIN
  SELECT r.id, r.order_id, r.refund_amount, r.status,
         o.customer_name, o.customer_email
  INTO v_return
  FROM returns r
  JOIN orders o ON o.id = r.order_id
  WHERE r.id = p_return_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  IF v_return.status != 'completed' THEN
    RAISE EXCEPTION 'Solo se puede crear rectificativa para devoluciones completadas';
  END IF;

  IF COALESCE(v_return.refund_amount, 0) <= 0 THEN
    RAISE EXCEPTION 'La devolución no tiene importe reembolsado';
  END IF;

  SELECT fd.id, fd.document_number, fd.original_document_id
  INTO v_existing
  FROM fiscal_documents fd
  WHERE fd.return_id = p_return_id
    AND fd.document_type = 'rectifying'
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT v_existing.id, v_existing.document_number, v_existing.original_document_id;
    RETURN;
  END IF;

  v_original := p_original_document_id;

  IF v_original IS NULL THEN
    SELECT fd.id
    INTO v_original
    FROM fiscal_documents fd
    WHERE fd.order_id = v_return.order_id
      AND fd.document_type IN ('invoice', 'simplified')
    ORDER BY CASE WHEN fd.document_type = 'invoice' THEN 0 ELSE 1 END, fd.issued_at ASC
    LIMIT 1;
  END IF;

  IF v_original IS NULL THEN
    RAISE EXCEPTION 'No existe documento fiscal original para el pedido';
  END IF;

  SELECT fd.customer_name, fd.customer_email, fd.customer_nif, fd.customer_fiscal_address
  INTO v_original_doc
  FROM fiscal_documents fd
  WHERE fd.id = v_original;

  v_total := -ABS(v_return.refund_amount);
  v_subtotal := ROUND(v_total / 1.21, 2);
  v_tax_amount := ROUND(v_total - v_subtotal, 2);
  v_number := generate_fiscal_document_number('rectifying', NOW());

  INSERT INTO fiscal_documents (
    order_id,
    return_id,
    original_document_id,
    document_type,
    document_number,
    customer_name,
    customer_email,
    customer_nif,
    customer_fiscal_address,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    metadata
  ) VALUES (
    v_return.order_id,
    p_return_id,
    v_original,
    'rectifying',
    v_number,
    COALESCE(v_original_doc.customer_name, v_return.customer_name, 'Cliente'),
    COALESCE(v_original_doc.customer_email, v_return.customer_email),
    v_original_doc.customer_nif,
    v_original_doc.customer_fiscal_address,
    v_subtotal,
    21.00,
    v_tax_amount,
    v_total,
    jsonb_build_object('refund_amount', v_return.refund_amount)
  )
  RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, v_number, v_original;
END;
$$;

COMMENT ON FUNCTION create_simplified_ticket_document IS 'Emisión idempotente de factura simplificada para un pedido elegible (fix ambigüedad document_number)';
COMMENT ON FUNCTION create_invoice_fiscal_document IS 'Emisión idempotente de factura completa para un pedido elegible (fix ambigüedad document_number)';
COMMENT ON FUNCTION create_rectifying_document_from_return IS 'Emisión idempotente de factura rectificativa para devolución completada (fix ambigüedad document_number)';
