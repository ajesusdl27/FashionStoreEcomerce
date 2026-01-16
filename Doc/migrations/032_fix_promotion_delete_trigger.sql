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
