import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Tag, ExternalLink, MessageSquare } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

function MediaBlock({ src, type, title }) {
  const isVideo = src && /\.(mp4|webm|ogg)$/i.test(src)
  if (!src) return null

  return isVideo ? (
    <video src={src} autoPlay muted loop playsInline
      className="w-full h-full object-cover"
      style={{ maxHeight: '500px' }} />
  ) : (
    <img src={src} alt={title}
      className="w-full object-cover"
      style={{ maxHeight: '500px' }} />
  )
}

export default function PortfolioDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isLight = theme === 'light'

  const [project, setProject] = useState(location.state?.project || null)
  const [loading, setLoading] = useState(!project)

  useEffect(() => {
    if (project) return
    fetch('/api/admin-data?action=portfolio')
      .then(r => r.json())
      .then(data => {
        const found = data.items?.find(p => p.id === id)
        if (found) setProject(found)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const go = (anchor) => {
    navigate('/')
    setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' }), 300)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--teal)' }} />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg)' }}>
        <p className="text-lg font-poppins font-bold" style={{ color: 'var(--text)' }}>Project not found</p>
        <button onClick={() => navigate('/')} className="btn-primary">← Back to Home</button>
      </div>
    )
  }

  const color = project.accentColor || '#10b981'
  const results = [project.result1, project.result2, project.result3].filter(r => r?.val)
  const tech = Array.isArray(project.tech) ? project.tech : (project.tech || '').split(',').map(t => t.trim()).filter(Boolean)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Top nav */}
      <div className="sticky top-0 z-50 border-b"
        style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--text2)' }}
            onMouseEnter={e => e.currentTarget.style.color = color}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}>
            <ArrowLeft size={16} /> Back
          </button>
          <span className="font-poppins font-black text-lg text-grad">G0GA</span>
          <button onClick={() => go('contact')}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${color}, #34d399)` }}>
            Hire Us
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Hero media */}
        {project.coverImage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden mb-10 shadow-2xl"
            style={{ border: `1px solid ${color}25` }}>
            <MediaBlock src={project.coverImage} title={project.title} />
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .1 }} className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: `${color}15`, color }}>
              {project.type}
            </span>
            {project.location && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text3)' }}>
                <MapPin size={11} /> {project.location}
              </span>
            )}
            {project.client && (
              <span className="text-xs" style={{ color: 'var(--text3)' }}>· {project.client}</span>
            )}
          </div>
          <h1 className="font-poppins text-3xl md:text-4xl font-black mb-4"
            style={{ letterSpacing: '-0.5px', color: 'var(--text)' }}>
            {project.title}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: description */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .15 }} className="lg:col-span-2 space-y-6">

            {project.description && (
              <div className="glass-card p-7 rounded-2xl">
                <h3 className="font-poppins font-bold text-sm mb-3" style={{ color }}>Project Overview</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
                  {project.description}
                </p>
              </div>
            )}

            {/* Tech stack */}
            {tech.length > 0 && (
              <div className="glass-card p-7 rounded-2xl">
                <h3 className="font-poppins font-bold text-sm mb-4 flex items-center gap-2" style={{ color }}>
                  <Tag size={13} /> Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tech.map(t => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-full border font-medium"
                      style={{ background: `${color}08`, borderColor: `${color}25`, color: 'var(--text2)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right: results + CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .2 }} className="space-y-4">

            {/* Results */}
            {results.length > 0 && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-poppins font-bold text-sm mb-5" style={{ color }}>Results Delivered</h3>
                <div className="space-y-4">
                  {results.map((r, i) => (
                    <div key={i} className="text-center p-4 rounded-xl"
                      style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                      <div className="font-poppins text-3xl font-black mb-1" style={{ color }}>{r.val}</div>
                      <div className="text-xs font-medium" style={{ color: 'var(--text3)' }}>{r.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="glass-card p-6 rounded-2xl space-y-3">
              <p className="text-xs font-medium text-center mb-4" style={{ color: 'var(--text2)' }}>
                Want similar results for your business?
              </p>
              <button onClick={() => go('contact')}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${color}, #34d399)`, boxShadow: `0 4px 20px ${color}35` }}>
                Start a Similar Project
              </button>
              <a href="https://wa.me/923091989556" target="_blank" rel="noopener noreferrer"
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                style={{ border: '1px solid var(--border)', color: 'var(--text2)' }}>
                <MessageSquare size={14} /> WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }}
          className="mt-12 text-center">
          <button onClick={() => navigate(-1)}
            className="text-sm transition-colors" style={{ color: 'var(--text3)' }}
            onMouseEnter={e => e.currentTarget.style.color = color}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            ← View all projects
          </button>
        </motion.div>
      </div>
    </div>
  )
}
