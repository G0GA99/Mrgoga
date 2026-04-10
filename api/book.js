export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, company, email, budget, time } = req.body

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: 'ac90c044-c369-4c9e-b779-52b1ee37c0da',
        subject: `🔔 New Call Booking — ${name} (${company})`,
        from_name: 'G0GA AI Assistant',
        name,
        email,
        message:
          `New call booking from G0GA website!\n\n` +
          `👤 Name: ${name}\n` +
          `🏢 Company: ${company}\n` +
          `📧 Email: ${email}\n` +
          `💰 Budget: ${budget}\n` +
          `🕐 Preferred Time: ${time}\n\n` +
          `Reply to confirm the 30-min strategy call.`,
      }),
    })

    const data = await response.json()
    if (data.success) {
      res.status(200).json({ ok: true })
    } else {
      res.status(500).json({ ok: false })
    }
  } catch (err) {
    console.error('Book error:', err)
    res.status(500).json({ ok: false })
  }
}
