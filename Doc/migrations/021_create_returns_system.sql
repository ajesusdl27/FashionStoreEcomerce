-- ============================================
-- FASHIONSTORE - SISTEMA DE DEVOLUCIONES
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- ============================================
-- 0. FUNCIÓN AUXILIAR: Verificar si usuario es admin
-- Usa raw_user_meta_data->>'is_admin' de auth.users
-- ============================================
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'is_admin')::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 1. TABLA PRINCIPAL DE DEVOLUCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Estado del proceso
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN (
    'requested',   -- Solicitud enviada por cliente
    'approved',    -- Aprobada por admin, esperando envío
    'shipped',     -- Cliente ha enviado el paquete
    'received',    -- Paquete recibido, en inspección
    'completed',   -- Reembolso procesado
    'rejected'     -- Rechazada por admin
  )),
  
  -- Datos financieros
  refund_amount NUMERIC(10, 2) DEFAULT 0,
  refund_method TEXT DEFAULT 'original_payment',
  
  -- Notas y comunicación
  customer_notes TEXT,         -- Mensaje del cliente al solicitar
  admin_notes TEXT,            -- Notas internas del admin
  rejection_reason TEXT,       -- Motivo si se rechaza
  
  -- Tracking
  tracking_number TEXT,        -- Número de seguimiento del envío de vuelta
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ============================================
-- 2. ITEMS DE LA DEVOLUCIÓN
-- ============================================
CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  
  -- Motivo de devolución
  reason TEXT NOT NULL CHECK (reason IN (
    'size_mismatch',    -- Talla incorrecta
    'defective',        -- Producto defectuoso
    'not_as_described', -- No coincide con descripción
    'changed_mind',     -- Cambio de opinión
    'arrived_late',     -- Llegó tarde
    'other'             -- Otro motivo
  )),
  reason_details TEXT,  -- Detalle adicional del motivo
  
  -- Inspección (solo admin)
  inspection_status TEXT DEFAULT 'pending' CHECK (inspection_status IN (
    'pending',     -- No inspeccionado
    'approved',    -- Apto para restock
    'rejected'     -- No apto (dañado, usado, etc.)
  )),
  inspection_notes TEXT,
  restock_approved BOOLEAN DEFAULT FALSE,
  
  -- Precio para cálculo de reembolso
  refund_amount NUMERIC(10, 2) DEFAULT 0
);

-- ============================================
-- 3. IMÁGENES DE DEVOLUCIÓN (Pruebas)
-- ============================================
CREATE TABLE IF NOT EXISTS return_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  return_item_id UUID REFERENCES return_items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  uploaded_by TEXT DEFAULT 'customer', -- 'customer' o 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. MODIFICAR TABLA ORDERS (Añadir refunded_amount)
-- ============================================
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC(10, 2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- ============================================
-- 5. CONFIGURACIÓN DE POLÍTICA DE DEVOLUCIONES
-- ============================================
INSERT INTO settings (key, value_bool, description) VALUES
  ('returns_enabled', true, 'Habilita/deshabilita el sistema de devoluciones')
ON CONFLICT (key) DO NOTHING;

-- Añadir columna para valores numéricos si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'settings' AND column_name = 'value_number') THEN
    ALTER TABLE settings ADD COLUMN value_number INTEGER;
  END IF;
END $$;

INSERT INTO settings (key, value_number, description) VALUES
  ('return_window_days', 30, 'Días máximos para solicitar devolución desde entrega')
ON CONFLICT (key) DO UPDATE SET value_number = EXCLUDED.value_number;

-- ============================================
-- 6. ÍNDICES PARA RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_returns_order ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user ON returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_return_items_return ON return_items(return_id);

-- ============================================
-- 7. ROW LEVEL SECURITY
-- ============================================

-- Habilitar RLS
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_images ENABLE ROW LEVEL SECURITY;

-- Políticas para returns (usando is_admin() en lugar de tabla admins)
CREATE POLICY "Users can view their own returns" ON returns
  FOR SELECT USING (
    user_id = auth.uid() 
    OR is_admin()
  );

CREATE POLICY "Users can create returns for their orders" ON returns
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_id 
      AND o.customer_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can update returns" ON returns
  FOR UPDATE USING (is_admin());

-- Políticas para return_items
CREATE POLICY "Users can view their return items" ON return_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM returns r 
      WHERE r.id = return_id 
      AND (r.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can insert return items" ON return_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM returns r 
      WHERE r.id = return_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update return items" ON return_items
  FOR UPDATE USING (is_admin());

-- Políticas para return_images
CREATE POLICY "Users can view return images" ON return_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM returns r 
      WHERE r.id = return_id 
      AND (r.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can upload return images" ON return_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM returns r 
      WHERE r.id = return_id AND r.user_id = auth.uid()
    )
  );

-- ============================================
-- 8. FUNCIÓN RPC: Procesar Devolución (Admin)
-- ============================================
CREATE OR REPLACE FUNCTION process_return(
  p_return_id UUID,
  p_action TEXT,  -- 'approve', 'reject', 'receive', 'complete'
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
  v_item RECORD;
  v_total_refund NUMERIC(10, 2) := 0;
BEGIN
  -- Verificar que el admin tiene permisos (usa is_admin())
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden procesar devoluciones';
  END IF;

  -- Obtener la devolución
  SELECT * INTO v_return FROM returns WHERE id = p_return_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  -- Procesar según la acción
  CASE p_action
    WHEN 'approve' THEN
      IF v_return.status != 'requested' THEN
        RAISE EXCEPTION 'Solo se pueden aprobar devoluciones en estado "requested"';
      END IF;
      UPDATE returns SET 
        status = 'approved', 
        approved_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

    WHEN 'reject' THEN
      IF v_return.status NOT IN ('requested', 'approved') THEN
        RAISE EXCEPTION 'No se puede rechazar esta devolución';
      END IF;
      UPDATE returns SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

    WHEN 'receive' THEN
      IF v_return.status != 'shipped' AND v_return.status != 'approved' THEN
        RAISE EXCEPTION 'Solo se pueden marcar como recibidas devoluciones enviadas o aprobadas';
      END IF;
      UPDATE returns SET 
        status = 'received',
        received_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

    WHEN 'complete' THEN
      IF v_return.status != 'received' THEN
        RAISE EXCEPTION 'Solo se pueden completar devoluciones en estado "received"';
      END IF;
      
      -- Calcular reembolso total de items aprobados
      SELECT COALESCE(SUM(refund_amount), 0) INTO v_total_refund
      FROM return_items
      WHERE return_id = p_return_id AND inspection_status = 'approved';
      
      -- Restaurar stock para items aprobados
      FOR v_item IN 
        SELECT ri.product_variant_id, ri.quantity
        FROM return_items ri
        WHERE ri.return_id = p_return_id 
        AND ri.inspection_status = 'approved'
        AND ri.restock_approved = TRUE
        AND ri.product_variant_id IS NOT NULL
      LOOP
        PERFORM restore_stock(v_item.product_variant_id, v_item.quantity);
      END LOOP;
      
      -- Actualizar devolución
      UPDATE returns SET 
        status = 'completed',
        completed_at = NOW(),
        refund_amount = v_total_refund,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar order con el monto reembolsado
      UPDATE orders SET 
        refunded_amount = COALESCE(refunded_amount, 0) + v_total_refund
      WHERE id = v_return.order_id;

    ELSE
      RAISE EXCEPTION 'Acción no válida: %', p_action;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. FUNCIÓN RPC: Inspeccionar Item (Admin)
-- ============================================
CREATE OR REPLACE FUNCTION inspect_return_item(
  p_item_id UUID,
  p_status TEXT,  -- 'approved' o 'rejected'
  p_restock BOOLEAN DEFAULT FALSE,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
  v_order_item RECORD;
BEGIN
  -- Verificar admin (usa is_admin())
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden inspeccionar items';
  END IF;

  -- Obtener item
  SELECT ri.*, r.status as return_status
  INTO v_item
  FROM return_items ri
  JOIN returns r ON r.id = ri.return_id
  WHERE ri.id = p_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item no encontrado';
  END IF;

  IF v_item.return_status != 'received' THEN
    RAISE EXCEPTION 'Solo se pueden inspeccionar items de devoluciones recibidas';
  END IF;

  -- Calcular monto de reembolso si se aprueba
  IF p_status = 'approved' THEN
    SELECT oi.price_at_purchase INTO v_order_item
    FROM order_items oi WHERE oi.id = v_item.order_item_id;
    
    UPDATE return_items SET
      inspection_status = 'approved',
      restock_approved = p_restock,
      inspection_notes = p_notes,
      refund_amount = COALESCE(v_order_item.price_at_purchase, 0) * v_item.quantity
    WHERE id = p_item_id;
  ELSE
    UPDATE return_items SET
      inspection_status = 'rejected',
      restock_approved = FALSE,
      inspection_notes = p_notes,
      refund_amount = 0
    WHERE id = p_item_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
