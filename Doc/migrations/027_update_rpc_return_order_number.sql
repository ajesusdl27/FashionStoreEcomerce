-- ============================================
-- FASHIONSTORE - MIGRACIÓN 027
-- Actualizar create_checkout_order para retornar order_number
-- Fecha: 2026-01-15
-- Autor: Sistema
-- ============================================
-- 
-- OBJETIVO:
-- Modificar la función RPC create_checkout_order para que retorne
-- un JSON con order_id y order_number en lugar de solo el UUID
--
-- IMPACTO: Cambio en el tipo de retorno de la función
-- El backend ya está preparado para recibir JSON
-- ============================================

-- Drop la función existente (con todos sus parámetros)
DROP FUNCTION IF EXISTS create_checkout_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, JSONB, UUID);

-- Recrear la función con retorno JSON
CREATE OR REPLACE FUNCTION create_checkout_order(
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_shipping_address TEXT,
  p_shipping_city TEXT,
  p_shipping_postal_code TEXT,
  p_shipping_country TEXT,
  p_total_amount NUMERIC,
  p_stripe_session_id TEXT,
  p_items JSONB,
  p_customer_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_order_id UUID;
  v_order_number BIGINT;
  v_item JSONB;
BEGIN
  -- Create the order with optional customer_id
  -- order_number será asignado automáticamente por IDENTITY
  INSERT INTO orders (
    customer_name, customer_email, customer_phone,
    shipping_address, shipping_city, shipping_postal_code, shipping_country,
    total_amount, status, stripe_session_id, customer_id
  ) VALUES (
    p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_shipping_city, p_shipping_postal_code, p_shipping_country,
    p_total_amount, 'pending', p_stripe_session_id, p_customer_id
  ) RETURNING id, order_number INTO v_order_id, v_order_number;

  -- Create order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_id, variant_id, quantity, price_at_purchase)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'variant_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price_at_purchase')::NUMERIC
    );
  END LOOP;

  -- Retornar JSON con ambos valores
  RETURN json_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_checkout_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, JSONB, UUID) TO anon;
GRANT EXECUTE ON FUNCTION create_checkout_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, JSONB, UUID) TO authenticated;

-- Agregar comentario
COMMENT ON FUNCTION create_checkout_order IS 
  'Creates a checkout order with items. Returns JSON with order_id (UUID) and order_number (BIGINT).';

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Puedes probar la función con:
-- SELECT create_checkout_order(
--   'Test User', 
--   'test@example.com', 
--   '123456789',
--   'Calle Test 123', 
--   'Madrid', 
--   '28001', 
--   'España',
--   99.99,
--   NULL,
--   '[{"product_id": "uuid-here", "variant_id": "uuid-here", "quantity": 1, "price_at_purchase": 99.99}]'::jsonb,
--   NULL
-- );
-- 
-- Resultado esperado: {"order_id": "...", "order_number": 1}
-- ============================================

-- FIN DE MIGRACIÓN 027
