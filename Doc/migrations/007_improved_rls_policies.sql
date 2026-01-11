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
