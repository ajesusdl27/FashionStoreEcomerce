-- ============================================================================
-- Migration 038: Remove is_admin() check from return RPC functions
-- ============================================================================
-- Reason: Admin validation is already done in TypeScript API layer
-- The is_admin() check fails when using service role client (supabaseAdmin)
-- because auth.uid() returns NULL with service role context
-- ============================================================================

-- Drop and recreate process_return without is_admin() check
DROP FUNCTION IF EXISTS process_return(UUID, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION process_return(
  p_return_id UUID,
  p_action TEXT,  -- 'approve', 'reject', 'receive', 'complete'
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL,
  p_return_label_url TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
  v_item RECORD;
  v_total_refund NUMERIC(10, 2) := 0;
  v_order_total NUMERIC(10, 2);
BEGIN
  -- Admin validation is done in TypeScript API layer before calling this function
  -- No need to verify is_admin() here as this function is only called from backend API

  -- Obtener devolución actual
  SELECT * INTO v_return FROM returns WHERE id = p_return_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  CASE p_action
    -- ========================================
    -- APROBAR: Solo desde requested
    -- ========================================
    WHEN 'approve' THEN
      IF v_return.status != 'requested' THEN
        RAISE EXCEPTION 'Solo se pueden aprobar devoluciones en estado "requested"';
      END IF;
      
      UPDATE returns SET 
        status = 'approved', 
        approved_at = NOW(),
        return_label_url = p_return_label_url,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar estado del pedido
      UPDATE orders SET status = 'return_approved' WHERE id = v_return.order_id;

    -- ========================================
    -- RECHAZAR: Puede ser desde requested O received
    -- ========================================
    WHEN 'reject' THEN
      -- Rechazo inicial: desde requested (motivo inválido, fuera de plazo, etc.)
      -- Rechazo final: desde received (producto dañado por cliente, incompleto, etc.)
      IF v_return.status NOT IN ('requested', 'received') THEN
        RAISE EXCEPTION 'Solo se pueden rechazar devoluciones en estado "requested" o "received"';
      END IF;
      
      UPDATE returns SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Si se rechaza después de recibir, actualizar estado del pedido
      IF v_return.status = 'received' THEN
        UPDATE orders SET status = 'delivered' WHERE id = v_return.order_id;
      ELSE
        -- Si se rechaza antes de enviar, restaurar a delivered
        UPDATE orders SET status = 'delivered' WHERE id = v_return.order_id;
      END IF;

    -- ========================================
    -- RECIBIR: Solo desde shipped
    -- ========================================
    WHEN 'receive' THEN
      IF v_return.status != 'shipped' THEN
        RAISE EXCEPTION 'Solo se pueden marcar como recibidas devoluciones en estado "shipped"';
      END IF;
      
      UPDATE returns SET 
        status = 'received',
        received_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar estado del pedido
      UPDATE orders SET status = 'return_received' WHERE id = v_return.order_id;

    -- ========================================
    -- COMPLETAR: Solo desde received
    -- ========================================
    WHEN 'complete' THEN
      IF v_return.status != 'received' THEN
        RAISE EXCEPTION 'Solo se pueden completar devoluciones en estado "received"';
      END IF;

      -- Calcular el monto total del reembolso
      FOR v_item IN 
        SELECT * FROM return_items WHERE return_id = p_return_id
      LOOP
        IF v_item.inspection_status = 'approved' THEN
          v_total_refund := v_total_refund + (v_item.refund_amount * v_item.quantity);
        END IF;
      END LOOP;

      IF v_total_refund = 0 THEN
        RAISE EXCEPTION 'No hay items aprobados para reembolsar';
      END IF;

      -- Obtener total del pedido
      SELECT total_amount INTO v_order_total FROM orders WHERE id = v_return.order_id;

      UPDATE returns SET 
        status = 'completed',
        completed_at = NOW(),
        refund_amount = v_total_refund,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

      -- Si se reembolsó el total del pedido, el pedido pasa a estado 'returned'
      -- Si es parcial, mantiene 'return_completed'
      IF v_total_refund >= v_order_total THEN
        UPDATE orders SET status = 'returned' WHERE id = v_return.order_id;
      ELSE
        UPDATE orders SET status = 'return_completed' WHERE id = v_return.order_id;
      END IF;

    ELSE
      RAISE EXCEPTION 'Acción inválida: %', p_action;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION process_return IS 'Procesa acciones de admin en devoluciones. Admin validation is done in API layer before calling this function.';


-- ============================================================================
-- Update inspect_return_item to remove is_admin() check
-- ============================================================================

DROP FUNCTION IF EXISTS inspect_return_item(UUID, TEXT, BOOLEAN, TEXT);

CREATE OR REPLACE FUNCTION inspect_return_item(
  p_item_id UUID,
  p_status TEXT,  -- 'approved' or 'rejected'
  p_restock BOOLEAN DEFAULT FALSE,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
  v_variant_id UUID;
BEGIN
  -- Admin validation is done in TypeScript API layer before calling this function
  -- No need to verify is_admin() here as this function is only called from backend API

  -- Validar status
  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Status inválido. Debe ser "approved" o "rejected"';
  END IF;

  -- Obtener item
  SELECT * INTO v_item FROM return_items WHERE id = p_item_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item de devolución no encontrado';
  END IF;

  -- Obtener variant_id del order_item
  SELECT variant_id INTO v_variant_id 
  FROM order_items 
  WHERE id = v_item.order_item_id;

  -- Actualizar el item (sin inspected_at ya que esa columna no existe)
  UPDATE return_items SET
    inspection_status = p_status,
    inspection_notes = COALESCE(p_notes, inspection_notes)
  WHERE id = p_item_id;

  -- Si se aprueba y se debe restockear, devolver al inventario
  IF p_status = 'approved' AND p_restock AND v_variant_id IS NOT NULL THEN
    UPDATE product_variants
    SET stock = stock + v_item.quantity
    WHERE id = v_variant_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION inspect_return_item IS 'Inspects a return item and optionally restocks inventory. Admin validation is done in API layer.';
