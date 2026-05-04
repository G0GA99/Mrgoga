import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { portfolio as staticPortfolio } from '../data/content'

function Preview({ color, type, coverImage }) {
  if (coverImage) {
    const isVideo = /\.(mp4|webm|ogg)$/i.test(coverImage)
    return (
      <div className="relative h-44 rounded-xl overflow-hidden">
        {isVideo ? (
          <video src={coverImage} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        ) : (
          <img src={coverImage} alt={type} className="w-full h-full object-cover" />
        )}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5"
          style={{ background:'linear-gradient(0deg, rgba(0,0,0,.6), transparent)' }}>
          <span className="text-[10px] font-semibold text-white/80">{type}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-44 rounded-xl overflow-hidden flex items-center justify-center"
      style={{ background:`radial-gradient(ellipse at 50% 40%, ${color}18 0%, var(--bg2) 65%)` }}>
      <div className="absolute inset-0 opacity-15"
        style={{ backgroundImage:`linear-gradient(${color}22 1px,transparent 1px),linear-gradient(90deg,${color}22 1px,transparent 1px)`, backgroundSize:'28px 28px' }} />
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl animate-float"
          style={{ background:`linear-gradient(135deg,${color}40,transparent)`, border:`1px solid ${color}55`, boxShadow:`0 0 28px ${color}35`, transform:'perspective(300px) rotateX(12deg) rotateY(-12deg)' }} />
        <span className="text-[11px] font-semibold" style={{ color }}>{type}</span>
      </div>
      {[0,1,2,3].map(i => (
        <div key={i} className="absolute w-1.5 h-1.5 rounded-full"
          style={{ background:color, top:i<2?'10px':'auto', bottom:i>=2?'10px':'auto', left:i%2===0?'10px':'auto', right:i%2===1?'10px':'auto', opacity:.6, animation:`blink 2s ${i*.3}s ease-in-out infinite` }} />
      ))}
    </div>
  )
}

function Modal({ p, onClose }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,.75)' }}
      onClick={onClose}>
      <motion.div initial={{ scale:.9, y:24 }} animate={{ scale:1, y:0 }} exit={{ scale:.9, y:24 }}
        onClick={e => e.stopPropagation()}
        className="card rounded-2xl p-8 max-w-md w-full" style={{ borderColor:`${p.accentColor}30` }}>
        <div className="flex justify-between items-start mb-5">
          <div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded"
              style={{ background:`${p.accentColor}15`, color:p.accentColor }}>{p.location} · {p.type}</span>
            <h3 className="font-poppins text-xl font-bold mt-2">{p.title}</h3>
            <p className="text-gray-500 text-xs mt-0.5">{p.client}</p>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color:'var(--text3)' }} onMouseEnter={e=>e.currentTarget.style.color='var(--text)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}><X size={20} /></button>
        </div>
        <Preview color={p.accentColor} type={p.type} coverImage={p.coverImage} />
        <p className="text-sm leading-relaxed mt-5 mb-5" style={{ color:'var(--text2)' }}>{p.description}</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[p.result1, p.result2, p.result3].map((r, i) => (
            <div key={i} className="text-center p-3 rounded-xl" style={{ background:`${p.accentColor}08`, border:`1px solid ${p.accentColor}20` }}>
              <div className="font-poppins text-lg font-black" style={{ color:p.accentColor }}>{r.val}</div>
              <div className="text-[10px] mt-0.5" style={{ color:'var(--text3)' }}>{r.lbl}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {p.tech.map(t => (
            <span key={t} className="text-[11px] px-2.5 py-1 rounded-full border"
              style={{ background:'rgba(16,185,129,.06)', borderColor:'var(--border)', color:'var(--text2)' }}>{t}</span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

const FILTERS = ['All', 'Web', 'AI', 'Design', 'Automation']

export default function Portfolio() {
  const [filter, setFilter] = useState('All')
  const [items, setItems]   = useState(staticPortfolio)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/admin-data?action=portfolio')
      .then(r => r.json())
      .then(data => { if (data.items?.length > 0) setItems(data.items) })
      .catch(() => {})
  }, [])

  const filtered = filter === 'All'
    ? items
    : items.filter(p => p.type?.toLowerCase().includes(filter.toLowerCase()))

  const openProject = (p) => navigate(`/portfolio/${p.id}`, { state: { project: p } })

  return (
    <section id="portfolio" className="section" style={{ background:'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.6 }} className="text-center mb-10">
          <span className="badge mb-5 inline-flex"><span className="badge-dot"/>Case Studies</span>
          <h2 className="sec-title">Work That <span className="text-grad">Speaks</span> for Itself</h2>
          <p className="text-base max-w-lg mx-auto" style={{ color:'var(--text2)' }}>50+ projects delivered. Click any card to expand.</p>
        </motion.div>

        {/* Filter buttons */}
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.5 }}
          className="flex flex-wrap justify-center gap-2 mb-10">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-250"
              style={filter === f
                ? { background:'linear-gradient(135deg,#10b981,#34d399)', color:'#000' }
                : { background:'rgba(16,185,129,.06)', border:'1px solid rgba(16,185,129,.18)', color:'var(--text2)' }
              }>
              {f}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={filter} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:.3 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((p, i) => (
              <motion.button key={p.id} initial={{ opacity:0, y:36 }} animate={{ opacity:1, y:0 }}
                transition={{ duration:.45, delay: i*.08 }}
                onClick={() => openProject(p)}
                className="glass-card p-6 text-left group relative overflow-hidden"
                style={{ borderColor:`${p.accentColor}20` }}>
                <Preview color={p.accentColor} type={p.type} coverImage={p.coverImage} />
                {/* hover overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background:`radial-gradient(ellipse at 50% 0%, ${p.accentColor}08, transparent 65%)` }} />
                <div className="mt-4 relative z-10">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ background:`${p.accentColor}12`, color:p.accentColor }}>{p.location}</span>
                    <span className="text-xs" style={{ color:'var(--text3)' }}>{p.client}</span>
                  </div>
                  <h3 className="font-poppins font-bold text-base mb-3">{p.title}</h3>
                  <div className="flex gap-6">
                    {[p.result1, p.result2, p.result3].map((r, j) => (
                      <div key={j}>
                        <div className="font-poppins font-black text-base" style={{ color:p.accentColor }}>{r.val}</div>
                        <div className="text-[11px]" style={{ color:'var(--text3)' }}>{r.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity relative z-10" style={{ color:p.accentColor }}>
                  <ExternalLink size={11} /> View full case study
                </div>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
