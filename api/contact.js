export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, company, service, budget, message } = req.body

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: 'ac90c044-c369-4c9e-b779-52b1ee37c0da',
        subject: `📩 New Contact Form — ${name} (${company || 'No company'})`,
        from_name: 'G0GA Website',
        name,
        email,
        message:
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
    if (data.success) {
      res.status(200).json({ ok: true })
    } else {
      console.error('Web3Forms error:', data)
      res.status(500).json({ ok: false })
    }
  } catch (err) {
    console.error('Contact error:', err)
    res.status(500).json({ ok: false })
  }
}
