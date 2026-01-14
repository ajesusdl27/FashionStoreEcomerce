-- ============================================
-- FASHIONSTORE - SISTEMA DE CUPONES
-- ============================================

-- ============================================
-- 1. TABLA DE CUPONES
-- ============================================
-- ============================================
-- 1. TABLA DE CUPONES
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  stripe_coupon_id TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_purchase_amount NUMERIC(10, 2) DEFAULT 0,
  max_discount_amount NUMERIC(10, 2), -- Para cupones porcentuales, límite máximo
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  max_uses INTEGER, -- NULL = ilimitado
  current_uses INTEGER DEFAULT 0,
  max_uses_per_customer INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. TABLA DE USO DE CUPONES (por usuario)
-- ============================================
CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coupon_id, customer_email, order_id)
);

-- ============================================
-- 3. ÍNDICES
-- ============================================
-- ============================================
-- 3. ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_email ON coupon_usages(customer_email);

-- ============================================
-- 4. FUNCIÓN RPC: Validar cupón
-- ============================================
CREATE OR REPLACE FUNCTION validate_coupon(
  p_code TEXT,
  p_cart_total NUMERIC,
  p_customer_email TEXT DEFAULT NULL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  error_message TEXT,
  coupon_id UUID,
  stripe_coupon_id TEXT,
  discount_type TEXT,
  discount_value NUMERIC,
  max_discount_amount NUMERIC,
  calculated_discount NUMERIC
) AS $$
DECLARE
  v_coupon RECORD;
  v_uses_by_customer INTEGER;
  v_calculated_discount NUMERIC;
BEGIN
  -- Buscar cupón
  SELECT * INTO v_coupon FROM coupons WHERE UPPER(code) = UPPER(p_code);
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Código promocional no válido'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;
  
  -- Verificar si está activo
  IF NOT v_coupon.is_active THEN
    RETURN QUERY SELECT FALSE, 'Este código ya no está activo'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;
  
  -- Verificar fechas
  IF v_coupon.start_date IS NOT NULL AND NOW() < v_coupon.start_date THEN
    RETURN QUERY SELECT FALSE, 'Este código aún no está disponible'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;
  
  IF v_coupon.end_date IS NOT NULL AND NOW() > v_coupon.end_date THEN
    RETURN QUERY SELECT FALSE, 'Este código ha expirado'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;
  
  -- Verificar monto mínimo
  IF p_cart_total < v_coupon.min_purchase_amount THEN
    RETURN QUERY SELECT FALSE, ('Compra mínima de ' || v_coupon.min_purchase_amount || '€ requerida')::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;
  
  -- Verificar usos globales
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN QUERY SELECT FALSE, 'Este código ha alcanzado su límite de usos'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;
  
  -- Verificar usos por cliente (si hay email)
  IF p_customer_email IS NOT NULL AND v_coupon.max_uses_per_customer IS NOT NULL THEN
    SELECT COUNT(*) INTO v_uses_by_customer
    FROM coupon_usages cu
    WHERE cu.coupon_id = v_coupon.id AND cu.customer_email = p_customer_email;
    
    IF v_uses_by_customer >= v_coupon.max_uses_per_customer THEN
      RETURN QUERY SELECT FALSE, 'Ya has usado este código el máximo de veces permitido'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
      RETURN;
    END IF;
  END IF;
  
  -- Calcular descuento
  IF v_coupon.discount_type = 'percentage' THEN
    v_calculated_discount := p_cart_total * (v_coupon.discount_value / 100);
    IF v_coupon.max_discount_amount IS NOT NULL AND v_calculated_discount > v_coupon.max_discount_amount THEN
      v_calculated_discount := v_coupon.max_discount_amount;
    END IF;
  ELSE
    v_calculated_discount := LEAST(v_coupon.discount_value, p_cart_total);
  END IF;
  
  -- Cupón válido
  RETURN QUERY SELECT 
    TRUE,
    NULL::TEXT,
    v_coupon.id,
    v_coupon.stripe_coupon_id,
    v_coupon.discount_type,
    v_coupon.discount_value,
    v_coupon.max_discount_amount,
    v_calculated_discount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. FUNCIÓN RPC: Usar cupón (atómico)
-- ============================================
CREATE OR REPLACE FUNCTION use_coupon(
  p_coupon_id UUID,
  p_customer_email TEXT,
  p_order_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_coupon RECORD;
  v_uses_by_customer INTEGER;
BEGIN
  -- Bloquear fila para evitar condiciones de carrera
  SELECT * INTO v_coupon FROM coupons WHERE id = p_coupon_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar límites globales
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar límites por cliente
  IF v_coupon.max_uses_per_customer IS NOT NULL THEN
    SELECT COUNT(*) INTO v_uses_by_customer
    FROM coupon_usages cu
    WHERE cu.coupon_id = p_coupon_id AND cu.customer_email = p_customer_email;
    
    IF v_uses_by_customer >= v_coupon.max_uses_per_customer THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Incrementar contador global
  UPDATE coupons SET current_uses = current_uses + 1, updated_at = NOW() WHERE id = p_coupon_id;
  
  -- Registrar uso por cliente
  INSERT INTO coupon_usages (coupon_id, customer_email, order_id)
  VALUES (p_coupon_id, p_customer_email, p_order_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. RLS POLICIES
-- ============================================
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;

-- Admins pueden todo en coupons (usando metadata)
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

-- Solo lectura pública para validación
DROP POLICY IF EXISTS "Public can read active coupons" ON coupons;
CREATE POLICY "Public can read active coupons" ON coupons
  FOR SELECT USING (is_active = TRUE);

-- Admins pueden ver usos (usando metadata)
DROP POLICY IF EXISTS "Admins can view coupon usages" ON coupon_usages;
CREATE POLICY "Admins can view coupon usages" ON coupon_usages
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );
