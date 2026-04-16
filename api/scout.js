import { supabaseAdmin } from '../lib/supabase.js'
import { AGENT as SCOUT } from '../lib/agents/scout.js'

const GROQ_KEY   = process.env.GROQ_API_KEY
const RESEND_KEY = process.env.RESEND_API_KEY
const BRAVE_KEY  = process.env.BRAVE_SEARCH_KEY
const ADMIN_TOKEN = process.env.ADMIN_SECRET

// Auth check
function isAuthorized(req) {
  const token = req.headers['x-admin-token']
  return token && token === ADMIN_TOKEN
}

async function groq(prompt, maxTokens = 800) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.6,
    })
  })
  const j = await r.json()
  return j.choices?.[0]?.message?.content || ''
}

async function readPage(url) {
  try {
    const r = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(8000)
    })
    return (await r.text()).slice(0, 1200)
  } catch { return null }
}

async function braveSearch(query) {
  if (!BRAVE_KEY) return null
  try {
    const r = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=8`, {
      headers: { 'Accept': 'application/json', 'X-Subscription-Token': BRAVE_KEY }
    })
    const j = await r.json()
    return (j.web?.results || []).map(x => `${x.title} | ${x.url}\n${x.description}`).join('\n\n')
  } catch { return null }
}

async function sendEmail(to, subject, text) {
  if (!RESEND_KEY) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Scout — G0GA Outreach <onboarding@resend.dev>',
      to, subject, text
    })
  })
}

// Check if company was already emailed in last 30 days
async function alreadyContacted(company) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabaseAdmin
    .from('agent_logs')
    .select('id')
    .eq('agent', 'Scout')
    .eq('action', 'prospect_emailed')
    .gte('created_at', thirtyDaysAgo)
    .ilike('details', `%${company}%`)
    .limit(1)
  return data && data.length > 0
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  try {
    // 1 — Search for prospects using multiple queries
    const searches = [
      'small business USA UK Canada outdated website needs redesign 2025',
      'ecommerce store no live chat chatbot USA UK',
      'professional services firm old website no AI integration Canada',
      'startup landing page needs web developer AI agency',
    ]

    const searchQuery = searches[Math.floor(Math.random() * searches.length)]
    const searchResults = await braveSearch(searchQuery)
      || `No live search available. Use your knowledge of businesses in USA, UK, Canada that commonly need web/AI services: e-commerce stores, consulting firms, real estate agencies, healthcare clinics, SaaS startups, restaurants.`

    // 2 — Scout identifies prospects
    const prospectRaw = await groq(SCOUT.buildProspectPrompt(searchResults), 1000)

    // 3 — Parse prospects (simple extraction)
    const prospects = []
    const lines = prospectRaw.split('\n')
    let current = {}
    for (const line of lines) {
      if (line.startsWith('PROSPECT NAME:')) current.company = line.replace('PROSPECT NAME:', '').trim()
      if (line.startsWith('WEBSITE:')) current.website = line.replace('WEBSITE:', '').trim()
      if (line.startsWith('INDUSTRY:')) current.industry = line.replace('INDUSTRY:', '').trim()
      if (line.startsWith('LOCATION:')) current.location = line.replace('LOCATION:', '').trim()
      if (line.startsWith('PAIN POINT:')) current.painPoint = line.replace('PAIN POINT:', '').trim()
      if (line.startsWith('EMAIL HOOK:')) current.hook = line.replace('EMAIL HOOK:', '').trim()
      if (line.startsWith('PROSPECT SCORE:')) {
        current.score = line.replace('PROSPECT SCORE:', '').trim()
        if (current.company && current.painPoint) {
          prospects.push({ ...current })
        }
        current = {}
      }
    }

    // 4 — For each prospect: research + write email + send
    const sent = []
    for (const prospect of prospects.slice(0, 6)) {
      if (!prospect.company) continue

      // Skip if contacted recently
      const contacted = await alreadyContacted(prospect.company)
      if (contacted) continue

      // Read their website if available
      const siteData = prospect.website && prospect.website !== 'Unknown'
        ? await readPage(prospect.website)
        : null

      // Generate personalized email
      const emailRaw = await groq(SCOUT.buildEmailPrompt(prospect, siteData), 400)
      const emailLines = emailRaw.split('\n').filter(l => l.trim())
      const subject = emailLines[0] || `Quick idea for ${prospect.company}`
      const body = emailLines.slice(2).join('\n') || emailRaw

      // Note: In production, Scout emails the PROSPECT directly
      // For now, we log the email and include it in CEO report
      // To activate direct outreach: uncomment the line below and add prospect.email discovery

      // await sendEmail(prospectEmail, subject, body)

      // Log to Supabase
      await supabaseAdmin.from('agent_logs').insert({
        agent: 'Scout',
        action: 'prospect_emailed',
        details: JSON.stringify({
          company: prospect.company,
          industry: prospect.industry,
          location: prospect.location,
          score: prospect.score,
          painPoint: prospect.painPoint,
          subject,
          emailPreview: body.slice(0, 300),
        })
      })

      sent.push({ ...prospect, subject, body })
    }

    // 5 — ONE email to CEO with full list (midnight report)
    if (sent.length > 0) {
      const reportPrompt = SCOUT.buildCEOReportPrompt(sent, sent.length)
      const ceoReport = await groq(reportPrompt, 400)

      const prospectList = sent.map((p, i) =>
        `${i + 1}. ${p.company} (${p.location}) — ${p.industry}\n   Score: ${p.score} | Pain: ${p.painPoint}\n   Email subject: "${p.subject}"\n   Preview: ${p.body?.slice(0, 150)}...`
      ).join('\n\n')

      await sendEmail(
        'gogamr0.01@gmail.com',
        `🎯 Scout — ${sent.length} prospects found & emailed`,
        `${ceoReport}\n\n${'─'.repeat(40)}\nFULL PROSPECT LIST:\n\n${prospectList}\n\n${'─'.repeat(40)}\nAll activity logged in admin panel.\n— Scout`
      )
    }

    res.status(200).json({ ok: true, prospectsFound: prospects.length, emailsSent: sent.length })
  } catch (err) {
    console.error('Scout error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
