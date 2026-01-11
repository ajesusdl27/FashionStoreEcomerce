-- ============================================
-- FASHIONSTORE - STOCK RESERVATION FUNCTIONS
-- Add atomic stock operations to prevent race conditions
-- ============================================

-- Drop existing functions first (if they exist with different parameter names)
DROP FUNCTION IF EXISTS reserve_stock(UUID, INTEGER);
DROP FUNCTION IF EXISTS restore_stock(UUID, INTEGER);

-- Function to atomically reserve (decrement) stock
-- Returns true if successful, false if insufficient stock
CREATE OR REPLACE FUNCTION reserve_stock(
  p_variant_id UUID,
  p_quantity INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_rows_affected INTEGER;
BEGIN
  -- Atomic update: only succeeds if there's enough stock
  UPDATE product_variants 
  SET stock = stock - p_quantity
  WHERE id = p_variant_id 
    AND stock >= p_quantity;
  
  -- Check if any row was updated
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  
  RETURN v_rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore (increment) stock after failed/cancelled payment
CREATE OR REPLACE FUNCTION restore_stock(
  p_variant_id UUID,
  p_quantity INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_rows_affected INTEGER;
BEGIN
  -- Atomically restore stock
  UPDATE product_variants 
  SET stock = stock + p_quantity
  WHERE id = p_variant_id;
  
  -- Check if any row was updated
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  
  RETURN v_rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated and anon roles
GRANT EXECUTE ON FUNCTION reserve_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION reserve_stock(UUID, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION restore_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_stock(UUID, INTEGER) TO anon;

-- Add index for faster stock lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON product_variants(id, stock);
