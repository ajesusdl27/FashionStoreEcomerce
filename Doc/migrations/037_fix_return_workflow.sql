-- ============================================
-- MIGRACIÓN: Corrección del Flujo de Devoluciones
-- Versión: 037
-- Fecha: 2026-01-23
-- Descripción: Corrige la lógica de validación de estados
--              para implementar el flujo correcto:
--              requested → approved → shipped → received → completed/rejected
-- ============================================

-- FLUJO CORRECTO:
-- 1. Cliente solicita (requested)
-- 2. Admin aprueba preliminarmente (approved) o rechaza (rejected)
-- 3. Cliente envía paquete (shipped)
-- 4. Admin recibe físicamente (received)
-- 5. Admin inspecciona y completa (completed) o rechaza (rejected)

-- Eliminar versiones anteriores de la función process_return
DROP FUNCTION IF EXISTS process_return(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS process_return(UUID, TEXT, TEXT, TEXT, TEXT);

-- Actualizar función process_return con validaciones corregidas
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
    -- COMPLETAR: Solo desde received después de inspección
    -- ========================================
    WHEN 'complete' THEN
      IF v_return.status != 'received' THEN
        RAISE EXCEPTION 'Solo se pueden completar devoluciones en estado "received"';
      END IF;
      
      -- Recalcular reembolso: solo items aprobados en la inspección
      -- Asegurar que cada item tiene su refund_amount correcto
      UPDATE return_items ri
      SET refund_amount = (
        SELECT oi.price_at_purchase * ri.quantity
        FROM order_items oi
        WHERE oi.id = ri.order_item_id
      )
      WHERE ri.return_id = p_return_id
      AND ri.inspection_status = 'approved'
      AND ri.refund_amount IS NULL OR ri.refund_amount = 0;
      
      -- Calcular reembolso total de items aprobados
      SELECT COALESCE(SUM(refund_amount), 0) INTO v_total_refund
      FROM return_items
      WHERE return_id = p_return_id AND inspection_status = 'approved';
      
      -- Restaurar stock para items aprobados y autorizados
      FOR v_item IN 
        SELECT ri.product_variant_id, ri.quantity
        FROM return_items ri
        WHERE ri.return_id = p_return_id 
        AND ri.inspection_status = 'approved'
        AND ri.restock_approved = TRUE
        AND ri.product_variant_id IS NOT NULL
      LOOP
        -- Incrementar stock
        UPDATE product_variants
        SET stock = stock + v_item.quantity
        WHERE id = v_item.product_variant_id;
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
      RAISE EXCEPTION 'Acción no válida: %. Válidas: approve, reject, receive, complete', p_action;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Función para que el CLIENTE marque como enviada
-- Solo puede hacerlo si la devolución está aprobada
-- ============================================
DROP FUNCTION IF EXISTS mark_return_shipped(UUID, TEXT);

CREATE OR REPLACE FUNCTION mark_return_shipped(
  p_return_id UUID,
  p_tracking_number TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
BEGIN
  -- Obtener devolución
  SELECT * INTO v_return FROM returns WHERE id = p_return_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  -- Verificar que el usuario es el propietario de la devolución
  IF v_return.user_id != auth.uid() AND NOT is_admin() THEN
    RAISE EXCEPTION 'No tienes permisos para modificar esta devolución';
  END IF;

  -- Validar que está en estado 'approved'
  IF v_return.status != 'approved' THEN
    RAISE EXCEPTION 'Solo puedes marcar como enviada una devolución aprobada. Estado actual: %', v_return.status;
  END IF;

  -- Actualizar a shipped
  UPDATE returns SET 
    status = 'shipped',
    tracking_number = COALESCE(p_tracking_number, tracking_number)
  WHERE id = p_return_id;
  
  -- Actualizar estado del pedido
  UPDATE orders SET status = 'return_shipped' WHERE id = v_return.order_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agregar política RLS para que clientes puedan ejecutar mark_return_shipped
GRANT EXECUTE ON FUNCTION mark_return_shipped TO authenticated;

-- Comentarios
COMMENT ON FUNCTION process_return IS 'Procesa acciones de admin en devoluciones: approve (requested→approved), reject (requested/received→rejected), receive (shipped→received), complete (received→completed)';
COMMENT ON FUNCTION mark_return_shipped IS 'Permite al cliente marcar su devolución como enviada una vez aprobada por admin';
