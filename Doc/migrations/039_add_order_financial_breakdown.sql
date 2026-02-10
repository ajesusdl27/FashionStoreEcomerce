-- ============================================
-- FASHIONSTORE - MIGRACIÓN 039
-- Añadir desglose financiero a la tabla orders
-- Fecha: 2026-02-10
-- Autor: Sistema
-- ============================================
-- 
-- OBJETIVO:
-- Almacenar subtotal, coste de envío, descuento y datos del cupón
-- directamente en la tabla orders para:
--   1. Mostrar desglose en el detalle del pedido (app + web)
--   2. No depender de Stripe metadata para reconstruir datos
--   3. Evitar hardcodear valores de envío en el frontend
--   4. Control de idempotencia del email de confirmación
--
-- IMPACTO:
-- - Nuevas columnas con DEFAULT para no romper pedidos existentes
-- - Actualización del RPC create_checkout_order con nuevos parámetros opcionales
-- - Backfill de pedidos existentes usando coupon_usages y order_items
-- ============================================

-- ==========================================
-- 1. AÑADIR COLUMNAS A orders
-- ==========================================

ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS confirmation_email_sent BOOLEAN DEFAULT false;

-- Comentarios
COMMENT ON COLUMN public.orders.subtotal IS 'Subtotal de los productos (sin envío ni descuento)';
COMMENT ON COLUMN public.orders.shipping_cost IS 'Coste de envío aplicado al pedido';
COMMENT ON COLUMN public.orders.discount_amount IS 'Cantidad descontada por cupón';
COMMENT ON COLUMN public.orders.coupon_code IS 'Código del cupón aplicado';
COMMENT ON COLUMN public.orders.coupon_id IS 'ID del cupón aplicado (FK a coupons)';
COMMENT ON COLUMN public.orders.confirmation_email_sent IS 'Flag de idempotencia para email de confirmación';

-- Índice para búsquedas por cupón
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON public.orders(coupon_id) WHERE coupon_id IS NOT NULL;

-- ==========================================
-- 2. BACKFILL PEDIDOS EXISTENTES
-- ==========================================

-- Calcular subtotal desde order_items para pedidos existentes
UPDATE public.orders o
SET subtotal = COALESCE((
  SELECT SUM(oi.price_at_purchase * oi.quantity)
  FROM public.order_items oi 
  WHERE oi.order_id = o.id
), 0)
WHERE o.subtotal = 0 OR o.subtotal IS NULL;

-- Inferir shipping_cost: si total_amount > subtotal, la diferencia incluye shipping
-- Para pedidos con cupón, necesitamos manejar el descuento
-- Asumimos: total_amount = subtotal + shipping_cost - discount_amount
-- Y los valores por defecto: shipping gratis si subtotal >= 50, sino 4.99
UPDATE public.orders o
SET shipping_cost = CASE 
  WHEN o.subtotal >= 50 THEN 0
  ELSE 4.99
END
WHERE o.shipping_cost = 0 OR o.shipping_cost IS NULL;

-- Backfill cupón desde coupon_usages
UPDATE public.orders o
SET 
  coupon_id = cu.coupon_id,
  coupon_code = c.code,
  discount_amount = CASE
    WHEN c.discount_type = 'percentage' THEN 
      LEAST(o.subtotal * (c.discount_value / 100), COALESCE(c.max_discount_amount, o.subtotal * (c.discount_value / 100)))
    WHEN c.discount_type = 'fixed' THEN 
      LEAST(c.discount_value, o.subtotal)
    ELSE 0
  END
FROM public.coupon_usages cu
JOIN public.coupons c ON c.id = cu.coupon_id
WHERE cu.order_id = o.id
  AND o.coupon_id IS NULL;

-- Marcar pedidos pagados existentes como email ya enviado (no reenviar)
UPDATE public.orders
SET confirmation_email_sent = true
WHERE status IN ('paid', 'processing', 'shipped', 'delivered');

-- ==========================================
-- 3. ACTUALIZAR RPC create_checkout_order
-- ==========================================

-- Drop la función existente
DROP FUNCTION IF EXISTS create_checkout_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, JSONB, UUID);

-- Recrear con nuevos parámetros opcionales (backwards compatible)
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
  p_customer_id UUID DEFAULT NULL,
  p_subtotal NUMERIC DEFAULT 0,
  p_shipping_cost NUMERIC DEFAULT 0,
  p_discount_amount NUMERIC DEFAULT 0,
  p_coupon_code TEXT DEFAULT NULL,
  p_coupon_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_order_id UUID;
  v_order_number BIGINT;
  v_item JSONB;
BEGIN
  -- Create the order with financial breakdown
  INSERT INTO orders (
    customer_name, customer_email, customer_phone,
    shipping_address, shipping_city, shipping_postal_code, shipping_country,
    total_amount, subtotal, shipping_cost, discount_amount,
    coupon_code, coupon_id,
    status, stripe_session_id, customer_id
  ) VALUES (
    p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_shipping_city, p_shipping_postal_code, p_shipping_country,
    p_total_amount, p_subtotal, p_shipping_cost, p_discount_amount,
    p_coupon_code, p_coupon_id,
    'pending', p_stripe_session_id, p_customer_id
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

-- Grant execute permissions (con nueva signatura)
GRANT EXECUTE ON FUNCTION create_checkout_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, JSONB, UUID, NUMERIC, NUMERIC, NUMERIC, TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION create_checkout_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, JSONB, UUID, NUMERIC, NUMERIC, NUMERIC, TEXT, UUID) TO authenticated;

COMMENT ON FUNCTION create_checkout_order IS 
  'Creates a checkout order with items and financial breakdown. Returns JSON with order_id and order_number.';

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Verificar columnas añadidas:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'orders' AND column_name IN ('subtotal', 'shipping_cost', 'discount_amount', 'coupon_code', 'coupon_id', 'confirmation_email_sent');
--
-- Verificar backfill:
-- SELECT id, order_number, total_amount, subtotal, shipping_cost, discount_amount, coupon_code 
-- FROM orders ORDER BY created_at DESC LIMIT 10;
-- ============================================

-- FIN DE MIGRACIÓN 039
