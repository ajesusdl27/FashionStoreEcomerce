-- Migration: Allow ANON users to update pending orders for guest checkout
-- Purpose: Enables guest users to confirm payment by updating order status and stripe_session_id
-- Author: System
-- Date: 2026-01-29
-- Updated: 2026-01-29 - Removed stripe_session_id IS NULL condition because
--          the API already sets stripe_session_id when creating the PaymentIntent
-- Updated: 2026-01-29 - Added SELECT policy because RLS requires SELECT access
--          before UPDATE can work

-- Drop policies if exist (for idempotency)
DROP POLICY IF EXISTS "orders_update_anon_confirm_payment" ON public.orders;
DROP POLICY IF EXISTS "orders_select_anon_pending" ON public.orders;

-- IMPORTANT: For UPDATE to work with RLS, the user must first be able to SELECT the row.
-- Without SELECT access, UPDATE will silently return 0 rows affected.

-- 1. Create SELECT policy for anon to see pending guest orders
CREATE POLICY "orders_select_anon_pending"
ON public.orders
FOR SELECT
TO anon
USING (
  customer_id IS NULL 
  AND status = 'pending'
  AND created_at > NOW() - INTERVAL '1 hour'
);

-- 2. Create UPDATE policy allowing ANON users to update their pending guest orders
-- Security constraints:
-- 1. Only orders without customer_id (guest orders)
-- 2. Only orders in 'pending' status
-- 3. Only orders created within the last hour (prevent abuse)
-- 4. WITH CHECK ensures customer_id remains NULL (guest order)

CREATE POLICY "orders_update_anon_confirm_payment"
ON public.orders
FOR UPDATE
TO anon
USING (
  customer_id IS NULL 
  AND status = 'pending'
  AND created_at > NOW() - INTERVAL '1 hour'
)
WITH CHECK (
  customer_id IS NULL
);

-- Note: This policy allows ANON users to update any columns on matching orders.
-- In practice, the app should only update 'status' and 'stripe_session_id'.
-- Consider creating a more restrictive policy or using RPC functions if stricter
-- column-level control is needed.

-- Verification query (run as admin):
-- SELECT policyname, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'orders' AND policyname = 'orders_update_anon_confirm_payment';
