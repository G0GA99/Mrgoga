// TEMPORARY — delete after running once
import { supabaseAdmin } from '../lib/supabase.js'

const ADMIN_TOKEN = process.env.ADMIN_SECRET || 'g0ga-admin-2025'

export default async function handler(req, res) {
  if (req.headers['x-admin-token'] !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' })
  if (!supabaseAdmin.configured) return res.status(500).json({ error: 'Supabase not configured' })

  const results = []

  const run = async (label, sql) => {
    try {
      const { error } = await supabaseAdmin.from('_migrations_dummy').select().limit(0)
      // Use raw SQL via supabase-js sql() template
      const { error: e } = await supabaseAdmin.sql`${sql}`
      results.push({ label, ok: !e, error: e?.message })
    } catch (err) {
      results.push({ label, ok: false, error: err.message })
    }
  }

  // 1 — Add cover_image_url to portfolio
  try {
    await supabaseAdmin.sql`ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS cover_image_url TEXT`
    results.push({ label: 'add cover_image_url column', ok: true })
  } catch (e) { results.push({ label: 'add cover_image_url column', ok: false, error: e.message }) }

  // 2 — portfolio_media table
  try {
    await supabaseAdmin.sql`
      CREATE TABLE IF NOT EXISTS portfolio_media (
        id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at    TIMESTAMPTZ DEFAULT now(),
        portfolio_id  UUID        REFERENCES portfolio(id) ON DELETE CASCADE,
        url           TEXT        NOT NULL,
        type          TEXT        DEFAULT 'image' CHECK (type IN ('image','video','file')),
        caption       TEXT,
        is_cover      BOOLEAN     DEFAULT false,
        display_order INT         DEFAULT 0
      )
    `
    results.push({ label: 'create portfolio_media', ok: true })
  } catch (e) { results.push({ label: 'create portfolio_media', ok: false, error: e.message }) }

  // 3 — testimonials table
  try {
    await supabaseAdmin.sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at       TIMESTAMPTZ DEFAULT now(),
        client_name      TEXT        NOT NULL,
        client_title     TEXT,
        client_company   TEXT,
        client_photo_url TEXT,
        message          TEXT        NOT NULL,
        rating           INT         DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
        service          TEXT,
        portfolio_id     UUID        REFERENCES portfolio(id),
        is_active        BOOLEAN     DEFAULT true,
        display_order    INT         DEFAULT 0
      )
    `
    results.push({ label: 'create testimonials', ok: true })
  } catch (e) { results.push({ label: 'create testimonials', ok: false, error: e.message }) }

  // 4 — RLS on new tables
  try {
    await supabaseAdmin.sql`ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY`
    await supabaseAdmin.sql`ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY`
    results.push({ label: 'enable RLS', ok: true })
  } catch (e) { results.push({ label: 'enable RLS', ok: false, error: e.message }) }

  // 5 — RLS policies
  try {
    await supabaseAdmin.sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='portfolio_media' AND policyname='service_role_all_portfolio_media') THEN
          CREATE POLICY service_role_all_portfolio_media ON portfolio_media FOR ALL TO service_role USING (true) WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='portfolio_media' AND policyname='anon_read_portfolio_media') THEN
          CREATE POLICY anon_read_portfolio_media ON portfolio_media FOR SELECT TO anon USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='service_role_all_testimonials') THEN
          CREATE POLICY service_role_all_testimonials ON testimonials FOR ALL TO service_role USING (true) WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='anon_read_testimonials') THEN
          CREATE POLICY anon_read_testimonials ON testimonials FOR SELECT TO anon USING (is_active = true);
        END IF;
      END $$
    `
    results.push({ label: 'RLS policies', ok: true })
  } catch (e) { results.push({ label: 'RLS policies', ok: false, error: e.message }) }

  // 6 — Storage bucket
  try {
    await supabaseAdmin.sql`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('portfolio-media','portfolio-media',true,52428800,
        ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','video/mp4','video/webm','application/pdf'])
      ON CONFLICT (id) DO NOTHING
    `
    results.push({ label: 'storage bucket', ok: true })
  } catch (e) { results.push({ label: 'storage bucket', ok: false, error: e.message }) }

  // 7 — Storage policies
  try {
    await supabaseAdmin.sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='public_read_portfolio_media') THEN
          CREATE POLICY public_read_portfolio_media ON storage.objects FOR SELECT USING (bucket_id='portfolio-media');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='service_role_portfolio_media') THEN
          CREATE POLICY service_role_portfolio_media ON storage.objects FOR ALL TO service_role
            USING (bucket_id='portfolio-media') WITH CHECK (bucket_id='portfolio-media');
        END IF;
      END $$
    `
    results.push({ label: 'storage policies', ok: true })
  } catch (e) { results.push({ label: 'storage policies', ok: false, error: e.message }) }

  const allOk = results.every(r => r.ok)
  res.status(allOk ? 200 : 207).json({ allOk, results })
}
