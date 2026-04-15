import { supabaseAdmin } from './lib/supabase.js'

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
]

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

    // 1 — Generate blog post
    const content = await groq(`You are Zion, Content Creator at G0GA AI Agency. You write like a smart human who has actually lived through what they're writing about — not like an AI generating filler content.

Write a blog post on: "${topic}"

Your skills: SEO copywriting, long-form storytelling, conversion-focused writing, case study writing, headline testing psychology, audience tone matching, CTA optimization.

Who reads this: business owners in USA, UK, Canada, Europe who are thinking about AI or web solutions but haven't pulled the trigger yet.

How to write it:
- Headline: specific, bold, tells them exactly what they'll learn. No clickbait.
- Opening: hook them with a real situation or uncomfortable truth. 2-3 sentences max.
- Body: 3 sections. Each section starts with a plain-text title on its own line. Write like you're explaining to a smart friend — real examples, clear logic, no padding.
- End: one strong CTA pointing to g0ga.vercel.app. Make them feel it would be stupid NOT to check it out.
- Total: 520-580 words. No markdown symbols. No stars, no hashtags, no bullet dashes.

Write the full post. Start with the headline.`)

    // 2 — Save to Supabase
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Zion',
      action: 'content_created',
      details: JSON.stringify({ topic, content }),
    })

    // 3 — Email CEO for approval
    const subject = `✍️ Zion wrote a new blog post — approve to publish`
    const text = `Hi Hammad,\n\nZion has created a new blog post for G0GA:\n\nTOPIC: ${topic}\n\n${'─'.repeat(60)}\n\n${content}\n\n${'─'.repeat(60)}\n\nReply "APPROVE" to publish this on the G0GA website, or "EDIT: [your changes]" to revise.\n\nZion — AI Content Creator @ G0GA\nRunning automatically every Wednesday.`

    await sendEmail(subject, text)

    res.status(200).json({ ok: true, topic, message: 'Zion content email sent to CEO' })
  } catch (err) {
    console.error('Zion error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
