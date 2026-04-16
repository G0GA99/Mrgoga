import { supabaseAdmin } from '../lib/supabase.js'
import { ZION } from '../lib/agents/index.js'

const GROQ_KEY     = process.env.GROQ_API_KEY
const MEDIUM_TOKEN = process.env.MEDIUM_TOKEN  // medium.com/me/settings → Integration tokens

// Content type rotation: 5 types, rotates weekly
const CONTENT_ROTATION = ['blog_post', 'linkedin_article', 'case_study', 'newsletter', 'seo_page']

async function readPage(url) {
  try {
    const r = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(8000)
    })
    return (await r.text()).slice(0, 1200)
  } catch { return null }
}

async function groq(prompt, maxTokens = 1400) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    })
  })
  const j = await r.json()
  return j.choices?.[0]?.message?.content || ''
}

async function publishToMedium(title, content) {
  if (!MEDIUM_TOKEN) return { skipped: true }
  try {
    const meRes = await fetch('https://api.medium.com/v1/me', {
      headers: { 'Authorization': `Bearer ${MEDIUM_TOKEN}`, 'Content-Type': 'application/json' }
    })
    const meData = await meRes.json()
    const userId = meData.data?.id
    if (!userId) return { published: false, error: 'No user ID' }

    const pubRes = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${MEDIUM_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        contentFormat: 'markdown',
        content,
        tags: ['AI', 'Technology', 'Business', 'Digital Agency', 'Automation'],
        publishStatus: 'public',
      })
    })
    const pubData = await pubRes.json()
    return pubRes.ok
      ? { published: true, url: pubData.data?.url }
      : { published: false, error: pubData.errors?.[0]?.message }
  } catch (e) {
    return { published: false, error: e.message }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  try {
    // Pick content type and topic from weekly rotation
    const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
    const contentType = CONTENT_ROTATION[week % CONTENT_ROTATION.length]
    const topics = ZION.topics[contentType]
    const topic = topics[week % topics.length]
    const typeInfo = ZION.contentTypes.find(t => t.type === contentType)

    // Research (only for blog posts — others are more opinion/story driven)
    let researchContext = ''
    if (contentType === 'blog_post') {
      const [r1, r2] = await Promise.all([
        readPage(`https://www.forbes.com/search/?q=${encodeURIComponent(topic)}`),
        readPage(`https://www.hubspot.com/blog/search?page=1&term=${encodeURIComponent(topic)}`),
      ])
      if (r1 || r2) {
        researchContext = `RESEARCH — what's already written:\n${r1 || ''}\n${r2 || ''}`
      }
    }

    // Generate content based on type
    let content = ''
    let prompt = ''

    switch (contentType) {
      case 'blog_post':
        prompt = ZION.buildBlogPrompt(topic, researchContext)
        content = await groq(prompt, 1400)
        break
      case 'linkedin_article':
        prompt = ZION.buildLinkedInPrompt(topic)
        content = await groq(prompt, 1600)
        break
      case 'case_study':
        prompt = ZION.buildCaseStudyPrompt(topic)
        content = await groq(prompt, 1000)
        break
      case 'newsletter':
        prompt = ZION.buildNewsletterPrompt(topic)
        content = await groq(prompt, 800)
        break
      case 'seo_page':
        prompt = ZION.buildSEOPagePrompt(topic)
        content = await groq(prompt, 1000)
        break
    }

    // Publish to Medium (blog posts and case studies work well there)
    let medium = { skipped: true }
    if (contentType === 'blog_post' || contentType === 'case_study') {
      medium = await publishToMedium(topic, content)
    }

    // Save to Supabase — digest picks this up Monday
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Zion',
      action: 'content_created',
      details: JSON.stringify({
        contentType,
        typeLabel: typeInfo?.label,
        platform: typeInfo?.platform,
        topic,
        content,
        medium,
      }),
    })

    // No individual CEO email — digest.js handles Monday summary
    res.status(200).json({ ok: true, contentType, typeLabel: typeInfo?.label, topic, medium })

  } catch (err) {
    console.error('Zion error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
