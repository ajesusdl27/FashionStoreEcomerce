-- ============================================
-- MIGRACIÓN: Sistema de Auditoría para Devoluciones
-- Versión: 036
-- Fecha: 2026-01-23
-- Descripción: Crea tabla de logs de auditoría para rastrear
--              todas las acciones en el sistema de devoluciones
-- ============================================

-- Crear tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS return_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'approved', 'rejected', 'shipped', 'received', 'completed', 'item_inspected', 'note_added'
  previous_status VARCHAR(30),
  new_status VARCHAR(30),
  performed_by UUID, -- NULL si es sistema o cliente anónimo
  performed_by_type VARCHAR(20) NOT NULL DEFAULT 'system', -- 'admin', 'customer', 'system'
  details JSONB DEFAULT '{}', -- Detalles adicionales de la acción
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsquedas eficientes
CREATE INDEX idx_return_audit_logs_return_id ON return_audit_logs(return_id);
CREATE INDEX idx_return_audit_logs_action ON return_audit_logs(action);
CREATE INDEX idx_return_audit_logs_created_at ON return_audit_logs(created_at DESC);
CREATE INDEX idx_return_audit_logs_performed_by ON return_audit_logs(performed_by);

-- RLS: Solo admins pueden ver los logs
ALTER TABLE return_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON return_audit_logs FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

CREATE POLICY "System can insert audit logs"
  ON return_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Función para registrar acciones de auditoría
CREATE OR REPLACE FUNCTION log_return_action(
  p_return_id UUID,
  p_action VARCHAR(50),
  p_previous_status VARCHAR(30) DEFAULT NULL,
  p_new_status VARCHAR(30) DEFAULT NULL,
  p_performed_by UUID DEFAULT NULL,
  p_performed_by_type VARCHAR(20) DEFAULT 'system',
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO return_audit_logs (
    return_id,
    action,
    previous_status,
    new_status,
    performed_by,
    performed_by_type,
    details
  ) VALUES (
    p_return_id,
    p_action,
    p_previous_status,
    p_new_status,
    p_performed_by,
    p_performed_by_type,
    p_details
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Trigger para loguear automáticamente cambios de estado
CREATE OR REPLACE FUNCTION trigger_log_return_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo registrar si el estado cambió
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM log_return_action(
      NEW.id,
      'status_changed',
      OLD.status,
      NEW.status,
      auth.uid(),
      CASE 
        WHEN (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
        THEN 'admin'
        ELSE 'customer'
      END,
      jsonb_build_object(
        'trigger', 'automatic',
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger en la tabla returns
DROP TRIGGER IF EXISTS tr_log_return_status ON returns;
CREATE TRIGGER tr_log_return_status
  AFTER UPDATE ON returns
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_return_status_change();

-- Vista para estadísticas de devoluciones
CREATE OR REPLACE VIEW return_statistics AS
SELECT
  -- Conteos por estado
  COUNT(*) FILTER (WHERE status = 'requested') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
  COUNT(*) FILTER (WHERE status = 'shipped') AS shipped_count,
  COUNT(*) FILTER (WHERE status = 'received') AS received_count,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
  COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count,
  COUNT(*) AS total_count,
  
  -- Métricas de tiempo (promedio en horas)
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
  
  -- Métricas financieras
  COALESCE(SUM(refund_amount) FILTER (WHERE status = 'completed'), 0) AS total_refunded,
  COALESCE(AVG(refund_amount) FILTER (WHERE status = 'completed'), 0)::numeric(10,2) AS avg_refund_amount,
  
  -- Devoluciones del último mes
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '30 days') AS last_30_days_count,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '7 days') AS last_7_days_count

FROM returns;

-- Dar acceso a la vista a admins
GRANT SELECT ON return_statistics TO authenticated;

-- Comentarios
COMMENT ON TABLE return_audit_logs IS 'Registro de auditoría para todas las acciones del sistema de devoluciones';
COMMENT ON VIEW return_statistics IS 'Estadísticas agregadas del sistema de devoluciones para el dashboard';
COMMENT ON FUNCTION log_return_action IS 'Función para registrar manualmente acciones en el log de auditoría';
