import { supabaseAdmin } from './lib/supabase.js'

const RESEND_KEY = process.env.RESEND_API_KEY

// Vault — called when client sends payment confirmation (tx hash via WhatsApp/email)
// Also used as manual trigger: POST /api/vault with { projectId, amount, txHash, currency, stage }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { projectId, clientName, amount, currency = 'USDT', txHash, stage = '50%' } = req.body

  if (!clientName || !amount) return res.status(400).json({ error: 'clientName and amount required' })

  try {
    // 1 — Update project paid amount in Supabase
    if (projectId) {
      const { data: project } = await supabaseAdmin
        .from('projects').select('paid_amount, budget_total').eq('id', projectId).single()

      if (project) {
        const newPaid = (project.paid_amount || 0) + parseFloat(amount)
        const newStatus = newPaid >= (project.budget_total || 0) ? 'delivered' : 'in_progress'
        await supabaseAdmin.from('projects').update({ paid_amount: newPaid, status: newStatus }).eq('id', projectId)
      }
    }

    // 2 — Log to agent_logs
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Vault',
      action: 'payment_received',
      details: `${stage} payment — ${amount} ${currency} from ${clientName}. TX: ${txHash || 'pending'}`,
      project_id: projectId || null,
    })

    // 3 — Email CEO
    const stageMessages = {
      '50%': 'Project kaam shuru kar sakte ho ✅',
      '30%': 'Midpoint payment received — delivery proceed karo ✅',
      '20%': 'Final payment received — project close karo ✅',
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Vault — G0GA Payments <onboarding@resend.dev>',
        to: 'gogamr0.01@gmail.com',
        subject: `💰 Payment Received — ${amount} ${currency} from ${clientName} (${stage})`,
        text:
          `Payment Alert from Vault!\n\n` +
          `CLIENT: ${clientName}\n` +
          `AMOUNT: ${amount} ${currency}\n` +
          `STAGE: ${stage}\n` +
          `TX HASH: ${txHash || 'Not provided'}\n\n` +
          `ACTION: ${stageMessages[stage] || 'Payment logged.'}\n\n` +
          `View dashboard: https://g0ga.vercel.app/admin\n\n` +
          `Vault — AI Payment Manager @ G0GA`,
      }),
    })

    res.status(200).json({ ok: true, message: `Payment logged — CEO notified` })
  } catch (err) {
    console.error('Vault error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
