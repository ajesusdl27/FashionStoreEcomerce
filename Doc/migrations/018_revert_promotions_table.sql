-- ============================================
-- FASHIONSTORE - REVERT MIGRATION 017
-- Drop Promotions Table
-- ============================================

DROP TRIGGER IF EXISTS update_promotions_updated_at ON promotions;
DROP POLICY IF EXISTS "Public can view active promotions" ON promotions;
DROP POLICY IF EXISTS "Admins can manage promotions" ON promotions;
DROP TABLE IF EXISTS promotions;
