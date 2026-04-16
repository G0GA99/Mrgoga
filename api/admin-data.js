// admin-data.js — Admin Dashboard API
// GET  → returns leads, projects, agent logs (dashboard data)
// POST → agent chat (CEO talks to any agent)

import { supabaseAdmin } from '../lib/supabase.js'

const GROQ_KEY    = process.env.GROQ_API_KEY
const ADMIN_TOKEN = process.env.ADMIN_SECRET || 'g0ga-admin-2025'

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

// ─── Router ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).end()
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  try {
    if (req.method === 'GET') return await getDashboardData(res)
    // POST: route by action field
    const action = req.body?.action
    if (action === 'digest') return await runDigest(res)
    return await agentChat(req.body, res)  // default POST = agent chat
  } catch (err) {
    console.error('Admin data error:', err)
    res.status(500).json({ error: err.message })
  }
}
