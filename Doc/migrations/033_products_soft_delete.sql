-- ============================================
-- Migration: Soft Delete de Productos
-- Fecha: 2026-01-18
-- Descripción: Añade campo deleted_at para soft delete de productos
-- ============================================

-- 1. Añadir campo deleted_at para soft delete
ALTER TABLE products
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Crear índice para optimizar filtrado de productos activos/eliminados
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);

-- 3. Crear índice compuesto para queries comunes
CREATE INDEX IF NOT EXISTS idx_products_active_deleted ON products(active, deleted_at) 
WHERE deleted_at IS NULL;

-- 4. Actualizar políticas RLS para productos

-- Primero eliminar políticas existentes si existen
DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "products_select_admin" ON products;
DROP POLICY IF EXISTS "Anyone can view products" ON products;

-- Política para usuarios anónimos/autenticados: solo ver productos no eliminados
CREATE POLICY "products_select_public"
ON products FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL);

-- Política para admin: puede ver todos los productos incluyendo eliminados
-- (Nota: Los admins pueden ver productos eliminados usando un cliente con permisos especiales)
-- Esta política se manejará a nivel de aplicación para el panel admin

-- Comentario explicativo:
COMMENT ON COLUMN products.deleted_at IS 
'Timestamp de eliminación suave. NULL = producto activo, fecha = producto eliminado (soft delete)';

-- ============================================
-- Verificación
-- ============================================
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' AND column_name = 'deleted_at';
