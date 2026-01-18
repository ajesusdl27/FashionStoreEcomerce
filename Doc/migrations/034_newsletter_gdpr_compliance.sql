-- ============================================
-- MIGRATION: 034_newsletter_gdpr_compliance.sql
-- FashionStore - GDPR Compliance for Newsletter
-- Date: 2026-01-18
-- ============================================

-- 1. Añadir estados 'failed' y 'paused' a campañas
ALTER TABLE newsletter_campaigns
  DROP CONSTRAINT IF EXISTS newsletter_campaigns_status_check;

ALTER TABLE newsletter_campaigns
  ADD CONSTRAINT newsletter_campaigns_status_check
  CHECK (status IN ('draft', 'sending', 'sent', 'failed', 'paused'));

-- 2. Añadir token único para unsubscribe (GDPR CRÍTICO)
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT uuid_generate_v4() UNIQUE;

-- Generar tokens para suscriptores existentes que no tengan
UPDATE newsletter_subscribers
SET unsubscribe_token = uuid_generate_v4()
WHERE unsubscribe_token IS NULL;

-- 3. Añadir contador de errores y último error a campaña
ALTER TABLE newsletter_campaigns
  ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error TEXT;

-- 4. Tabla de logs de envío (auditoría y reintentos)
CREATE TABLE IF NOT EXISTS newsletter_send_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE SET NULL,
  subscriber_email TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'failed', 'bounced', 'opened', 'clicked')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_send_logs_campaign ON newsletter_send_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_send_logs_status ON newsletter_send_logs(status);
CREATE INDEX IF NOT EXISTS idx_send_logs_email ON newsletter_send_logs(subscriber_email);
CREATE INDEX IF NOT EXISTS idx_subscribers_token ON newsletter_subscribers(unsubscribe_token);

-- 6. RLS para logs
ALTER TABLE newsletter_send_logs ENABLE ROW LEVEL SECURITY;

-- Policy para que admins puedan gestionar logs
DROP POLICY IF EXISTS "Admins can manage send logs" ON newsletter_send_logs;
CREATE POLICY "Admins can manage send logs"
  ON newsletter_send_logs
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- 7. Tabla para rate limiting de suscripciones
CREATE TABLE IF NOT EXISTS newsletter_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON newsletter_rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_time ON newsletter_rate_limits(last_attempt_at);

-- Limpiar registros antiguos automáticamente (más de 1 hora)
CREATE OR REPLACE FUNCTION clean_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM newsletter_rate_limits 
  WHERE last_attempt_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- RLS para rate limits (público puede insertar/actualizar su IP)
ALTER TABLE newsletter_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can manage own rate limits" ON newsletter_rate_limits;
CREATE POLICY "Public can manage own rate limits"
  ON newsletter_rate_limits
  FOR ALL
  TO anon, authenticated
  WITH CHECK (true);
