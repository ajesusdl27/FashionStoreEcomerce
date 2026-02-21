-- ============================================================================
-- Migration 043: Secure return_statistics view access
-- ============================================================================
-- Problem:
-- - return_statistics is a VIEW (not a table), so it cannot have RLS policies
-- - it was granted to authenticated users directly
--
-- Goal:
-- - enforce admin-only visibility for return statistics
-- - keep access pattern compatible with authenticated role
-- ============================================================================

DROP VIEW IF EXISTS return_statistics;

CREATE VIEW return_statistics
WITH (security_invoker = true)
AS
SELECT
  COUNT(*) FILTER (WHERE status = 'requested') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
  COUNT(*) FILTER (WHERE status = 'shipped') AS shipped_count,
  COUNT(*) FILTER (WHERE status = 'received') AS received_count,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
  COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count,
  COUNT(*) AS total_count,
  AVG(
    CASE WHEN approved_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (approved_at - created_at)) / 3600
    END
  )::numeric(10,2) AS avg_hours_to_approve,
  AVG(
    CASE WHEN completed_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600
    END
  )::numeric(10,2) AS avg_hours_to_complete,
  COALESCE(SUM(refund_amount) FILTER (WHERE status = 'completed'), 0) AS total_refunded,
  COALESCE(AVG(refund_amount) FILTER (WHERE status = 'completed'), 0)::numeric(10,2) AS avg_refund_amount,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '30 days') AS last_30_days_count,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '7 days') AS last_7_days_count
FROM returns
HAVING is_admin();

REVOKE ALL ON return_statistics FROM PUBLIC;
GRANT SELECT ON return_statistics TO authenticated;

COMMENT ON VIEW return_statistics IS 'Estadísticas agregadas del sistema de devoluciones para el dashboard (solo admin)';
