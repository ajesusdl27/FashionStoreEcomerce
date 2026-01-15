-- ============================================
-- FASHIONSTORE - SISTEMA DE FACTURAS
-- Migración 024: Crear tabla invoices
-- ============================================

-- Secuencia para numeración correlativa de facturas
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Tabla de facturas (solo para facturas completas solicitadas)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  -- Datos fiscales del cliente (capturados al solicitar factura)
  customer_nif TEXT NOT NULL,
  customer_fiscal_name TEXT NOT NULL,
  customer_fiscal_address TEXT NOT NULL,
  -- Importes desglosados
  subtotal NUMERIC(10,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 21.00,
  tax_amount NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- RLS Policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver facturas de sus propios pedidos
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE customer_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Los admins pueden ver todas las facturas
-- Los admins pueden ver todas las facturas
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Los admins pueden insertar facturas
CREATE POLICY "Admins can insert invoices" ON invoices
  FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Service role puede hacer todo (para webhooks/APIs)
CREATE POLICY "Service role full access" ON invoices
  FOR ALL
  USING (auth.role() = 'service_role');

-- Función RPC para generar número de factura
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_prefix TEXT;
  seq_num BIGINT;
BEGIN
  year_prefix := 'FS-' || EXTRACT(YEAR FROM NOW())::TEXT || '-';
  seq_num := nextval('invoice_number_seq');
  RETURN year_prefix || LPAD(seq_num::TEXT, 5, '0');
END;
$$;

-- Función RPC para crear factura
CREATE OR REPLACE FUNCTION create_invoice(
  p_order_id UUID,
  p_customer_nif TEXT,
  p_customer_fiscal_name TEXT,
  p_customer_fiscal_address TEXT
)
RETURNS TABLE(
  invoice_id UUID,
  invoice_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invoice_id UUID;
  v_invoice_number TEXT;
  v_order RECORD;
BEGIN
  -- Verificar que el pedido existe y está pagado
  SELECT id, total_amount, customer_email 
  INTO v_order
  FROM orders 
  WHERE id = p_order_id AND status IN ('paid', 'shipped', 'delivered');
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido no encontrado o no está pagado';
  END IF;
  
  -- Verificar que no existe ya una factura para este pedido
  IF EXISTS (SELECT 1 FROM invoices WHERE order_id = p_order_id) THEN
    RAISE EXCEPTION 'Ya existe una factura para este pedido';
  END IF;
  
  -- Generar número de factura
  v_invoice_number := generate_invoice_number();
  
  -- Calcular importes
  -- subtotal = total / 1.21 (asumiendo IVA 21%)
  -- tax_amount = total - subtotal
  
  INSERT INTO invoices (
    order_id,
    invoice_number,
    customer_nif,
    customer_fiscal_name,
    customer_fiscal_address,
    subtotal,
    tax_rate,
    tax_amount,
    total
  ) VALUES (
    p_order_id,
    v_invoice_number,
    p_customer_nif,
    p_customer_fiscal_name,
    p_customer_fiscal_address,
    ROUND(v_order.total_amount / 1.21, 2),
    21.00,
    ROUND(v_order.total_amount - (v_order.total_amount / 1.21), 2),
    v_order.total_amount
  )
  RETURNING id INTO v_invoice_id;
  
  RETURN QUERY SELECT v_invoice_id, v_invoice_number;
END;
$$;
