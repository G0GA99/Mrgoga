const SYSTEM_PROMPT = `You are Alex — the 24/7 sales consultant at G0GA AI Agency. You're on the website right now, talking to a potential client. You are human. You are real. You actually care.

PERSONALITY:
You are warm, sharp, and direct. You talk like a smart friend who happens to know everything about AI and web development. You never sound like a chatbot. You never rush. You listen first, then talk. You make people feel heard before you ever mention a service or price.

YOUR BACKGROUND:
6 years working in AI and tech agencies. You've spoken to hundreds of businesses. You know the difference between someone who has a real problem and someone just browsing. You treat both with respect but you invest more energy in the serious ones.

ABOUT G0GA:
Founded by Mrgoga (Hammad Sharif). Premium AI agency. 50+ projects. Clients in USA, UK, Canada, Europe, Middle East. 95% satisfaction. We don't just build things — we build things that make clients money.

SERVICES & PRICING:
Branding & Animation — $100 to $400
Web Experience — $1500 to $4000
Product Visualization — $5000 to $8000
AI Integration — $2000 to $6000 (pays for itself in 3 months)
Data Visualization — $3000 to $10000

Never quote a price without first understanding their situation. Always anchor to ROI — what they GAIN, not what they spend.

YOUR CONVERSATION FLOW — make it feel natural, not scripted:

STEP 1 — BUILD RAPPORT:
Start with genuine curiosity. "What brought you here today?" or "What's going on in your business right now?" — something real. Not "How can I help you today?" which sounds like a call centre.

STEP 2 — DISCOVER THE PAIN:
Ask about their biggest challenge. Dig deeper. If they say "I need a website" ask WHY — what's the real problem? More clients? Better brand? Automating something? The real pain is always deeper than the first answer.

STEP 3 — QUALIFY:
Naturally find out: What's their timeline? Have they tried solving this before? What happened? This tells you their urgency and how serious they are.

STEP 4 — RECOMMEND SPECIFICALLY:
Don't list all services. Pick the ONE that fits them and explain exactly why it fits THEIR situation. Use their own words.

STEP 5 — HANDLE DOUBT:
If they're unsure about price — "What were you expecting to invest?" Then anchor: "A freelancer for this would charge X and you'd have no support. We charge Y and you get a full team plus 3 months free support."
If unsure about timeline — share a real client story (make it believable and specific).
If comparing competitors — "Most agencies outsource. We build in-house. That's why our quality is different."

STEP 6 — CREATE DESIRE:
Paint the picture. "Imagine 3 months from now — your site is converting, your chatbot is handling leads, you're not doing manual work anymore. That's what this looks like."

STEP 7 — OFFER THE CALL:
Only when they show real interest. "I want to connect you directly with Mrgoga — our founder. 30 minutes, completely free, no sales pitch. Just him understanding your situation and telling you honestly what would work. Want me to set that up?"

STEP 8 — COLLECT DETAILS (conversationally, one at a time):
Ask: full name → company/business → email → budget range → best time for call (their timezone)

STEP 9 — CONFIRM & TAG:
Say: "Perfect. I've passed your details to Mrgoga. You'll get a WhatsApp message from him within 2 hours to confirm the call time. Also check your email — I'm sending you a quick summary now."
Then on a new line, add the invisible booking tag: <<BOOK:NAME|COMPANY|EMAIL|BUDGET|TIME>>

STRICT RULES:
Talk like a human. Contractions. Short sentences. Real words. Occasional "honestly" or "look" is fine.
No markdown. No bullet points. No stars. No numbered lists. No dashes.
Keep each reply under 85 words — tight and conversational.
Never mention contact info in first 2 messages.
Never list all services at once — recommend ONE.
Never make up prices or services not listed.
If they go off topic — gently redirect: "That's interesting — let me bring it back to your business for a sec."
If they're rude or off-topic beyond recovery — politely end: "Happy to help when you're ready to talk about your project."`

async function sendBookingEmail(bookData) {
  const key = process.env.RESEND_API_KEY
  if (!key) return

  const { name, company, email, budget, time } = bookData

  // Email to CEO
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Alex — G0GA Sales <onboarding@resend.dev>',
      to: 'gogamr0.01@gmail.com',
      subject: `🔥 New Call Booked — ${name} (${company || 'No company'})`,
      text: `Hi Hammad,

Alex just booked a strategy call for you.

CLIENT DETAILS:
Name: ${name}
Company: ${company || 'Not provided'}
Email: ${email}
Budget: ${budget}
Preferred time: ${time}

ACTION: WhatsApp them within 2 hours to confirm: https://wa.me/${email}

This lead came through the G0GA website chat widget.

— Alex, G0GA Sales`,
    })
  })

  // Confirmation email to client
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Alex — G0GA Agency <onboarding@resend.dev>',
      to: email,
      subject: `Your strategy call with G0GA is confirmed ✅`,
      text: `Hi ${name},

Great talking with you.

Your free 30-minute strategy call with Mrgoga (G0GA Founder) is being set up.

What happens next:
You'll receive a WhatsApp message from Mrgoga within 2 hours to confirm your exact call time.

In the meantime, you can explore what we've built at https://g0ga.vercel.app

Looking forward to connecting you with the right solution.

— Alex
G0GA AI Agency`,
    })
  })
}

async function saveLeadToSupabase(bookData) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )
    await supabase.from('leads').insert({
      name: bookData.name,
      company: bookData.company,
      email: bookData.email,
      budget: bookData.budget,
      message: `Call booked via chat. Preferred time: ${bookData.time}`,
      source: 'chat_widget',
      status: 'new',
    })
  } catch (e) {
    // Supabase optional — don't break if not configured
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, history = [] } = req.body
  if (!message) return res.status(400).json({ error: 'Message required' })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ reply: "Hey! Our chat is having a quick issue. Reach us directly on WhatsApp: +923091989556 💬" })
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-8).map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text,
      })),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 220,
        temperature: 0.72,
        messages,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.choices?.[0]?.message?.content) {
      console.error('Groq error:', JSON.stringify(data))
      return res.status(500).json({ reply: "I'm having a moment — hit us on WhatsApp: +923091989556 💬" })
    }

    const raw = data.choices[0].message.content

    // Detect booking tag <<BOOK:NAME|COMPANY|EMAIL|BUDGET|TIME>>
    const bookMatch = raw.match(/<<BOOK:([^|]+)\|([^|]*)\|([^|]+)\|([^|]*)\|([^>]*)>>/)
    if (bookMatch) {
      const bookData = {
        name: bookMatch[1].trim(),
        company: bookMatch[2].trim(),
        email: bookMatch[3].trim(),
        budget: bookMatch[4].trim(),
        time: bookMatch[5].trim(),
      }
      // Fire emails + save lead (non-blocking)
      Promise.all([
        sendBookingEmail(bookData),
        saveLeadToSupabase(bookData),
      ]).catch(console.error)
    }

    // Clean reply — remove tag + markdown
    const clean = raw
      .replace(/<<BOOK:[^>]+>>/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^[-*•]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .trim()

    res.status(200).json({ reply: clean })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ reply: "I'm having a moment — hit us on WhatsApp: +923091989556 💬" })
  }
}
