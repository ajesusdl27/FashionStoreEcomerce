-- ============================================
-- FASHIONSTORE - ALTER SETTINGS TABLE
-- Add generic value column for configuration
-- ============================================

-- Add a generic value column
ALTER TABLE settings ADD COLUMN IF NOT EXISTS value TEXT;

-- Migrate existing value_bool to value
UPDATE settings 
SET value = CASE WHEN value_bool = true THEN 'true' ELSE 'false' END
WHERE value IS NULL;

-- Make key the primary key and allow upsert
-- The key is already primary key from 001_create_tables.sql

-- Insert default settings if not exist
INSERT INTO settings (key, value, description) VALUES
  ('store_name', 'FashionStore', 'Nombre de la tienda'),
  ('store_email', 'contacto@fashionstore.com', 'Email de contacto'),
  ('store_phone', '+34 600 000 000', 'Teléfono de contacto'),
  ('store_address', 'Calle Moda, 123, 28001 Madrid', 'Dirección física'),
  ('currency', 'EUR', 'Moneda'),
  ('shipping_cost', '4.99', 'Coste de envío estándar'),
  ('free_shipping_threshold', '50', 'Umbral para envío gratis'),
  ('tax_rate', '21', 'IVA en porcentaje')
ON CONFLICT (key) DO NOTHING;

-- Update offers_enabled to use new value column if it exists with value_bool
UPDATE settings SET value = 'true' WHERE key = 'offers_enabled' AND value_bool = true AND value IS NULL;
UPDATE settings SET value = 'false' WHERE key = 'offers_enabled' AND value_bool = false AND value IS NULL;
