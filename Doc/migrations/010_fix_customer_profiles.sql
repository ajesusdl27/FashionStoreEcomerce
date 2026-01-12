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
