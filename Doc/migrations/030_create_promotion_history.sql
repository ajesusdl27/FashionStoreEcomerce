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
