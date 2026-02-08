-- Migration: Setup daily low stock alert cron job
-- This sets up a pg_cron job that invokes the Edge Function every day at 7:00 UTC (8:00 AM Madrid/Spain)
--
-- PREREQUISITES:
--   1. Enable pg_cron extension in Supabase Dashboard > Database > Extensions
--   2. Enable pg_net extension in Supabase Dashboard > Database > Extensions (for HTTP requests)
--   3. Deploy the Edge Function: supabase functions deploy daily-low-stock-alert
--   4. Set RESEND_API_KEY secret: supabase secrets set RESEND_API_KEY=re_xxxxx
--
-- ALTERNATIVE: If you prefer to use an external cron service (GitHub Actions, Vercel Cron, etc.),
-- you can skip this migration and use the API endpoint POST /api/admin/check-low-stock instead
-- with the x-cron-secret header.

-- Enable required extensions (run in SQL Editor if not already enabled)
-- CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
-- CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the cron job: Every day at 7:00 UTC = 8:00 AM Madrid (CET/CEST)
-- The job calls the Supabase Edge Function via HTTP
SELECT cron.schedule(
  'daily-low-stock-alert',           -- Job name (unique identifier)
  '0 7 * * *',                        -- Cron expression: 7:00 UTC daily
  $$
  SELECT net.http_post(
    url := (SELECT value FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/daily-low-stock-alert',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT value FROM vault.decrypted_secrets WHERE name = 'SERVICE_rOLE_KEY')
    ),
    body := '{"source": "pg_cron"}'::jsonb
  );
  $$
);

-- To verify the job was created:
-- SELECT * FROM cron.job;

-- To check job execution history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- To remove the job:
-- SELECT cron.unschedule('daily-low-stock-alert');

-- ===========================================
-- ALTERNATIVE: Simple version without vault
-- If vault secrets are not configured, use this simpler version.
-- Replace YOUR_SUPABASE_URL and YOUR_SERVICE_ROLE_KEY with actual values.
-- ===========================================
/*
SELECT cron.schedule(
  'daily-low-stock-alert',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-low-stock-alert',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{"source": "pg_cron"}'::jsonb
  );
  $$
);
*/
