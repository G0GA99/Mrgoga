import { supabaseAdmin } from '../lib/supabase.js'
import { AGENT as SCOUT } from '../lib/agents/scout.js'

const GROQ_KEY    = process.env.GROQ_API_KEY
const RESEND_KEY  = process.env.RESEND_API_KEY
const ADMIN_TOKEN = process.env.ADMIN_SECRET

function isAuthorized(req) {
  return req.headers['x-admin-token'] === ADMIN_TOKEN
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

// Read any webpage via Jina AI (free)
async function readPage(url) {
  try {
    const r = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(10000)
    })
    return (await r.text()).slice(0, 2000)
  } catch { return null }
}

// Search web via Jina AI search (free, no key)
async function jinaSearch(query) {
  try {
    const r = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(12000)
    })
    return (await r.text()).slice(0, 2000)
  } catch { return null }
}

// Extract email from website content
function extractEmail(text) {
  if (!text) return null
  const matches = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g)
  if (!matches) return null
  // Filter out common non-contact emails
  const filtered = matches.filter(e =>
    !e.includes('example.com') &&
    !e.includes('sentry.io') &&
    !e.includes('@2x') &&
    !e.includes('noreply') &&
    !e.includes('no-reply') &&
    !e.includes('donotreply') &&
    e.length < 60
  )
  return filtered[0] || null
}

// Send cold email to prospect
async function sendProspectEmail(to, subject, body) {
  if (!RESEND_KEY) return false
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Scout — G0GA AI Agency <onboarding@resend.dev>',
        to,
        subject,
        text: body,
        reply_to: 'gogamr0.01@gmail.com',
      })
    })
    return r.ok
  } catch { return false }
}

// Send CEO report
async function sendCEOReport(subject, text) {
  if (!RESEND_KEY) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Scout — G0GA Outreach <onboarding@resend.dev>',
      to: 'gogamr0.01@gmail.com',
      subject,
      text,
    })
  })
}

// Check if already contacted in last 30 days
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
    // 1 — Search globally for high-ticket prospects, rotating daily
    const queries = [
      // Middle East — high-budget markets
      'real estate agency Dubai Abu Dhabi website AI chatbot contact email',
      'private clinic hospital UAE Saudi Arabia website contact automation',
      'law firm consulting firm Dubai Riyadh website no client portal email',
      'luxury hotel resort UAE Qatar website contact no AI chatbot',
      'investment firm wealth management Dubai website contact email',
      // Europe — established businesses
      'law firm accounting Germany UK Netherlands website contact email no automation',
      'e-commerce brand Germany France website customer support no chatbot contact',
      'real estate agency Spain Italy UK website no AI chatbot contact email',
      'logistics company Europe website no dashboard contact email',
      'manufacturing company Germany UK website no automation contact email',
      // USA/Canada/Australia — high-ticket
      'law firm consulting USA website no AI client portal contact email',
      'car dealership group USA Australia website no AI assistant contact',
      'marketing agency USA Canada white label AI services website email',
      'healthcare clinic network USA website no booking automation contact email',
    ]
    const dayIndex = new Date().getDay() + Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % 7
    const query = queries[dayIndex % queries.length]

    const searchResults = await jinaSearch(query)
      || `Find established high-ticket businesses globally: law firms in UK/Germany, real estate agencies in Dubai, private clinics in UAE, e-commerce brands in Europe, consulting firms in USA. These are profitable businesses that need AI chatbots, automation, data dashboards, or modern websites.`

    // 2 — Scout identifies prospects
    const prospectRaw = await groq(SCOUT.buildProspectPrompt(searchResults), 1200)

    // 3 — Parse prospects
    const prospects = []
    const blocks = prospectRaw.split(/\n(?=PROSPECT NAME:)/)
    for (const block of blocks) {
      const get = (key) => {
        const match = block.match(new RegExp(`${key}:\\s*(.+)`))
        return match ? match[1].trim() : ''
      }
      const company = get('PROSPECT NAME')
      const website = get('WEBSITE')
      const painPoint = get('PAIN POINT')
      if (company && website && painPoint) {
        prospects.push({
          company,
          website,
          industry: get('INDUSTRY'),
          location: get('LOCATION'),
          budget: get('ESTIMATED BUDGET'),
          painPoint,
          hook: get('EMAIL HOOK'),
          score: get('PROSPECT SCORE'),
        })
      }
    }

    // 4 — For each prospect: read site, find email, send personalized email
    const results = []

    for (const prospect of prospects.slice(0, 6)) {
      if (!prospect.company || !prospect.website) continue

      // Skip if contacted recently
      if (await alreadyContacted(prospect.company)) continue

      // Read their website to find email + more context
      const homepageData = await readPage(prospect.website)
      const contactData = await readPage(`${prospect.website}/contact`)
        || await readPage(`${prospect.website}/contact-us`)

      const siteData = [homepageData, contactData].filter(Boolean).join('\n').slice(0, 2500)

      // Extract email from site
      const prospectEmail = extractEmail(siteData)

      // Generate personalized cold email (pass budget context)
      const emailRaw = await groq(SCOUT.buildEmailPrompt(prospect, siteData), 400)
      const lines = emailRaw.split('\n').filter(l => l.trim())
      const subject = lines[0]?.replace(/^subject:\s*/i, '').trim() || `Quick idea for ${prospect.company}`
      const body = lines.slice(lines[1] === '' ? 2 : 1).join('\n').trim()

      let emailSent = false

      // Send email if we found their address
      if (prospectEmail) {
        emailSent = await sendProspectEmail(prospectEmail, subject, body)
      }

      // Log to Supabase
      await supabaseAdmin.from('agent_logs').insert({
        agent: 'Scout',
        action: 'prospect_emailed',
        details: JSON.stringify({
          company: prospect.company,
          website: prospect.website,
          industry: prospect.industry,
          location: prospect.location,
          score: prospect.score,
          painPoint: prospect.painPoint,
          email: prospectEmail || 'not found',
          emailSent,
          subject,
        })
      })

      results.push({
        ...prospect,
        email: prospectEmail || 'not found',
        emailSent,
        subject,
        bodyPreview: body.slice(0, 200),
      })
    }

    // 5 — ONE CEO report with all data
    if (results.length > 0) {
      const sent = results.filter(r => r.emailSent)
      const noEmail = results.filter(r => !r.emailSent)

      const prospectList = results.map((p, i) =>
        `${i + 1}. ${p.company} | ${p.industry} | ${p.location}
   Score: ${p.score}
   Problem: ${p.painPoint}
   Email: ${p.email}
   Contacted: ${p.emailSent ? '✅ Email sent' : '❌ Email not found on site'}
   Subject sent: "${p.subject}"`
      ).join('\n\n')

      const summary =
        `Scout ran today.\n\n` +
        `Prospects found: ${results.length}\n` +
        `Emails sent: ${sent.length}\n` +
        `Email not found: ${noEmail.length}\n\n` +
        `HOT LEADS (reply to gogamr0.01@gmail.com):\n` +
        `${sent.filter(r => r.score?.toLowerCase().includes('hot')).map(r => `• ${r.company} — ${r.email}`).join('\n') || 'None today'}\n\n` +
        `ALL PROSPECTS:\n\n${prospectList}\n\n` +
        `Client replies go to: gogamr0.01@gmail.com\n— Scout`

      await sendCEOReport(
        `🎯 Scout — ${sent.length} clients contacted today`,
        summary
      )
    }

    res.status(200).json({
      ok: true,
      prospectsFound: prospects.length,
      emailsSent: results.filter(r => r.emailSent).length,
      emailsNotFound: results.filter(r => !r.emailSent).length,
    })

  } catch (err) {
    console.error('Scout error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
