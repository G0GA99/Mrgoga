import { supabaseAdmin } from './lib/supabase.js'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'g0ga-admin-2025'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  // Auth check
  const token = req.headers['x-admin-token']
  if (token !== ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const [leadsRes, projectsRes, logsRes] = await Promise.all([
      supabaseAdmin.from('leads').select('*').order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('projects').select('*').order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('agent_logs').select('*').order('created_at', { ascending: false }).limit(100),
    ])

    res.status(200).json({
      leads:    leadsRes.data    || [],
      projects: projectsRes.data || [],
      logs:     logsRes.data     || [],
    })
  } catch (err) {
    console.error('Admin data error:', err)
    res.status(500).json({ error: err.message })
  }
}
