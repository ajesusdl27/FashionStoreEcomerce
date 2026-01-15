-- ============================================
-- FASHIONSTORE - FIX: Corregir política RLS de returns
-- Ejecutar DESPUÉS de 021_create_returns_system.sql
-- ============================================

-- Eliminar la política problemática
DROP POLICY IF EXISTS "Users can create returns for their orders" ON returns;

-- Crear nueva política usando auth.jwt() en lugar de auth.users
CREATE POLICY "Users can create returns for their orders" ON returns
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_id 
      AND o.customer_email = auth.jwt()->>'email'
    )
  );
