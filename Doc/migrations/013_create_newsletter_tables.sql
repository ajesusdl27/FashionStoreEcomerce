-- ============================================
-- FASHIONSTORE - NEWSLETTER SYSTEM
-- ============================================

-- 1. NEWSLETTER SUBSCRIBERS
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NEWSLETTER CAMPAIGNS
CREATE TABLE newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  content TEXT NOT NULL, -- HTML content
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent')),
  sent_count INTEGER DEFAULT 0,
  total_recipients INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- 3. RLS POLICIES

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Subscribers:
-- Public can INSERT (subscribe)
CREATE POLICY "Public can subscribe"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view/manage all
CREATE POLICY "Admins can manage subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Campaigns:
-- Only Admins can manage campaigns
CREATE POLICY "Admins can manage campaigns"
  ON newsletter_campaigns
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );
