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
