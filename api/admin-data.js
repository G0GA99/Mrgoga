// admin-data.js — Admin Dashboard API
// GET  → returns leads, projects, agent logs (dashboard data)
// POST → agent chat (CEO talks to any agent)

import { supabaseAdmin } from '../lib/supabase.js'

const GROQ_KEY     = process.env.GROQ_API_KEY
const ADMIN_TOKEN  = process.env.ADMIN_SECRET || 'g0ga-admin-2025'
const SUPABASE_URL = process.env.SUPABASE_URL
const BUCKET       = 'portfolio-media'

function isAuthorized(req) {
  const token = req.headers['x-admin-token']
  return token === ADMIN_TOKEN
}

// ─── Dashboard Data (GET) ────────────────────────────────────────────────────

async function getDashboardData(res) {
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
}

// ─── Agent Chat (POST action=chat) ───────────────────────────────────────────

async function groq(systemPrompt, userMessage, history = []) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6),
    { role: 'user', content: userMessage },
  ]
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    })
  })
  const j = await r.json()
  return j.choices?.[0]?.message?.content || 'No response'
}

async function getAgentLogs(agent) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabaseAdmin
    .from('agent_logs')
    .select('action, details, created_at')
    .eq('agent', agent)
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })
    .limit(10)
  return data || []
}

async function getZaraContext() {
  const [leadsRes, projectsRes] = await Promise.all([
    supabaseAdmin.from('leads').select('name, service, budget, status, created_at').order('created_at', { ascending: false }).limit(10),
    supabaseAdmin.from('projects').select('client_name, title, status, assigned_to').order('created_at', { ascending: false }).limit(5),
  ])
  return { leads: leadsRes.data || [], projects: projectsRes.data || [] }
}

function buildSystemPrompt(agent, logs, extraData = {}) {
  const logSummary = logs.length > 0
    ? logs.map(l => {
        let d = ''
        try { d = JSON.stringify(JSON.parse(l.details)).slice(0, 200) } catch { d = String(l.details || '').slice(0, 200) }
        return `- ${new Date(l.created_at).toLocaleDateString()}: ${l.action} | ${d}`
      }).join('\n')
    : 'No activity logged this week.'

  const personas = {
    Scout: `You are Scout — Business Development Agent at G0GA AI Agency. You find local businesses in USA, UK, Canada and send personalized cold emails daily.

YOUR RECENT ACTIVITY (last 7 days):
${logSummary}

When CEO asks if anyone is interested: explain which companies you contacted. Email replies go to gogamr0.01@gmail.com — you can tell CEO which prospects to check for replies. Be direct and results-focused.`,

    Nova: `You are Nova — Marketing Manager at G0GA AI Agency. You create and post content daily to grow G0GA's social media presence.

YOUR RECENT ACTIVITY (last 7 days):
${logSummary}

Report what you posted and where. Be energetic and data-driven.`,

    Kai: `You are Kai — SEO Specialist at G0GA AI Agency. You run weekly SEO audits of g0ga.vercel.app.

YOUR RECENT ACTIVITY (last 7 days):
${logSummary}

Be analytical. Report real keyword data from your logs.`,

    Zion: `You are Zion — Content Creator at G0GA AI Agency. You write blog posts, LinkedIn articles, case studies, newsletters, and SEO landing pages on weekly rotation.

YOUR RECENT ACTIVITY (last 7 days):
${logSummary}

Report what content type you wrote this week and what's coming next. Be creative but business-focused.`,

    Zara: `You are Zara — Project Manager at G0GA AI Agency. You manage leads and projects.

CURRENT LEADS (${extraData.leads?.length || 0} total):
${(extraData.leads || []).map((l, i) => `${i+1}. ${l.name} — ${l.service || 'General'} — Budget: ${l.budget || '?'} — Status: ${l.status}`).join('\n') || 'No leads.'}

ACTIVE PROJECTS:
${(extraData.projects || []).filter(p => p.status === 'in_progress').map(p => `• ${p.client_name}: ${p.title} (${p.assigned_to || 'unassigned'})`).join('\n') || 'No active projects.'}

YOUR RECENT ACTIVITY:
${logSummary}

Be organized. Flag anything urgent. Speak like a capable project manager.`,

    Luna: `You are Luna — Site Health Monitor at G0GA AI Agency. You check g0ga.vercel.app weekly for errors and performance issues.

YOUR RECENT ACTIVITY (last 7 days):
${logSummary}

Report site health based on your last check. Be technical but concise.`,

    Vex: `You are Vex — Reputation Monitor at G0GA AI Agency. You track G0GA's online mentions and competitor activity.

YOUR RECENT ACTIVITY (last 7 days):
${logSummary}

Report brand intelligence. Speak like a sharp brand analyst.`,

    Alex: `You are Alex — AI Sales Consultant at G0GA AI Agency. You handle the live chat on g0ga.vercel.app and book discovery calls.

YOUR RECENT ACTIVITY (last 7 days):
${logSummary}

Report conversation quality and leads booked. Be warm but results-focused.`,
  }

  return personas[agent] || `You are ${agent} at G0GA AI Agency.\n\n${logSummary}`
}

async function agentChat(body, res) {
  const { agent, message, history = [] } = body
  const validAgents = ['Scout', 'Nova', 'Kai', 'Zion', 'Zara', 'Luna', 'Vex', 'Alex']

  if (!agent || !message) return res.status(400).json({ error: 'agent and message required' })
  if (!validAgents.includes(agent)) return res.status(400).json({ error: 'Invalid agent' })

  const [logs, extraData] = await Promise.all([
    getAgentLogs(agent),
    agent === 'Zara' ? getZaraContext() : Promise.resolve({}),
  ])

  const systemPrompt = buildSystemPrompt(agent, logs, extraData)
  const reply = await groq(systemPrompt, message, history)
  res.status(200).json({ ok: true, agent, reply })
}

// ─── Weekly Digest (POST action=digest) ─────────────────────────────────────

async function runDigest(res) {
  const RESEND_KEY = process.env.RESEND_API_KEY
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: logs } = await supabaseAdmin
    .from('agent_logs').select('*')
    .in('agent', ['Nova', 'Kai', 'Zion'])
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })

  if (!logs || logs.length === 0) {
    return res.status(200).json({ ok: true, message: 'No reports this week' })
  }

  const agentReports = {}
  for (const log of logs) {
    if (!agentReports[log.agent]) agentReports[log.agent] = log
  }

  const [{ data: newLeads }, { data: scoutLogs }] = await Promise.all([
    supabaseAdmin.from('leads').select('id, name, service, budget, status').gte('created_at', sevenDaysAgo),
    supabaseAdmin.from('agent_logs').select('details').eq('agent', 'Scout').eq('action', 'prospect_emailed').gte('created_at', sevenDaysAgo),
  ])

  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  let email = `G0GA — Weekly Update (${date})\n\n`

  if (agentReports['Nova']) {
    let d = {}; try { d = JSON.parse(agentReports['Nova'].details) } catch {}
    email += `NOVA: ${d.linkedin?.posted ? 'Posted to LinkedIn ✅' : 'Content ready, LinkedIn pending 📝'}\n`
  }
  if (agentReports['Kai']) {
    const r = typeof agentReports['Kai'].details === 'string' ? agentReports['Kai'].details.slice(0, 300) : ''
    email += `\nKAI (SEO):\n${r}\n`
  }
  if (agentReports['Zion']) {
    let d = {}; try { d = JSON.parse(agentReports['Zion'].details) } catch {}
    email += `\nZION: ${d.typeLabel || 'Content'} written — "${d.topic || 'Weekly post'}"\n`
    email += `Medium: ${d.medium?.published ? `Published ✅ ${d.medium.url}` : 'Pending 📝'}\n`
  }

  email += `\nLEADS THIS WEEK: ${newLeads?.length || 0}\n`
  if (newLeads?.length > 0) {
    newLeads.forEach((l, i) => { email += `  ${i+1}. ${l.name} — ${l.service || 'General'} — Budget: ${l.budget || '?'}\n` })
  }

  email += `\nSCOUT OUTREACH: ${scoutLogs?.length || 0} prospects contacted\n`
  if (scoutLogs?.length > 0) {
    scoutLogs.slice(0, 5).forEach((log, i) => {
      try { const d = JSON.parse(log.details); email += `  ${i+1}. ${d.company} (${d.location}) — ${d.score}\n` } catch {}
    })
  }
  email += `\nAdmin panel: https://g0ga.vercel.app/admin\n— G0GA Team`

  if (RESEND_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'G0GA Team <onboarding@resend.dev>', to: 'gogamr0.01@gmail.com', subject: `📊 G0GA Weekly Digest — ${date}`, text: email })
    })
  }

  await supabaseAdmin.from('agent_logs').insert({
    agent: 'Digest', action: 'weekly_digest_sent',
    details: `Weekly digest sent. Agents: ${Object.keys(agentReports).join(', ')}. Leads: ${newLeads?.length || 0}. Scout: ${scoutLogs?.length || 0}`,
  })

  res.status(200).json({ ok: true, agentsIncluded: Object.keys(agentReports) })
}

// ─── Test Email ──────────────────────────────────────────────────────────────

async function sendTestEmail(res) {
  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) return res.status(500).json({ ok: false, error: 'RESEND_API_KEY not set in Vercel dashboard' })
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'G0GA Admin <onboarding@resend.dev>',
        to: 'gogamr0.01@gmail.com',
        subject: '✅ G0GA Email Test — Working!',
        text: `Your G0GA email system is working correctly.\n\nSent: ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })} PKT\n\n— G0GA Admin Panel`,
      })
    })
    const data = await r.json()
    if (r.ok) return res.status(200).json({ ok: true, message: 'Test email sent to gogamr0.01@gmail.com — check your inbox!' })
    return res.status(500).json({ ok: false, error: data.message || 'Resend rejected the email', raw: data })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
}

// ─── Run Agent Now ────────────────────────────────────────────────────────────

async function runAgentNow(body, res) {
  const { agent } = body
  const SITE_URL = process.env.SITE_URL || process.env.VERCEL_URL
  if (!SITE_URL) return res.status(500).json({ ok: false, error: 'SITE_URL env var not set' })

  const agentEndpoints = {
    Scout: '/api/scout',
    Nova:  '/api/nova',
    Kai:   '/api/kai',
    Zion:  '/api/zion',
    Zara:  '/api/zara',
    Luna:  '/api/monitor?agent=luna',
    Vex:   '/api/monitor?agent=vex',
  }

  const endpoint = agentEndpoints[agent]
  if (!endpoint) return res.status(400).json({ ok: false, error: `Unknown agent: ${agent}` })

  const base = SITE_URL.startsWith('http') ? SITE_URL : `https://${SITE_URL}`
  const token = process.env.ADMIN_SECRET || 'g0ga-admin-2025'

  const r = await fetch(`${base}${endpoint}`, {
    method: 'POST',
    headers: { 'x-admin-token': token, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(90000),
  })

  const data = await r.json().catch(() => ({ status: r.status }))
  res.status(r.ok ? 200 : r.status).json({ ok: r.ok, agent, result: data })
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

function dbToPortfolio(item) {
  return {
    id: item.id,
    title: item.title,
    client: item.client || '',
    location: item.location || '',
    type: item.type || 'AI Integration',
    description: item.description || '',
    result1: { val: item.result1_val || '', lbl: item.result1_lbl || '' },
    result2: { val: item.result2_val || '', lbl: item.result2_lbl || '' },
    result3: { val: item.result3_val || '', lbl: item.result3_lbl || '' },
    tech: item.tech ? item.tech.split(',').map(t => t.trim()).filter(Boolean) : [],
    accentColor: item.accent_color || '#10b981',
  }
}

// ─── Upload URL (GET action=upload-url) ─────────────────────────────────────

async function getUploadUrl(req, res) {
  if (!supabaseAdmin.configured) return res.status(500).json({ error: 'Supabase not configured' })
  const { filename } = req.query
  if (!filename) return res.status(400).json({ error: 'filename required' })
  const ext = filename.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '')
  const key = `portfolio/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  try {
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(key)
    if (error) return res.status(500).json({ error: error.message })
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${key}`
    res.status(200).json({ uploadUrl: data.signedUrl, token: data.token, key, publicUrl })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ─── One-time DB Migration (POST action=migrate) ─────────────────────────────

async function runMigration(res) {
  if (!supabaseAdmin.configured) return res.status(500).json({ error: 'Supabase not configured' })
  const results = []
  const step = async (label, fn) => {
    try { await fn(); results.push({ label, ok: true }) }
    catch (e) { results.push({ label, ok: false, error: e.message }) }
  }

  await step('cover_image_url column', () =>
    supabaseAdmin.sql`ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS cover_image_url TEXT`)

  await step('portfolio_media table', () =>
    supabaseAdmin.sql`CREATE TABLE IF NOT EXISTS portfolio_media (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT now(),
      portfolio_id UUID REFERENCES portfolio(id) ON DELETE CASCADE,
      url TEXT NOT NULL, type TEXT DEFAULT 'image' CHECK (type IN ('image','video','file')),
      caption TEXT, is_cover BOOLEAN DEFAULT false, display_order INT DEFAULT 0)`)

  await step('testimonials table', () =>
    supabaseAdmin.sql`CREATE TABLE IF NOT EXISTS testimonials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT now(),
      client_name TEXT NOT NULL, client_title TEXT, client_company TEXT, client_photo_url TEXT,
      message TEXT NOT NULL, rating INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
      service TEXT, portfolio_id UUID REFERENCES portfolio(id),
      is_active BOOLEAN DEFAULT true, display_order INT DEFAULT 0)`)

  await step('RLS', () => supabaseAdmin.sql`
    ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY;
    ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY`)

  await step('storage bucket', () =>
    supabaseAdmin.sql`INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
      VALUES ('portfolio-media','portfolio-media',true,52428800,
        ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','video/mp4','video/webm','application/pdf'])
      ON CONFLICT (id) DO NOTHING`)

  const allOk = results.every(r => r.ok)
  res.status(allOk ? 200 : 207).json({ allOk, results })
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

async function getPublicPortfolio(res) {
  const { data, error } = await supabaseAdmin
    .from('portfolio').select('*').eq('is_active', true).order('created_at', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ items: (data || []).map(dbToPortfolio) })
}

async function getAdminPortfolio(res) {
  const { data, error } = await supabaseAdmin
    .from('portfolio').select('*').order('created_at', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ items: data || [] })
}

async function addPortfolio(body, res) {
  const { title, client, location, type, description, result1_val, result1_lbl, result2_val, result2_lbl, result3_val, result3_lbl, tech, accent_color, cover_image_url } = body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const { data, error } = await supabaseAdmin.from('portfolio').insert({
    title, client: client || '', location: location || '', type: type || 'AI Integration',
    description: description || '', result1_val: result1_val || '', result1_lbl: result1_lbl || '',
    result2_val: result2_val || '', result2_lbl: result2_lbl || '',
    result3_val: result3_val || '', result3_lbl: result3_lbl || '',
    tech: tech || '', accent_color: accent_color || '#10b981', is_active: true,
    cover_image_url: cover_image_url || null,
  }).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ ok: true, item: data })
}

async function updatePortfolio(body, res) {
  const { id, ...fields } = body
  if (!id) return res.status(400).json({ error: 'ID required' })
  const { error } = await supabaseAdmin.from('portfolio').update(fields).eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ ok: true })
}

async function deletePortfolio(body, res) {
  const { id } = body
  if (!id) return res.status(400).json({ error: 'ID required' })
  const { error } = await supabaseAdmin.from('portfolio').delete().eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ ok: true })
}

// ─── Router ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).end()

  try {
    if (req.method === 'GET') {
      const action = req.query?.action
      if (action === 'portfolio') return await getPublicPortfolio(res)
      if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })
      if (action === 'portfolio-admin') return await getAdminPortfolio(res)
      if (action === 'upload-url') return await getUploadUrl(req, res)
      return await getDashboardData(res)
    }

    if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })
    const action = req.body?.action
    if (action === 'digest')           return await runDigest(res)
    if (action === 'test-email')       return await sendTestEmail(res)
    if (action === 'run-agent')        return await runAgentNow(req.body, res)
    if (action === 'portfolio-add')    return await addPortfolio(req.body, res)
    if (action === 'portfolio-update') return await updatePortfolio(req.body, res)
    if (action === 'portfolio-delete') return await deletePortfolio(req.body, res)
    if (action === 'migrate')          return await runMigration(res)
    return await agentChat(req.body, res)
  } catch (err) {
    console.error('Admin data error:', err)
    res.status(500).json({ error: err.message })
  }
}
