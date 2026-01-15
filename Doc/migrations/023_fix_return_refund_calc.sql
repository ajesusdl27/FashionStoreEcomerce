-- ============================================
-- FIX: RECALCULO DE MONTOS DE DEVOLUCIÓN
-- ============================================

-- 1. Mejorar inspect_return_item para cálculo directo
CREATE OR REPLACE FUNCTION inspect_return_item(
  p_item_id UUID,
  p_status TEXT,  -- 'approved' o 'rejected'
  p_restock BOOLEAN DEFAULT FALSE,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Verificar admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden inspeccionar items';
  END IF;

  -- Verificar estado
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

  -- Actualizar
  IF p_status = 'approved' THEN
    UPDATE return_items ri
    SET
      inspection_status = 'approved',
      restock_approved = p_restock,
      inspection_notes = p_notes,
      refund_amount = (
        SELECT oi.price_at_purchase * ri.quantity
        FROM order_items oi
        WHERE oi.id = ri.order_item_id
      )
    WHERE id = p_item_id;
  ELSE
    UPDATE return_items
    SET
      inspection_status = 'rejected',
      restock_approved = FALSE,
      inspection_notes = p_notes,
      refund_amount = 0
    WHERE id = p_item_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Mejorar process_return para asegurar cálculo al completar
CREATE OR REPLACE FUNCTION process_return(
  p_return_id UUID,
  p_action TEXT,
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
  v_item RECORD;
  v_total_refund NUMERIC(10, 2) := 0;
BEGIN
  -- Verificar admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden procesar devoluciones';
  END IF;

  SELECT * INTO v_return FROM returns WHERE id = p_return_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

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
      
      -- RECALCULO DE SEGURIDAD: Asegurar que todos los items aprobados tengan su refund_amount correcto
      -- Esto corrige cualquier item que pudiera haberse quedado a 0 por error en la inspección
      UPDATE return_items ri
      SET refund_amount = (
        SELECT oi.price_at_purchase * ri.quantity
        FROM order_items oi
        WHERE oi.id = ri.order_item_id
      )
      WHERE ri.return_id = p_return_id AND ri.inspection_status = 'approved';

      -- Calcular total sumando los items (ahora garantizados correctos)
      SELECT COALESCE(SUM(refund_amount), 0) INTO v_total_refund
      FROM return_items
      WHERE return_id = p_return_id AND inspection_status = 'approved';
      
      -- Restaurar stock
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
      
      -- Actualizar order
      UPDATE orders SET 
        refunded_amount = COALESCE(refunded_amount, 0) + v_total_refund
      WHERE id = v_return.order_id;

    ELSE
      RAISE EXCEPTION 'Acción no válida: %', p_action;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CORRECCIÓN DE DATOS EXISTENTES (DO BLOCK)
DO $$
DECLARE
  v_rec_item RECORD;
  v_rec_return RECORD;
  v_total NUMERIC;
BEGIN
  -- A. Arreglar return_items con refund_amount = 0 que estan aprobados
  FOR v_rec_item IN 
    SELECT ri.id, ri.quantity, ri.order_item_id 
    FROM return_items ri
    WHERE ri.inspection_status = 'approved' AND (ri.refund_amount IS NULL OR ri.refund_amount = 0)
  LOOP
    UPDATE return_items
    SET refund_amount = (
      SELECT oi.price_at_purchase * v_rec_item.quantity
      FROM order_items oi
      WHERE oi.id = v_rec_item.order_item_id
    )
    WHERE id = v_rec_item.id;
  END LOOP;

  -- B. Recalcular returns completados con refund_amount = 0
  FOR v_rec_return IN 
    SELECT r.id, r.order_id 
    FROM returns r 
    WHERE r.status = 'completed' AND (r.refund_amount IS NULL OR r.refund_amount = 0)
  LOOP
    -- Calcular real
    SELECT COALESCE(SUM(ri.refund_amount), 0) INTO v_total
    FROM return_items ri
    WHERE ri.return_id = v_rec_return.id AND ri.inspection_status = 'approved';
    
    -- Actualizar return
    UPDATE returns SET refund_amount = v_total WHERE id = v_rec_return.id;
    
    -- Actualizar order (sumar la diferencia)
    UPDATE orders 
    SET refunded_amount = COALESCE(refunded_amount, 0) + v_total
    WHERE id = v_rec_return.order_id;
  END LOOP;
END;
$$;
