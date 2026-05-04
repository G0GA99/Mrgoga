-- ================================================================
-- G0GA — Media Tables Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ================================================================

-- 1. Add cover_image_url to existing portfolio table
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- ================================================================
-- 2. portfolio_media table — multiple images/videos per portfolio item
-- ================================================================
CREATE TABLE IF NOT EXISTS portfolio_media (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ DEFAULT now(),
  portfolio_id   UUID        REFERENCES portfolio(id) ON DELETE CASCADE,
  url            TEXT        NOT NULL,
  type           TEXT        DEFAULT 'image' CHECK (type IN ('image','video','file')),
  caption        TEXT,
  is_cover       BOOLEAN     DEFAULT false,
  display_order  INT         DEFAULT 0
);

ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access portfolio_media"
ON portfolio_media FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Anon can read portfolio_media"
ON portfolio_media FOR SELECT TO anon USING (true);

-- ================================================================
-- 3. testimonials table — client testimonials with optional photo
-- ================================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  client_name     TEXT        NOT NULL,
  client_title    TEXT,
  client_company  TEXT,
  client_photo_url TEXT,
  message         TEXT        NOT NULL,
  rating          INT         DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  service         TEXT,
  portfolio_id    UUID        REFERENCES portfolio(id),
  is_active       BOOLEAN     DEFAULT true,
  display_order   INT         DEFAULT 0
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access testimonials"
ON testimonials FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Anon can read active testimonials"
ON testimonials FOR SELECT TO anon USING (is_active = true);

-- ================================================================
-- 4. Supabase Storage bucket for portfolio media
-- ================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-media',
  'portfolio-media',
  true,
  52428800,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','video/mp4','video/webm','application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read portfolio-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-media');

CREATE POLICY "Service role manage portfolio-media"
ON storage.objects FOR ALL TO service_role
USING (bucket_id = 'portfolio-media')
WITH CHECK (bucket_id = 'portfolio-media');

-- ================================================================
-- Done! Tables created. Now set SUPABASE_URL + SUPABASE_SERVICE_KEY
-- in Vercel env vars if not already done.
-- ================================================================
