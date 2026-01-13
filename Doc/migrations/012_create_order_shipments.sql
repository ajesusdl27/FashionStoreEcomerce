-- ============================================
-- FASHIONSTORE - ORDER SHIPMENTS TABLE
-- Tabla para almacenar información de envío
-- ============================================

-- 1. TABLA ORDER_SHIPMENTS
CREATE TABLE IF NOT EXISTS order_shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL,                    -- Empresa de transporte (SEUR, MRW, Correos, etc.)
  tracking_number TEXT,                     -- Número de seguimiento
  tracking_url TEXT,                        -- URL completa de seguimiento
  shipped_at TIMESTAMPTZ DEFAULT NOW(),     -- Fecha de envío
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id)                          -- Un envío por pedido
);

-- 2. ÍNDICE PARA BÚSQUEDAS
CREATE INDEX IF NOT EXISTS idx_order_shipments_order ON order_shipments(order_id);

-- 3. RLS POLICIES
ALTER TABLE order_shipments ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Admins can manage order_shipments" ON order_shipments;
DROP POLICY IF EXISTS "Customers can view their own shipments" ON order_shipments;

-- Admins pueden gestionar todos los envíos (usando JWT metadata)
CREATE POLICY "Admins can manage order_shipments"
  ON order_shipments
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Clientes pueden ver sus propios envíos
CREATE POLICY "Customers can view their own shipments"
  ON order_shipments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_shipments.order_id
      AND orders.customer_email = (auth.jwt() ->> 'email')
    )
  );
