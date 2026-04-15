import { ALEX } from '../lib/agents/index.js'

const SYSTEM_PROMPT = ALEX.systemPrompt


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
      text: `Hi HammadSharif,

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
