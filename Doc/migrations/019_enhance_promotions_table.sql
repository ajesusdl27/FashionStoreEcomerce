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
