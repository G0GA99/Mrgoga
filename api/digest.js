// digest.js — Weekly CEO Digest
// Runs at 12:30 AM PKT Monday (30 min after all agents)
// Collects all weekly reports from Supabase and sends ONE email to CEO

import { supabaseAdmin } from '../lib/supabase.js'

const RESEND_KEY  = process.env.RESEND_API_KEY
const ADMIN_TOKEN = process.env.ADMIN_SECRET

function isAuthorized(req) {
  return req.headers['x-admin-token'] === ADMIN_TOKEN
}

async function sendEmail(subject, text) {
  if (!RESEND_KEY) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'G0GA Team <onboarding@resend.dev>',
      to: 'gogamr0.01@gmail.com',
      subject, text
    })
  })
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Collect this week's logs from all reporting agents
    const { data: logs } = await supabaseAdmin
      .from('agent_logs')
      .select('*')
      .in('agent', ['Nova', 'Kai', 'Zion'])
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })

    if (!logs || logs.length === 0) {
      return res.status(200).json({ ok: true, message: 'No reports this week' })
    }

    // Get latest entry per agent
    const agentReports = {}
    for (const log of logs) {
      if (!agentReports[log.agent]) agentReports[log.agent] = log
    }

    // Also get new leads count this week
    const { data: newLeads } = await supabaseAdmin
      .from('leads')
      .select('id, name, service, budget, status')
      .gte('created_at', sevenDaysAgo)

    // Also get Scout prospects this week
    const { data: scoutLogs } = await supabaseAdmin
      .from('agent_logs')
      .select('details')
      .eq('agent', 'Scout')
      .eq('action', 'prospect_emailed')
      .gte('created_at', sevenDaysAgo)

    // Build ONE short digest email
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    let email = `G0GA — Weekly Update (${date})\n\n`

    // Nova
    if (agentReports['Nova']) {
      let d = {}
      try { d = JSON.parse(agentReports['Nova'].details) } catch {}
      email += `NOVA: ${d.linkedin?.posted ? 'Posted to LinkedIn ✅' : 'Content ready, LinkedIn pending 📝'}\n`
    }

    // Kai
    if (agentReports['Kai']) {
      const r = typeof agentReports['Kai'].details === 'string'
        ? agentReports['Kai'].details.slice(0, 300)
        : ''
      email += `\nKAI (SEO):\n${r}\n`
    }

    // Zion
    if (agentReports['Zion']) {
      let d = {}
      try { d = JSON.parse(agentReports['Zion'].details) } catch {}
      email += `\nZION: Blog written — "${d.topic || 'Weekly post'}"\n`
      email += `Medium: ${d.medium?.published ? `Published ✅ ${d.medium.url}` : 'Pending (add MEDIUM_TOKEN) 📝'}\n`
    }

    // Leads
    email += `\nLEADS THIS WEEK: ${newLeads?.length || 0}\n`
    if (newLeads?.length > 0) {
      newLeads.forEach((l, i) => {
        email += `  ${i+1}. ${l.name} — ${l.service || 'General'} — Budget: ${l.budget || '?'}\n`
      })
    }

    // Scout
    email += `\nSCOUT OUTREACH: ${scoutLogs?.length || 0} prospects contacted\n`
    if (scoutLogs?.length > 0) {
      scoutLogs.slice(0, 5).forEach((log, i) => {
        try {
          const d = JSON.parse(log.details)
          email += `  ${i+1}. ${d.company} (${d.location}) — ${d.score}\n`
        } catch {}
      })
    }

    email += `\nAdmin panel: https://g0ga.vercel.app/admin\n— G0GA Team`

    // Send ONE email
    await sendEmail(
      `📊 G0GA Weekly Digest — ${date}`,
      email
    )

    // Log digest sent
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Digest',
      action: 'weekly_digest_sent',
      details: `Weekly digest sent. Agents: ${Object.keys(agentReports).join(', ')}. Leads: ${newLeads?.length || 0}. Scout: ${scoutLogs?.length || 0}`,
    })

    res.status(200).json({ ok: true, agentsIncluded: Object.keys(agentReports) })
  } catch (err) {
    console.error('Digest error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
