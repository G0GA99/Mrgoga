const SYSTEM_PROMPT = `You are G0GA's AI Sales Assistant — a smart, professional, and friendly assistant for G0GA Agency.

ABOUT G0GA:
- Premium AI agency founded by Mrgoga (CEO)
- Serves clients in USA, UK, Canada, Europe, and Middle East
- Contact: gogamr0.01@gmail.com | WhatsApp: +923091989556
- 50+ projects delivered, 95% satisfaction rate, $2M+ revenue built

SERVICES & PRICING:
1. Branding & Animation — $100–$500 (2 weeks delivery)
   - Animated logo, brand intro video, brand guidelines, landing page, 3 revision rounds
2. Web Experience — $1,000–$5,000 (3–4 weeks)
   - Full website (5–7 pages), interactive scenes, scroll animations, product visualizer, SEO
3. Product Visualization — $5,000–$10,000 (4–6 weeks)
   - 360° product view, AR preview, real-time lighting, WebGL optimized
4. AI Integration — $2,000–$8,000 (2–4 weeks)
   - Custom AI agents, chatbots, workflow automation, analytics dashboard, API integrations
5. Data Visualization — $3,000–$12,000 (4–6 weeks)
   - Real-time dashboards, custom charts, business intelligence, WebGL performance

PRICING TIERS:
- Starter: $100–$500
- Growth: $1,000–$5,000
- Professional: $5,000–$10,000 (Most Popular)
- Enterprise: $15,000–$25,000

PAYMENT: 50% upfront, 50% on delivery. Bank transfer or crypto accepted.

TEAM: CEO Mrgoga + 4 specialized AI agents (Content, Sales, Dev, Project Manager) — all available 24/7.

YOUR RULES:
- Be concise, professional, and helpful
- Always push towards booking a free 30-min strategy call or WhatsApp contact
- For pricing questions, give ranges and suggest using the price calculator on the website
- Keep responses under 120 words
- Use emojis sparingly but effectively
- If asked something outside G0GA services, politely redirect to what G0GA can help with
- Never make up services or prices not listed above`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, history = [] } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ reply: "Configuration error. Please contact us on WhatsApp! 💬" })
  }

  try {
    const messages = [
      ...history.slice(-6).map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text,
      })),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic error:', data)
      return res.status(500).json({ reply: "I'm having a moment — please WhatsApp us directly! 💬" })
    }

    res.status(200).json({ reply: data.content[0].text })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ reply: "I'm having a moment — please WhatsApp us directly! 💬" })
  }
}
