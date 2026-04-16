import { supabaseAdmin } from '../lib/supabase.js'
import { ZION } from '../lib/agents/index.js'

const GROQ_KEY      = process.env.GROQ_API_KEY
const RESEND_KEY    = process.env.RESEND_API_KEY
const MEDIUM_TOKEN  = process.env.MEDIUM_TOKEN  // Get from medium.com/me/settings → Integration tokens

const TOPICS = [
  'How AI agents are replacing traditional software agencies in 2025',
  '5 ways AI automation saves businesses 40+ hours per week',
  'Why your business needs a chatbot before your competitor gets one',
  'From idea to launch in 7 days: how AI development agencies work',
  'The real cost of NOT using AI in your business (with numbers)',
  'How G0GA builds full web apps using AI — no shortcuts',
  'AI integration for e-commerce: what it costs and what you get',
  'Why 90% of AI chatbots fail — and how to build one that works',
  'What makes a great AI agency: 5 things to check before hiring one',
  'How small businesses in UK and Canada are using AI to beat bigger competitors',
  'Custom AI chatbot vs off-the-shelf: the honest cost comparison',
  'How to automate your sales follow-up using AI — a practical guide',
]

// Read top-ranking pages for research via Jina AI (free, no key)
async function readPage(url) {
  try {
    const r = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(8000)
    })
    const text = await r.text()
    return text.slice(0, 1200)
  } catch { return null }
}

async function groq(prompt) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.7,
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
      from: 'Zion — G0GA Content <onboarding@resend.dev>',
      to: 'gogamr0.01@gmail.com',
      subject,
      text,
    })
  })
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  try {
    // Pick topic based on week number
    const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
    const topic = TOPICS[week % TOPICS.length]

    // 1 — Zion researches: reads what's already ranking for this topic
    const searchSlug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)
    const [competitor1, competitor2] = await Promise.all([
      readPage(`https://www.forbes.com/search/?q=${encodeURIComponent(topic)}`),
      readPage(`https://r.jina.ai/https://www.hubspot.com/blog/search?page=1&term=${encodeURIComponent(topic)}`),
    ])

    const researchContext = (competitor1 || competitor2)
      ? `RESEARCH — what's already written on this topic:\n${competitor1 || ''}\n${competitor2 || ''}`
      : ''

    // 2 — Generate blog post with research context
    const content = await groq(ZION.buildPrompt(topic, researchContext))

    // 3 — Publish to Medium (if token configured)
    let mediumResult = { skipped: true }
    if (MEDIUM_TOKEN) {
      try {
        // Get Medium user ID first
        const meRes = await fetch('https://api.medium.com/v1/me', {
          headers: { 'Authorization': `Bearer ${MEDIUM_TOKEN}`, 'Content-Type': 'application/json' }
        })
        const meData = await meRes.json()
        const userId = meData.data?.id

        if (userId) {
          const pubRes = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${MEDIUM_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: topic,
              contentFormat: 'markdown',
              content: content,
              tags: ['AI', 'Technology', 'Business', 'Digital Agency'],
              publishStatus: 'public',
            })
          })
          const pubData = await pubRes.json()
          mediumResult = pubRes.ok
            ? { published: true, url: pubData.data?.url }
            : { published: false, error: pubData.errors?.[0]?.message }
        }
      } catch (e) {
        mediumResult = { published: false, error: e.message }
      }
    }

    // 4 — Save to Supabase
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Zion',
      action: 'content_created',
      details: JSON.stringify({ topic, content, medium: mediumResult }),
    })

    // 5 — Weekly email to CEO (Zion runs Wednesday — always send)
    const mediumStatus = mediumResult.published
      ? `✅ Published on Medium: ${mediumResult.url}`
      : mediumResult.skipped
        ? '📝 Medium not connected (add MEDIUM_TOKEN to Vercel to auto-publish)'
        : `⚠️ Medium publish failed: ${mediumResult.error}`

    const subject = `✍️ Zion — Weekly Blog: ${topic.slice(0, 50)}`
    const text = `Weekly blog post created.\n\nTopic: ${topic}\n\n${mediumStatus}\n\n---\n\n${content}\n\n— Zion`

    await sendEmail(subject, text)

    res.status(200).json({ ok: true, topic, medium: mediumResult })
  } catch (err) {
    console.error('Zion error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
