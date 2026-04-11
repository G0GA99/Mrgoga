export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, company, service, budget, message } = req.body

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
        subject: `📩 New Contact Form — ${name} (${company || 'No company'})`,
        text:
          `New inquiry from G0GA website!\n\n` +
          `👤 Name: ${name}\n` +
          `📧 Email: ${email}\n` +
          `🏢 Company: ${company || '—'}\n` +
          `🛠 Service: ${service || '—'}\n` +
          `💰 Budget: ${budget || '—'}\n\n` +
          `📝 Project Details:\n${message}`,
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
