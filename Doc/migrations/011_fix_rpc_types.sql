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
