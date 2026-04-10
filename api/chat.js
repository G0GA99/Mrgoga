const SYSTEM_PROMPT = `You are G0GA's AI Sales Assistant — a smart, professional, and friendly assistant for G0GA Agency.

ABOUT G0GA:
- Premium AI agency founded by Mrgoga (CEO)
- Serves clients in USA, UK, Canada, Europe, and Middle East
- Contact: gogamr0.01@gmail.com | WhatsApp: +923091989556
- 50+ projects delivered, 95% satisfaction rate, $2M+ revenue built

SERVICES & PRICING:
1. Branding & Animation — $100–$500 (2 weeks delivery)
2. Web Experience — $1,000–$5,000 (3–4 weeks)
3. Product Visualization — $5,000–$10,000 (4–6 weeks)
4. AI Integration — $2,000–$8,000 (2–4 weeks)
5. Data Visualization — $3,000–$12,000 (4–6 weeks)

PRICING TIERS: Starter $100–500 | Growth $1K–5K | Professional $5K–10K | Enterprise $15K–25K
PAYMENT: 50% upfront, 50% on delivery. Bank transfer or crypto.
TEAM: CEO Mrgoga + 4 AI agents (Content, Sales, Dev, PM) — 24/7.

RULES:
- Be concise, professional, friendly
- Keep responses under 100 words
- Always guide towards booking a free 30-min call or WhatsApp
- Never make up services or prices not listed above`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, history = [] } = req.body
  if (!message) return res.status(400).json({ error: 'Message required' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ reply: "Configuration error. Please contact us on WhatsApp! 💬" })
  }

  try {
    const contents = []

    // Add history (last 6 messages)
    history.slice(-6).forEach(m => {
      contents.push({
        role: m.role === 'bot' ? 'model' : 'user',
        parts: [{ text: m.text }]
      })
    })

    // Add current message
    contents.push({ role: 'user', parts: [{ text: message }] })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 }
        }),
      }
    )

    const data = await response.json()

    if (!response.ok || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Gemini error:', JSON.stringify(data))
      return res.status(500).json({ reply: "I'm having a moment — please WhatsApp us! 💬" })
    }

    res.status(200).json({ reply: data.candidates[0].content.parts[0].text })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ reply: "I'm having a moment — please WhatsApp us! 💬" })
  }
}
