import { supabaseAdmin } from '../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, company, email, budget, time } = req.body

  // 1 — Save booking to Supabase
  try {
    await supabaseAdmin.from('leads').insert({
      name,
      email,
      company: company || null,
      budget: budget || null,
      message: `Call booking — preferred time: ${time}`,
      source: 'call_booking',
      status: 'call_scheduled',
    })
  } catch (dbErr) {
    console.error('Supabase insert error:', dbErr)
  }

  // 2 — Send email via Resend
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'G0GA AI Assistant <onboarding@resend.dev>',
        to: 'gogamr0.01@gmail.com',
        subject: `🔔 Call Booking — ${name} (${company})`,
        text:
          `New call booking from G0GA website!\n\n` +
          `👤 Name: ${name}\n` +
          `🏢 Company: ${company}\n` +
          `📧 Email: ${email}\n` +
          `💰 Budget: ${budget}\n` +
          `🕐 Preferred Time: ${time}\n\n` +
          `Reply to confirm the 30-min strategy call.\n\n` +
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
    console.error('Book error:', err)
    res.status(500).json({ ok: false })
  }
}
