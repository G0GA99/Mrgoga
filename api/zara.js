import { supabaseAdmin } from '../lib/supabase.js'
import { ZARA, assignDeveloper } from '../lib/agents/index.js'

const GROQ_KEY   = process.env.GROQ_API_KEY
const RESEND_KEY = process.env.RESEND_API_KEY



async function groq(prompt) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.3,
    })
  })
  const j = await r.json()
  return j.choices?.[0]?.message?.content || ''
}

async function sendEmail(to, subject, text) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Zara — G0GA Project Manager <onboarding@resend.dev>', to, subject, text })
  })
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  try {
    // 1 — Get new leads that haven't been processed by Zara yet
    const { data: newLeads } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('status', 'new')
      .order('created_at', { ascending: true })
      .limit(5)

    if (!newLeads || newLeads.length === 0) {
      return res.status(200).json({ ok: true, message: 'No new leads to process' })
    }

    const processed = []

    for (const lead of newLeads) {
      // 2 — Zara researches and creates project brief
      const brief = await groq(ZARA.buildPrompt(lead))

      // 3 — Assign to developer
      const assignedTo = assignDeveloper(lead.service).name

      // 4 — Create project in Supabase
      const { data: project } = await supabaseAdmin.from('projects').insert({
        lead_id: lead.id,
        client_name: lead.name,
        client_email: lead.email,
        title: `${lead.service || 'Project'} for ${lead.name}`,
        description: brief,
        service: lead.service,
        budget_total: null,
        status: 'inquiry',
        assigned_to: assignedTo,
        notes: `Auto-assigned by Zara on ${new Date().toISOString()}`,
      }).select().single()

      // 5 — Log Zara's action
      await supabaseAdmin.from('agent_logs').insert({
        agent: 'Zara',
        action: 'project_created',
        details: `Created project for ${lead.name}, assigned to ${assignedTo}`,
        project_id: project?.id,
      })

      // 6 — Update lead status
      await supabaseAdmin.from('leads').update({ status: 'contacted' }).eq('id', lead.id)

      // 7 — Email CEO with brief + assignment
      await sendEmail(
        'gogamr0.01@gmail.com',
        `📋 Zara: New project brief ready — ${lead.name} (${lead.service || 'General'})`,
        `New lead — ${lead.name} (${lead.service || 'General'})\n` +
        `Email: ${lead.email} | Budget: ${lead.budget || '?'}\n` +
        `Assigned to: ${assignedTo}\n\n` +
        `${brief}\n\n` +
        `Reply APPROVE to start or HOLD to wait. — Zara`
      )

      processed.push({ lead: lead.name, assignedTo })
    }

    res.status(200).json({ ok: true, processed })
  } catch (err) {
    console.error('Zara error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
