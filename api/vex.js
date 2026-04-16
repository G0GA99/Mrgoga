import { supabaseAdmin } from '../lib/supabase.js'
import { AGENT as VEX } from '../lib/agents/vex.js'

const GROQ_KEY    = process.env.GROQ_API_KEY
const RESEND_KEY  = process.env.RESEND_API_KEY
const BRAVE_KEY   = process.env.BRAVE_SEARCH_KEY
const ADMIN_TOKEN = process.env.ADMIN_SECRET

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
      max_tokens: 600, temperature: 0.4,
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

async function braveSearch(query) {
  if (!BRAVE_KEY) return null
  try {
    const r = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`, {
      headers: { 'Accept': 'application/json', 'X-Subscription-Token': BRAVE_KEY }
    })
    const j = await r.json()
    return (j.web?.results || []).map(x => `${x.title}: ${x.description}`).join('\n')
  } catch { return null }
}

async function sendEmail(subject, text) {
  if (!RESEND_KEY) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Vex — G0GA Brand <onboarding@resend.dev>',
      to: 'gogamr0.01@gmail.com',
      subject, text
    })
  })
}

async function isMonthlyReportDue() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabaseAdmin
    .from('agent_logs').select('id')
    .eq('agent', 'Vex').eq('action', 'monthly_report_sent')
    .gte('created_at', thirtyDaysAgo).limit(1)
  return !data || data.length === 0
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  try {
    // 1 — Search for G0GA mentions + competitor activity
    const [mentionsData, competitorData] = await Promise.all([
      braveSearch('G0GA AI Agency g0ga.vercel.app MrGoga'),
      readPage('https://www.appinventiv.com/ai-development/'),
    ])

    // 2 — Generate reputation report
    const report = await groq(VEX.buildPrompt(mentionsData, competitorData))

    // 3 — Log to Supabase
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Vex',
      action: 'reputation_check',
      details: JSON.stringify({ report, hasData: !!(mentionsData || competitorData) }),
    })

    // 4 — Monthly report only
    if (await isMonthlyReportDue()) {
      await supabaseAdmin.from('agent_logs').insert({
        agent: 'Vex', action: 'monthly_report_sent',
        details: 'Monthly reputation report sent to CEO',
      })
      await sendEmail(
        `🔍 Vex — Monthly Brand & Competitor Report`,
        `30-day brand intelligence summary.\n\n${report}\n\nNext report in 30 days.\n— Vex`
      )
    }

    res.status(200).json({ ok: true, reportReady: true })
  } catch (err) {
    console.error('Vex error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
