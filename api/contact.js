import { supabaseAdmin } from '../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, company, service, budget, message } = req.body

  // 1 — Save lead to Supabase
  try {
    await supabaseAdmin.from('leads').insert({
      name,
      email,
      company: company || null,
      service: service || null,
      budget: budget || null,
      message,
      source: 'contact_form',
      status: 'new',
    })
  } catch (dbErr) {
    console.error('Supabase insert error:', dbErr)
    // Don't block email — continue even if DB fails
  }

  // 2 — Send email via Resend
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer re_eqMrGQEn_AW3SgKgzTUYauWzqkC8SvHum`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'G0GA Website <onboarding@resend.dev>',
        to: 'gogamr0.01@gmail.com',
        subject: `📩 New Lead — ${name} (${company || 'No company'})`,
        text:
          `New inquiry from G0GA website!\n\n` +
          `👤 Name: ${name}\n` +
          `📧 Email: ${email}\n` +
          `🏢 Company: ${company || '—'}\n` +
          `🛠 Service: ${service || '—'}\n` +
          `💰 Budget: ${budget || '—'}\n\n` +
          `📝 Project Details:\n${message}\n\n` +
          `─────────────────────\n` +
          `View all leads: https://g0ga.vercel.app/admin`,
      }),
    })

    const data = await response.json()
    if (data.id) {
      res.status(200).json({ ok: true })
    } else {
      console.error('Resend error:', data)
      res.status(500).json({ ok: false })
    }
  } catch (err) {
    console.error('Contact error:', err)
    res.status(500).json({ ok: false })
  }
}
