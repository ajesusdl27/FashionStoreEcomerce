-- ============================================
-- FASHIONSTORE - MIGRACIÓN 028
-- Fix RLS policies for authenticated user checkout
-- Fecha: 2026-01-15
-- Autor: Sistema
-- ============================================
-- 
-- PROBLEMA IDENTIFICADO:
-- Los usuarios autenticados no pueden:
-- 1. Actualizar stripe_session_id en sus pedidos
-- 2. Leer sus pedidos recién creados en la página de éxito
--
-- SOLUCIÓN:
-- Añadir políticas UPDATE para authenticated users
-- ============================================

-- Permitir que usuarios autenticados actualicen stripe_session_id de sus propios pedidos
CREATE POLICY "orders_update_own_session_id" 
  ON orders FOR UPDATE 
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Permitir que authenticated users vean sus pedidos por stripe_session_id
-- (necesario para la página de éxito cuando el usuario está logueado)
CREATE POLICY "orders_select_by_session_authenticated" 
  ON orders FOR SELECT 
  TO authenticated
  USING (
    stripe_session_id IS NOT NULL AND 
    (customer_id = auth.uid() OR customer_email = auth.jwt()->>'email')
  );

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Las políticas existentes son:
-- 1. orders_select_customer_own - SELECT por customer_id
-- 2. orders_select_by_session_anon - SELECT anon por stripe_session_id
-- 3. orders_select_authenticated - SELECT admin (ya existe de migración anterior)
-- 4. orders_update_authenticated - UPDATE admin (ya existe)
--
-- Nuevas políticas añadidas:
-- 5. orders_update_own_session_id - UPDATE usuarios sus propios pedidos
-- 6. orders_select_by_session_authenticated - SELECT por session para usuarios logueados
-- ============================================

-- FIN DE MIGRACIÓN 028
