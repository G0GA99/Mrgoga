import { supabaseAdmin } from '../lib/supabase.js'
import { NOVA } from '../lib/agents/index.js'

const GROQ_KEY       = process.env.GROQ_API_KEY
const RESEND_KEY     = process.env.RESEND_API_KEY
const LINKEDIN_TOKEN = process.env.LINKEDIN_TOKEN     // add later
const LINKEDIN_ORG   = process.env.LINKEDIN_ORG_ID   // add later

const POST_TYPES = [
  'tip',        // "5 ways AI saves you time"
  'case_study', // "We built X for client Y, here's what happened"
  'question',   // "Are you still doing X manually? Here's why that's costing you"
  'insight',    // Industry news + G0GA take
  'offer',      // Service promotion
]

async function groq(prompt) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.8,
    })
  })
  const j = await r.json()
  return j.choices?.[0]?.message?.content || ''
}

async function postToLinkedIn(text) {
  if (!LINKEDIN_TOKEN || !LINKEDIN_ORG) return { skipped: true, reason: 'LinkedIn not configured yet' }

  const r = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:organization:${LINKEDIN_ORG}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        }
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
    })
  })
  return r.ok ? { posted: true } : { posted: false, error: await r.text() }
}

async function sendEmail(subject, text) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Nova — G0GA Marketing <onboarding@resend.dev>',
      to: 'gogamr0.01@gmail.com',
      subject,
      text,
    })
  })
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  try {
    const day = new Date().getDay() // 0=Sun ... 6=Sat
    const type = POST_TYPES[day % POST_TYPES.length]

    // 1 — Generate social post
    const post = await groq(NOVA.buildPrompt(type))

    // 2 — Try to post to LinkedIn (if configured)
    const linkedinResult = await postToLinkedIn(post)

    // 3 — Log to Supabase
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Nova',
      action: linkedinResult.posted ? 'posted_linkedin' : 'content_ready',
      details: JSON.stringify({ type, post, linkedin: linkedinResult }),
    })

    // 4 — Email CEO with preview
    const status = linkedinResult.posted
      ? '✅ Posted to LinkedIn Company Page'
      : linkedinResult.skipped
        ? '📝 Content ready (LinkedIn not connected yet — add LINKEDIN_TOKEN to Vercel)'
        : '⚠️ LinkedIn post failed — content saved'

    await sendEmail(
      `📣 Nova's Daily Post — ${status}`,
      `Hi Hammad,\n\nNova's daily content for today (${new Date().toLocaleDateString()}):\n\nTYPE: ${type.replace('_',' ').toUpperCase()}\nSTATUS: ${status}\n\n${'─'.repeat(60)}\n\n${post}\n\n${'─'.repeat(60)}\n\nNova — AI Marketing Manager @ G0GA\nRunning automatically every day at 10am.`
    )

    res.status(200).json({ ok: true, type, linkedin: linkedinResult })
  } catch (err) {
    console.error('Nova error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
