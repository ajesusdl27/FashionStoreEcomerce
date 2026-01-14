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
