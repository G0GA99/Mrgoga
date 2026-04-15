// api/dev.js — Developer Agent Endpoint
// One endpoint for all 5 developers: Orion, Cypher, Blaze, Atlas, Rex
// Called by Zara after assigning a project, or manually triggered
// ?agent=orion&project_id=xxx OR body: { agent, project_id }

import { supabaseAdmin } from '../lib/supabase.js'
import { getDeveloper } from '../lib/agents/developers.js'

const GROQ_KEY   = process.env.GROQ_API_KEY
const RESEND_KEY = process.env.RESEND_API_KEY

async function groq(systemPrompt, userMessage) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 900,
      temperature: 0.4,
    })
  })
  const j = await r.json()
  return j.choices?.[0]?.message?.content || ''
}

async function sendEmail(from, subject, text) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: 'gogamr0.01@gmail.com',
      subject,
      text,
    })
  })
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  // Get agent name and project_id from query or body
  const agentName = (req.query.agent || req.body?.agent || 'orion').toLowerCase()
  const projectId = req.query.project_id || req.body?.project_id

  const dev = getDeveloper(agentName.charAt(0).toUpperCase() + agentName.slice(1))

  try {
    // 1 — Load project from Supabase (or use test brief if no project_id)
    let project = null
    let brief = ''

    if (projectId) {
      const { data } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      project = data
      brief = project?.description || 'No brief provided'
    } else {
      // Test mode — generic brief
      brief = `New project assigned to ${dev.name}. Client needs help with ${dev.specializes[0]}. Please create a detailed plan.`
    }

    // 2 — Developer analyzes project and creates technical plan
    const userMessage = `You have just been assigned this project. Read it carefully and create your full technical report.

PROJECT BRIEF:
${brief}

CLIENT: ${project?.client_name || 'New Client'}
SERVICE: ${project?.service || dev.specializes[0]}
STATUS: ${project?.status || 'inquiry'}

Write your complete technical plan now.`

    const plan = await groq(dev.systemPrompt, userMessage)

    // 3 — Log to Supabase
    await supabaseAdmin.from('agent_logs').insert({
      agent: dev.name,
      action: 'technical_plan_created',
      details: JSON.stringify({ project_id: projectId, plan }),
      project_id: projectId || null,
    })

    // 4 — Update project notes if project exists
    if (project?.id) {
      await supabaseAdmin.from('projects').update({
        notes: `Technical plan from ${dev.name} (${new Date().toISOString()}):\n\n${plan}`,
        status: 'in_progress',
      }).eq('id', project.id)
    }

    // 5 — Email CEO with developer's plan
    const subject = `⚙️ ${dev.name} — Technical Plan Ready: ${project?.title || dev.specializes[0]}`
    const text = `Hi HammadSharif,

${dev.name} (${dev.role}) has reviewed the project and created a technical plan.

CLIENT: ${project?.client_name || 'Test'}
SERVICE: ${project?.service || dev.specializes[0]}

${'─'.repeat(60)}

${plan}

${'─'.repeat(60)}

Reply "GO ${dev.name.toUpperCase()}" to approve and let ${dev.name} begin.

${dev.name} — ${dev.role} @ G0GA`

    await sendEmail(
      `${dev.name} — G0GA ${dev.role} <onboarding@resend.dev>`,
      subject,
      text
    )

    res.status(200).json({
      ok: true,
      developer: dev.name,
      role: dev.role,
      project: project?.title || 'Test project',
      message: `${dev.name} technical plan sent to CEO`,
    })

  } catch (err) {
    console.error(`${dev.name} error:`, err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
