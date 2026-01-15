-- Add return_label_url to returns table
ALTER TABLE returns ADD COLUMN return_label_url TEXT;

-- Update process_return function to accept return_label_url
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
  -- Verificar que el admin tiene permisos
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
        admin_notes = COALESCE(p_notes, admin_notes),
        return_label_url = COALESCE(p_return_label_url, return_label_url)
      WHERE id = p_return_id;
      
      -- Actualizar estado del pedido
      UPDATE orders SET status = 'return_approved' WHERE id = v_return.order_id;

    WHEN 'reject' THEN
      IF v_return.status NOT IN ('requested', 'approved') THEN
        RAISE EXCEPTION 'No se puede rechazar esta devolución';
      END IF;
      UPDATE returns SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Restaurar estado del pedido a delivered
      UPDATE orders SET status = 'delivered' WHERE id = v_return.order_id;

    WHEN 'receive' THEN
      IF v_return.status != 'shipped' AND v_return.status != 'approved' THEN
        RAISE EXCEPTION 'Solo se pueden marcar como recibidas devoluciones enviadas o aprobadas';
      END IF;
      UPDATE returns SET 
        status = 'received',
        received_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar estado del pedido
      UPDATE orders SET status = 'return_received' WHERE id = v_return.order_id;

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
      
      -- Determinar el estado final del pedido
      SELECT total_amount INTO v_order_total FROM orders WHERE id = v_return.order_id;
      
      IF v_total_refund >= v_order_total THEN
        UPDATE orders SET status = 'return_completed' WHERE id = v_return.order_id;
      ELSE
        UPDATE orders SET status = 'partially_refunded' WHERE id = v_return.order_id;
      END IF;

    ELSE
      RAISE EXCEPTION 'Acción no válida: %', p_action;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
