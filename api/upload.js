// api/upload.js — generates signed Supabase Storage upload URL
// Client uploads file directly to Supabase (bypasses Vercel 4.5MB limit)

import { supabaseAdmin } from '../lib/supabase.js'

const ADMIN_TOKEN = process.env.ADMIN_SECRET || 'g0ga-admin-2025'
const SUPABASE_URL = process.env.SUPABASE_URL
const BUCKET = 'portfolio-media'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const token = req.headers['x-admin-token'] || req.query?.token
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' })

  if (!supabaseAdmin.configured) {
    return res.status(500).json({ error: 'Supabase not configured — add SUPABASE_URL and SUPABASE_SERVICE_KEY to Vercel env vars' })
  }

  const { filename } = req.query
  if (!filename) return res.status(400).json({ error: 'filename required' })

  // Sanitize filename — keep extension, replace everything else
  const ext = filename.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '')
  const key = `portfolio/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(key)

    if (error) return res.status(500).json({ error: error.message })

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${key}`

    res.status(200).json({
      uploadUrl: data.signedUrl,
      token: data.token,
      key,
      publicUrl,
    })
  } catch (err) {
    console.error('[Upload] Error:', err)
    res.status(500).json({ error: err.message })
  }
}
