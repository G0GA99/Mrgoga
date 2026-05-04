import { supabaseAdmin } from '../lib/supabase.js'
import { AGENT as SCOUT } from '../lib/agents/scout.js'

const GROQ_KEY    = process.env.GROQ_API_KEY
const RESEND_KEY  = process.env.RESEND_API_KEY
const ADMIN_TOKEN = process.env.ADMIN_SECRET || 'g0ga-admin-2025'

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

async function readPage(url) {
  try {
    const r = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(10000)
    })
    return (await r.text()).slice(0, 1500)
  } catch { return null }
}

async function jinaSearch(query) {
  try {
    const r = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(12000)
    })
    return (await r.text()).slice(0, 2000)
  } catch { return null }
}

function extractEmail(text) {
  if (!text) return null
  const matches = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g)
  if (!matches) return null
  const filtered = matches.filter(e =>
    !e.includes('example.com') && !e.includes('sentry.io') &&
    !e.includes('@2x') && !e.includes('noreply') &&
    !e.includes('no-reply') && !e.includes('donotreply') &&
    !e.includes('wix') && !e.includes('wordpress') &&
    !e.includes('google') && !e.includes('schema') &&
    e.length < 60
  )
  return filtered[0] || null
}

// Full website deep scan — reads 5 pages in parallel
async function deepWebsiteScan(website) {
  const paths = ['', '/about', '/about-us', '/contact', '/contact-us', '/team', '/our-team']
  const results = await Promise.allSettled(
    paths.map(p => readPage(`${website}${p}`))
  )
  const pages = results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value)

  const combined = pages.join('\n---\n').slice(0, 5000)
  const email = extractEmail(combined)
  return { content: combined, email }
}

// Social media scan — LinkedIn + Instagram + Twitter search
async function socialScan(company, website) {
  const domain = website.replace(/https?:\/\//, '').replace(/\/.*/, '')

  const [linkedinSearch, socialSearch] = await Promise.allSettled([
    jinaSearch(`"${company}" LinkedIn company page employees`),
    jinaSearch(`"${company}" site:instagram.com OR site:twitter.com OR site:facebook.com`),
  ])

  const linkedin = linkedinSearch.status === 'fulfilled' ? linkedinSearch.value : ''
  const social   = socialSearch.status   === 'fulfilled' ? socialSearch.value   : ''

  // Try to read their LinkedIn page if URL found
  const linkedinUrl = linkedin?.match(/linkedin\.com\/company\/[\w-]+/)?.[0]
  let linkedinData = null
  if (linkedinUrl) {
    linkedinData = await readPage(`https://${linkedinUrl}`)
  }

  // Extract employee count, industry, followers from LinkedIn data
  const followers    = linkedinData?.match(/(\d[\d,]+)\s*followers/i)?.[1] || null
  const employees    = linkedinData?.match(/(\d[\d,]+)\s*employees/i)?.[1]  || null
  const linkedinDesc = linkedinData?.slice(0, 800) || linkedin?.slice(0, 500) || ''
  const socialSignal = social?.slice(0, 400) || ''

  return {
    linkedinUrl: linkedinUrl ? `https://${linkedinUrl}` : null,
    followers,
    employees,
    linkedinSummary: linkedinDesc,
    socialSignal,
    email: extractEmail(linkedinData || ''),
  }
}

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

async function alreadyContacted(company) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabaseAdmin
    .from('agent_logs').select('id').eq('agent', 'Scout')
    .eq('action', 'prospect_emailed').gte('created_at', thirtyDaysAgo)
    .ilike('details', `%${company}%`).limit(1)
  return data && data.length > 0
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })
  if (!GROQ_KEY) return res.status(500).json({ ok: false, error: 'GROQ_API_KEY not configured' })

  try {
    // 1 — Search for high-ticket prospects
    const queries = [
      'real estate agency Dubai Abu Dhabi contact email website',
      'private clinic hospital UAE Saudi Arabia website contact',
      'law firm consulting firm Dubai Riyadh website contact email',
      'luxury hotel resort UAE Qatar website contact',
      'investment firm wealth management Dubai website contact',
      'law firm accounting Germany UK Netherlands website contact email',
      'e-commerce brand Germany France website customer support contact',
      'real estate agency Spain Italy UK website contact email',
      'logistics company Europe website contact email',
      'manufacturing company Germany UK website contact email',
      'law firm consulting USA website contact email',
      'car dealership group USA Australia website contact',
      'marketing agency USA Canada website email',
      'healthcare clinic network USA website contact email',
    ]
    const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000))
    const query = queries[dayIndex % queries.length]

    const searchResults = await jinaSearch(query)
      || 'Find established high-ticket businesses: law firms UK/Germany, real estate Dubai, clinics UAE, e-commerce Europe, consulting USA.'

    // 2 — AI identifies prospects from search
    const prospectRaw = await groq(SCOUT.buildProspectPrompt(searchResults), 1200)

    // 3 — Parse prospects
    const prospects = []
    for (const block of prospectRaw.split(/\n(?=PROSPECT NAME:)/)) {
      const get = (key) => block.match(new RegExp(`${key}:\\s*(.+)`))?.[1]?.trim() || ''
      const company = get('PROSPECT NAME')
      const website = get('WEBSITE')
      const painPoint = get('PAIN POINT')
      if (company && website && painPoint) {
        prospects.push({ company, website, industry: get('INDUSTRY'), location: get('LOCATION'), budget: get('ESTIMATED BUDGET'), painPoint, hook: get('EMAIL HOOK'), score: get('PROSPECT SCORE') })
      }
    }

    // 4 — Deep research + email each prospect (max 4 — more research = better quality)
    const results = []

    for (const prospect of prospects.slice(0, 4)) {
      if (!prospect.company || !prospect.website) continue
      if (await alreadyContacted(prospect.company)) continue

      // DEEP RESEARCH — website + social in parallel
      const [webScan, social] = await Promise.allSettled([
        deepWebsiteScan(prospect.website),
        socialScan(prospect.company, prospect.website),
      ])

      const web  = webScan.status  === 'fulfilled' ? webScan.value  : { content: '', email: null }
      const soc  = social.status   === 'fulfilled' ? social.value   : { linkedinUrl: null, followers: null, employees: null, linkedinSummary: '', socialSignal: '', email: null }

      // Find email — website first, then LinkedIn
      const prospectEmail = web.email || soc.email

      // Build rich research context for AI
      const researchContext = [
        `WEBSITE CONTENT:\n${web.content}`,
        soc.linkedinUrl ? `\nLINKEDIN: ${soc.linkedinUrl}` : '',
        soc.followers   ? `Followers: ${soc.followers}`     : '',
        soc.employees   ? `Employees: ${soc.employees}`     : '',
        soc.linkedinSummary ? `\nLINKEDIN INFO:\n${soc.linkedinSummary}` : '',
        soc.socialSignal    ? `\nSOCIAL PRESENCE:\n${soc.socialSignal}`  : '',
      ].filter(Boolean).join('\n').slice(0, 4000)

      // AI writes personalized email with full research context
      const emailRaw = await groq(SCOUT.buildEmailPrompt(prospect, researchContext), 500)
      const lines  = emailRaw.split('\n').filter(l => l.trim())
      const subject = lines[0]?.replace(/^subject:\s*/i, '').trim() || `Quick idea for ${prospect.company}`
      const body    = lines.slice(lines[1] === '' ? 2 : 1).join('\n').trim()

      let emailSent = false
      if (prospectEmail) {
        emailSent = await sendProspectEmail(prospectEmail, subject, body)
      }

      // HOT lead instant alert
      if (emailSent && prospect.score?.toLowerCase().includes('hot')) {
        await sendCEOReport(
          `🔥 Scout — HOT LEAD contacted: ${prospect.company}`,
          `Scout emailed a HOT prospect.\n\n` +
          `Company: ${prospect.company}\n` +
          `Industry: ${prospect.industry} | ${prospect.location}\n` +
          `Budget: ${prospect.budget || 'High-ticket'}\n` +
          `LinkedIn: ${soc.linkedinUrl || 'Not found'}\n` +
          `Employees: ${soc.employees || '?'} | Followers: ${soc.followers || '?'}\n` +
          `Problem: ${prospect.painPoint}\n` +
          `Email sent to: ${prospectEmail}\n` +
          `Subject: "${subject}"\n\n` +
          `Email preview:\n${body.slice(0, 300)}\n\n— Scout`
        )
      }

      // Log to Supabase
      await supabaseAdmin.from('agent_logs').insert({
        agent: 'Scout', action: 'prospect_emailed',
        details: JSON.stringify({
          company: prospect.company, website: prospect.website,
          industry: prospect.industry, location: prospect.location,
          score: prospect.score, budget: prospect.budget,
          painPoint: prospect.painPoint,
          linkedin: soc.linkedinUrl || null,
          employees: soc.employees || null,
          followers: soc.followers || null,
          email: prospectEmail || 'not found',
          emailSent, subject,
        })
      })

      results.push({
        ...prospect,
        linkedin: soc.linkedinUrl,
        employees: soc.employees,
        followers: soc.followers,
        email: prospectEmail || 'not found',
        emailSent, subject,
        bodyPreview: body.slice(0, 200),
      })
    }

    // 5 — CEO summary email
    if (results.length > 0) {
      const sent    = results.filter(r => r.emailSent)
      const noEmail = results.filter(r => !r.emailSent)

      const list = results.map((p, i) =>
        `${i+1}. ${p.company} | ${p.industry} | ${p.location}\n` +
        `   Score: ${p.score} | Budget: ${p.budget || '?'}\n` +
        `   LinkedIn: ${p.linkedin || 'Not found'} | Employees: ${p.employees || '?'}\n` +
        `   Problem: ${p.painPoint}\n` +
        `   Email: ${p.email}\n` +
        `   Status: ${p.emailSent ? '✅ Email sent' : '❌ Email not found'}\n` +
        `   Subject: "${p.subject}"`
      ).join('\n\n')

      await sendCEOReport(
        `🎯 Scout — ${sent.length} clients contacted today`,
        `Scout ran — full website + social research done.\n\n` +
        `Prospects researched: ${results.length}\n` +
        `Emails sent: ${sent.length}\n` +
        `Email not found: ${noEmail.length}\n\n` +
        `HOT LEADS:\n${sent.filter(r => r.score?.toLowerCase().includes('hot')).map(r => `• ${r.company} — ${r.email} (${r.linkedin || 'no LinkedIn'})`).join('\n') || 'None today'}\n\n` +
        `ALL PROSPECTS:\n\n${list}\n\n` +
        `Replies go to: gogamr0.01@gmail.com\n— Scout`
      )
    }

    res.status(200).json({
      ok: true,
      prospectsFound: prospects.length,
      researched: results.length,
      emailsSent: results.filter(r => r.emailSent).length,
      emailsNotFound: results.filter(r => !r.emailSent).length,
      prospects: results.map(r => ({ company: r.company, location: r.location, score: r.score, linkedin: r.linkedin, employees: r.employees, email: r.email, emailSent: r.emailSent }))
    })

  } catch (err) {
    console.error('Scout error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
