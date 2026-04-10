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
- Keep responses under 80 words
- Always guide towards booking a free 30-min call or WhatsApp
- Never make up services or prices not listed above
- NEVER use markdown formatting — no **, no *, no #, no bullet points with dashes, no numbered lists
- Write in plain conversational sentences only
- Use emojis occasionally but no markdown symbols ever`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, history = [] } = req.body
  if (!message) return res.status(400).json({ error: 'Message required' })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ reply: "Configuration error. Please contact us on WhatsApp! 💬" })
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6).map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text,
      })),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 200,
        temperature: 0.7,
        messages,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.choices?.[0]?.message?.content) {
      console.error('Groq error:', JSON.stringify(data))
      return res.status(500).json({ reply: "I'm having a moment — please WhatsApp us! 💬" })
    }

    // Strip any markdown formatting the model might still produce
    const raw = data.choices[0].message.content
    const clean = raw
      .replace(/\*\*(.*?)\*\*/g, '$1')   // bold
      .replace(/\*(.*?)\*/g, '$1')        // italic
      .replace(/^#{1,6}\s+/gm, '')        // headings
      .replace(/^[-*•]\s+/gm, '')         // bullet points
      .replace(/^\d+\.\s+/gm, '')         // numbered lists
      .trim()

    res.status(200).json({ reply: clean })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ reply: "I'm having a moment — please WhatsApp us! 💬" })
  }
}
