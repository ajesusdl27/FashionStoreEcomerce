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
