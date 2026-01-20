-- ============================================
-- Migración: Mejorar RLS de Settings
-- ============================================
-- Esta migración añade una columna is_public a settings y mejora
-- las políticas RLS para proteger configuraciones sensibles.
--
-- ANTES: Cualquier usuario podía leer TODAS las configuraciones
-- DESPUÉS: Solo se pueden leer configuraciones marcadas como públicas
-- ============================================

-- 1. Añadir columna is_public para controlar visibilidad
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- 2. Añadir columna updated_at para auditoría
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger para updated_at
DROP TRIGGER IF EXISTS settings_updated_at ON settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_timestamp();

-- 5. Marcar configuraciones públicas (las que se muestran en el frontend)
UPDATE settings SET is_public = true WHERE key IN (
  -- Información de contacto visible en el sitio
  'store_name',
  'store_email', 
  'store_phone',
  'store_address',
  -- Información de envío visible en carrito/checkout
  'shipping_cost',
  'free_shipping_threshold',
  -- Ofertas (se muestran en el banner)
  'offers_enabled',
  'flash_offers_end',
  -- Políticas de devolución
  'return_window_days',
  -- Localización (para formateo de precios)
  'currency',
  'locale',
  -- Redes sociales (links en footer)
  'social_instagram',
  'social_twitter',
  'social_tiktok',
  'social_youtube',
  -- SEO (metadatos públicos)
  'meta_title',
  'meta_description'
);

-- 6. Configuraciones que NO son públicas (sensibles)
-- maintenance_mode, maintenance_message, tax_rate, prices_include_tax
-- Se quedan con is_public = false por defecto

-- 7. Eliminar políticas RLS existentes
DROP POLICY IF EXISTS "Allow public read on settings" ON settings;
DROP POLICY IF EXISTS "Allow admin full access on settings" ON settings;
DROP POLICY IF EXISTS "settings_public_read" ON settings;
DROP POLICY IF EXISTS "settings_admin_all" ON settings;

-- 8. Crear nuevas políticas RLS mejoradas

-- Política: Usuarios anónimos solo pueden leer settings públicos
CREATE POLICY "settings_public_read"
ON settings
FOR SELECT
TO anon
USING (is_public = true);

-- Política: Usuarios autenticados pueden leer settings públicos
CREATE POLICY "settings_authenticated_read_public"
ON settings
FOR SELECT
TO authenticated
USING (is_public = true);

-- Política: Admins pueden leer TODOS los settings
CREATE POLICY "settings_admin_read_all"
ON settings
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'user_metadata' IS NOT NULL 
  AND (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
);

-- Política: Solo admins pueden insertar/actualizar/eliminar
CREATE POLICY "settings_admin_write"
ON settings
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'user_metadata' IS NOT NULL 
  AND (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
)
WITH CHECK (
  auth.jwt() ->> 'user_metadata' IS NOT NULL 
  AND (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
);

-- 9. Asegurar que RLS está habilitado
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 10. Crear índice para mejorar rendimiento de consultas públicas
CREATE INDEX IF NOT EXISTS idx_settings_is_public ON settings(is_public) WHERE is_public = true;

-- 11. Añadir comentarios de documentación
COMMENT ON COLUMN settings.is_public IS 'Indica si este setting puede ser leído por usuarios no autenticados';
COMMENT ON COLUMN settings.updated_at IS 'Timestamp de última modificación';

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecutar esta query para verificar las políticas:
-- SELECT * FROM pg_policies WHERE tablename = 'settings';
