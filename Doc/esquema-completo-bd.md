# Esquema Completo de Base de Datos (Consolidado)

Este documento contiene el SQL consolidado del esquema final de FashionStore generado desde las migraciones en `Doc/migrations`.

## Alcance

- Fuente: migraciones incrementales `001` a `043`.
- Incluye correcciones con numeración duplicada (`015`, `028`, `038`) en orden determinista.
- Excluye: `000_init_full_database_CLEAN.sql`, `004_seed_data.sql`, `018_revert_promotions_table.sql`, `rollback_026.sql`, `setup_daily_low_stock_cron.sql`.

## SQL Consolidado

```sql
-- =========================================================
-- FASHIONSTORE - ESQUEMA CONSOLIDADO (001 -> 043)
-- =========================================================

-- =========================================================
-- BEGIN MIGRATION: 001_create_tables.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - ESQUEMA DE BASE DE DATOS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CATEGORÍAS
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PRODUCTOS
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  offer_price NUMERIC(10, 2) CHECK (offer_price IS NULL OR offer_price >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT TRUE,
  is_offer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. VARIANTES (Stock por Talla)
-- ============================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  UNIQUE(product_id, size)
);

-- ============================================
-- 4. IMÁGENES DE PRODUCTO
-- ============================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. PEDIDOS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Datos del cliente
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  -- Dirección de envío
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'España',
  -- Datos del pedido
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ITEMS DEL PEDIDO
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC(10, 2) NOT NULL
);

-- ============================================
-- 7. CONFIGURACIÓN GLOBAL
-- ============================================
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value_bool BOOLEAN DEFAULT FALSE,
  description TEXT
);

-- Insertar configuración inicial
INSERT INTO settings (key, value_bool, description) VALUES
  ('offers_enabled', false, 'Muestra/oculta la sección Flash Offers en la Home');

-- ============================================
-- 8. ÍNDICES PARA RENDIMIENTO
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_is_offer ON products(is_offer);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(customer_email);
-- END MIGRATION: 001_create_tables.sql

-- =========================================================
-- BEGIN MIGRATION: 002_rls_policies.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - POLÍTICAS DE SEGURIDAD (RLS)
-- Ejecutar DESPUÉS de 001_create_tables.sql
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CATEGORÍAS
-- ============================================
-- Lectura pública
CREATE POLICY "Categories: Public read" 
  ON categories FOR SELECT 
  USING (true);

-- Escritura solo admin (usuarios autenticados)
CREATE POLICY "Categories: Admin write" 
  ON categories FOR ALL 
  USING (auth.role() = 'authenticated');

-- ============================================
-- PRODUCTOS
-- ============================================
-- Lectura pública (solo productos activos)
CREATE POLICY "Products: Public read active" 
  ON products FOR SELECT 
  USING (active = true);

-- Admin puede ver y modificar todos
CREATE POLICY "Products: Admin full access" 
  ON products FOR ALL 
  USING (auth.role() = 'authenticated');

-- ============================================
-- VARIANTES
-- ============================================
-- Lectura pública
CREATE POLICY "Variants: Public read" 
  ON product_variants FOR SELECT 
  USING (true);

-- Escritura solo admin
CREATE POLICY "Variants: Admin write" 
  ON product_variants FOR ALL 
  USING (auth.role() = 'authenticated');

-- ============================================
-- IMÁGENES
-- ============================================
-- Lectura pública
CREATE POLICY "Images: Public read" 
  ON product_images FOR SELECT 
  USING (true);

-- Escritura solo admin
CREATE POLICY "Images: Admin write" 
  ON product_images FOR ALL 
  USING (auth.role() = 'authenticated');

-- ============================================
-- PEDIDOS
-- ============================================
-- Inserción pública (guest checkout)
CREATE POLICY "Orders: Public insert" 
  ON orders FOR INSERT 
  WITH CHECK (true);

-- Lectura solo admin
CREATE POLICY "Orders: Admin read" 
  ON orders FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Actualización solo admin
CREATE POLICY "Orders: Admin update" 
  ON orders FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- ============================================
-- ITEMS DE PEDIDO
-- ============================================
-- Inserción pública con pedido
CREATE POLICY "Order items: Public insert" 
  ON order_items FOR INSERT 
  WITH CHECK (true);

-- Lectura solo admin
CREATE POLICY "Order items: Admin read" 
  ON order_items FOR SELECT 
  USING (auth.role() = 'authenticated');

-- ============================================
-- CONFIGURACIÓN
-- ============================================
-- Lectura pública
CREATE POLICY "Settings: Public read" 
  ON settings FOR SELECT 
  USING (true);

-- Escritura solo admin
CREATE POLICY "Settings: Admin write" 
  ON settings FOR ALL 
  USING (auth.role() = 'authenticated');
-- END MIGRATION: 002_rls_policies.sql

-- =========================================================
-- BEGIN MIGRATION: 003_storage_bucket.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - STORAGE BUCKET
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Crear bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- ============================================
-- POLÍTICAS DEL BUCKET
-- ============================================

-- Lectura pública de imágenes
CREATE POLICY "Product images: Public read" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'product-images');

-- Subida solo para usuarios autenticados (admin)
CREATE POLICY "Product images: Admin upload" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Actualización solo para admin
CREATE POLICY "Product images: Admin update" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Eliminación solo para admin
CREATE POLICY "Product images: Admin delete" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
-- END MIGRATION: 003_storage_bucket.sql

-- =========================================================
-- BEGIN MIGRATION: 005_settings_value.sql
-- =========================================================
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
-- END MIGRATION: 005_settings_value.sql

-- =========================================================
-- BEGIN MIGRATION: 006_stock_reservation_functions.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - STOCK RESERVATION FUNCTIONS
-- Add atomic stock operations to prevent race conditions
-- ============================================

-- Drop existing functions first (if they exist with different parameter names)
DROP FUNCTION IF EXISTS reserve_stock(UUID, INTEGER);
DROP FUNCTION IF EXISTS restore_stock(UUID, INTEGER);

-- Function to atomically reserve (decrement) stock
-- Returns true if successful, false if insufficient stock
CREATE OR REPLACE FUNCTION reserve_stock(
  p_variant_id UUID,
  p_quantity INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_rows_affected INTEGER;
BEGIN
  -- Atomic update: only succeeds if there's enough stock
  UPDATE product_variants 
  SET stock = stock - p_quantity
  WHERE id = p_variant_id 
    AND stock >= p_quantity;
  
  -- Check if any row was updated
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  
  RETURN v_rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore (increment) stock after failed/cancelled payment
CREATE OR REPLACE FUNCTION restore_stock(
  p_variant_id UUID,
  p_quantity INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_rows_affected INTEGER;
BEGIN
  -- Atomically restore stock
  UPDATE product_variants 
  SET stock = stock + p_quantity
  WHERE id = p_variant_id;
  
  -- Check if any row was updated
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  
  RETURN v_rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated and anon roles
GRANT EXECUTE ON FUNCTION reserve_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION reserve_stock(UUID, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION restore_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_stock(UUID, INTEGER) TO anon;

-- Add index for faster stock lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON product_variants(id, stock);
-- END MIGRATION: 006_stock_reservation_functions.sql

-- =========================================================
-- BEGIN MIGRATION: 007_improved_rls_policies.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - IMPROVED RLS POLICIES
-- Ejecutar DESPUÉS de 006_stock_reservation_functions.sql
-- ============================================

-- ============================================
-- DROP EXISTING CONFLICTING POLICIES
-- ============================================

-- Drop all existing policies to recreate them properly
DROP POLICY IF EXISTS "Categories: Public read" ON categories;
DROP POLICY IF EXISTS "Categories: Admin write" ON categories;
DROP POLICY IF EXISTS "Products: Public read active" ON products;
DROP POLICY IF EXISTS "Products: Admin full access" ON products;
DROP POLICY IF EXISTS "Variants: Public read" ON product_variants;
DROP POLICY IF EXISTS "Variants: Admin write" ON product_variants;
DROP POLICY IF EXISTS "Images: Public read" ON product_images;
DROP POLICY IF EXISTS "Images: Admin write" ON product_images;
DROP POLICY IF EXISTS "Orders: Public insert" ON orders;
DROP POLICY IF EXISTS "Orders: Admin read" ON orders;
DROP POLICY IF EXISTS "Orders: Admin update" ON orders;
DROP POLICY IF EXISTS "Order items: Public insert" ON order_items;
DROP POLICY IF EXISTS "Order items: Admin read" ON order_items;
DROP POLICY IF EXISTS "Settings: Public read" ON settings;
DROP POLICY IF EXISTS "Settings: Admin write" ON settings;

-- ============================================
-- CATEGORIES - Public read, Admin write
-- ============================================
CREATE POLICY "categories_select_public" 
  ON categories FOR SELECT 
  USING (true);

CREATE POLICY "categories_insert_authenticated" 
  ON categories FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "categories_update_authenticated" 
  ON categories FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "categories_delete_authenticated" 
  ON categories FOR DELETE 
  TO authenticated
  USING (true);

-- ============================================
-- PRODUCTS - Public read (active only), Admin full
-- ============================================
-- Public can only see active products
CREATE POLICY "products_select_public" 
  ON products FOR SELECT 
  TO anon
  USING (active = true);

-- Authenticated can see ALL products (including inactive for admin)
CREATE POLICY "products_select_authenticated" 
  ON products FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "products_insert_authenticated" 
  ON products FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "products_update_authenticated" 
  ON products FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "products_delete_authenticated" 
  ON products FOR DELETE 
  TO authenticated
  USING (true);

-- ============================================
-- PRODUCT VARIANTS - Public read, Admin write
-- ============================================
CREATE POLICY "variants_select_public" 
  ON product_variants FOR SELECT 
  USING (true);

CREATE POLICY "variants_insert_authenticated" 
  ON product_variants FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "variants_update_authenticated" 
  ON product_variants FOR UPDATE 
  TO authenticated
  USING (true);

-- Also allow anon to update via SECURITY DEFINER functions (stock operations)
-- The RPC functions use SECURITY DEFINER so they bypass RLS

CREATE POLICY "variants_delete_authenticated" 
  ON product_variants FOR DELETE 
  TO authenticated
  USING (true);

-- ============================================
-- PRODUCT IMAGES - Public read, Admin write
-- ============================================
CREATE POLICY "images_select_public" 
  ON product_images FOR SELECT 
  USING (true);

CREATE POLICY "images_insert_authenticated" 
  ON product_images FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "images_update_authenticated" 
  ON product_images FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "images_delete_authenticated" 
  ON product_images FOR DELETE 
  TO authenticated
  USING (true);

-- ============================================
-- ORDERS - Complex policies for guest checkout + admin
-- ============================================
-- Anyone can see their own order by stripe_session_id (for success page)
CREATE POLICY "orders_select_by_session" 
  ON orders FOR SELECT 
  TO anon
  USING (stripe_session_id IS NOT NULL);

-- Authenticated (admin) can see all orders
CREATE POLICY "orders_select_authenticated" 
  ON orders FOR SELECT 
  TO authenticated
  USING (true);

-- Insert handled via SECURITY DEFINER function (create_checkout_order)
-- Update handled via SECURITY DEFINER function (update_order_status)

CREATE POLICY "orders_update_authenticated" 
  ON orders FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "orders_delete_authenticated" 
  ON orders FOR DELETE 
  TO authenticated
  USING (true);

-- ============================================
-- ORDER ITEMS - Admin read, insert via function
-- ============================================
-- Order items are read via join with orders
CREATE POLICY "order_items_select_authenticated" 
  ON order_items FOR SELECT 
  TO authenticated
  USING (true);

-- Allow anon to select order items for their order (success page)
CREATE POLICY "order_items_select_by_order" 
  ON order_items FOR SELECT 
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.stripe_session_id IS NOT NULL
    )
  );

CREATE POLICY "order_items_delete_authenticated" 
  ON order_items FOR DELETE 
  TO authenticated
  USING (true);

-- ============================================
-- SETTINGS - Public read, Admin write  
-- ============================================
CREATE POLICY "settings_select_public" 
  ON settings FOR SELECT 
  USING (true);

CREATE POLICY "settings_insert_authenticated" 
  ON settings FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "settings_update_authenticated" 
  ON settings FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "settings_delete_authenticated" 
  ON settings FOR DELETE 
  TO authenticated
  USING (true);

-- ============================================
-- SECURITY DEFINER FUNCTIONS
-- These run with owner privileges, bypassing RLS
-- ============================================

-- Function to create order with items (for guest checkout)
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
  p_items JSONB
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
BEGIN
  -- Create the order
  INSERT INTO orders (
    customer_name, customer_email, customer_phone,
    shipping_address, shipping_city, shipping_postal_code, shipping_country,
    total_amount, status, stripe_session_id
  ) VALUES (
    p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_shipping_city, p_shipping_postal_code, p_shipping_country,
    p_total_amount, 'pending', p_stripe_session_id
  ) RETURNING id INTO v_order_id;

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

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update order status (for webhooks)
CREATE OR REPLACE FUNCTION update_order_status(
  p_stripe_session_id TEXT,
  p_status TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_rows_affected INTEGER;
BEGIN
  UPDATE orders 
  SET status = p_status
  WHERE stripe_session_id = p_stripe_session_id;
  
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  RETURN v_rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get order with items by stripe session (for webhooks)
CREATE OR REPLACE FUNCTION get_order_by_session(
  p_stripe_session_id TEXT
) RETURNS TABLE (
  id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  total_amount NUMERIC,
  status TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id, o.customer_name, o.customer_email, o.customer_phone,
    o.shipping_address, o.shipping_city, o.shipping_postal_code, o.shipping_country,
    o.total_amount, o.status, o.stripe_session_id, o.created_at
  FROM orders o
  WHERE o.stripe_session_id = p_stripe_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get order items by order id (for webhooks/email)
CREATE OR REPLACE FUNCTION get_order_items(
  p_order_id UUID
) RETURNS TABLE (
  id UUID,
  product_id UUID,
  variant_id UUID,
  quantity INTEGER,
  price_at_purchase NUMERIC,
  product_name TEXT,
  product_slug TEXT,
  variant_size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oi.id, oi.product_id, oi.variant_id, oi.quantity, oi.price_at_purchase,
    p.name, p.slug, pv.size
  FROM order_items oi
  LEFT JOIN products p ON p.id = oi.product_id
  LEFT JOIN product_variants pv ON pv.id = oi.variant_id
  WHERE oi.order_id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_checkout_order TO anon;
GRANT EXECUTE ON FUNCTION create_checkout_order TO authenticated;
GRANT EXECUTE ON FUNCTION update_order_status TO anon;
GRANT EXECUTE ON FUNCTION update_order_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_by_session TO anon;
GRANT EXECUTE ON FUNCTION get_order_by_session TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_items TO anon;
GRANT EXECUTE ON FUNCTION get_order_items TO authenticated;

-- ============================================
-- STORAGE POLICIES (already exist, but ensure correct)
-- ============================================
-- Note: Storage policies are managed separately in Supabase dashboard
-- The bucket 'product-images' should have:
-- - SELECT: public (true)
-- - INSERT: authenticated only
-- - DELETE: authenticated only
-- END MIGRATION: 007_improved_rls_policies.sql

-- =========================================================
-- BEGIN MIGRATION: 008_social_settings.sql
-- =========================================================
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
-- END MIGRATION: 008_social_settings.sql

-- =========================================================
-- BEGIN MIGRATION: 009_customer_auth.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - CUSTOMER AUTHENTICATION
-- Ejecutar DESPUÉS de 008_social_settings.sql
-- ============================================

-- ============================================
-- 1. ADD CUSTOMER_ID TO ORDERS
-- ============================================
-- Add optional customer_id column to orders table
-- This allows linking orders to registered customers
-- NULL = guest checkout (existing behavior preserved)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for customer order lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- ============================================
-- 2. PROFILES TABLE (Optional customer data)
-- ============================================
-- Store additional customer profile information
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  -- Default shipping address
  default_address TEXT,
  default_city TEXT,
  default_postal_code TEXT,
  default_country TEXT DEFAULT 'España',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS POLICIES FOR CUSTOMER PROFILES
-- ============================================
-- Customers can only read/update their own profile
CREATE POLICY "profiles_select_own" 
  ON customer_profiles FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" 
  ON customer_profiles FOR INSERT 
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" 
  ON customer_profiles FOR UPDATE 
  TO authenticated
  USING (id = auth.uid());

-- Admin can view all profiles
CREATE POLICY "profiles_select_admin" 
  ON customer_profiles FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND (u.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- ============================================
-- 4. RLS POLICIES FOR CUSTOMER ORDERS
-- ============================================
-- Drop existing order policies that might conflict
DROP POLICY IF EXISTS "orders_select_by_session" ON orders;

-- Customers can see their own orders (by customer_id)
CREATE POLICY "orders_select_customer_own" 
  ON orders FOR SELECT 
  TO authenticated
  USING (customer_id = auth.uid());

-- Anonymous users can still see orders by stripe session (success page)
CREATE POLICY "orders_select_by_session_anon" 
  ON orders FOR SELECT 
  TO anon
  USING (stripe_session_id IS NOT NULL);

-- ============================================
-- 5. UPDATED create_checkout_order FUNCTION
-- ============================================
-- Drop and recreate with customer_id support
DROP FUNCTION IF EXISTS create_checkout_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, JSONB);

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
  p_customer_id UUID DEFAULT NULL  -- NEW: Optional customer_id
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
BEGIN
  -- Create the order with optional customer_id
  INSERT INTO orders (
    customer_name, customer_email, customer_phone,
    shipping_address, shipping_city, shipping_postal_code, shipping_country,
    total_amount, status, stripe_session_id, customer_id
  ) VALUES (
    p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_shipping_city, p_shipping_postal_code, p_shipping_country,
    p_total_amount, 'pending', p_stripe_session_id, p_customer_id
  ) RETURNING id INTO v_order_id;

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

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_checkout_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, JSONB, UUID) TO anon;
GRANT EXECUTE ON FUNCTION create_checkout_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, JSONB, UUID) TO authenticated;

-- ============================================
-- 6. get_customer_orders FUNCTION
-- ============================================
-- Function to get all orders for a customer
CREATE OR REPLACE FUNCTION get_customer_orders(
  p_customer_id UUID
) RETURNS TABLE (
  id UUID,
  customer_name TEXT,
  customer_email TEXT,
  total_amount NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ,
  item_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id, 
    o.customer_name, 
    o.customer_email,
    o.total_amount, 
    o.status, 
    o.created_at,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
  FROM orders o
  WHERE o.customer_id = p_customer_id
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_customer_orders(UUID) TO authenticated;

-- ============================================
-- 7. get_customer_order_detail FUNCTION
-- ============================================
-- Function to get full order detail for a customer
CREATE OR REPLACE FUNCTION get_customer_order_detail(
  p_order_id UUID,
  p_customer_id UUID
) RETURNS TABLE (
  id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  total_amount NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id, o.customer_name, o.customer_email, o.customer_phone,
    o.shipping_address, o.shipping_city, o.shipping_postal_code, o.shipping_country,
    o.total_amount, o.status, o.created_at
  FROM orders o
  WHERE o.id = p_order_id 
  AND o.customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_customer_order_detail(UUID, UUID) TO authenticated;

-- ============================================
-- 8. upsert_customer_profile FUNCTION
-- ============================================
-- Function to create or update customer profile
CREATE OR REPLACE FUNCTION upsert_customer_profile(
  p_full_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_default_address TEXT DEFAULT NULL,
  p_default_city TEXT DEFAULT NULL,
  p_default_postal_code TEXT DEFAULT NULL,
  p_default_country TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO customer_profiles (
    id, full_name, phone, 
    default_address, default_city, default_postal_code, default_country
  ) VALUES (
    auth.uid(), p_full_name, p_phone,
    p_default_address, p_default_city, p_default_postal_code, 
    COALESCE(p_default_country, 'España')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, customer_profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, customer_profiles.phone),
    default_address = COALESCE(EXCLUDED.default_address, customer_profiles.default_address),
    default_city = COALESCE(EXCLUDED.default_city, customer_profiles.default_city),
    default_postal_code = COALESCE(EXCLUDED.default_postal_code, customer_profiles.default_postal_code),
    default_country = COALESCE(EXCLUDED.default_country, customer_profiles.default_country),
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION upsert_customer_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- ============================================
-- 9. get_customer_profile FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_customer_profile()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  phone TEXT,
  default_address TEXT,
  default_city TEXT,
  default_postal_code TEXT,
  default_country TEXT,
  email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id,
    cp.full_name,
    cp.phone,
    cp.default_address,
    cp.default_city,
    cp.default_postal_code,
    cp.default_country,
    u.email
  FROM customer_profiles cp
  JOIN auth.users u ON u.id = cp.id
  WHERE cp.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_customer_profile() TO authenticated;
-- END MIGRATION: 009_customer_auth.sql

-- =========================================================
-- BEGIN MIGRATION: 010_fix_customer_profiles.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - FIX CUSTOMER PROFILES
-- Ejecutar DESPUÉS de 009_customer_auth.sql
-- ============================================

-- ============================================
-- 1. FIX RLS POLICY THAT QUERIES AUTH.USERS
-- ============================================
-- The existing policy causes "permission denied for table users"
-- because it tries to query auth.users which requires elevated permissions

DROP POLICY IF EXISTS "profiles_select_admin" ON customer_profiles;

-- Recreate with simpler logic (admin check is done in application layer)
-- Any authenticated user can SELECT their own profile (already covered by profiles_select_own)
-- This policy allows admin frontend to query all profiles
CREATE POLICY "profiles_select_all_authenticated" 
  ON customer_profiles FOR SELECT 
  TO authenticated
  USING (true);

-- ============================================
-- 2. TRIGGER FOR AUTO-PROFILE CREATION ON SIGNUP
-- ============================================
-- Creates customer_profiles record when new user signs up
-- This ensures upsert operations always work (update path, not insert)

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customer_profiles (id, full_name, phone)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. BACKFILL EXISTING USERS
-- ============================================
-- Create profiles for existing users that don't have one
INSERT INTO customer_profiles (id, full_name)
SELECT id, raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM customer_profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- GRANT EXECUTE PERMISSIONS (ensure they exist)
-- ============================================
GRANT EXECUTE ON FUNCTION upsert_customer_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_profile() TO authenticated;
-- END MIGRATION: 010_fix_customer_profiles.sql

-- =========================================================
-- BEGIN MIGRATION: 011_fix_rpc_types.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - FIX RPC TYPES
-- Ejecutar DESPUÉS de 010_fix_customer_profiles.sql
-- ============================================

-- Fix error: "Returned type character varying(255) does not match expected type text"
-- auth.users.email is varchar(255), function expects TEXT.
-- We explicitly cast u.email::TEXT to match the return type.

CREATE OR REPLACE FUNCTION get_customer_profile()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  phone TEXT,
  default_address TEXT,
  default_city TEXT,
  default_postal_code TEXT,
  default_country TEXT,
  email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id,
    cp.full_name,
    cp.phone,
    cp.default_address,
    cp.default_city,
    cp.default_postal_code,
    cp.default_country,
    u.email::TEXT  -- Explicit cast to fix type mismatch
  FROM customer_profiles cp
  JOIN auth.users u ON u.id = cp.id
  WHERE cp.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure permissions are set
GRANT EXECUTE ON FUNCTION get_customer_profile() TO authenticated;
-- END MIGRATION: 011_fix_rpc_types.sql

-- =========================================================
-- BEGIN MIGRATION: 012_create_order_shipments.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - ORDER SHIPMENTS TABLE
-- Tabla para almacenar información de envío
-- ============================================

-- 1. TABLA ORDER_SHIPMENTS
CREATE TABLE IF NOT EXISTS order_shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL,                    -- Empresa de transporte (SEUR, MRW, Correos, etc.)
  tracking_number TEXT,                     -- Número de seguimiento
  tracking_url TEXT,                        -- URL completa de seguimiento
  shipped_at TIMESTAMPTZ DEFAULT NOW(),     -- Fecha de envío
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id)                          -- Un envío por pedido
);

-- 2. ÍNDICE PARA BÚSQUEDAS
CREATE INDEX IF NOT EXISTS idx_order_shipments_order ON order_shipments(order_id);

-- 3. RLS POLICIES
ALTER TABLE order_shipments ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Admins can manage order_shipments" ON order_shipments;
DROP POLICY IF EXISTS "Customers can view their own shipments" ON order_shipments;

-- Admins pueden gestionar todos los envíos (usando JWT metadata)
CREATE POLICY "Admins can manage order_shipments"
  ON order_shipments
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Clientes pueden ver sus propios envíos
CREATE POLICY "Customers can view their own shipments"
  ON order_shipments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_shipments.order_id
      AND orders.customer_email = (auth.jwt() ->> 'email')
    )
  );
-- END MIGRATION: 012_create_order_shipments.sql

-- =========================================================
-- BEGIN MIGRATION: 013_create_newsletter_tables.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - NEWSLETTER SYSTEM
-- ============================================

-- 1. NEWSLETTER SUBSCRIBERS
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NEWSLETTER CAMPAIGNS
CREATE TABLE newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  content TEXT NOT NULL, -- HTML content
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent')),
  sent_count INTEGER DEFAULT 0,
  total_recipients INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- 3. RLS POLICIES

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Subscribers:
-- Public can INSERT (subscribe)
CREATE POLICY "Public can subscribe"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view/manage all
CREATE POLICY "Admins can manage subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Campaigns:
-- Only Admins can manage campaigns
CREATE POLICY "Admins can manage campaigns"
  ON newsletter_campaigns
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );
-- END MIGRATION: 013_create_newsletter_tables.sql

-- =========================================================
-- BEGIN MIGRATION: 014_add_category_size_type.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - Añadir tipo de talla a categorías
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Añadir columna size_type a categories
ALTER TABLE categories 
ADD COLUMN size_type TEXT DEFAULT 'clothing' 
CHECK (size_type IN ('clothing', 'footwear', 'universal'));

-- Comentario para documentación
COMMENT ON COLUMN categories.size_type IS 'Tipo de talla: clothing (XXS-XXL), footwear (36-46), universal (Única)';

-- Actualizar categorías existentes según su nombre
-- (Ajusta estos UPDATEs según tus categorías reales)
UPDATE categories SET size_type = 'footwear' WHERE slug ILIKE '%zapatilla%' OR slug ILIKE '%zapato%' OR slug ILIKE '%bota%';
UPDATE categories SET size_type = 'universal' WHERE slug ILIKE '%accesorio%' OR slug ILIKE '%gorra%' OR slug ILIKE '%gafa%' OR slug ILIKE '%reloj%' OR slug ILIKE '%bolso%';
-- END MIGRATION: 014_add_category_size_type.sql

-- =========================================================
-- BEGIN MIGRATION: 015_add_category_metadata.sql
-- =========================================================
-- ============================================
-- MIGRACIÓN: Añadir campos de metadata a categorías
-- Fecha: 21 de Enero 2026
-- Descripción: Añade campos para mejorar la experiencia visual de categorías sin imágenes
-- ============================================

-- Añadir campos de metadata a categorías
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'tag',
ADD COLUMN IF NOT EXISTS color_theme TEXT DEFAULT 'default';

-- Índices para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(featured, display_order);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Comentarios para documentación
COMMENT ON COLUMN categories.featured IS 'Indica si la categoría debe destacarse en la página principal';
COMMENT ON COLUMN categories.display_order IS 'Orden de visualización (menor número = mayor prioridad)';
COMMENT ON COLUMN categories.description IS 'Descripción breve de la categoría para mostrar en tarjetas';
COMMENT ON COLUMN categories.icon_name IS 'Nombre del icono de Lucide React a usar (ej: shirt, footprints, watch)';
COMMENT ON COLUMN categories.color_theme IS 'Tema de color para gradientes (default, blue, green, purple, orange, red, pink)';

-- Actualizar categorías existentes con valores por defecto inteligentes
UPDATE categories 
SET 
  display_order = CASE 
    WHEN LOWER(name) LIKE '%camiseta%' OR LOWER(name) LIKE '%shirt%' THEN 1
    WHEN LOWER(name) LIKE '%pantalon%' OR LOWER(name) LIKE '%jean%' OR LOWER(name) LIKE '%trouser%' THEN 2
    WHEN LOWER(name) LIKE '%zapato%' OR LOWER(name) LIKE '%shoe%' OR LOWER(name) LIKE '%calzado%' THEN 3
    WHEN LOWER(name) LIKE '%accesorio%' OR LOWER(name) LIKE '%accessory%' THEN 4
    ELSE 5
  END,
  icon_name = CASE 
    WHEN LOWER(name) LIKE '%camiseta%' OR LOWER(name) LIKE '%shirt%' THEN 'shirt'
    WHEN LOWER(name) LIKE '%pantalon%' OR LOWER(name) LIKE '%jean%' OR LOWER(name) LIKE '%trouser%' THEN 'pants'
    WHEN LOWER(name) LIKE '%zapato%' OR LOWER(name) LIKE '%shoe%' OR LOWER(name) LIKE '%calzado%' THEN 'footprints'
    WHEN LOWER(name) LIKE '%accesorio%' OR LOWER(name) LIKE '%accessory%' THEN 'watch'
    WHEN LOWER(name) LIKE '%mujer%' OR LOWER(name) LIKE '%woman%' THEN 'user'
    WHEN LOWER(name) LIKE '%hombre%' OR LOWER(name) LIKE '%man%' THEN 'user-check'
    WHEN LOWER(name) LIKE '%niño%' OR LOWER(name) LIKE '%kid%' OR LOWER(name) LIKE '%child%' THEN 'baby'
    ELSE 'tag'
  END,
  color_theme = CASE 
    WHEN LOWER(name) LIKE '%camiseta%' OR LOWER(name) LIKE '%shirt%' THEN 'blue'
    WHEN LOWER(name) LIKE '%pantalon%' OR LOWER(name) LIKE '%jean%' OR LOWER(name) LIKE '%trouser%' THEN 'purple'
    WHEN LOWER(name) LIKE '%zapato%' OR LOWER(name) LIKE '%shoe%' OR LOWER(name) LIKE '%calzado%' THEN 'orange'
    WHEN LOWER(name) LIKE '%accesorio%' OR LOWER(name) LIKE '%accessory%' THEN 'green'
    WHEN LOWER(name) LIKE '%mujer%' OR LOWER(name) LIKE '%woman%' THEN 'pink'
    WHEN LOWER(name) LIKE '%hombre%' OR LOWER(name) LIKE '%man%' THEN 'blue'
    WHEN LOWER(name) LIKE '%niño%' OR LOWER(name) LIKE '%kid%' OR LOWER(name) LIKE '%child%' THEN 'yellow'
    ELSE 'default'
  END,
  description = CASE 
    WHEN LOWER(name) LIKE '%camiseta%' OR LOWER(name) LIKE '%shirt%' THEN 'Encuentra tu estilo perfecto'
    WHEN LOWER(name) LIKE '%pantalon%' OR LOWER(name) LIKE '%jean%' OR LOWER(name) LIKE '%trouser%' THEN 'Comodidad y estilo'
    WHEN LOWER(name) LIKE '%zapato%' OR LOWER(name) LIKE '%shoe%' OR LOWER(name) LIKE '%calzado%' THEN 'Pisa con confianza'
    WHEN LOWER(name) LIKE '%accesorio%' OR LOWER(name) LIKE '%accessory%' THEN 'Completa tu look'
    ELSE 'Descubre nuestra colección'
  END
WHERE featured IS NULL OR display_order IS NULL OR icon_name IS NULL OR color_theme IS NULL;

-- Marcar las primeras 3 categorías como destacadas
UPDATE categories 
SET featured = TRUE 
WHERE id IN (
  SELECT id 
  FROM categories 
  ORDER BY display_order ASC, name ASC 
  LIMIT 3
);

-- Verificar los cambios
SELECT 
  name, 
  featured, 
  display_order, 
  icon_name, 
  color_theme, 
  description 
FROM categories 
ORDER BY display_order ASC, name ASC;
-- END MIGRATION: 015_add_category_metadata.sql

-- =========================================================
-- BEGIN MIGRATION: 015_create_coupons_table.sql
-- =========================================================
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
-- END MIGRATION: 015_create_coupons_table.sql

-- =========================================================
-- BEGIN MIGRATION: 016_fix_coupon_usages_rls.sql
-- =========================================================
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
-- END MIGRATION: 016_fix_coupon_usages_rls.sql

-- =========================================================
-- BEGIN MIGRATION: 017_create_promotions_table.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - MIGRATION 017
-- Create Promotions Table
-- ============================================

-- 1. Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  
  -- Linking to logic
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  
  -- Display Logic
  locations JSONB NOT NULL DEFAULT '["home_hero"]', -- Array of strings: 'home_hero', 'announcement', 'checkout', etc.
  priority INTEGER DEFAULT 10, -- Lower number = Higher priority
  
  -- Visual Customization (JSON for flexibility)
  -- Expected structure: { "textColor": "white|black", "textAlignment": "left|center|right", "overlayOpacity": 0.5 }
  style_config JSONB DEFAULT '{}',
  
  -- Validity
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_priority ON promotions(priority);

-- 3. RLS Policies
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Admin: Full Access
DROP POLICY IF EXISTS "Admins can manage promotions" ON promotions;
CREATE POLICY "Admins can manage promotions" ON promotions
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

-- Public: Read Only (Active & Valid Dates)
DROP POLICY IF EXISTS "Public can view active promotions" ON promotions;
CREATE POLICY "Public can view active promotions" ON promotions
  FOR SELECT USING (
    is_active = TRUE 
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- 4. Trigger for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_promotions_updated_at ON promotions;
CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- END MIGRATION: 017_create_promotions_table.sql

-- =========================================================
-- BEGIN MIGRATION: 019_enhance_promotions_table.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - MIGRATION 019
-- Enhance Promotions Table (Mobile Image & CTA)
-- ============================================

-- Add new columns for enhanced customization
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS mobile_image_url TEXT,
ADD COLUMN IF NOT EXISTS cta_text TEXT,
ADD COLUMN IF NOT EXISTS cta_link TEXT;

-- Comment on columns
COMMENT ON COLUMN promotions.mobile_image_url IS 'Optional image optimized for mobile devices';
COMMENT ON COLUMN promotions.cta_text IS 'Custom text for the Call-to-Action button';
COMMENT ON COLUMN promotions.cta_link IS 'Custom URL for the Call-to-Action button';
-- END MIGRATION: 019_enhance_promotions_table.sql

-- =========================================================
-- BEGIN MIGRATION: 020_create_cancel_order_rpc.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - CANCEL ORDER RPC
-- Atomic order cancellation with stock restoration
-- ============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS cancel_order(UUID);

-- Function to atomically cancel an order and restore stock
-- Returns true if successful, raises exception on failure
CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_order_status TEXT;
  v_item RECORD;
BEGIN
  -- 1. Lock and fetch the order status
  SELECT status INTO v_order_status
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  -- Check if order exists
  IF v_order_status IS NULL THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  -- 2. Validate order can be cancelled (only 'paid' status)
  IF v_order_status <> 'paid' THEN
    RAISE EXCEPTION 'Order cannot be cancelled. Current status: %. Only "paid" orders can be cancelled.', v_order_status;
  END IF;

  -- 3. Update order status to 'cancelled'
  UPDATE orders
  SET status = 'cancelled'
  WHERE id = p_order_id;

  -- 4. Restore stock for each order item
  FOR v_item IN
    SELECT variant_id, quantity
    FROM order_items
    WHERE order_id = p_order_id
      AND variant_id IS NOT NULL
  LOOP
    -- Use the existing restore_stock function
    PERFORM restore_stock(v_item.variant_id, v_item.quantity);
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION cancel_order(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION cancel_order(UUID) IS 
  'Atomically cancels an order (status must be "paid") and restores stock for all items.';
-- END MIGRATION: 020_create_cancel_order_rpc.sql

-- =========================================================
-- BEGIN MIGRATION: 021_create_returns_system.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - SISTEMA DE DEVOLUCIONES
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- ============================================
-- 0. FUNCIÓN AUXILIAR: Verificar si usuario es admin
-- Usa raw_user_meta_data->>'is_admin' de auth.users
-- ============================================
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'is_admin')::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 1. TABLA PRINCIPAL DE DEVOLUCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Estado del proceso
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN (
    'requested',   -- Solicitud enviada por cliente
    'approved',    -- Aprobada por admin, esperando envío
    'shipped',     -- Cliente ha enviado el paquete
    'received',    -- Paquete recibido, en inspección
    'completed',   -- Reembolso procesado
    'rejected'     -- Rechazada por admin
  )),
  
  -- Datos financieros
  refund_amount NUMERIC(10, 2) DEFAULT 0,
  refund_method TEXT DEFAULT 'original_payment',
  
  -- Notas y comunicación
  customer_notes TEXT,         -- Mensaje del cliente al solicitar
  admin_notes TEXT,            -- Notas internas del admin
  rejection_reason TEXT,       -- Motivo si se rechaza
  
  -- Tracking
  tracking_number TEXT,        -- Número de seguimiento del envío de vuelta
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ============================================
-- 2. ITEMS DE LA DEVOLUCIÓN
-- ============================================
CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  
  -- Motivo de devolución
  reason TEXT NOT NULL CHECK (reason IN (
    'size_mismatch',    -- Talla incorrecta
    'defective',        -- Producto defectuoso
    'not_as_described', -- No coincide con descripción
    'changed_mind',     -- Cambio de opinión
    'arrived_late',     -- Llegó tarde
    'other'             -- Otro motivo
  )),
  reason_details TEXT,  -- Detalle adicional del motivo
  
  -- Inspección (solo admin)
  inspection_status TEXT DEFAULT 'pending' CHECK (inspection_status IN (
    'pending',     -- No inspeccionado
    'approved',    -- Apto para restock
    'rejected'     -- No apto (dañado, usado, etc.)
  )),
  inspection_notes TEXT,
  restock_approved BOOLEAN DEFAULT FALSE,
  
  -- Precio para cálculo de reembolso
  refund_amount NUMERIC(10, 2) DEFAULT 0
);

-- ============================================
-- 3. IMÁGENES DE DEVOLUCIÓN (Pruebas)
-- ============================================
CREATE TABLE IF NOT EXISTS return_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  return_item_id UUID REFERENCES return_items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  uploaded_by TEXT DEFAULT 'customer', -- 'customer' o 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. MODIFICAR TABLA ORDERS (Añadir refunded_amount)
-- ============================================
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC(10, 2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- ============================================
-- 5. CONFIGURACIÓN DE POLÍTICA DE DEVOLUCIONES
-- ============================================
INSERT INTO settings (key, value_bool, description) VALUES
  ('returns_enabled', true, 'Habilita/deshabilita el sistema de devoluciones')
ON CONFLICT (key) DO NOTHING;

-- Añadir columna para valores numéricos si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'settings' AND column_name = 'value_number') THEN
    ALTER TABLE settings ADD COLUMN value_number INTEGER;
  END IF;
END $$;

INSERT INTO settings (key, value_number, description) VALUES
  ('return_window_days', 30, 'Días máximos para solicitar devolución desde entrega')
ON CONFLICT (key) DO UPDATE SET value_number = EXCLUDED.value_number;

-- ============================================
-- 6. ÍNDICES PARA RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_returns_order ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user ON returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_return_items_return ON return_items(return_id);

-- ============================================
-- 7. ROW LEVEL SECURITY
-- ============================================

-- Habilitar RLS
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_images ENABLE ROW LEVEL SECURITY;

-- Políticas para returns (usando is_admin() en lugar de tabla admins)
CREATE POLICY "Users can view their own returns" ON returns
  FOR SELECT USING (
    user_id = auth.uid() 
    OR is_admin()
  );

CREATE POLICY "Users can create returns for their orders" ON returns
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_id 
      AND o.customer_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can update returns" ON returns
  FOR UPDATE USING (is_admin());

-- Políticas para return_items
CREATE POLICY "Users can view their return items" ON return_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM returns r 
      WHERE r.id = return_id 
      AND (r.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can insert return items" ON return_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM returns r 
      WHERE r.id = return_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update return items" ON return_items
  FOR UPDATE USING (is_admin());

-- Políticas para return_images
CREATE POLICY "Users can view return images" ON return_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM returns r 
      WHERE r.id = return_id 
      AND (r.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can upload return images" ON return_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM returns r 
      WHERE r.id = return_id AND r.user_id = auth.uid()
    )
  );

-- ============================================
-- 8. FUNCIÓN RPC: Procesar Devolución (Admin)
-- ============================================
CREATE OR REPLACE FUNCTION process_return(
  p_return_id UUID,
  p_action TEXT,  -- 'approve', 'reject', 'receive', 'complete'
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
  v_item RECORD;
  v_total_refund NUMERIC(10, 2) := 0;
BEGIN
  -- Verificar que el admin tiene permisos (usa is_admin())
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden procesar devoluciones';
  END IF;

  -- Obtener la devolución
  SELECT * INTO v_return FROM returns WHERE id = p_return_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  -- Procesar según la acción
  CASE p_action
    WHEN 'approve' THEN
      IF v_return.status != 'requested' THEN
        RAISE EXCEPTION 'Solo se pueden aprobar devoluciones en estado "requested"';
      END IF;
      UPDATE returns SET 
        status = 'approved', 
        approved_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

    WHEN 'reject' THEN
      IF v_return.status NOT IN ('requested', 'approved') THEN
        RAISE EXCEPTION 'No se puede rechazar esta devolución';
      END IF;
      UPDATE returns SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

    WHEN 'receive' THEN
      IF v_return.status != 'shipped' AND v_return.status != 'approved' THEN
        RAISE EXCEPTION 'Solo se pueden marcar como recibidas devoluciones enviadas o aprobadas';
      END IF;
      UPDATE returns SET 
        status = 'received',
        received_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

    WHEN 'complete' THEN
      IF v_return.status != 'received' THEN
        RAISE EXCEPTION 'Solo se pueden completar devoluciones en estado "received"';
      END IF;
      
      -- Calcular reembolso total de items aprobados
      SELECT COALESCE(SUM(refund_amount), 0) INTO v_total_refund
      FROM return_items
      WHERE return_id = p_return_id AND inspection_status = 'approved';
      
      -- Restaurar stock para items aprobados
      FOR v_item IN 
        SELECT ri.product_variant_id, ri.quantity
        FROM return_items ri
        WHERE ri.return_id = p_return_id 
        AND ri.inspection_status = 'approved'
        AND ri.restock_approved = TRUE
        AND ri.product_variant_id IS NOT NULL
      LOOP
        PERFORM restore_stock(v_item.product_variant_id, v_item.quantity);
      END LOOP;
      
      -- Actualizar devolución
      UPDATE returns SET 
        status = 'completed',
        completed_at = NOW(),
        refund_amount = v_total_refund,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar order con el monto reembolsado
      UPDATE orders SET 
        refunded_amount = COALESCE(refunded_amount, 0) + v_total_refund
      WHERE id = v_return.order_id;

    ELSE
      RAISE EXCEPTION 'Acción no válida: %', p_action;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. FUNCIÓN RPC: Inspeccionar Item (Admin)
-- ============================================
CREATE OR REPLACE FUNCTION inspect_return_item(
  p_item_id UUID,
  p_status TEXT,  -- 'approved' o 'rejected'
  p_restock BOOLEAN DEFAULT FALSE,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
  v_order_item RECORD;
BEGIN
  -- Verificar admin (usa is_admin())
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden inspeccionar items';
  END IF;

  -- Obtener item
  SELECT ri.*, r.status as return_status
  INTO v_item
  FROM return_items ri
  JOIN returns r ON r.id = ri.return_id
  WHERE ri.id = p_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item no encontrado';
  END IF;

  IF v_item.return_status != 'received' THEN
    RAISE EXCEPTION 'Solo se pueden inspeccionar items de devoluciones recibidas';
  END IF;

  -- Calcular monto de reembolso si se aprueba
  IF p_status = 'approved' THEN
    SELECT oi.price_at_purchase INTO v_order_item
    FROM order_items oi WHERE oi.id = v_item.order_item_id;
    
    UPDATE return_items SET
      inspection_status = 'approved',
      restock_approved = p_restock,
      inspection_notes = p_notes,
      refund_amount = COALESCE(v_order_item.price_at_purchase, 0) * v_item.quantity
    WHERE id = p_item_id;
  ELSE
    UPDATE return_items SET
      inspection_status = 'rejected',
      restock_approved = FALSE,
      inspection_notes = p_notes,
      refund_amount = 0
    WHERE id = p_item_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- END MIGRATION: 021_create_returns_system.sql

-- =========================================================
-- BEGIN MIGRATION: 022_fix_returns_policy.sql
-- =========================================================
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
-- END MIGRATION: 022_fix_returns_policy.sql

-- =========================================================
-- BEGIN MIGRATION: 023_fix_return_refund_calc.sql
-- =========================================================
-- ============================================
-- FIX: RECALCULO DE MONTOS DE DEVOLUCIÓN
-- ============================================

-- 1. Mejorar inspect_return_item para cálculo directo
CREATE OR REPLACE FUNCTION inspect_return_item(
  p_item_id UUID,
  p_status TEXT,  -- 'approved' o 'rejected'
  p_restock BOOLEAN DEFAULT FALSE,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Verificar admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden inspeccionar items';
  END IF;

  -- Verificar estado
  SELECT ri.*, r.status as return_status
  INTO v_item
  FROM return_items ri
  JOIN returns r ON r.id = ri.return_id
  WHERE ri.id = p_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item no encontrado';
  END IF;

  IF v_item.return_status != 'received' THEN
    RAISE EXCEPTION 'Solo se pueden inspeccionar items de devoluciones recibidas';
  END IF;

  -- Actualizar
  IF p_status = 'approved' THEN
    UPDATE return_items ri
    SET
      inspection_status = 'approved',
      restock_approved = p_restock,
      inspection_notes = p_notes,
      refund_amount = (
        SELECT oi.price_at_purchase * ri.quantity
        FROM order_items oi
        WHERE oi.id = ri.order_item_id
      )
    WHERE id = p_item_id;
  ELSE
    UPDATE return_items
    SET
      inspection_status = 'rejected',
      restock_approved = FALSE,
      inspection_notes = p_notes,
      refund_amount = 0
    WHERE id = p_item_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Mejorar process_return para asegurar cálculo al completar
CREATE OR REPLACE FUNCTION process_return(
  p_return_id UUID,
  p_action TEXT,
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
  v_item RECORD;
  v_total_refund NUMERIC(10, 2) := 0;
BEGIN
  -- Verificar admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden procesar devoluciones';
  END IF;

  SELECT * INTO v_return FROM returns WHERE id = p_return_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  CASE p_action
    WHEN 'approve' THEN
      IF v_return.status != 'requested' THEN
        RAISE EXCEPTION 'Solo se pueden aprobar devoluciones en estado "requested"';
      END IF;
      UPDATE returns SET 
        status = 'approved', 
        approved_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

    WHEN 'reject' THEN
      IF v_return.status NOT IN ('requested', 'approved') THEN
        RAISE EXCEPTION 'No se puede rechazar esta devolución';
      END IF;
      UPDATE returns SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

    WHEN 'receive' THEN
      IF v_return.status != 'shipped' AND v_return.status != 'approved' THEN
        RAISE EXCEPTION 'Solo se pueden marcar como recibidas devoluciones enviadas o aprobadas';
      END IF;
      UPDATE returns SET 
        status = 'received',
        received_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

    WHEN 'complete' THEN
      IF v_return.status != 'received' THEN
        RAISE EXCEPTION 'Solo se pueden completar devoluciones en estado "received"';
      END IF;
      
      -- RECALCULO DE SEGURIDAD: Asegurar que todos los items aprobados tengan su refund_amount correcto
      -- Esto corrige cualquier item que pudiera haberse quedado a 0 por error en la inspección
      UPDATE return_items ri
      SET refund_amount = (
        SELECT oi.price_at_purchase * ri.quantity
        FROM order_items oi
        WHERE oi.id = ri.order_item_id
      )
      WHERE ri.return_id = p_return_id AND ri.inspection_status = 'approved';

      -- Calcular total sumando los items (ahora garantizados correctos)
      SELECT COALESCE(SUM(refund_amount), 0) INTO v_total_refund
      FROM return_items
      WHERE return_id = p_return_id AND inspection_status = 'approved';
      
      -- Restaurar stock
      FOR v_item IN 
        SELECT ri.product_variant_id, ri.quantity
        FROM return_items ri
        WHERE ri.return_id = p_return_id 
        AND ri.inspection_status = 'approved'
        AND ri.restock_approved = TRUE
        AND ri.product_variant_id IS NOT NULL
      LOOP
        PERFORM restore_stock(v_item.product_variant_id, v_item.quantity);
      END LOOP;
      
      -- Actualizar devolución
      UPDATE returns SET 
        status = 'completed',
        completed_at = NOW(),
        refund_amount = v_total_refund,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar order
      UPDATE orders SET 
        refunded_amount = COALESCE(refunded_amount, 0) + v_total_refund
      WHERE id = v_return.order_id;

    ELSE
      RAISE EXCEPTION 'Acción no válida: %', p_action;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CORRECCIÓN DE DATOS EXISTENTES (DO BLOCK)
DO $$
DECLARE
  v_rec_item RECORD;
  v_rec_return RECORD;
  v_total NUMERIC;
BEGIN
  -- A. Arreglar return_items con refund_amount = 0 que estan aprobados
  FOR v_rec_item IN 
    SELECT ri.id, ri.quantity, ri.order_item_id 
    FROM return_items ri
    WHERE ri.inspection_status = 'approved' AND (ri.refund_amount IS NULL OR ri.refund_amount = 0)
  LOOP
    UPDATE return_items
    SET refund_amount = (
      SELECT oi.price_at_purchase * v_rec_item.quantity
      FROM order_items oi
      WHERE oi.id = v_rec_item.order_item_id
    )
    WHERE id = v_rec_item.id;
  END LOOP;

  -- B. Recalcular returns completados con refund_amount = 0
  FOR v_rec_return IN 
    SELECT r.id, r.order_id 
    FROM returns r 
    WHERE r.status = 'completed' AND (r.refund_amount IS NULL OR r.refund_amount = 0)
  LOOP
    -- Calcular real
    SELECT COALESCE(SUM(ri.refund_amount), 0) INTO v_total
    FROM return_items ri
    WHERE ri.return_id = v_rec_return.id AND ri.inspection_status = 'approved';
    
    -- Actualizar return
    UPDATE returns SET refund_amount = v_total WHERE id = v_rec_return.id;
    
    -- Actualizar order (sumar la diferencia)
    UPDATE orders 
    SET refunded_amount = COALESCE(refunded_amount, 0) + v_total
    WHERE id = v_rec_return.order_id;
  END LOOP;
END;
$$;
-- END MIGRATION: 023_fix_return_refund_calc.sql

-- =========================================================
-- BEGIN MIGRATION: 024_create_invoices.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - SISTEMA DE FACTURAS
-- Migración 024: Crear tabla invoices
-- ============================================

-- Secuencia para numeración correlativa de facturas
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Tabla de facturas (solo para facturas completas solicitadas)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  -- Datos fiscales del cliente (capturados al solicitar factura)
  customer_nif TEXT NOT NULL,
  customer_fiscal_name TEXT NOT NULL,
  customer_fiscal_address TEXT NOT NULL,
  -- Importes desglosados
  subtotal NUMERIC(10,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 21.00,
  tax_amount NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- RLS Policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver facturas de sus propios pedidos
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE customer_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Los admins pueden ver todas las facturas
-- Los admins pueden ver todas las facturas
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Los admins pueden insertar facturas
CREATE POLICY "Admins can insert invoices" ON invoices
  FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Service role puede hacer todo (para webhooks/APIs)
CREATE POLICY "Service role full access" ON invoices
  FOR ALL
  USING (auth.role() = 'service_role');

-- Función RPC para generar número de factura
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_prefix TEXT;
  seq_num BIGINT;
BEGIN
  year_prefix := 'FS-' || EXTRACT(YEAR FROM NOW())::TEXT || '-';
  seq_num := nextval('invoice_number_seq');
  RETURN year_prefix || LPAD(seq_num::TEXT, 5, '0');
END;
$$;

-- Función RPC para crear factura
CREATE OR REPLACE FUNCTION create_invoice(
  p_order_id UUID,
  p_customer_nif TEXT,
  p_customer_fiscal_name TEXT,
  p_customer_fiscal_address TEXT
)
RETURNS TABLE(
  invoice_id UUID,
  invoice_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invoice_id UUID;
  v_invoice_number TEXT;
  v_order RECORD;
BEGIN
  -- Verificar que el pedido existe y está pagado
  SELECT id, total_amount, customer_email 
  INTO v_order
  FROM orders 
  WHERE id = p_order_id AND status IN ('paid', 'shipped', 'delivered');
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido no encontrado o no está pagado';
  END IF;
  
  -- Verificar que no existe ya una factura para este pedido
  IF EXISTS (SELECT 1 FROM invoices WHERE order_id = p_order_id) THEN
    RAISE EXCEPTION 'Ya existe una factura para este pedido';
  END IF;
  
  -- Generar número de factura
  v_invoice_number := generate_invoice_number();
  
  -- Calcular importes
  -- subtotal = total / 1.21 (asumiendo IVA 21%)
  -- tax_amount = total - subtotal
  
  INSERT INTO invoices (
    order_id,
    invoice_number,
    customer_nif,
    customer_fiscal_name,
    customer_fiscal_address,
    subtotal,
    tax_rate,
    tax_amount,
    total
  ) VALUES (
    p_order_id,
    v_invoice_number,
    p_customer_nif,
    p_customer_fiscal_name,
    p_customer_fiscal_address,
    ROUND(v_order.total_amount / 1.21, 2),
    21.00,
    ROUND(v_order.total_amount - (v_order.total_amount / 1.21), 2),
    v_order.total_amount
  )
  RETURNING id INTO v_invoice_id;
  
  RETURN QUERY SELECT v_invoice_id, v_invoice_number;
END;
$$;
-- END MIGRATION: 024_create_invoices.sql

-- =========================================================
-- BEGIN MIGRATION: 025_create_documents_bucket.sql
-- =========================================================
    -- ============================================
    -- FASHIONSTORE - STORAGE BUCKET FOR DOCUMENTS
    -- Migración 025: Crear bucket 'documents'
    -- ============================================

    -- Crear bucket para documentos (facturas, pdfs)
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('documents', 'documents', true)
    ON CONFLICT (id) DO NOTHING;

    -- ============================================
    -- POLÍTICAS DEL BUCKET
    -- ============================================

    -- Lectura pública (para descargar facturas)
    CREATE POLICY "Documents: Public read" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'documents');

    -- Subida para usuarios autenticados (para generar sus facturas)
    -- Nota: En producción idealmente solo el Service Role subiría esto,
    -- pero dado que la llamada API actúa como el usuario, permitimos auth.
    CREATE POLICY "Documents: Authenticated upload" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

    -- Actualización solo para admin
    CREATE POLICY "Documents: Admin update" 
    ON storage.objects FOR UPDATE 
    USING (
        bucket_id = 'documents' 
        AND (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

    -- Eliminación solo para admin
    CREATE POLICY "Documents: Admin delete" 
    ON storage.objects FOR DELETE 
    USING (
        bucket_id = 'documents' 
        AND (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );
-- END MIGRATION: 025_create_documents_bucket.sql

-- =========================================================
-- BEGIN MIGRATION: 026_add_order_number_polished.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - MIGRACIÓN 026
-- Sistema de Numeración Secuencial de Pedidos
-- Fecha: 2026-01-15
-- Autor: Sistema
-- ============================================
-- 
-- OBJETIVO:
-- Añadir columna order_number (BIGINT) a la tabla orders
-- para reemplazar el uso de UUID como identificador visible
-- Formato display: #A000001 (6 dígitos con padding)
--
-- CAMBIOS:
-- 1. Nueva columna: orders.order_number (BIGINT, NOT NULL, UNIQUE)
-- 2. Índice para búsquedas rápidas
-- 3. Migración de datos históricos (asignar números secuenciales)
-- 4. Secuencia sincronizada con el máximo valor actual
--
-- TIEMPO ESTIMADO: 5-10 minutos (depende del número de pedidos)
-- IMPACTO: Bloqueo temporal de escrituras en tabla orders
-- ============================================

BEGIN;

-- ============================================
-- PASO 1: Crear columna con IDENTITY
-- ============================================
-- IDENTITY es similar a SERIAL pero más estándar SQL
-- GENERATED BY DEFAULT permite insertar valores manualmente si es necesario
ALTER TABLE orders
ADD COLUMN order_number BIGINT GENERATED BY DEFAULT AS IDENTITY;

DO $$ BEGIN
  RAISE NOTICE 'Paso 1/6: Columna order_number creada';
END $$;

-- ============================================
-- PASO 2: Crear índice
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

DO $$ BEGIN
  RAISE NOTICE 'Paso 2/6: Índice idx_orders_order_number creado';
END $$;

-- ============================================
-- PASO 3: Migrar datos históricos
-- ============================================
-- Asigna números secuenciales a pedidos existentes
-- ordenados por fecha de creación (los más antiguos primero)
DO $$
DECLARE
  affected_rows INT;
BEGIN
  WITH sorted_orders AS (
    SELECT 
      id, 
      ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
    FROM orders
    WHERE order_number IS NULL
  )
  UPDATE orders
  SET order_number = sorted_orders.rn
  FROM sorted_orders
  WHERE orders.id = sorted_orders.id;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Paso 3/6: % pedidos históricos actualizados con números secuenciales', affected_rows;
END $$;

-- ============================================
-- PASO 4: Sincronizar secuencia
-- ============================================
-- Ajusta la secuencia para que el próximo número sea mayor que el máximo actual
-- Esto evita duplicados cuando se creen nuevos pedidos
DO $$
DECLARE
  next_val BIGINT;
BEGIN
  SELECT setval('orders_order_number_seq', (SELECT COALESCE(MAX(order_number), 0) FROM orders)) INTO next_val;
  RAISE NOTICE 'Paso 4/6: Secuencia sincronizada. Próximo valor: %', next_val + 1;
END $$;

-- ============================================
-- PASO 5: Hacer columna obligatoria (NOT NULL)
-- ============================================
-- Ahora que todos los pedidos tienen un número, hacemos la columna obligatoria
ALTER TABLE orders 
ALTER COLUMN order_number SET NOT NULL;

DO $$ BEGIN
  RAISE NOTICE 'Paso 5/6: Columna order_number configurada como NOT NULL';
END $$;

-- ============================================
-- PASO 6: Añadir constraint de unicidad
-- ============================================
-- Crítico: Asegura que no haya números de pedido duplicados
ALTER TABLE orders 
ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);

DO $$ BEGIN
  RAISE NOTICE 'Paso 6/6: Constraint de unicidad añadido';
END $$;

COMMIT;

-- ============================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================
DO $$
DECLARE
  total_orders INT;
  orders_with_number INT;
  max_number INT;
  next_value BIGINT;
  has_nulls INT;
  has_duplicates INT;
BEGIN
  -- Contar pedidos
  SELECT COUNT(*) INTO total_orders FROM orders;
  SELECT COUNT(*) INTO orders_with_number FROM orders WHERE order_number IS NOT NULL;
  SELECT MAX(order_number) INTO max_number FROM orders;
  SELECT last_value INTO next_value FROM orders_order_number_seq;
  
  -- Verificar nulls
  SELECT COUNT(*) INTO has_nulls FROM orders WHERE order_number IS NULL;
  
  -- Verificar duplicados
  SELECT COUNT(*) INTO has_duplicates FROM (
    SELECT order_number 
    FROM orders 
    GROUP BY order_number 
    HAVING COUNT(*) > 1
  ) duplicates;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '           VERIFICACIÓN DE MIGRACIÓN 026              ';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'Total de pedidos en BD:        %', total_orders;
  RAISE NOTICE 'Pedidos con order_number:      %', orders_with_number;
  RAISE NOTICE 'Máximo order_number asignado:  %', max_number;
  RAISE NOTICE 'Próximo número disponible:     %', next_value + 1;
  RAISE NOTICE '';
  RAISE NOTICE 'Verificaciones:';
  RAISE NOTICE '  - Pedidos con NULL:          % (debe ser 0)', has_nulls;
  RAISE NOTICE '  - Números duplicados:        % (debe ser 0)', has_duplicates;
  RAISE NOTICE '';
  
  -- Validar que todo está correcto
  IF has_nulls > 0 THEN
    RAISE WARNING '⚠️  ATENCIÓN: Hay % pedidos sin order_number', has_nulls;
  END IF;
  
  IF has_duplicates > 0 THEN
    RAISE WARNING '⚠️  ATENCIÓN: Hay % números de pedido duplicados', has_duplicates;
  END IF;
  
  IF total_orders = orders_with_number AND has_nulls = 0 AND has_duplicates = 0 THEN
    RAISE NOTICE '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
  ELSE
    RAISE WARNING '⚠️  VERIFICAR RESULTADOS - Posibles problemas detectados';
  END IF;
  
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
END $$;

-- ============================================
-- QUERY DE MUESTRA
-- ============================================
-- Mostrar los últimos 5 pedidos con sus números
DO $$
DECLARE
  sample_row RECORD;
BEGIN
  RAISE NOTICE 'Muestra de pedidos (últimos 5):';
  RAISE NOTICE '';
  
  FOR sample_row IN 
    SELECT 
      order_number,
      substring(id::text, 1, 8) as short_id,
      customer_email,
      created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 5
  LOOP
    RAISE NOTICE 'Order #% | UUID: % | Cliente: % | Fecha: %',
      sample_row.order_number,
      sample_row.short_id,
      sample_row.customer_email,
      sample_row.created_at;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- ============================================
-- FIN DE MIGRACIÓN 026
-- ============================================
-- 
-- PRÓXIMOS PASOS:
-- 1. Actualizar función RPC create_checkout_order para retornar order_number
-- 2. Actualizar código frontend/backend para usar formatOrderId()
-- 3. Probar creación de nuevos pedidos
-- 4. Verificar emails y facturas con nuevo formato
--
-- En caso de problemas, ejecutar: rollback_026.sql
-- ============================================
-- END MIGRATION: 026_add_order_number_polished.sql

-- =========================================================
-- BEGIN MIGRATION: 027_update_rpc_return_order_number.sql
-- =========================================================
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
-- END MIGRATION: 027_update_rpc_return_order_number.sql

-- =========================================================
-- BEGIN MIGRATION: 028_add_return_order_statuses.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - AÑADIR ESTADOS DE DEVOLUCIÓN A PEDIDOS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Este script actualiza las opciones de status de orders para incluir
-- estados relacionados con devoluciones.

-- Nota: PostgreSQL no permite modificar directamente los valores de un CHECK constraint.
-- Primero debemos eliminar el constraint existente y luego crear uno nuevo.

-- 1. Eliminar el constraint de status existente (si existe)
DO $$
BEGIN
  -- Buscar y eliminar cualquier constraint CHECK sobre la columna status
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'orders' AND column_name = 'status'
  ) THEN
    -- Obtener el nombre del constraint y eliminarlo
    EXECUTE (
      SELECT 'ALTER TABLE orders DROP CONSTRAINT IF EXISTS ' || constraint_name
      FROM information_schema.constraint_column_usage
      WHERE table_name = 'orders' AND column_name = 'status'
      LIMIT 1
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Si no existe el constraint, continuar
    NULL;
END $$;

-- 2. Añadir nuevo constraint con estados adicionales para devoluciones
-- Estados:
--   pending          - Pedido creado, pendiente de pago
--   paid             - Pagado, esperando preparación
--   shipped          - Enviado al cliente
--   delivered        - Entregado al cliente
--   cancelled        - Pedido cancelado
--   return_requested - Cliente ha solicitado una devolución
--   return_approved  - Devolución aprobada, esperando envío del cliente
--   return_shipped   - Cliente ha enviado la devolución
--   return_received  - Devolución recibida, en inspección
--   return_completed - Devolución completada, reembolso procesado
--   partially_refunded - Reembolso parcial procesado

-- Nota: No añadimos el constraint estricto para mayor flexibilidad
-- Los valores se validan en la aplicación

-- 3. Crear función para validar estados de pedidos (opcional, para referencia)
CREATE OR REPLACE FUNCTION get_valid_order_statuses()
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY[
    'pending',
    'paid', 
    'shipped',
    'delivered',
    'cancelled',
    'return_requested',
    'return_approved',
    'return_shipped',
    'return_received',
    'return_completed',
    'partially_refunded'
  ];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Actualizar la función process_return para cambiar el estado del pedido
CREATE OR REPLACE FUNCTION process_return(
  p_return_id UUID,
  p_action TEXT,  -- 'approve', 'reject', 'receive', 'complete'
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
  v_item RECORD;
  v_total_refund NUMERIC(10, 2) := 0;
  v_order_total NUMERIC(10, 2);
BEGIN
  -- Verificar que el admin tiene permisos
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden procesar devoluciones';
  END IF;

  -- Obtener la devolución
  SELECT * INTO v_return FROM returns WHERE id = p_return_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  -- Procesar según la acción
  CASE p_action
    WHEN 'approve' THEN
      IF v_return.status != 'requested' THEN
        RAISE EXCEPTION 'Solo se pueden aprobar devoluciones en estado "requested"';
      END IF;
      UPDATE returns SET 
        status = 'approved', 
        approved_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar estado del pedido
      UPDATE orders SET status = 'return_approved' WHERE id = v_return.order_id;

    WHEN 'reject' THEN
      IF v_return.status NOT IN ('requested', 'approved') THEN
        RAISE EXCEPTION 'No se puede rechazar esta devolución';
      END IF;
      UPDATE returns SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Restaurar estado del pedido a delivered
      UPDATE orders SET status = 'delivered' WHERE id = v_return.order_id;

    WHEN 'receive' THEN
      IF v_return.status != 'shipped' AND v_return.status != 'approved' THEN
        RAISE EXCEPTION 'Solo se pueden marcar como recibidas devoluciones enviadas o aprobadas';
      END IF;
      UPDATE returns SET 
        status = 'received',
        received_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar estado del pedido
      UPDATE orders SET status = 'return_received' WHERE id = v_return.order_id;

    WHEN 'complete' THEN
      IF v_return.status != 'received' THEN
        RAISE EXCEPTION 'Solo se pueden completar devoluciones en estado "received"';
      END IF;
      
      -- Calcular reembolso total de items aprobados
      SELECT COALESCE(SUM(refund_amount), 0) INTO v_total_refund
      FROM return_items
      WHERE return_id = p_return_id AND inspection_status = 'approved';
      
      -- Restaurar stock para items aprobados
      FOR v_item IN 
        SELECT ri.product_variant_id, ri.quantity
        FROM return_items ri
        WHERE ri.return_id = p_return_id 
        AND ri.inspection_status = 'approved'
        AND ri.restock_approved = TRUE
        AND ri.product_variant_id IS NOT NULL
      LOOP
        PERFORM restore_stock(v_item.product_variant_id, v_item.quantity);
      END LOOP;
      
      -- Actualizar devolución
      UPDATE returns SET 
        status = 'completed',
        completed_at = NOW(),
        refund_amount = v_total_refund,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar order con el monto reembolsado
      UPDATE orders SET 
        refunded_amount = COALESCE(refunded_amount, 0) + v_total_refund
      WHERE id = v_return.order_id;
      
      -- Determinar el estado final del pedido
      SELECT total_amount INTO v_order_total FROM orders WHERE id = v_return.order_id;
      
      IF v_total_refund >= v_order_total THEN
        UPDATE orders SET status = 'return_completed' WHERE id = v_return.order_id;
      ELSE
        UPDATE orders SET status = 'partially_refunded' WHERE id = v_return.order_id;
      END IF;

    ELSE
      RAISE EXCEPTION 'Acción no válida: %', p_action;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Función para que el cliente marque como enviada la devolución
CREATE OR REPLACE FUNCTION mark_return_shipped(
  p_return_id UUID,
  p_tracking_number TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
BEGIN
  -- Obtener la devolución y verificar que pertenece al usuario
  SELECT r.*, o.customer_id INTO v_return
  FROM returns r
  JOIN orders o ON o.id = r.order_id
  WHERE r.id = p_return_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;
  
  -- Verificar que el usuario es el propietario o es admin
  IF v_return.user_id != auth.uid() AND NOT is_admin() THEN
    RAISE EXCEPTION 'No tienes permiso para modificar esta devolución';
  END IF;
  
  IF v_return.status != 'approved' THEN
    RAISE EXCEPTION 'Solo se pueden marcar como enviadas devoluciones aprobadas';
  END IF;
  
  UPDATE returns SET 
    status = 'shipped',
    tracking_number = COALESCE(p_tracking_number, tracking_number)
  WHERE id = p_return_id;
  
  -- Actualizar estado del pedido
  UPDATE orders SET status = 'return_shipped' WHERE id = v_return.order_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- END MIGRATION: 028_add_return_order_statuses.sql

-- =========================================================
-- BEGIN MIGRATION: 028_fix_orders_rls_for_authenticated_checkout.sql
-- =========================================================
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
-- END MIGRATION: 028_fix_orders_rls_for_authenticated_checkout.sql

-- =========================================================
-- BEGIN MIGRATION: 029_add_return_label.sql
-- =========================================================
-- Add return_label_url to returns table
ALTER TABLE returns ADD COLUMN return_label_url TEXT;

-- Update process_return function to accept return_label_url
CREATE OR REPLACE FUNCTION process_return(
  p_return_id UUID,
  p_action TEXT,  -- 'approve', 'reject', 'receive', 'complete'
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL,
  p_return_label_url TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
  v_item RECORD;
  v_total_refund NUMERIC(10, 2) := 0;
  v_order_total NUMERIC(10, 2);
BEGIN
  -- Verificar que el admin tiene permisos
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden procesar devoluciones';
  END IF;

  -- Obtener la devolución
  SELECT * INTO v_return FROM returns WHERE id = p_return_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  -- Procesar según la acción
  CASE p_action
    WHEN 'approve' THEN
      IF v_return.status != 'requested' THEN
        RAISE EXCEPTION 'Solo se pueden aprobar devoluciones en estado "requested"';
      END IF;
      UPDATE returns SET 
        status = 'approved', 
        approved_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes),
        return_label_url = COALESCE(p_return_label_url, return_label_url)
      WHERE id = p_return_id;
      
      -- Actualizar estado del pedido
      UPDATE orders SET status = 'return_approved' WHERE id = v_return.order_id;

    WHEN 'reject' THEN
      IF v_return.status NOT IN ('requested', 'approved') THEN
        RAISE EXCEPTION 'No se puede rechazar esta devolución';
      END IF;
      UPDATE returns SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Restaurar estado del pedido a delivered
      UPDATE orders SET status = 'delivered' WHERE id = v_return.order_id;

    WHEN 'receive' THEN
      IF v_return.status != 'shipped' AND v_return.status != 'approved' THEN
        RAISE EXCEPTION 'Solo se pueden marcar como recibidas devoluciones enviadas o aprobadas';
      END IF;
      UPDATE returns SET 
        status = 'received',
        received_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar estado del pedido
      UPDATE orders SET status = 'return_received' WHERE id = v_return.order_id;

    WHEN 'complete' THEN
      IF v_return.status != 'received' THEN
        RAISE EXCEPTION 'Solo se pueden completar devoluciones en estado "received"';
      END IF;
      
      -- Calcular reembolso total de items aprobados
      SELECT COALESCE(SUM(refund_amount), 0) INTO v_total_refund
      FROM return_items
      WHERE return_id = p_return_id AND inspection_status = 'approved';
      
      -- Restaurar stock para items aprobados
      FOR v_item IN 
        SELECT ri.product_variant_id, ri.quantity
        FROM return_items ri
        WHERE ri.return_id = p_return_id 
        AND ri.inspection_status = 'approved'
        AND ri.restock_approved = TRUE
        AND ri.product_variant_id IS NOT NULL
      LOOP
        PERFORM restore_stock(v_item.product_variant_id, v_item.quantity);
      END LOOP;
      
      -- Actualizar devolución
      UPDATE returns SET 
        status = 'completed',
        completed_at = NOW(),
        refund_amount = v_total_refund,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar order con el monto reembolsado
      UPDATE orders SET 
        refunded_amount = COALESCE(refunded_amount, 0) + v_total_refund
      WHERE id = v_return.order_id;
      
      -- Determinar el estado final del pedido
      SELECT total_amount INTO v_order_total FROM orders WHERE id = v_return.order_id;
      
      IF v_total_refund >= v_order_total THEN
        UPDATE orders SET status = 'return_completed' WHERE id = v_return.order_id;
      ELSE
        UPDATE orders SET status = 'partially_refunded' WHERE id = v_return.order_id;
      END IF;

    ELSE
      RAISE EXCEPTION 'Acción no válida: %', p_action;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- END MIGRATION: 029_add_return_label.sql

-- =========================================================
-- BEGIN MIGRATION: 030_create_promotion_history.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - MIGRATION 030
-- Create Promotion History for Audit Trail
-- ============================================

-- 1. Create promotion_history table for auditing changes
CREATE TABLE IF NOT EXISTS promotion_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'activated', 'deactivated', 'deleted')),
  changes JSONB, -- Stores the old and new values for updates
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_promotion_history_promotion_id ON promotion_history(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_action ON promotion_history(action);
CREATE INDEX IF NOT EXISTS idx_promotion_history_created_at ON promotion_history(created_at DESC);

-- 3. Enable RLS
ALTER TABLE promotion_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage history
DROP POLICY IF EXISTS "Admins can manage promotion history" ON promotion_history;
CREATE POLICY "Admins can manage promotion history" ON promotion_history
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

-- 4. Create trigger function to auto-log changes
CREATE OR REPLACE FUNCTION log_promotion_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO promotion_history (promotion_id, changed_by, action, changes)
    VALUES (
      NEW.id,
      auth.uid(),
      'created',
      jsonb_build_object('new', row_to_json(NEW))
    );
    RETURN NEW;
  
  ELSIF TG_OP = 'UPDATE' THEN
    -- Determine the specific action type
    DECLARE
      action_type TEXT := 'updated';
    BEGIN
      -- Check if only is_active changed
      IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
        IF NEW.is_active = TRUE THEN
          action_type := 'activated';
        ELSE
          action_type := 'deactivated';
        END IF;
      END IF;
      
      INSERT INTO promotion_history (promotion_id, changed_by, action, changes)
      VALUES (
        NEW.id,
        auth.uid(),
        action_type,
        jsonb_build_object(
          'old', row_to_json(OLD),
          'new', row_to_json(NEW)
        )
      );
    END;
    RETURN NEW;
  
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO promotion_history (promotion_id, changed_by, action, changes)
    VALUES (
      OLD.id,
      auth.uid(),
      'deleted',
      jsonb_build_object('old', row_to_json(OLD))
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger on promotions table
DROP TRIGGER IF EXISTS trg_log_promotion_changes ON promotions;
CREATE TRIGGER trg_log_promotion_changes
  AFTER INSERT OR UPDATE OR DELETE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION log_promotion_changes();

-- 6. Comments
COMMENT ON TABLE promotion_history IS 'Audit trail for promotion changes';
COMMENT ON COLUMN promotion_history.action IS 'Type of change: created, updated, activated, deactivated, deleted';
COMMENT ON COLUMN promotion_history.changes IS 'JSON containing old and new values of the promotion';
-- END MIGRATION: 030_create_promotion_history.sql

-- =========================================================
-- BEGIN MIGRATION: 031_create_promotion_drafts.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - MIGRATION 031
-- Create Promotion Drafts for Auto-save
-- ============================================

-- 1. Create promotion_drafts table for auto-saving wizard progress
CREATE TABLE IF NOT EXISTS promotion_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promotion_data JSONB NOT NULL DEFAULT '{}',
  wizard_step INTEGER DEFAULT 1 CHECK (wizard_step >= 1 AND wizard_step <= 4),
  last_saved TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create unique index to ensure one draft per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_promotion_drafts_user_id 
  ON promotion_drafts(user_id);

-- 3. Create index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_promotion_drafts_last_saved 
  ON promotion_drafts(last_saved);

-- 4. Enable RLS
ALTER TABLE promotion_drafts ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies - Only admins can manage their own drafts
DROP POLICY IF EXISTS "Admins can view own drafts" ON promotion_drafts;
CREATE POLICY "Admins can view own drafts" ON promotion_drafts
  FOR SELECT USING (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

DROP POLICY IF EXISTS "Admins can insert own drafts" ON promotion_drafts;
CREATE POLICY "Admins can insert own drafts" ON promotion_drafts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

DROP POLICY IF EXISTS "Admins can update own drafts" ON promotion_drafts;
CREATE POLICY "Admins can update own drafts" ON promotion_drafts
  FOR UPDATE USING (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

DROP POLICY IF EXISTS "Admins can delete own drafts" ON promotion_drafts;
CREATE POLICY "Admins can delete own drafts" ON promotion_drafts
  FOR DELETE USING (
    auth.uid() = user_id AND
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

-- 6. Function to auto-update last_saved on modification
CREATE OR REPLACE FUNCTION update_draft_last_saved()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_saved = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger for auto-updating last_saved
DROP TRIGGER IF EXISTS trg_update_draft_last_saved ON promotion_drafts;
CREATE TRIGGER trg_update_draft_last_saved
  BEFORE UPDATE ON promotion_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_draft_last_saved();

-- 8. Function to cleanup old drafts (older than 7 days)
-- Can be called periodically via cron or manually
CREATE OR REPLACE FUNCTION cleanup_old_promotion_drafts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM promotion_drafts
  WHERE last_saved < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Comments
COMMENT ON TABLE promotion_drafts IS 'Auto-saved promotion drafts from the wizard';
COMMENT ON COLUMN promotion_drafts.promotion_data IS 'JSON containing all form fields from the wizard';
COMMENT ON COLUMN promotion_drafts.wizard_step IS 'Current step in the wizard (1-4)';
-- END MIGRATION: 031_create_promotion_drafts.sql

-- =========================================================
-- BEGIN MIGRATION: 032_fix_promotion_delete_trigger.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - MIGRATION 032
-- Fix Promotion Delete Trigger
-- ============================================
-- Problem: The AFTER DELETE trigger tries to insert a reference
-- to the deleted promotion_id, which violates the FK constraint.
-- Solution: Store promotion info in JSON and set promotion_id to NULL
-- for deleted records, since the promotion no longer exists.

-- 1. Update the trigger function to handle DELETE properly
CREATE OR REPLACE FUNCTION log_promotion_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO promotion_history (promotion_id, changed_by, action, changes)
    VALUES (
      NEW.id,
      auth.uid(),
      'created',
      jsonb_build_object('new', row_to_json(NEW))
    );
    RETURN NEW;
  
  ELSIF TG_OP = 'UPDATE' THEN
    -- Determine the specific action type
    DECLARE
      action_type TEXT := 'updated';
    BEGIN
      -- Check if only is_active changed
      IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
        IF NEW.is_active = TRUE THEN
          action_type := 'activated';
        ELSE
          action_type := 'deactivated';
        END IF;
      END IF;
      
      INSERT INTO promotion_history (promotion_id, changed_by, action, changes)
      VALUES (
        NEW.id,
        auth.uid(),
        action_type,
        jsonb_build_object(
          'old', row_to_json(OLD),
          'new', row_to_json(NEW)
        )
      );
    END;
    RETURN NEW;
  
  ELSIF TG_OP = 'DELETE' THEN
    -- For DELETE: set promotion_id to NULL since cascade will delete anyway
    -- Store the full promotion data in changes for audit purposes
    INSERT INTO promotion_history (promotion_id, changed_by, action, changes)
    VALUES (
      NULL,  -- Cannot reference deleted row
      auth.uid(),
      'deleted',
      jsonb_build_object(
        'old', row_to_json(OLD),
        'deleted_id', OLD.id,
        'deleted_title', OLD.title
      )
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS trg_log_promotion_changes ON promotions;
CREATE TRIGGER trg_log_promotion_changes
  AFTER INSERT OR UPDATE OR DELETE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION log_promotion_changes();

-- 3. Done - the trigger will now properly handle DELETE operations
-- END MIGRATION: 032_fix_promotion_delete_trigger.sql

-- =========================================================
-- BEGIN MIGRATION: 033_products_soft_delete.sql
-- =========================================================
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
-- END MIGRATION: 033_products_soft_delete.sql

-- =========================================================
-- BEGIN MIGRATION: 034_newsletter_gdpr_compliance.sql
-- =========================================================
-- ============================================
-- MIGRATION: 034_newsletter_gdpr_compliance.sql
-- FashionStore - GDPR Compliance for Newsletter
-- Date: 2026-01-18
-- ============================================

-- 1. Añadir estados 'failed' y 'paused' a campañas
ALTER TABLE newsletter_campaigns
  DROP CONSTRAINT IF EXISTS newsletter_campaigns_status_check;

ALTER TABLE newsletter_campaigns
  ADD CONSTRAINT newsletter_campaigns_status_check
  CHECK (status IN ('draft', 'sending', 'sent', 'failed', 'paused'));

-- 2. Añadir token único para unsubscribe (GDPR CRÍTICO)
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT uuid_generate_v4() UNIQUE;

-- Generar tokens para suscriptores existentes que no tengan
UPDATE newsletter_subscribers
SET unsubscribe_token = uuid_generate_v4()
WHERE unsubscribe_token IS NULL;

-- 3. Añadir contador de errores y último error a campaña
ALTER TABLE newsletter_campaigns
  ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error TEXT;

-- 4. Tabla de logs de envío (auditoría y reintentos)
CREATE TABLE IF NOT EXISTS newsletter_send_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE SET NULL,
  subscriber_email TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'failed', 'bounced', 'opened', 'clicked')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_send_logs_campaign ON newsletter_send_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_send_logs_status ON newsletter_send_logs(status);
CREATE INDEX IF NOT EXISTS idx_send_logs_email ON newsletter_send_logs(subscriber_email);
CREATE INDEX IF NOT EXISTS idx_subscribers_token ON newsletter_subscribers(unsubscribe_token);

-- 6. RLS para logs
ALTER TABLE newsletter_send_logs ENABLE ROW LEVEL SECURITY;

-- Policy para que admins puedan gestionar logs
DROP POLICY IF EXISTS "Admins can manage send logs" ON newsletter_send_logs;
CREATE POLICY "Admins can manage send logs"
  ON newsletter_send_logs
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- 7. Tabla para rate limiting de suscripciones
CREATE TABLE IF NOT EXISTS newsletter_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON newsletter_rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_time ON newsletter_rate_limits(last_attempt_at);

-- Limpiar registros antiguos automáticamente (más de 1 hora)
CREATE OR REPLACE FUNCTION clean_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM newsletter_rate_limits 
  WHERE last_attempt_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- RLS para rate limits (público puede insertar/actualizar su IP)
ALTER TABLE newsletter_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can manage own rate limits" ON newsletter_rate_limits;
CREATE POLICY "Public can manage own rate limits"
  ON newsletter_rate_limits
  FOR ALL
  TO anon, authenticated
  WITH CHECK (true);
-- END MIGRATION: 034_newsletter_gdpr_compliance.sql

-- =========================================================
-- BEGIN MIGRATION: 035_improve_settings_rls.sql
-- =========================================================
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
-- END MIGRATION: 035_improve_settings_rls.sql

-- =========================================================
-- BEGIN MIGRATION: 036_create_return_audit_logs.sql
-- =========================================================
-- ============================================
-- MIGRACIÓN: Sistema de Auditoría para Devoluciones
-- Versión: 036
-- Fecha: 2026-01-23
-- Descripción: Crea tabla de logs de auditoría para rastrear
--              todas las acciones en el sistema de devoluciones
-- ============================================

-- Crear tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS return_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'approved', 'rejected', 'shipped', 'received', 'completed', 'item_inspected', 'note_added'
  previous_status VARCHAR(30),
  new_status VARCHAR(30),
  performed_by UUID, -- NULL si es sistema o cliente anónimo
  performed_by_type VARCHAR(20) NOT NULL DEFAULT 'system', -- 'admin', 'customer', 'system'
  details JSONB DEFAULT '{}', -- Detalles adicionales de la acción
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsquedas eficientes
CREATE INDEX idx_return_audit_logs_return_id ON return_audit_logs(return_id);
CREATE INDEX idx_return_audit_logs_action ON return_audit_logs(action);
CREATE INDEX idx_return_audit_logs_created_at ON return_audit_logs(created_at DESC);
CREATE INDEX idx_return_audit_logs_performed_by ON return_audit_logs(performed_by);

-- RLS: Solo admins pueden ver los logs
ALTER TABLE return_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON return_audit_logs FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

CREATE POLICY "System can insert audit logs"
  ON return_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Función para registrar acciones de auditoría
CREATE OR REPLACE FUNCTION log_return_action(
  p_return_id UUID,
  p_action VARCHAR(50),
  p_previous_status VARCHAR(30) DEFAULT NULL,
  p_new_status VARCHAR(30) DEFAULT NULL,
  p_performed_by UUID DEFAULT NULL,
  p_performed_by_type VARCHAR(20) DEFAULT 'system',
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO return_audit_logs (
    return_id,
    action,
    previous_status,
    new_status,
    performed_by,
    performed_by_type,
    details
  ) VALUES (
    p_return_id,
    p_action,
    p_previous_status,
    p_new_status,
    p_performed_by,
    p_performed_by_type,
    p_details
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Trigger para loguear automáticamente cambios de estado
CREATE OR REPLACE FUNCTION trigger_log_return_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo registrar si el estado cambió
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM log_return_action(
      NEW.id,
      'status_changed',
      OLD.status,
      NEW.status,
      auth.uid(),
      CASE 
        WHEN (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
        THEN 'admin'
        ELSE 'customer'
      END,
      jsonb_build_object(
        'trigger', 'automatic',
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger en la tabla returns
DROP TRIGGER IF EXISTS tr_log_return_status ON returns;
CREATE TRIGGER tr_log_return_status
  AFTER UPDATE ON returns
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_return_status_change();

-- Vista para estadísticas de devoluciones
CREATE OR REPLACE VIEW return_statistics AS
SELECT
  -- Conteos por estado
  COUNT(*) FILTER (WHERE status = 'requested') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
  COUNT(*) FILTER (WHERE status = 'shipped') AS shipped_count,
  COUNT(*) FILTER (WHERE status = 'received') AS received_count,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
  COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count,
  COUNT(*) AS total_count,
  
  -- Métricas de tiempo (promedio en horas)
  AVG(
    CASE WHEN approved_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (approved_at - created_at)) / 3600
    END
  )::numeric(10,2) AS avg_hours_to_approve,
  
  AVG(
    CASE WHEN completed_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600
    END
  )::numeric(10,2) AS avg_hours_to_complete,
  
  -- Métricas financieras
  COALESCE(SUM(refund_amount) FILTER (WHERE status = 'completed'), 0) AS total_refunded,
  COALESCE(AVG(refund_amount) FILTER (WHERE status = 'completed'), 0)::numeric(10,2) AS avg_refund_amount,
  
  -- Devoluciones del último mes
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '30 days') AS last_30_days_count,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '7 days') AS last_7_days_count

FROM returns;

-- Dar acceso a la vista a admins
GRANT SELECT ON return_statistics TO authenticated;

-- Comentarios
COMMENT ON TABLE return_audit_logs IS 'Registro de auditoría para todas las acciones del sistema de devoluciones';
COMMENT ON VIEW return_statistics IS 'Estadísticas agregadas del sistema de devoluciones para el dashboard';
COMMENT ON FUNCTION log_return_action IS 'Función para registrar manualmente acciones en el log de auditoría';
-- END MIGRATION: 036_create_return_audit_logs.sql

-- =========================================================
-- BEGIN MIGRATION: 037_fix_return_workflow.sql
-- =========================================================
-- ============================================
-- MIGRACIÓN: Corrección del Flujo de Devoluciones
-- Versión: 037
-- Fecha: 2026-01-23
-- Descripción: Corrige la lógica de validación de estados
--              para implementar el flujo correcto:
--              requested → approved → shipped → received → completed/rejected
-- ============================================

-- FLUJO CORRECTO:
-- 1. Cliente solicita (requested)
-- 2. Admin aprueba preliminarmente (approved) o rechaza (rejected)
-- 3. Cliente envía paquete (shipped)
-- 4. Admin recibe físicamente (received)
-- 5. Admin inspecciona y completa (completed) o rechaza (rejected)

-- Eliminar versiones anteriores de la función process_return
DROP FUNCTION IF EXISTS process_return(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS process_return(UUID, TEXT, TEXT, TEXT, TEXT);

-- Actualizar función process_return con validaciones corregidas
CREATE OR REPLACE FUNCTION process_return(
  p_return_id UUID,
  p_action TEXT,  -- 'approve', 'reject', 'receive', 'complete'
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL,
  p_return_label_url TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
  v_item RECORD;
  v_total_refund NUMERIC(10, 2) := 0;
  v_order_total NUMERIC(10, 2);
BEGIN
  -- Verificar que el admin tiene permisos
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden procesar devoluciones';
  END IF;

  -- Obtener devolución actual
  SELECT * INTO v_return FROM returns WHERE id = p_return_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  CASE p_action
    -- ========================================
    -- APROBAR: Solo desde requested
    -- ========================================
    WHEN 'approve' THEN
      IF v_return.status != 'requested' THEN
        RAISE EXCEPTION 'Solo se pueden aprobar devoluciones en estado "requested"';
      END IF;
      
      UPDATE returns SET 
        status = 'approved', 
        approved_at = NOW(),
        return_label_url = p_return_label_url,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar estado del pedido
      UPDATE orders SET status = 'return_approved' WHERE id = v_return.order_id;

    -- ========================================
    -- RECHAZAR: Puede ser desde requested O received
    -- ========================================
    WHEN 'reject' THEN
      -- Rechazo inicial: desde requested (motivo inválido, fuera de plazo, etc.)
      -- Rechazo final: desde received (producto dañado por cliente, incompleto, etc.)
      IF v_return.status NOT IN ('requested', 'received') THEN
        RAISE EXCEPTION 'Solo se pueden rechazar devoluciones en estado "requested" o "received"';
      END IF;
      
      UPDATE returns SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Si se rechaza después de recibir, actualizar estado del pedido
      IF v_return.status = 'received' THEN
        UPDATE orders SET status = 'delivered' WHERE id = v_return.order_id;
      ELSE
        -- Si se rechaza antes de enviar, restaurar a delivered
        UPDATE orders SET status = 'delivered' WHERE id = v_return.order_id;
      END IF;

    -- ========================================
    -- RECIBIR: Solo desde shipped
    -- ========================================
    WHEN 'receive' THEN
      IF v_return.status != 'shipped' THEN
        RAISE EXCEPTION 'Solo se pueden marcar como recibidas devoluciones en estado "shipped"';
      END IF;
      
      UPDATE returns SET 
        status = 'received',
        received_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar estado del pedido
      UPDATE orders SET status = 'return_received' WHERE id = v_return.order_id;

    -- ========================================
    -- COMPLETAR: Solo desde received después de inspección
    -- ========================================
    WHEN 'complete' THEN
      IF v_return.status != 'received' THEN
        RAISE EXCEPTION 'Solo se pueden completar devoluciones en estado "received"';
      END IF;
      
      -- Recalcular reembolso: solo items aprobados en la inspección
      -- Asegurar que cada item tiene su refund_amount correcto
      UPDATE return_items ri
      SET refund_amount = (
        SELECT oi.price_at_purchase * ri.quantity
        FROM order_items oi
        WHERE oi.id = ri.order_item_id
      )
      WHERE ri.return_id = p_return_id
      AND ri.inspection_status = 'approved'
      AND ri.refund_amount IS NULL OR ri.refund_amount = 0;
      
      -- Calcular reembolso total de items aprobados
      SELECT COALESCE(SUM(refund_amount), 0) INTO v_total_refund
      FROM return_items
      WHERE return_id = p_return_id AND inspection_status = 'approved';
      
      -- Restaurar stock para items aprobados y autorizados
      FOR v_item IN 
        SELECT ri.product_variant_id, ri.quantity
        FROM return_items ri
        WHERE ri.return_id = p_return_id 
        AND ri.inspection_status = 'approved'
        AND ri.restock_approved = TRUE
        AND ri.product_variant_id IS NOT NULL
      LOOP
        -- Incrementar stock
        UPDATE product_variants
        SET stock = stock + v_item.quantity
        WHERE id = v_item.product_variant_id;
      END LOOP;
      
      -- Actualizar devolución
      UPDATE returns SET 
        status = 'completed',
        completed_at = NOW(),
        refund_amount = v_total_refund,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar order con el monto reembolsado
      UPDATE orders SET 
        refunded_amount = COALESCE(refunded_amount, 0) + v_total_refund
      WHERE id = v_return.order_id;
      
      -- Determinar el estado final del pedido
      SELECT total_amount INTO v_order_total FROM orders WHERE id = v_return.order_id;
      
      IF v_total_refund >= v_order_total THEN
        UPDATE orders SET status = 'return_completed' WHERE id = v_return.order_id;
      ELSE
        UPDATE orders SET status = 'partially_refunded' WHERE id = v_return.order_id;
      END IF;

    ELSE
      RAISE EXCEPTION 'Acción no válida: %. Válidas: approve, reject, receive, complete', p_action;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Función para que el CLIENTE marque como enviada
-- Solo puede hacerlo si la devolución está aprobada
-- ============================================
DROP FUNCTION IF EXISTS mark_return_shipped(UUID, TEXT);

CREATE OR REPLACE FUNCTION mark_return_shipped(
  p_return_id UUID,
  p_tracking_number TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
BEGIN
  -- Obtener devolución
  SELECT * INTO v_return FROM returns WHERE id = p_return_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  -- Verificar que el usuario es el propietario de la devolución
  IF v_return.user_id != auth.uid() AND NOT is_admin() THEN
    RAISE EXCEPTION 'No tienes permisos para modificar esta devolución';
  END IF;

  -- Validar que está en estado 'approved'
  IF v_return.status != 'approved' THEN
    RAISE EXCEPTION 'Solo puedes marcar como enviada una devolución aprobada. Estado actual: %', v_return.status;
  END IF;

  -- Actualizar a shipped
  UPDATE returns SET 
    status = 'shipped',
    tracking_number = COALESCE(p_tracking_number, tracking_number)
  WHERE id = p_return_id;
  
  -- Actualizar estado del pedido
  UPDATE orders SET status = 'return_shipped' WHERE id = v_return.order_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agregar política RLS para que clientes puedan ejecutar mark_return_shipped
GRANT EXECUTE ON FUNCTION mark_return_shipped TO authenticated;

-- Comentarios
COMMENT ON FUNCTION process_return IS 'Procesa acciones de admin en devoluciones: approve (requested→approved), reject (requested/received→rejected), receive (shipped→received), complete (received→completed)';
COMMENT ON FUNCTION mark_return_shipped IS 'Permite al cliente marcar su devolución como enviada una vez aprobada por admin';
-- END MIGRATION: 037_fix_return_workflow.sql

-- =========================================================
-- BEGIN MIGRATION: 038_orders_update_anon_policy.sql
-- =========================================================
-- Migration: Allow ANON users to update pending orders for guest checkout
-- Purpose: Enables guest users to confirm payment by updating order status and stripe_session_id
-- Author: System
-- Date: 2026-01-29
-- Updated: 2026-01-29 - Removed stripe_session_id IS NULL condition because
--          the API already sets stripe_session_id when creating the PaymentIntent
-- Updated: 2026-01-29 - Added SELECT policy because RLS requires SELECT access
--          before UPDATE can work

-- Drop policies if exist (for idempotency)
DROP POLICY IF EXISTS "orders_update_anon_confirm_payment" ON public.orders;
DROP POLICY IF EXISTS "orders_select_anon_pending" ON public.orders;

-- IMPORTANT: For UPDATE to work with RLS, the user must first be able to SELECT the row.
-- Without SELECT access, UPDATE will silently return 0 rows affected.

-- 1. Create SELECT policy for anon to see pending guest orders
CREATE POLICY "orders_select_anon_pending"
ON public.orders
FOR SELECT
TO anon
USING (
  customer_id IS NULL 
  AND status = 'pending'
  AND created_at > NOW() - INTERVAL '1 hour'
);

-- 2. Create UPDATE policy allowing ANON users to update their pending guest orders
-- Security constraints:
-- 1. Only orders without customer_id (guest orders)
-- 2. Only orders in 'pending' status
-- 3. Only orders created within the last hour (prevent abuse)
-- 4. WITH CHECK ensures customer_id remains NULL (guest order)

CREATE POLICY "orders_update_anon_confirm_payment"
ON public.orders
FOR UPDATE
TO anon
USING (
  customer_id IS NULL 
  AND status = 'pending'
  AND created_at > NOW() - INTERVAL '1 hour'
)
WITH CHECK (
  customer_id IS NULL
);

-- Note: This policy allows ANON users to update any columns on matching orders.
-- In practice, the app should only update 'status' and 'stripe_session_id'.
-- Consider creating a more restrictive policy or using RPC functions if stricter
-- column-level control is needed.

-- Verification query (run as admin):
-- SELECT policyname, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'orders' AND policyname = 'orders_update_anon_confirm_payment';
-- END MIGRATION: 038_orders_update_anon_policy.sql

-- =========================================================
-- BEGIN MIGRATION: 038_remove_is_admin_from_return_rpcs.sql
-- =========================================================
-- ============================================================================
-- Migration 038: Remove is_admin() check from return RPC functions
-- ============================================================================
-- Reason: Admin validation is already done in TypeScript API layer
-- The is_admin() check fails when using service role client (supabaseAdmin)
-- because auth.uid() returns NULL with service role context
-- ============================================================================

-- Drop and recreate process_return without is_admin() check
DROP FUNCTION IF EXISTS process_return(UUID, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION process_return(
  p_return_id UUID,
  p_action TEXT,  -- 'approve', 'reject', 'receive', 'complete'
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL,
  p_return_label_url TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
  v_item RECORD;
  v_total_refund NUMERIC(10, 2) := 0;
  v_order_total NUMERIC(10, 2);
BEGIN
  -- Admin validation is done in TypeScript API layer before calling this function
  -- No need to verify is_admin() here as this function is only called from backend API

  -- Obtener devolución actual
  SELECT * INTO v_return FROM returns WHERE id = p_return_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  CASE p_action
    -- ========================================
    -- APROBAR: Solo desde requested
    -- ========================================
    WHEN 'approve' THEN
      IF v_return.status != 'requested' THEN
        RAISE EXCEPTION 'Solo se pueden aprobar devoluciones en estado "requested"';
      END IF;
      
      UPDATE returns SET 
        status = 'approved', 
        approved_at = NOW(),
        return_label_url = p_return_label_url,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar estado del pedido
      UPDATE orders SET status = 'return_approved' WHERE id = v_return.order_id;

    -- ========================================
    -- RECHAZAR: Puede ser desde requested O received
    -- ========================================
    WHEN 'reject' THEN
      -- Rechazo inicial: desde requested (motivo inválido, fuera de plazo, etc.)
      -- Rechazo final: desde received (producto dañado por cliente, incompleto, etc.)
      IF v_return.status NOT IN ('requested', 'received') THEN
        RAISE EXCEPTION 'Solo se pueden rechazar devoluciones en estado "requested" o "received"';
      END IF;
      
      UPDATE returns SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Si se rechaza después de recibir, actualizar estado del pedido
      IF v_return.status = 'received' THEN
        UPDATE orders SET status = 'delivered' WHERE id = v_return.order_id;
      ELSE
        -- Si se rechaza antes de enviar, restaurar a delivered
        UPDATE orders SET status = 'delivered' WHERE id = v_return.order_id;
      END IF;

    -- ========================================
    -- RECIBIR: Solo desde shipped
    -- ========================================
    WHEN 'receive' THEN
      IF v_return.status != 'shipped' THEN
        RAISE EXCEPTION 'Solo se pueden marcar como recibidas devoluciones en estado "shipped"';
      END IF;
      
      UPDATE returns SET 
        status = 'received',
        received_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;
      
      -- Actualizar estado del pedido
      UPDATE orders SET status = 'return_received' WHERE id = v_return.order_id;

    -- ========================================
    -- COMPLETAR: Solo desde received
    -- ========================================
    WHEN 'complete' THEN
      IF v_return.status != 'received' THEN
        RAISE EXCEPTION 'Solo se pueden completar devoluciones en estado "received"';
      END IF;

      -- Calcular el monto total del reembolso
      FOR v_item IN 
        SELECT * FROM return_items WHERE return_id = p_return_id
      LOOP
        IF v_item.inspection_status = 'approved' THEN
          v_total_refund := v_total_refund + (v_item.refund_amount * v_item.quantity);
        END IF;
      END LOOP;

      IF v_total_refund = 0 THEN
        RAISE EXCEPTION 'No hay items aprobados para reembolsar';
      END IF;

      -- Obtener total del pedido
      SELECT total_amount INTO v_order_total FROM orders WHERE id = v_return.order_id;

      UPDATE returns SET 
        status = 'completed',
        completed_at = NOW(),
        refund_amount = v_total_refund,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

      -- Si se reembolsó el total del pedido, el pedido pasa a estado 'returned'
      -- Si es parcial, mantiene 'return_completed'
      IF v_total_refund >= v_order_total THEN
        UPDATE orders SET status = 'returned' WHERE id = v_return.order_id;
      ELSE
        UPDATE orders SET status = 'return_completed' WHERE id = v_return.order_id;
      END IF;

    ELSE
      RAISE EXCEPTION 'Acción inválida: %', p_action;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION process_return IS 'Procesa acciones de admin en devoluciones. Admin validation is done in API layer before calling this function.';


-- ============================================================================
-- Update inspect_return_item to remove is_admin() check
-- ============================================================================

DROP FUNCTION IF EXISTS inspect_return_item(UUID, TEXT, BOOLEAN, TEXT);

CREATE OR REPLACE FUNCTION inspect_return_item(
  p_item_id UUID,
  p_status TEXT,  -- 'approved' or 'rejected'
  p_restock BOOLEAN DEFAULT FALSE,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
  v_variant_id UUID;
BEGIN
  -- Admin validation is done in TypeScript API layer before calling this function
  -- No need to verify is_admin() here as this function is only called from backend API

  -- Validar status
  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Status inválido. Debe ser "approved" o "rejected"';
  END IF;

  -- Obtener item
  SELECT * INTO v_item FROM return_items WHERE id = p_item_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item de devolución no encontrado';
  END IF;

  -- Obtener variant_id del order_item
  SELECT variant_id INTO v_variant_id 
  FROM order_items 
  WHERE id = v_item.order_item_id;

  -- Actualizar el item (sin inspected_at ya que esa columna no existe)
  UPDATE return_items SET
    inspection_status = p_status,
    inspection_notes = COALESCE(p_notes, inspection_notes)
  WHERE id = p_item_id;

  -- Si se aprueba y se debe restockear, devolver al inventario
  IF p_status = 'approved' AND p_restock AND v_variant_id IS NOT NULL THEN
    UPDATE product_variants
    SET stock = stock + v_item.quantity
    WHERE id = v_variant_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION inspect_return_item IS 'Inspects a return item and optionally restocks inventory. Admin validation is done in API layer.';
-- END MIGRATION: 038_remove_is_admin_from_return_rpcs.sql

-- =========================================================
-- BEGIN MIGRATION: 039_add_order_financial_breakdown.sql
-- =========================================================
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
-- END MIGRATION: 039_add_order_financial_breakdown.sql

-- =========================================================
-- BEGIN MIGRATION: 040_create_fiscal_documents.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - MIGRACIÓN 040
-- Sistema unificado de documentos fiscales
-- - Factura completa
-- - Factura simplificada (ticket)
-- - Factura rectificativa
-- ============================================

CREATE SEQUENCE IF NOT EXISTS fiscal_document_number_seq START 1;

CREATE TABLE IF NOT EXISTS fiscal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  return_id UUID REFERENCES returns(id) ON DELETE SET NULL,
  legacy_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  original_document_id UUID REFERENCES fiscal_documents(id) ON DELETE SET NULL,

  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'simplified', 'rectifying')),
  document_number TEXT NOT NULL UNIQUE,
  sequence_number BIGINT NOT NULL DEFAULT nextval('fiscal_document_number_seq'),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_nif TEXT,
  customer_fiscal_address TEXT,

  subtotal NUMERIC(10,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 21.00,
  tax_amount NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',

  pdf_url TEXT,
  pdf_storage_path TEXT,
  pdf_sha256 TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fiscal_documents_rectifying_requires_original
    CHECK (
      document_type != 'rectifying'
      OR (document_type = 'rectifying' AND original_document_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_fiscal_documents_order ON fiscal_documents(order_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_documents_return ON fiscal_documents(return_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_documents_type ON fiscal_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_fiscal_documents_issued_at ON fiscal_documents(issued_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_fiscal_document_invoice_per_order
  ON fiscal_documents(order_id)
  WHERE document_type = 'invoice';

CREATE UNIQUE INDEX IF NOT EXISTS uniq_fiscal_document_simplified_per_order
  ON fiscal_documents(order_id)
  WHERE document_type = 'simplified';

CREATE UNIQUE INDEX IF NOT EXISTS uniq_fiscal_document_rectifying_per_return
  ON fiscal_documents(return_id)
  WHERE document_type = 'rectifying' AND return_id IS NOT NULL;

ALTER TABLE fiscal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fiscal documents" ON fiscal_documents
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins can view all fiscal documents" ON fiscal_documents
  FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Service role full access fiscal documents" ON fiscal_documents
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION set_fiscal_document_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_set_fiscal_document_updated_at ON fiscal_documents;
CREATE TRIGGER tr_set_fiscal_document_updated_at
  BEFORE UPDATE ON fiscal_documents
  FOR EACH ROW
  EXECUTE FUNCTION set_fiscal_document_updated_at();

CREATE OR REPLACE FUNCTION generate_fiscal_document_number(
  p_document_type TEXT,
  p_issued_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefix TEXT;
  v_seq BIGINT;
  v_year TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM p_issued_at)::TEXT;

  v_prefix := CASE p_document_type
    WHEN 'invoice' THEN 'FSI'
    WHEN 'simplified' THEN 'FSS'
    WHEN 'rectifying' THEN 'FSR'
    ELSE 'FSD'
  END;

  v_seq := nextval('fiscal_document_number_seq');

  RETURN v_prefix || '-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION create_simplified_ticket_document(
  p_order_id UUID
)
RETURNS TABLE(
  document_id UUID,
  document_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_existing RECORD;
  v_number TEXT;
  v_id UUID;
  v_total NUMERIC(10,2);
  v_subtotal NUMERIC(10,2);
  v_tax_amount NUMERIC(10,2);
BEGIN
  SELECT id, order_number, customer_name, customer_email, total_amount, status
  INTO v_order
  FROM orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido no encontrado';
  END IF;

  IF v_order.status NOT IN ('paid', 'shipped', 'delivered', 'return_requested', 'return_approved', 'return_shipped', 'return_received', 'return_completed', 'partially_refunded') THEN
    RAISE EXCEPTION 'El pedido no es elegible para emitir ticket simplificado';
  END IF;

  SELECT id, document_number
  INTO v_existing
  FROM fiscal_documents
  WHERE order_id = p_order_id
    AND document_type = 'simplified'
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT v_existing.id, v_existing.document_number;
    RETURN;
  END IF;

  v_total := COALESCE(v_order.total_amount, 0);
  v_subtotal := ROUND(v_total / 1.21, 2);
  v_tax_amount := ROUND(v_total - v_subtotal, 2);
  v_number := generate_fiscal_document_number('simplified', NOW());

  INSERT INTO fiscal_documents (
    order_id,
    document_type,
    document_number,
    customer_name,
    customer_email,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    metadata
  ) VALUES (
    p_order_id,
    'simplified',
    v_number,
    COALESCE(v_order.customer_name, 'Cliente'),
    v_order.customer_email,
    v_subtotal,
    21.00,
    v_tax_amount,
    v_total,
    jsonb_build_object('order_number', v_order.order_number)
  )
  RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, v_number;
END;
$$;

CREATE OR REPLACE FUNCTION create_invoice_fiscal_document(
  p_order_id UUID,
  p_customer_nif TEXT,
  p_customer_fiscal_name TEXT,
  p_customer_fiscal_address TEXT
)
RETURNS TABLE(
  document_id UUID,
  document_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_existing RECORD;
  v_id UUID;
  v_number TEXT;
  v_total NUMERIC(10,2);
  v_subtotal NUMERIC(10,2);
  v_tax_amount NUMERIC(10,2);
BEGIN
  SELECT id, order_number, customer_name, customer_email, total_amount, status
  INTO v_order
  FROM orders
  WHERE id = p_order_id
    AND status IN ('paid', 'shipped', 'delivered', 'return_requested', 'return_approved', 'return_shipped', 'return_received', 'return_completed', 'partially_refunded');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido no encontrado o no elegible';
  END IF;

  SELECT id, document_number
  INTO v_existing
  FROM fiscal_documents
  WHERE order_id = p_order_id
    AND document_type = 'invoice'
  LIMIT 1;

  v_total := COALESCE(v_order.total_amount, 0);
  v_subtotal := ROUND(v_total / 1.21, 2);
  v_tax_amount := ROUND(v_total - v_subtotal, 2);

  IF FOUND THEN
    UPDATE fiscal_documents
    SET customer_name = COALESCE(p_customer_fiscal_name, customer_name),
        customer_email = COALESCE(v_order.customer_email, customer_email),
        customer_nif = p_customer_nif,
        customer_fiscal_address = p_customer_fiscal_address,
        subtotal = v_subtotal,
        tax_rate = 21.00,
        tax_amount = v_tax_amount,
        total = v_total,
        metadata = metadata || jsonb_build_object('updated_by_rpc', true, 'updated_at_rpc', NOW())
    WHERE id = v_existing.id;

    RETURN QUERY SELECT v_existing.id, v_existing.document_number;
    RETURN;
  END IF;

  v_number := generate_fiscal_document_number('invoice', NOW());

  INSERT INTO fiscal_documents (
    order_id,
    document_type,
    document_number,
    customer_name,
    customer_email,
    customer_nif,
    customer_fiscal_address,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    metadata
  ) VALUES (
    p_order_id,
    'invoice',
    v_number,
    COALESCE(p_customer_fiscal_name, v_order.customer_name, 'Cliente'),
    v_order.customer_email,
    p_customer_nif,
    p_customer_fiscal_address,
    v_subtotal,
    21.00,
    v_tax_amount,
    v_total,
    jsonb_build_object('order_number', v_order.order_number)
  ) RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, v_number;
END;
$$;

CREATE OR REPLACE FUNCTION create_rectifying_document_from_return(
  p_return_id UUID,
  p_original_document_id UUID DEFAULT NULL
)
RETURNS TABLE(
  document_id UUID,
  document_number TEXT,
  original_document UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_return RECORD;
  v_existing RECORD;
  v_original UUID;
  v_original_doc RECORD;
  v_number TEXT;
  v_id UUID;
  v_total NUMERIC(10,2);
  v_subtotal NUMERIC(10,2);
  v_tax_amount NUMERIC(10,2);
BEGIN
  SELECT r.id, r.order_id, r.refund_amount, r.status,
         o.customer_name, o.customer_email
  INTO v_return
  FROM returns r
  JOIN orders o ON o.id = r.order_id
  WHERE r.id = p_return_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  IF v_return.status != 'completed' THEN
    RAISE EXCEPTION 'Solo se puede crear rectificativa para devoluciones completadas';
  END IF;

  IF COALESCE(v_return.refund_amount, 0) <= 0 THEN
    RAISE EXCEPTION 'La devolución no tiene importe reembolsado';
  END IF;

  SELECT id, document_number
  INTO v_existing
  FROM fiscal_documents
  WHERE return_id = p_return_id
    AND document_type = 'rectifying'
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT v_existing.id, v_existing.document_number, v_existing.original_document_id;
    RETURN;
  END IF;

  v_original := p_original_document_id;

  IF v_original IS NULL THEN
    SELECT id
    INTO v_original
    FROM fiscal_documents
    WHERE order_id = v_return.order_id
      AND document_type IN ('invoice', 'simplified')
    ORDER BY CASE WHEN document_type = 'invoice' THEN 0 ELSE 1 END, issued_at ASC
    LIMIT 1;
  END IF;

  IF v_original IS NULL THEN
    RAISE EXCEPTION 'No existe documento fiscal original para el pedido';
  END IF;

  SELECT customer_name, customer_email, customer_nif, customer_fiscal_address
  INTO v_original_doc
  FROM fiscal_documents
  WHERE id = v_original;

  v_total := -ABS(v_return.refund_amount);
  v_subtotal := ROUND(v_total / 1.21, 2);
  v_tax_amount := ROUND(v_total - v_subtotal, 2);
  v_number := generate_fiscal_document_number('rectifying', NOW());

  INSERT INTO fiscal_documents (
    order_id,
    return_id,
    original_document_id,
    document_type,
    document_number,
    customer_name,
    customer_email,
    customer_nif,
    customer_fiscal_address,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    metadata
  ) VALUES (
    v_return.order_id,
    p_return_id,
    v_original,
    'rectifying',
    v_number,
    COALESCE(v_original_doc.customer_name, v_return.customer_name, 'Cliente'),
    COALESCE(v_original_doc.customer_email, v_return.customer_email),
    v_original_doc.customer_nif,
    v_original_doc.customer_fiscal_address,
    v_subtotal,
    21.00,
    v_tax_amount,
    v_total,
    jsonb_build_object('refund_amount', v_return.refund_amount)
  )
  RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, v_number, v_original;
END;
$$;

INSERT INTO fiscal_documents (
  order_id,
  legacy_invoice_id,
  document_type,
  document_number,
  issued_at,
  customer_name,
  customer_email,
  customer_nif,
  customer_fiscal_address,
  subtotal,
  tax_rate,
  tax_amount,
  total,
  pdf_url,
  metadata
)
SELECT
  i.order_id,
  i.id,
  'invoice',
  i.invoice_number,
  COALESCE(i.issued_at, i.created_at, NOW()),
  COALESCE(i.customer_fiscal_name, o.customer_name, 'Cliente'),
  o.customer_email,
  i.customer_nif,
  i.customer_fiscal_address,
  i.subtotal,
  i.tax_rate,
  i.tax_amount,
  i.total,
  i.pdf_url,
  jsonb_build_object('migrated_from', 'invoices', 'legacy_invoice_id', i.id)
FROM invoices i
LEFT JOIN orders o ON o.id = i.order_id
ON CONFLICT (document_number) DO NOTHING;

COMMENT ON TABLE fiscal_documents IS 'Repositorio unificado de documentos fiscales emitidos (factura completa, simplificada y rectificativa)';
COMMENT ON FUNCTION create_simplified_ticket_document IS 'Emisión idempotente de factura simplificada para un pedido elegible';
COMMENT ON FUNCTION create_rectifying_document_from_return IS 'Emisión idempotente de factura rectificativa a partir de una devolución completada';

CREATE OR REPLACE FUNCTION sync_invoice_to_fiscal_documents()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_name TEXT;
  v_customer_email TEXT;
BEGIN
  SELECT o.customer_name, o.customer_email
  INTO v_customer_name, v_customer_email
  FROM orders o
  WHERE o.id = NEW.order_id;

  INSERT INTO fiscal_documents (
    order_id,
    legacy_invoice_id,
    document_type,
    document_number,
    issued_at,
    customer_name,
    customer_email,
    customer_nif,
    customer_fiscal_address,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    pdf_url,
    metadata
  ) VALUES (
    NEW.order_id,
    NEW.id,
    'invoice',
    NEW.invoice_number,
    COALESCE(NEW.issued_at, NEW.created_at, NOW()),
    COALESCE(NEW.customer_fiscal_name, v_customer_name, 'Cliente'),
    v_customer_email,
    NEW.customer_nif,
    NEW.customer_fiscal_address,
    NEW.subtotal,
    NEW.tax_rate,
    NEW.tax_amount,
    NEW.total,
    NEW.pdf_url,
    jsonb_build_object('synced_from', 'invoices', 'legacy_invoice_id', NEW.id)
  )
  ON CONFLICT (document_number)
  DO UPDATE SET
    legacy_invoice_id = EXCLUDED.legacy_invoice_id,
    customer_name = EXCLUDED.customer_name,
    customer_email = EXCLUDED.customer_email,
    customer_nif = EXCLUDED.customer_nif,
    customer_fiscal_address = EXCLUDED.customer_fiscal_address,
    subtotal = EXCLUDED.subtotal,
    tax_rate = EXCLUDED.tax_rate,
    tax_amount = EXCLUDED.tax_amount,
    total = EXCLUDED.total,
    pdf_url = COALESCE(EXCLUDED.pdf_url, fiscal_documents.pdf_url),
    issued_at = EXCLUDED.issued_at,
    metadata = fiscal_documents.metadata || jsonb_build_object('last_sync_at', NOW());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_invoice_to_fiscal_documents ON invoices;
CREATE TRIGGER tr_sync_invoice_to_fiscal_documents
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION sync_invoice_to_fiscal_documents();

COMMENT ON FUNCTION sync_invoice_to_fiscal_documents IS 'Sincroniza automáticamente la tabla invoices legacy con fiscal_documents';
-- END MIGRATION: 040_create_fiscal_documents.sql

-- =========================================================
-- BEGIN MIGRATION: 041_fix_fiscal_documents_rpc_ambiguity.sql
-- =========================================================
-- ============================================
-- FASHIONSTORE - MIGRACIÓN 041
-- Fix ambigüedad "document_number" en RPCs fiscales
-- ============================================

CREATE OR REPLACE FUNCTION create_simplified_ticket_document(
  p_order_id UUID
)
RETURNS TABLE(
  document_id UUID,
  document_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_existing RECORD;
  v_number TEXT;
  v_id UUID;
  v_total NUMERIC(10,2);
  v_subtotal NUMERIC(10,2);
  v_tax_amount NUMERIC(10,2);
BEGIN
  SELECT id, order_number, customer_name, customer_email, total_amount, status
  INTO v_order
  FROM orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido no encontrado';
  END IF;

  IF v_order.status NOT IN ('paid', 'shipped', 'delivered', 'return_requested', 'return_approved', 'return_shipped', 'return_received', 'return_completed', 'partially_refunded') THEN
    RAISE EXCEPTION 'El pedido no es elegible para emitir ticket simplificado';
  END IF;

  SELECT fd.id, fd.document_number
  INTO v_existing
  FROM fiscal_documents fd
  WHERE fd.order_id = p_order_id
    AND fd.document_type = 'simplified'
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT v_existing.id, v_existing.document_number;
    RETURN;
  END IF;

  v_total := COALESCE(v_order.total_amount, 0);
  v_subtotal := ROUND(v_total / 1.21, 2);
  v_tax_amount := ROUND(v_total - v_subtotal, 2);
  v_number := generate_fiscal_document_number('simplified', NOW());

  INSERT INTO fiscal_documents (
    order_id,
    document_type,
    document_number,
    customer_name,
    customer_email,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    metadata
  ) VALUES (
    p_order_id,
    'simplified',
    v_number,
    COALESCE(v_order.customer_name, 'Cliente'),
    v_order.customer_email,
    v_subtotal,
    21.00,
    v_tax_amount,
    v_total,
    jsonb_build_object('order_number', v_order.order_number)
  )
  RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, v_number;
END;
$$;

CREATE OR REPLACE FUNCTION create_invoice_fiscal_document(
  p_order_id UUID,
  p_customer_nif TEXT,
  p_customer_fiscal_name TEXT,
  p_customer_fiscal_address TEXT
)
RETURNS TABLE(
  document_id UUID,
  document_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_existing RECORD;
  v_id UUID;
  v_number TEXT;
  v_total NUMERIC(10,2);
  v_subtotal NUMERIC(10,2);
  v_tax_amount NUMERIC(10,2);
BEGIN
  SELECT id, order_number, customer_name, customer_email, total_amount, status
  INTO v_order
  FROM orders
  WHERE id = p_order_id
    AND status IN ('paid', 'shipped', 'delivered', 'return_requested', 'return_approved', 'return_shipped', 'return_received', 'return_completed', 'partially_refunded');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido no encontrado o no elegible';
  END IF;

  SELECT fd.id, fd.document_number
  INTO v_existing
  FROM fiscal_documents fd
  WHERE fd.order_id = p_order_id
    AND fd.document_type = 'invoice'
  LIMIT 1;

  v_total := COALESCE(v_order.total_amount, 0);
  v_subtotal := ROUND(v_total / 1.21, 2);
  v_tax_amount := ROUND(v_total - v_subtotal, 2);

  IF FOUND THEN
    UPDATE fiscal_documents
    SET customer_name = COALESCE(p_customer_fiscal_name, customer_name),
        customer_email = COALESCE(v_order.customer_email, customer_email),
        customer_nif = p_customer_nif,
        customer_fiscal_address = p_customer_fiscal_address,
        subtotal = v_subtotal,
        tax_rate = 21.00,
        tax_amount = v_tax_amount,
        total = v_total,
        metadata = metadata || jsonb_build_object('updated_by_rpc', true, 'updated_at_rpc', NOW())
    WHERE id = v_existing.id;

    RETURN QUERY SELECT v_existing.id, v_existing.document_number;
    RETURN;
  END IF;

  v_number := generate_fiscal_document_number('invoice', NOW());

  INSERT INTO fiscal_documents (
    order_id,
    document_type,
    document_number,
    customer_name,
    customer_email,
    customer_nif,
    customer_fiscal_address,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    metadata
  ) VALUES (
    p_order_id,
    'invoice',
    v_number,
    COALESCE(p_customer_fiscal_name, v_order.customer_name, 'Cliente'),
    v_order.customer_email,
    p_customer_nif,
    p_customer_fiscal_address,
    v_subtotal,
    21.00,
    v_tax_amount,
    v_total,
    jsonb_build_object('order_number', v_order.order_number)
  ) RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, v_number;
END;
$$;

CREATE OR REPLACE FUNCTION create_rectifying_document_from_return(
  p_return_id UUID,
  p_original_document_id UUID DEFAULT NULL
)
RETURNS TABLE(
  document_id UUID,
  document_number TEXT,
  original_document UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_return RECORD;
  v_existing RECORD;
  v_original UUID;
  v_original_doc RECORD;
  v_number TEXT;
  v_id UUID;
  v_total NUMERIC(10,2);
  v_subtotal NUMERIC(10,2);
  v_tax_amount NUMERIC(10,2);
BEGIN
  SELECT r.id, r.order_id, r.refund_amount, r.status,
         o.customer_name, o.customer_email
  INTO v_return
  FROM returns r
  JOIN orders o ON o.id = r.order_id
  WHERE r.id = p_return_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  IF v_return.status != 'completed' THEN
    RAISE EXCEPTION 'Solo se puede crear rectificativa para devoluciones completadas';
  END IF;

  IF COALESCE(v_return.refund_amount, 0) <= 0 THEN
    RAISE EXCEPTION 'La devolución no tiene importe reembolsado';
  END IF;

  SELECT fd.id, fd.document_number, fd.original_document_id
  INTO v_existing
  FROM fiscal_documents fd
  WHERE fd.return_id = p_return_id
    AND fd.document_type = 'rectifying'
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT v_existing.id, v_existing.document_number, v_existing.original_document_id;
    RETURN;
  END IF;

  v_original := p_original_document_id;

  IF v_original IS NULL THEN
    SELECT fd.id
    INTO v_original
    FROM fiscal_documents fd
    WHERE fd.order_id = v_return.order_id
      AND fd.document_type IN ('invoice', 'simplified')
    ORDER BY CASE WHEN fd.document_type = 'invoice' THEN 0 ELSE 1 END, fd.issued_at ASC
    LIMIT 1;
  END IF;

  IF v_original IS NULL THEN
    RAISE EXCEPTION 'No existe documento fiscal original para el pedido';
  END IF;

  SELECT fd.customer_name, fd.customer_email, fd.customer_nif, fd.customer_fiscal_address
  INTO v_original_doc
  FROM fiscal_documents fd
  WHERE fd.id = v_original;

  v_total := -ABS(v_return.refund_amount);
  v_subtotal := ROUND(v_total / 1.21, 2);
  v_tax_amount := ROUND(v_total - v_subtotal, 2);
  v_number := generate_fiscal_document_number('rectifying', NOW());

  INSERT INTO fiscal_documents (
    order_id,
    return_id,
    original_document_id,
    document_type,
    document_number,
    customer_name,
    customer_email,
    customer_nif,
    customer_fiscal_address,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    metadata
  ) VALUES (
    v_return.order_id,
    p_return_id,
    v_original,
    'rectifying',
    v_number,
    COALESCE(v_original_doc.customer_name, v_return.customer_name, 'Cliente'),
    COALESCE(v_original_doc.customer_email, v_return.customer_email),
    v_original_doc.customer_nif,
    v_original_doc.customer_fiscal_address,
    v_subtotal,
    21.00,
    v_tax_amount,
    v_total,
    jsonb_build_object('refund_amount', v_return.refund_amount)
  )
  RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, v_number, v_original;
END;
$$;

COMMENT ON FUNCTION create_simplified_ticket_document IS 'Emisión idempotente de factura simplificada para un pedido elegible (fix ambigüedad document_number)';
COMMENT ON FUNCTION create_invoice_fiscal_document IS 'Emisión idempotente de factura completa para un pedido elegible (fix ambigüedad document_number)';
COMMENT ON FUNCTION create_rectifying_document_from_return IS 'Emisión idempotente de factura rectificativa para devolución completada (fix ambigüedad document_number)';
-- END MIGRATION: 041_fix_fiscal_documents_rpc_ambiguity.sql

-- =========================================================
-- BEGIN MIGRATION: 042_fix_return_refund_with_coupon_proration.sql
-- =========================================================
-- ============================================================================
-- Migration 042: Fix return refund calculation with coupon proration
-- ============================================================================
-- Problem:
-- - process_return('complete') multiplied refund_amount by quantity again
-- - refund did not account for order-level coupon discounts
--
-- Goal:
-- - Refund "what the customer paid for returned products"
-- - Keep shipping out of standard return completion refund calculation
-- ============================================================================

DROP FUNCTION IF EXISTS process_return(UUID, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION process_return(
  p_return_id UUID,
  p_action TEXT,  -- 'approve', 'reject', 'receive', 'complete'
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL,
  p_return_label_url TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_return RECORD;
  v_item RECORD;
  v_total_refund NUMERIC(10, 2) := 0;
  v_order_total NUMERIC(10, 2) := 0;
  v_order_discount NUMERIC(10, 2) := 0;
  v_order_items_gross NUMERIC(10, 2) := 0;
  v_approved_count INTEGER := 0;
BEGIN
  -- Admin validation is done in TypeScript API layer before calling this function

  -- Obtener devolución actual
  SELECT * INTO v_return FROM returns WHERE id = p_return_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devolución no encontrada';
  END IF;

  CASE p_action
    WHEN 'approve' THEN
      IF v_return.status != 'requested' THEN
        RAISE EXCEPTION 'Solo se pueden aprobar devoluciones en estado "requested"';
      END IF;

      UPDATE returns SET
        status = 'approved',
        approved_at = NOW(),
        return_label_url = p_return_label_url,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

      UPDATE orders SET status = 'return_approved' WHERE id = v_return.order_id;

    WHEN 'reject' THEN
      IF v_return.status NOT IN ('requested', 'received') THEN
        RAISE EXCEPTION 'Solo se pueden rechazar devoluciones en estado "requested" o "received"';
      END IF;

      UPDATE returns SET
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

      UPDATE orders SET status = 'delivered' WHERE id = v_return.order_id;

    WHEN 'receive' THEN
      IF v_return.status != 'shipped' THEN
        RAISE EXCEPTION 'Solo se pueden marcar como recibidas devoluciones en estado "shipped"';
      END IF;

      UPDATE returns SET
        status = 'received',
        received_at = NOW(),
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

      UPDATE orders SET status = 'return_received' WHERE id = v_return.order_id;

    WHEN 'complete' THEN
      IF v_return.status != 'received' THEN
        RAISE EXCEPTION 'Solo se pueden completar devoluciones en estado "received"';
      END IF;

      SELECT COUNT(*) INTO v_approved_count
      FROM return_items
      WHERE return_id = p_return_id
        AND inspection_status = 'approved';

      IF v_approved_count = 0 THEN
        RAISE EXCEPTION 'No hay items aprobados para reembolsar';
      END IF;

      SELECT
        COALESCE(o.total_amount, 0),
        COALESCE(o.discount_amount, 0),
        COALESCE((
          SELECT SUM(oi.price_at_purchase * oi.quantity)
          FROM order_items oi
          WHERE oi.order_id = o.id
        ), 0)
      INTO v_order_total, v_order_discount, v_order_items_gross
      FROM orders o
      WHERE o.id = v_return.order_id;

      -- Recalcular refund_amount por línea (neto, descontando parte proporcional del cupón)
      WITH approved_lines AS (
        SELECT
          ri.id,
          ROUND(oi.price_at_purchase * ri.quantity, 2) AS line_gross
        FROM return_items ri
        JOIN order_items oi ON oi.id = ri.order_item_id
        WHERE ri.return_id = p_return_id
          AND ri.inspection_status = 'approved'
      ),
      calculated AS (
        SELECT
          id,
          ROUND(
            GREATEST(
              line_gross - CASE
                WHEN v_order_items_gross > 0 AND v_order_discount > 0
                  THEN (v_order_discount * line_gross / v_order_items_gross)
                ELSE 0
              END,
              0
            ),
            2
          ) AS line_refund
        FROM approved_lines
      )
      UPDATE return_items ri
      SET refund_amount = c.line_refund
      FROM calculated c
      WHERE ri.id = c.id;

      SELECT COALESCE(SUM(refund_amount), 0) INTO v_total_refund
      FROM return_items
      WHERE return_id = p_return_id
        AND inspection_status = 'approved';

      IF v_total_refund <= 0 THEN
        RAISE EXCEPTION 'No hay importe válido para reembolsar';
      END IF;

      UPDATE returns SET
        status = 'completed',
        completed_at = NOW(),
        refund_amount = v_total_refund,
        admin_notes = COALESCE(p_notes, admin_notes)
      WHERE id = p_return_id;

      IF v_total_refund >= v_order_total THEN
        UPDATE orders SET status = 'returned' WHERE id = v_return.order_id;
      ELSE
        UPDATE orders SET status = 'return_completed' WHERE id = v_return.order_id;
      END IF;

    ELSE
      RAISE EXCEPTION 'Acción inválida: %', p_action;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION process_return IS 'Procesa acciones de admin en devoluciones. Reembolso neto prorratea el cupón por items devueltos.';
-- END MIGRATION: 042_fix_return_refund_with_coupon_proration.sql

-- =========================================================
-- BEGIN MIGRATION: 043_secure_return_statistics_view.sql
-- =========================================================
-- ============================================================================
-- Migration 043: Secure return_statistics view access
-- ============================================================================
-- Problem:
-- - return_statistics is a VIEW (not a table), so it cannot have RLS policies
-- - it was granted to authenticated users directly
--
-- Goal:
-- - enforce admin-only visibility for return statistics
-- - keep access pattern compatible with authenticated role
-- ============================================================================

DROP VIEW IF EXISTS return_statistics;

CREATE VIEW return_statistics
WITH (security_invoker = true)
AS
SELECT
  COUNT(*) FILTER (WHERE status = 'requested') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
  COUNT(*) FILTER (WHERE status = 'shipped') AS shipped_count,
  COUNT(*) FILTER (WHERE status = 'received') AS received_count,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
  COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count,
  COUNT(*) AS total_count,
  AVG(
    CASE WHEN approved_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (approved_at - created_at)) / 3600
    END
  )::numeric(10,2) AS avg_hours_to_approve,
  AVG(
    CASE WHEN completed_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600
    END
  )::numeric(10,2) AS avg_hours_to_complete,
  COALESCE(SUM(refund_amount) FILTER (WHERE status = 'completed'), 0) AS total_refunded,
  COALESCE(AVG(refund_amount) FILTER (WHERE status = 'completed'), 0)::numeric(10,2) AS avg_refund_amount,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '30 days') AS last_30_days_count,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '7 days') AS last_7_days_count
FROM returns
HAVING is_admin();

REVOKE ALL ON return_statistics FROM PUBLIC;
GRANT SELECT ON return_statistics TO authenticated;

COMMENT ON VIEW return_statistics IS 'Estadísticas agregadas del sistema de devoluciones para el dashboard (solo admin)';
-- END MIGRATION: 043_secure_return_statistics_view.sql
```
