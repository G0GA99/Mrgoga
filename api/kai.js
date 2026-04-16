import { supabaseAdmin } from '../lib/supabase.js'
import { KAI } from '../lib/agents/index.js'

const GROQ_KEY   = process.env.GROQ_API_KEY
const RESEND_KEY = process.env.RESEND_API_KEY
const BRAVE_KEY  = process.env.BRAVE_SEARCH_KEY  // optional — add later

// Web search via Brave (if key available) or fallback to Jina
async function webSearch(query) {
  if (BRAVE_KEY) {
    const r = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`, {
      headers: { 'Accept': 'application/json', 'X-Subscription-Token': BRAVE_KEY }
    })
    const j = await r.json()
    return (j.web?.results || []).map(x => `${x.title}: ${x.url}\n${x.description}`).join('\n\n')
  }
  return null
}

// Read any webpage content via Jina AI (free, no key)
async function readPage(url) {
  try {
    const r = await fetch(`https://r.jina.ai/${url}`, { headers: { 'Accept': 'text/plain' }, signal: AbortSignal.timeout(8000) })
    const text = await r.text()
    return text.slice(0, 1500) // first 1500 chars
  } catch { return null }
}

async function groq(prompt) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 900,
      temperature: 0.4,
    })
  })
  const j = await r.json()
  return j.choices?.[0]?.message?.content || ''
}

async function sendEmail(subject, text) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Kai — G0GA SEO <onboarding@resend.dev>',
      to: 'gogamr0.01@gmail.com',
      subject,
      text,
    })
  })
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  try {
    // 1 — Kai researches: reads G0GA site + checks competitor
    const [siteData, competitorData, searchData] = await Promise.all([
      readPage('https://g0ga.vercel.app'),
      readPage('https://www.appinventiv.com/ai-development/'),  // competitor example
      webSearch('hire AI chatbot developer agency USA UK 2025'),
    ])

    // 2 — Build research context
    const researchContext = `
LIVE DATA KAI GATHERED THIS WEEK:

G0GA WEBSITE (what Google sees right now):
${siteData || 'Could not read — site may be slow'}

COMPETITOR SNAPSHOT (Appinventiv AI page):
${competitorData || 'Could not read'}

SEARCH RESULTS FOR "hire AI chatbot developer agency":
${searchData || 'Brave Search not connected yet — use knowledge-based analysis'}
`.trim()

    // 3 — Kai generates SEO report with real context
    const report = await groq(KAI.buildPrompt(researchContext))

    // 4 — Log to Supabase
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Kai',
      action: 'seo_report',
      details: report,
    })

    // No individual CEO email — digest.js collects all reports at 12:30am Monday
    res.status(200).json({ ok: true, message: 'Kai SEO report saved' })
  } catch (err) {
    console.error('Kai error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
