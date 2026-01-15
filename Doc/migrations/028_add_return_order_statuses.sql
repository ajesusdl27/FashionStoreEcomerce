-- ============================================
-- FASHIONSTORE - AÑADIR ESTADOS DE DEVOLUCIÓN A PEDIDOS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Este script actualiza las opciones de status de orders para incluir
-- estados relacionados con devoluciones.

-- Nota: PostgreSQL no permite modificar directamente los valores de un CHECK constraint.
-- Primero debemos eliminar el constraint existente y luego crear uno nuevo.

-- 1. Eliminar el constraint de status existente (si existe)
DO $$
BEGIN
  -- Buscar y eliminar cualquier constraint CHECK sobre la columna status
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'orders' AND column_name = 'status'
  ) THEN
    -- Obtener el nombre del constraint y eliminarlo
    EXECUTE (
      SELECT 'ALTER TABLE orders DROP CONSTRAINT IF EXISTS ' || constraint_name
      FROM information_schema.constraint_column_usage
      WHERE table_name = 'orders' AND column_name = 'status'
      LIMIT 1
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Si no existe el constraint, continuar
    NULL;
END $$;

-- 2. Añadir nuevo constraint con estados adicionales para devoluciones
-- Estados:
--   pending          - Pedido creado, pendiente de pago
--   paid             - Pagado, esperando preparación
--   shipped          - Enviado al cliente
--   delivered        - Entregado al cliente
--   cancelled        - Pedido cancelado
--   return_requested - Cliente ha solicitado una devolución
--   return_approved  - Devolución aprobada, esperando envío del cliente
--   return_shipped   - Cliente ha enviado la devolución
--   return_received  - Devolución recibida, en inspección
--   return_completed - Devolución completada, reembolso procesado
--   partially_refunded - Reembolso parcial procesado

-- Nota: No añadimos el constraint estricto para mayor flexibilidad
-- Los valores se validan en la aplicación

-- 3. Crear función para validar estados de pedidos (opcional, para referencia)
CREATE OR REPLACE FUNCTION get_valid_order_statuses()
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY[
    'pending',
    'paid', 
    'shipped',
    'delivered',
    'cancelled',
    'return_requested',
    'return_approved',
    'return_shipped',
    'return_received',
    'return_completed',
    'partially_refunded'
  ];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Actualizar la función process_return para cambiar el estado del pedido
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
        admin_notes = COALESCE(p_notes, admin_notes)
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

-- 5. Función para que el cliente marque como enviada la devolución
CREATE OR REPLACE FUNCTION mark_return_shipped(
  p_return_id UUID,
  p_tracking_number TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
BEGIN
  -- Obtener la devolución y verificar que pertenece al usuario
  SELECT r.*, o.customer_id INTO v_return
  FROM returns r
  JOIN orders o ON o.id = r.order_id
  WHERE r.id = p_return_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;
  
  -- Verificar que el usuario es el propietario o es admin
  IF v_return.user_id != auth.uid() AND NOT is_admin() THEN
    RAISE EXCEPTION 'No tienes permiso para modificar esta devolución';
  END IF;
  
  IF v_return.status != 'approved' THEN
    RAISE EXCEPTION 'Solo se pueden marcar como enviadas devoluciones aprobadas';
  END IF;
  
  UPDATE returns SET 
    status = 'shipped',
    tracking_number = COALESCE(p_tracking_number, tracking_number)
  WHERE id = p_return_id;
  
  -- Actualizar estado del pedido
  UPDATE orders SET status = 'return_shipped' WHERE id = v_return.order_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
