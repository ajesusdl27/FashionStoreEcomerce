-- ============================================
-- FASHIONSTORE - FIX COUPON USAGES RLS
-- ============================================
-- Problema: La tabla coupon_usages tiene RLS activado pero no tiene
-- política de INSERT, lo que impide que la función use_coupon() 
-- registre los usos de cupones cuando se ejecuta desde el webhook.
--
-- Solución: Añadir política que permita INSERT a usuarios autenticados
-- y desde funciones SECURITY DEFINER (service role).
-- ============================================

-- ============================================
-- 1. PERMITIR INSERT EN COUPON_USAGES
-- ============================================
-- Esta política permite que cualquier usuario autenticado (incluyendo
-- el service role que ejecuta webhooks) pueda insertar registros de uso
DROP POLICY IF EXISTS "Service role can insert coupon usages" ON coupon_usages;
CREATE POLICY "Service role can insert coupon usages" ON coupon_usages
  FOR INSERT 
  WITH CHECK (true);

-- ============================================
-- 2. PERMITIR LECTURA DE PROPIOS USOS
-- ============================================
-- Los usuarios pueden ver sus propios usos de cupones
DROP POLICY IF EXISTS "Users can view their own coupon usages" ON coupon_usages;
CREATE POLICY "Users can view their own coupon usages" ON coupon_usages
  FOR SELECT 
  USING (
    customer_email = auth.jwt() ->> 'email'
    OR (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

-- ============================================
-- 3. MEJORAR LA FUNCIÓN use_coupon
-- ============================================
-- Añadir mejor manejo de errores y validación
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
  -- Validar que el email no esté vacío
  IF p_customer_email IS NULL OR p_customer_email = '' THEN
    RAISE EXCEPTION 'customer_email cannot be empty';
  END IF;

  -- Validar que el order_id exista
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = p_order_id) THEN
    RAISE EXCEPTION 'order_id % does not exist', p_order_id;
  END IF;

  -- Bloquear fila para evitar condiciones de carrera
  SELECT * INTO v_coupon FROM coupons WHERE id = p_coupon_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'coupon_id % not found', p_coupon_id;
  END IF;
  
  -- Verificar límites globales
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RAISE EXCEPTION 'Coupon has reached maximum uses';
  END IF;
  
  -- Verificar límites por cliente
  IF v_coupon.max_uses_per_customer IS NOT NULL THEN
    SELECT COUNT(*) INTO v_uses_by_customer
    FROM coupon_usages cu
    WHERE cu.coupon_id = p_coupon_id AND cu.customer_email = p_customer_email;
    
    IF v_uses_by_customer >= v_coupon.max_uses_per_customer THEN
      RAISE EXCEPTION 'Customer has reached maximum uses for this coupon';
    END IF;
  END IF;
  
  -- Incrementar contador global
  UPDATE coupons 
  SET current_uses = current_uses + 1, updated_at = NOW() 
  WHERE id = p_coupon_id;
  
  -- Registrar uso por cliente (idempotente con UNIQUE constraint)
  BEGIN
    INSERT INTO coupon_usages (coupon_id, customer_email, order_id)
    VALUES (p_coupon_id, p_customer_email, p_order_id);
  EXCEPTION
    WHEN unique_violation THEN
      -- Ya existe este registro, no es un error
      RAISE NOTICE 'Coupon usage already recorded for this order';
      RETURN TRUE;
  END;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log el error para debugging
    RAISE NOTICE 'Error in use_coupon: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. CREAR FUNCIÓN PARA VERIFICAR USO DE CUPÓN
-- ============================================
-- Útil para debugging y verificación
CREATE OR REPLACE FUNCTION check_coupon_usage(
  p_coupon_code TEXT,
  p_customer_email TEXT
)
RETURNS TABLE (
  uses_count INTEGER,
  max_uses_per_customer INTEGER,
  can_use BOOLEAN,
  usage_details JSONB
) AS $$
DECLARE
  v_coupon RECORD;
  v_uses_by_customer INTEGER;
BEGIN
  -- Buscar cupón
  SELECT * INTO v_coupon FROM coupons WHERE UPPER(code) = UPPER(p_coupon_code);
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, FALSE, '{}'::JSONB;
    RETURN;
  END IF;
  
  -- Contar usos del cliente
  SELECT COUNT(*) INTO v_uses_by_customer
  FROM coupon_usages cu
  WHERE cu.coupon_id = v_coupon.id AND cu.customer_email = p_customer_email;
  
  -- Crear detalles de uso
  RETURN QUERY SELECT 
    v_uses_by_customer::INTEGER,
    v_coupon.max_uses_per_customer::INTEGER,
    (
      v_coupon.max_uses_per_customer IS NULL 
      OR v_uses_by_customer < v_coupon.max_uses_per_customer
    )::BOOLEAN,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'order_id', cu.order_id,
          'used_at', cu.used_at
        )
      )
      FROM coupon_usages cu
      WHERE cu.coupon_id = v_coupon.id AND cu.customer_email = p_customer_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. GRANT EXECUTE PERMISSIONS
-- ============================================
-- Asegurar que las funciones pueden ser ejecutadas
GRANT EXECUTE ON FUNCTION use_coupon(UUID, TEXT, UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION check_coupon_usage(TEXT, TEXT) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION validate_coupon(TEXT, NUMERIC, TEXT) TO authenticated, anon, service_role;

-- ============================================
-- 6. VERIFICACIÓN DE POLÍTICAS
-- ============================================
-- Verificar que RLS está configurado correctamente
DO $$
BEGIN
  -- Verificar que RLS está activado
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'coupon_usages') THEN
    RAISE WARNING 'RLS is not enabled on coupon_usages table';
  END IF;
  
  -- Verificar que hay políticas de INSERT
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'coupon_usages' 
    AND cmd = 'INSERT'
  ) THEN
    RAISE WARNING 'No INSERT policy found for coupon_usages';
  END IF;
END $$;
