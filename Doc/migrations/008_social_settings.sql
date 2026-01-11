-- Añadir settings de redes sociales y mejorar configuración
-- Migration: 008_social_settings.sql

-- Asegurar que las columnas value y value_number existen
ALTER TABLE settings ADD COLUMN IF NOT EXISTS value TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS value_number NUMERIC(10, 2);

-- Insertar settings de redes sociales (solo si no existen)
INSERT INTO settings (key, value, description)
VALUES 
  ('social_instagram', 'https://instagram.com/fashionstore', 'URL del perfil de Instagram'),
  ('social_twitter', 'https://twitter.com/fashionstore', 'URL del perfil de Twitter/X'),
  ('social_tiktok', 'https://tiktok.com/@fashionstore', 'URL del perfil de TikTok'),
  ('social_youtube', 'https://youtube.com/fashionstore', 'URL del canal de YouTube')
ON CONFLICT (key) DO NOTHING;

-- Actualizar descripción del tax_rate para claridad
UPDATE settings 
SET description = 'Porcentaje de IVA aplicado al total (0 para no aplicar)'
WHERE key = 'tax_rate';

-- Añadir meta_description para SEO si no existe
INSERT INTO settings (key, value, description)
VALUES ('meta_description', 'FashionStore - Tu tienda de streetwear premium con las mejores marcas urbanas. Zapatillas, camisetas, sudaderas y más.', 'Descripción SEO para motores de búsqueda')
ON CONFLICT (key) DO NOTHING;

-- Añadir setting de modo mantenimiento si no existe
INSERT INTO settings (key, value_bool, description)
VALUES ('maintenance_mode', false, 'Activar modo mantenimiento (solo admin puede acceder)')
ON CONFLICT (key) DO NOTHING;

-- Migrar valores de texto a value_number para campos numéricos
UPDATE settings SET value_number = value::numeric WHERE key = 'shipping_cost' AND value IS NOT NULL AND value_number IS NULL;
UPDATE settings SET value_number = value::numeric WHERE key = 'free_shipping_threshold' AND value IS NOT NULL AND value_number IS NULL;
UPDATE settings SET value_number = value::numeric WHERE key = 'tax_rate' AND value IS NOT NULL AND value_number IS NULL;

-- Asegurar que los settings de tienda existan
INSERT INTO settings (key, value, description) VALUES
  ('store_name', 'FashionStore', 'Nombre de la tienda'),
  ('store_email', 'contacto@fashionstore.com', 'Email de contacto'),
  ('store_phone', '+34 600 000 000', 'Teléfono de contacto'),
  ('store_address', 'Calle Moda, 123, 28001 Madrid', 'Dirección física'),
  ('currency', 'EUR', 'Moneda'),
  ('shipping_cost', '4.99', 'Coste de envío estándar'),
  ('free_shipping_threshold', '50', 'Umbral para envío gratis'),
  ('tax_rate', '0', 'IVA en porcentaje (0 para no aplicar)')
ON CONFLICT (key) DO NOTHING;

-- Actualizar value_number para los campos numéricos recién insertados
UPDATE settings SET value_number = 4.99 WHERE key = 'shipping_cost' AND value_number IS NULL;
UPDATE settings SET value_number = 50 WHERE key = 'free_shipping_threshold' AND value_number IS NULL;
UPDATE settings SET value_number = 0 WHERE key = 'tax_rate' AND value_number IS NULL;
