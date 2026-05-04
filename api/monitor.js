// monitor.js — Luna (site health) + Vex (reputation) combined
// ?agent=luna  → runs site health check
// ?agent=vex   → runs reputation + competitor check

import { supabaseAdmin } from '../lib/supabase.js'
import { AGENT as LUNA } from '../lib/agents/luna.js'
import { AGENT as VEX }  from '../lib/agents/vex.js'

const GROQ_KEY    = process.env.GROQ_API_KEY
const RESEND_KEY  = process.env.RESEND_API_KEY
const ADMIN_TOKEN = process.env.ADMIN_SECRET || 'g0ga-admin-2025'
const SITE_URL    = process.env.SITE_URL || 'https://g0ga.vercel.app'

function isAuthorized(req) {
  return req.headers['x-admin-token'] === ADMIN_TOKEN
}

async function groq(prompt, maxTokens = 500) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens, temperature: 0.3,
    })
  })
  const j = await r.json()
  return j.choices?.[0]?.message?.content || ''
}

async function readPage(url) {
  try {
    const r = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain' }, signal: AbortSignal.timeout(8000)
    })
    return (await r.text()).slice(0, 1000)
  } catch { return null }
}

async function jinaSearch(query) {
  try {
    const r = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`, {
      headers: { 'Accept': 'text/plain' }, signal: AbortSignal.timeout(10000)
    })
    return (await r.text()).slice(0, 1500)
  } catch { return null }
}

async function sendEmail(from, subject, text) {
  if (!RESEND_KEY) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: 'gogamr0.01@gmail.com', subject, text })
  })
}

async function isMonthlyReportDue(agentName) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabaseAdmin
    .from('agent_logs').select('id')
    .eq('agent', agentName).eq('action', 'monthly_report_sent')
    .gte('created_at', thirtyDaysAgo).limit(1)
  return !data || data.length === 0
}

// ─── Luna — Site Health ───────────────────────────────────────────────────────

async function runLuna(res) {
  // Check homepage
  let siteData = null
  try {
    const r = await fetch(`https://r.jina.ai/${SITE_URL}`, {
      headers: { 'Accept': 'text/plain' }, signal: AbortSignal.timeout(8000)
    })
    siteData = (await r.text()).slice(0, 800)
  } catch { siteData = null }

  // Check key API endpoints
  const endpoints = ['/api/chat', '/api/contact', '/api/book']
  const endpointResults = await Promise.all(endpoints.map(async path => {
    try {
      const start = Date.now()
      const r = await fetch(`${SITE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN || '' },
        body: JSON.stringify({ message: 'health-check', history: [] }),
        signal: AbortSignal.timeout(10000)
      })
      return { path, status: r.status, ok: r.ok, ms: Date.now() - start }
    } catch (e) {
      return { path, status: 0, ok: false, error: e.message }
    }
  }))

  const endpointSummary = endpointResults.map(e =>
    `${e.path}: ${e.ok ? `✅ OK (${e.ms}ms)` : `❌ FAILED (status ${e.status}${e.error ? ' — ' + e.error : ''})`}`
  ).join('\n')

  const criticalFailures = endpointResults.filter(e => !e.ok)
  const siteDown = !siteData
  const report = await groq(LUNA.buildCheckPrompt(siteData, endpointSummary))
  const status = (siteDown || criticalFailures.length > 0) ? 'critical' : 'healthy'

  await supabaseAdmin.from('agent_logs').insert({
    agent: 'Luna', action: 'health_check',
    details: JSON.stringify({ status, siteDown, criticalFailures: criticalFailures.length, endpointResults }),
  })

  if (siteDown || criticalFailures.length > 0) {
    await sendEmail(
      'Luna — G0GA Systems <onboarding@resend.dev>',
      `🚨 Luna — CRITICAL: Site issue detected`,
      `Luna detected a critical issue on g0ga.vercel.app.\n\n${endpointSummary}\n\n${report}\n\nAction required immediately.\n— Luna`
    )
  } else if (await isMonthlyReportDue('Luna')) {
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Luna', action: 'monthly_report_sent', details: 'Monthly health report sent',
    })
    await sendEmail(
      'Luna — G0GA Systems <onboarding@resend.dev>',
      `🟢 Luna — Monthly Site Health Report`,
      `30-day site health summary.\n\n${endpointSummary}\n\n${report}\n\nNext report in 30 days.\n— Luna`
    )
  }

  res.status(200).json({ ok: true, agent: 'Luna', status, criticalFailures: criticalFailures.length })
}

// ─── Vex — Reputation Monitor ─────────────────────────────────────────────────

async function runVex(res) {
  const [mentionsData, competitorData] = await Promise.all([
    jinaSearch('G0GA AI Agency g0ga.vercel.app MrGoga'),
    readPage('https://www.appinventiv.com/ai-development/'),
  ])

  const report = await groq(VEX.buildPrompt(mentionsData, competitorData), 600)

  await supabaseAdmin.from('agent_logs').insert({
    agent: 'Vex', action: 'reputation_check',
    details: JSON.stringify({ report, hasData: !!(mentionsData || competitorData) }),
  })

  if (await isMonthlyReportDue('Vex')) {
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Vex', action: 'monthly_report_sent', details: 'Monthly reputation report sent',
    })
    await sendEmail(
      'Vex — G0GA Brand <onboarding@resend.dev>',
      `🔍 Vex — Monthly Brand & Competitor Report`,
      `30-day brand intelligence summary.\n\n${report}\n\nNext report in 30 days.\n— Vex`
    )
  }

  res.status(200).json({ ok: true, agent: 'Vex', reportReady: true })
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  const agent = (req.query?.agent || req.body?.agent || '').toLowerCase()

  try {
    if (agent === 'luna') return await runLuna(res)
    if (agent === 'vex')  return await runVex(res)
    return res.status(400).json({ error: 'agent=luna or agent=vex required' })
  } catch (err) {
    console.error('Monitor error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
