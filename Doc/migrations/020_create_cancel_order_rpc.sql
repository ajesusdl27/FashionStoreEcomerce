-- ============================================
-- FASHIONSTORE - CANCEL ORDER RPC
-- Atomic order cancellation with stock restoration
-- ============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS cancel_order(UUID);

-- Function to atomically cancel an order and restore stock
-- Returns true if successful, raises exception on failure
CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_order_status TEXT;
  v_item RECORD;
BEGIN
  -- 1. Lock and fetch the order status
  SELECT status INTO v_order_status
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  -- Check if order exists
  IF v_order_status IS NULL THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  -- 2. Validate order can be cancelled (only 'paid' status)
  IF v_order_status <> 'paid' THEN
    RAISE EXCEPTION 'Order cannot be cancelled. Current status: %. Only "paid" orders can be cancelled.', v_order_status;
  END IF;

  -- 3. Update order status to 'cancelled'
  UPDATE orders
  SET status = 'cancelled'
  WHERE id = p_order_id;

  -- 4. Restore stock for each order item
  FOR v_item IN
    SELECT variant_id, quantity
    FROM order_items
    WHERE order_id = p_order_id
      AND variant_id IS NOT NULL
  LOOP
    -- Use the existing restore_stock function
    PERFORM restore_stock(v_item.variant_id, v_item.quantity);
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION cancel_order(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION cancel_order(UUID) IS 
  'Atomically cancels an order (status must be "paid") and restores stock for all items.';
