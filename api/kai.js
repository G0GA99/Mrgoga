import { supabaseAdmin } from './lib/supabase.js'
import { KAI } from './lib/agents/index.js'

const GROQ_KEY  = process.env.GROQ_API_KEY
const RESEND_KEY = process.env.RESEND_API_KEY
const SITE_URL  = 'https://g0ga.vercel.app'

async function groq(prompt) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
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
  // Allow manual trigger (GET) and Vercel Cron (GET with header)
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  try {
    // 1 — Kai generates SEO report using Groq
    const report = await groq(KAI.buildPrompt())

    // 2 — Log to Supabase
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Kai',
      action: 'seo_report',
      details: report,
    })

    // 3 — Email CEO
    const subject = `📈 Kai's Weekly SEO Report — ${new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}`
    const text = `Hi Hammad,\n\nHere's your weekly SEO report from Kai:\n\n${report}\n\n---\nKai — AI SEO Specialist @ G0GA\nRunning automatically every Monday.`

    await sendEmail(subject, text)

    res.status(200).json({ ok: true, message: 'Kai SEO report sent' })
  } catch (err) {
    console.error('Kai error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
