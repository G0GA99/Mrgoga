import { supabaseAdmin } from '../lib/supabase.js'
import { AGENT as ZION } from '../lib/agents/zion.js'

const GROQ_KEY  = process.env.GROQ_API_KEY
const DEVTO_KEY = process.env.DEVTO_API_KEY  // dev.to → Settings → Extensions → API Keys

// Weekly rotation for non-blog content (Monday only)
const WEEKLY_ROTATION = ['linkedin_article', 'case_study', 'newsletter', 'seo_page']

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

async function publishToDevTo(title, content, tags = []) {
  if (!DEVTO_KEY) return { skipped: true }
  try {
    const res = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: { 'api-key': DEVTO_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article: {
          title,
          body_markdown: content,
          published: true,
          tags: tags.slice(0, 4),  // dev.to max 4 tags
        }
      })
    })
    const data = await res.json()
    return res.ok
      ? { published: true, url: data.url }
      : { published: false, error: data.error || JSON.stringify(data) }
  } catch (e) {
    return { published: false, error: e.message }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  try {
    const now = new Date()
    const dayIndex  = Math.floor(Date.now() / (24 * 60 * 60 * 1000))  // days since epoch
    const weekIndex = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
    const dayOfWeek = now.getDay()  // 0=Sun 1=Mon ... 6=Sat
    const isMonday  = dayOfWeek === 1

    // ── DAILY: Blog Post ──────────────────────────────────────────────────────
    const blogTopics = ZION.topics.blog_post
    const blogTopic  = blogTopics[dayIndex % blogTopics.length]

    // Research for blog post
    const [r1, r2] = await Promise.all([
      readPage(`https://www.forbes.com/search/?q=${encodeURIComponent(blogTopic)}`),
      readPage(`https://www.hubspot.com/blog/search?page=1&term=${encodeURIComponent(blogTopic)}`),
    ])
    const researchContext = (r1 || r2)
      ? `RESEARCH — what's already written:\n${r1 || ''}\n${r2 || ''}`
      : ''

    const blogContent = await groq(ZION.buildBlogPrompt(blogTopic, researchContext), 1400)

    // Publish blog post to Dev.to
    const devto = await publishToDevTo(blogTopic, blogContent, ['ai', 'webdev', 'automation', 'business'])

    // Save blog post to Supabase
    await supabaseAdmin.from('agent_logs').insert({
      agent: 'Zion',
      action: 'content_created',
      details: JSON.stringify({
        contentType: 'blog_post',
        typeLabel: 'Blog Post',
        platform: 'Dev.to',
        topic: blogTopic,
        content: blogContent,
        devto,
      }),
    })

    // ── WEEKLY (Monday only): Rotating content type ───────────────────────────
    let weeklyResult = null

    if (isMonday) {
      const weeklyType   = WEEKLY_ROTATION[weekIndex % WEEKLY_ROTATION.length]
      const weeklyTopics = ZION.topics[weeklyType]
      const weeklyTopic  = weeklyTopics[weekIndex % weeklyTopics.length]
      const typeInfo     = ZION.contentTypes.find(t => t.type === weeklyType)

      let weeklyContent = ''
      switch (weeklyType) {
        case 'linkedin_article':
          weeklyContent = await groq(ZION.buildLinkedInPrompt(weeklyTopic), 1600)
          break
        case 'case_study':
          weeklyContent = await groq(ZION.buildCaseStudyPrompt(weeklyTopic), 1000)
          break
        case 'newsletter':
          weeklyContent = await groq(ZION.buildNewsletterPrompt(weeklyTopic), 800)
          break
        case 'seo_page':
          weeklyContent = await groq(ZION.buildSEOPagePrompt(weeklyTopic), 1000)
          break
      }

      // Publish case study to Dev.to as well
      let weeklyDevto = { skipped: true }
      if (weeklyType === 'case_study') {
        weeklyDevto = await publishToDevTo(weeklyTopic, weeklyContent, ['ai', 'casestudy', 'business', 'automation'])
      }

      await supabaseAdmin.from('agent_logs').insert({
        agent: 'Zion',
        action: 'content_created',
        details: JSON.stringify({
          contentType: weeklyType,
          typeLabel: typeInfo?.label,
          platform: typeInfo?.platform,
          topic: weeklyTopic,
          content: weeklyContent,
          devto: weeklyDevto,
        }),
      })

      weeklyResult = { contentType: weeklyType, typeLabel: typeInfo?.label, topic: weeklyTopic, devto: weeklyDevto }
    }

    res.status(200).json({
      ok: true,
      daily: { contentType: 'blog_post', topic: blogTopic, devto },
      weekly: weeklyResult,
    })

  } catch (err) {
    console.error('Zion error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
