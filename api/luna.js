import { supabaseAdmin } from '../lib/supabase.js'
import { AGENT as LUNA } from '../lib/agents/luna.js'

const GROQ_KEY    = process.env.GROQ_API_KEY
const RESEND_KEY  = process.env.RESEND_API_KEY
const ADMIN_TOKEN = process.env.ADMIN_SECRET
const SITE_URL    = process.env.SITE_URL || 'https://g0ga.vercel.app'

function isAuthorized(req) {
  return req.headers['x-admin-token'] === ADMIN_TOKEN
}

async function groq(prompt) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500, temperature: 0.2,
    })
  })
  const j = await r.json()
  return j.choices?.[0]?.message?.content || ''
}

async function sendEmail(subject, text) {
  if (!RESEND_KEY) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Luna — G0GA Systems <onboarding@resend.dev>',
      to: 'gogamr0.01@gmail.com',
      subject, text
    })
  })
}

async function checkEndpoint(path) {
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
}

async function isMonthlyReportDue() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabaseAdmin
    .from('agent_logs')
    .select('id')
    .eq('agent', 'Luna')
    .eq('action', 'monthly_report_sent')
    .gte('created_at', thirtyDaysAgo)
    .limit(1)
  return !data || data.length === 0
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  try {
    // 1 — Check site homepage
    let siteData = null
    try {
      const r = await fetch(`https://r.jina.ai/${SITE_URL}`, {
        headers: { 'Accept': 'text/plain' }, signal: AbortSignal.timeout(8000)
      })
      siteData = (await r.text()).slice(0, 800)
    } catch { siteData = null }

    // 2 — Check key API endpoints
    const endpoints = ['/api/chat', '/api/contact', '/api/book']
    const endpointResults = await Promise.all(endpoints.map(checkEndpoint))
    const endpointSummary = endpointResults.map(e =>
      `${e.path}: ${e.ok ? `✅ OK (${e.ms}ms)` : `❌ FAILED (status ${e.status}${e.error ? ' — ' + e.error : ''})`}`
    ).join('\n')

    // 3 — Check for critical failures
    const criticalFailures = endpointResults.filter(e => !e.ok)
    const siteDown = !siteData

    // 4 — Generate health report
    const report = await groq(LUNA.buildCheckPrompt(siteData, endpointSummary))

    // 5 — Log to Supabase
    const status = (siteDown || criticalFailures.length > 0) ? 'critical' : 'healthy'
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Luna',
      action: 'health_check',
      details: JSON.stringify({ status, siteDown, criticalFailures: criticalFailures.length, endpointResults }),
    })

    // 6 — CRITICAL: email CEO immediately
    if (siteDown || criticalFailures.length > 0) {
      await sendEmail(
        `🚨 Luna — CRITICAL: Site issue detected`,
        `Luna detected a critical issue on g0ga.vercel.app.\n\n${endpointSummary}\n\n${report}\n\nAction required immediately.\n— Luna`
      )
    }

    // 7 — Monthly report (non-critical summary)
    else if (await isMonthlyReportDue()) {
      await supabaseAdmin.from('agent_logs').insert({
        agent: 'Luna',
        action: 'monthly_report_sent',
        details: 'Monthly health report sent to CEO',
      })
      await sendEmail(
        `🟢 Luna — Monthly Site Health Report`,
        `30-day site health summary.\n\n${endpointSummary}\n\n${report}\n\nNext report in 30 days.\n— Luna`
      )
    }

    res.status(200).json({ ok: true, status, criticalFailures: criticalFailures.length })
  } catch (err) {
    console.error('Luna error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
