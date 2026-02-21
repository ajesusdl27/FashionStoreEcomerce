-- ============================================
-- FASHIONSTORE - MIGRACIÓN 040
-- Sistema unificado de documentos fiscales
-- - Factura completa
-- - Factura simplificada (ticket)
-- - Factura rectificativa
-- ============================================

CREATE SEQUENCE IF NOT EXISTS fiscal_document_number_seq START 1;

CREATE TABLE IF NOT EXISTS fiscal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  return_id UUID REFERENCES returns(id) ON DELETE SET NULL,
  legacy_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  original_document_id UUID REFERENCES fiscal_documents(id) ON DELETE SET NULL,

  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'simplified', 'rectifying')),
  document_number TEXT NOT NULL UNIQUE,
  sequence_number BIGINT NOT NULL DEFAULT nextval('fiscal_document_number_seq'),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_nif TEXT,
  customer_fiscal_address TEXT,

  subtotal NUMERIC(10,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 21.00,
  tax_amount NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',

  pdf_url TEXT,
  pdf_storage_path TEXT,
  pdf_sha256 TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fiscal_documents_rectifying_requires_original
    CHECK (
      document_type != 'rectifying'
      OR (document_type = 'rectifying' AND original_document_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_fiscal_documents_order ON fiscal_documents(order_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_documents_return ON fiscal_documents(return_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_documents_type ON fiscal_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_fiscal_documents_issued_at ON fiscal_documents(issued_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_fiscal_document_invoice_per_order
  ON fiscal_documents(order_id)
  WHERE document_type = 'invoice';

CREATE UNIQUE INDEX IF NOT EXISTS uniq_fiscal_document_simplified_per_order
  ON fiscal_documents(order_id)
  WHERE document_type = 'simplified';

CREATE UNIQUE INDEX IF NOT EXISTS uniq_fiscal_document_rectifying_per_return
  ON fiscal_documents(return_id)
  WHERE document_type = 'rectifying' AND return_id IS NOT NULL;

ALTER TABLE fiscal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fiscal documents" ON fiscal_documents
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins can view all fiscal documents" ON fiscal_documents
  FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Service role full access fiscal documents" ON fiscal_documents
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION set_fiscal_document_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_set_fiscal_document_updated_at ON fiscal_documents;
CREATE TRIGGER tr_set_fiscal_document_updated_at
  BEFORE UPDATE ON fiscal_documents
  FOR EACH ROW
  EXECUTE FUNCTION set_fiscal_document_updated_at();

CREATE OR REPLACE FUNCTION generate_fiscal_document_number(
  p_document_type TEXT,
  p_issued_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefix TEXT;
  v_seq BIGINT;
  v_year TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM p_issued_at)::TEXT;

  v_prefix := CASE p_document_type
    WHEN 'invoice' THEN 'FSI'
    WHEN 'simplified' THEN 'FSS'
    WHEN 'rectifying' THEN 'FSR'
    ELSE 'FSD'
  END;

  v_seq := nextval('fiscal_document_number_seq');

  RETURN v_prefix || '-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
END;
$$;

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

  SELECT id, document_number
  INTO v_existing
  FROM fiscal_documents
  WHERE order_id = p_order_id
    AND document_type = 'simplified'
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

  SELECT id, document_number
  INTO v_existing
  FROM fiscal_documents
  WHERE order_id = p_order_id
    AND document_type = 'invoice'
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

  SELECT id, document_number
  INTO v_existing
  FROM fiscal_documents
  WHERE return_id = p_return_id
    AND document_type = 'rectifying'
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT v_existing.id, v_existing.document_number, v_existing.original_document_id;
    RETURN;
  END IF;

  v_original := p_original_document_id;

  IF v_original IS NULL THEN
    SELECT id
    INTO v_original
    FROM fiscal_documents
    WHERE order_id = v_return.order_id
      AND document_type IN ('invoice', 'simplified')
    ORDER BY CASE WHEN document_type = 'invoice' THEN 0 ELSE 1 END, issued_at ASC
    LIMIT 1;
  END IF;

  IF v_original IS NULL THEN
    RAISE EXCEPTION 'No existe documento fiscal original para el pedido';
  END IF;

  SELECT customer_name, customer_email, customer_nif, customer_fiscal_address
  INTO v_original_doc
  FROM fiscal_documents
  WHERE id = v_original;

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

INSERT INTO fiscal_documents (
  order_id,
  legacy_invoice_id,
  document_type,
  document_number,
  issued_at,
  customer_name,
  customer_email,
  customer_nif,
  customer_fiscal_address,
  subtotal,
  tax_rate,
  tax_amount,
  total,
  pdf_url,
  metadata
)
SELECT
  i.order_id,
  i.id,
  'invoice',
  i.invoice_number,
  COALESCE(i.issued_at, i.created_at, NOW()),
  COALESCE(i.customer_fiscal_name, o.customer_name, 'Cliente'),
  o.customer_email,
  i.customer_nif,
  i.customer_fiscal_address,
  i.subtotal,
  i.tax_rate,
  i.tax_amount,
  i.total,
  i.pdf_url,
  jsonb_build_object('migrated_from', 'invoices', 'legacy_invoice_id', i.id)
FROM invoices i
LEFT JOIN orders o ON o.id = i.order_id
ON CONFLICT (document_number) DO NOTHING;

COMMENT ON TABLE fiscal_documents IS 'Repositorio unificado de documentos fiscales emitidos (factura completa, simplificada y rectificativa)';
COMMENT ON FUNCTION create_simplified_ticket_document IS 'Emisión idempotente de factura simplificada para un pedido elegible';
COMMENT ON FUNCTION create_rectifying_document_from_return IS 'Emisión idempotente de factura rectificativa a partir de una devolución completada';

CREATE OR REPLACE FUNCTION sync_invoice_to_fiscal_documents()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_name TEXT;
  v_customer_email TEXT;
BEGIN
  SELECT o.customer_name, o.customer_email
  INTO v_customer_name, v_customer_email
  FROM orders o
  WHERE o.id = NEW.order_id;

  INSERT INTO fiscal_documents (
    order_id,
    legacy_invoice_id,
    document_type,
    document_number,
    issued_at,
    customer_name,
    customer_email,
    customer_nif,
    customer_fiscal_address,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    pdf_url,
    metadata
  ) VALUES (
    NEW.order_id,
    NEW.id,
    'invoice',
    NEW.invoice_number,
    COALESCE(NEW.issued_at, NEW.created_at, NOW()),
    COALESCE(NEW.customer_fiscal_name, v_customer_name, 'Cliente'),
    v_customer_email,
    NEW.customer_nif,
    NEW.customer_fiscal_address,
    NEW.subtotal,
    NEW.tax_rate,
    NEW.tax_amount,
    NEW.total,
    NEW.pdf_url,
    jsonb_build_object('synced_from', 'invoices', 'legacy_invoice_id', NEW.id)
  )
  ON CONFLICT (document_number)
  DO UPDATE SET
    legacy_invoice_id = EXCLUDED.legacy_invoice_id,
    customer_name = EXCLUDED.customer_name,
    customer_email = EXCLUDED.customer_email,
    customer_nif = EXCLUDED.customer_nif,
    customer_fiscal_address = EXCLUDED.customer_fiscal_address,
    subtotal = EXCLUDED.subtotal,
    tax_rate = EXCLUDED.tax_rate,
    tax_amount = EXCLUDED.tax_amount,
    total = EXCLUDED.total,
    pdf_url = COALESCE(EXCLUDED.pdf_url, fiscal_documents.pdf_url),
    issued_at = EXCLUDED.issued_at,
    metadata = fiscal_documents.metadata || jsonb_build_object('last_sync_at', NOW());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_invoice_to_fiscal_documents ON invoices;
CREATE TRIGGER tr_sync_invoice_to_fiscal_documents
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION sync_invoice_to_fiscal_documents();

COMMENT ON FUNCTION sync_invoice_to_fiscal_documents IS 'Sincroniza automáticamente la tabla invoices legacy con fiscal_documents';