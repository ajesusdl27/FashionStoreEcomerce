-- ============================================================================
-- Migration 042: Fix return refund calculation with coupon proration
-- ============================================================================
-- Problem:
-- - process_return('complete') multiplied refund_amount by quantity again
-- - refund did not account for order-level coupon discounts
--
-- Goal:
-- - Refund "what the customer paid for returned products"
-- - Keep shipping out of standard return completion refund calculation
-- ============================================================================

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
  v_order_total NUMERIC(10, 2) := 0;
  v_order_discount NUMERIC(10, 2) := 0;
  v_order_items_gross NUMERIC(10, 2) := 0;
  v_approved_count INTEGER := 0;
BEGIN
  -- Admin validation is done in TypeScript API layer before calling this function

  -- Obtener devolución actual
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
        return_label_url = p_return_label_url,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

      UPDATE orders SET status = 'return_approved' WHERE id = v_return.order_id;

    WHEN 'reject' THEN
      IF v_return.status NOT IN ('requested', 'received') THEN
        RAISE EXCEPTION 'Solo se pueden rechazar devoluciones en estado "requested" o "received"';
      END IF;

      UPDATE returns SET
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

      UPDATE orders SET status = 'delivered' WHERE id = v_return.order_id;

    WHEN 'receive' THEN
      IF v_return.status != 'shipped' THEN
        RAISE EXCEPTION 'Solo se pueden marcar como recibidas devoluciones en estado "shipped"';
      END IF;

      UPDATE returns SET
        status = 'received',
        received_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

      UPDATE orders SET status = 'return_received' WHERE id = v_return.order_id;

    WHEN 'complete' THEN
      IF v_return.status != 'received' THEN
        RAISE EXCEPTION 'Solo se pueden completar devoluciones en estado "received"';
      END IF;

      SELECT COUNT(*) INTO v_approved_count
      FROM return_items
      WHERE return_id = p_return_id
        AND inspection_status = 'approved';

      IF v_approved_count = 0 THEN
        RAISE EXCEPTION 'No hay items aprobados para reembolsar';
      END IF;

      SELECT
        COALESCE(o.total_amount, 0),
        COALESCE(o.discount_amount, 0),
        COALESCE((
          SELECT SUM(oi.price_at_purchase * oi.quantity)
          FROM order_items oi
          WHERE oi.order_id = o.id
        ), 0)
      INTO v_order_total, v_order_discount, v_order_items_gross
      FROM orders o
      WHERE o.id = v_return.order_id;

      -- Recalcular refund_amount por línea (neto, descontando parte proporcional del cupón)
      WITH approved_lines AS (
        SELECT
          ri.id,
          ROUND(oi.price_at_purchase * ri.quantity, 2) AS line_gross
        FROM return_items ri
        JOIN order_items oi ON oi.id = ri.order_item_id
        WHERE ri.return_id = p_return_id
          AND ri.inspection_status = 'approved'
      ),
      calculated AS (
        SELECT
          id,
          ROUND(
            GREATEST(
              line_gross - CASE
                WHEN v_order_items_gross > 0 AND v_order_discount > 0
                  THEN (v_order_discount * line_gross / v_order_items_gross)
                ELSE 0
              END,
              0
            ),
            2
          ) AS line_refund
        FROM approved_lines
      )
      UPDATE return_items ri
      SET refund_amount = c.line_refund
      FROM calculated c
      WHERE ri.id = c.id;

      SELECT COALESCE(SUM(refund_amount), 0) INTO v_total_refund
      FROM return_items
      WHERE return_id = p_return_id
        AND inspection_status = 'approved';

      IF v_total_refund <= 0 THEN
        RAISE EXCEPTION 'No hay importe válido para reembolsar';
      END IF;

      UPDATE returns SET
        status = 'completed',
        completed_at = NOW(),
        refund_amount = v_total_refund,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

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

COMMENT ON FUNCTION process_return IS 'Procesa acciones de admin en devoluciones. Reembolso neto prorratea el cupón por items devueltos.';
