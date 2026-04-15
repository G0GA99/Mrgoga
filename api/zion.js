import { supabaseAdmin } from '../lib/supabase.js'
import { ZION } from '../lib/agents/index.js'

const GROQ_KEY   = process.env.GROQ_API_KEY
const RESEND_KEY = process.env.RESEND_API_KEY

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

    // 3 — Save to Supabase
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Zion',
      action: 'content_created',
      details: JSON.stringify({ topic, content }),
    })

    // 4 — Email CEO for approval
    const subject = `✍️ Zion — New blog post: ${topic.slice(0, 50)}`
    const text = `New blog post ready.\n\nTopic: ${topic}\n\n${content}\n\nReply APPROVE to publish or EDIT: [changes]. — Zion`

    await sendEmail(subject, text)

    res.status(200).json({ ok: true, topic, message: 'Zion content email sent to CEO' })
  } catch (err) {
    console.error('Zion error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
