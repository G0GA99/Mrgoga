import { motion } from 'framer-motion'
import { CheckCircle, ArrowUpRight } from 'lucide-react'
import { services } from '../data/content'
import { useTheme } from '../hooks/useTheme'

function ServiceCard({ s, i, isLight }) {
  const go = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })

  const cardFrontBg   = isLight ? 'rgba(255,255,255,0.70)' : 'rgba(10,10,10,0.60)'
  const cardBackBg    = isLight
    ? `linear-gradient(135deg,${s.color}12,rgba(255,255,255,0.75))`
    : `linear-gradient(135deg,${s.color}10,rgba(10,10,10,0.85))`
  const descColor     = isLight ? 'var(--text2)' : '#6b7280'
  const priceSubColor = isLight ? 'var(--text3)' : '#6b7280'
  const labelColor    = isLight ? 'var(--text3)' : '#6b7280'
  const borderDiv     = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'

  return (
    <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, amount:.08 }} transition={{ duration:.55, delay: i*.09 }}
      className="flip-card h-[370px]">
      <div className="flip-inner">

        {/* Front */}
        <div className="flip-front shimmer service-glow flex flex-col p-7 cursor-pointer"
          style={{
            background: cardFrontBg,
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            border: `1px solid ${s.color}25`,
            borderRadius: '14px',
          }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5 relative z-[1]"
            style={{ background:`${s.color}12`, border:`1px solid ${s.color}30` }}>
            {s.icon}
          </div>
          <h3 className="font-poppins text-[1.05rem] font-bold mb-2 relative z-[1]" style={{ color: s.color }}>
            {s.title}
          </h3>
          <p className="text-sm leading-relaxed flex-1 relative z-[1]" style={{ color: descColor }}>{s.shortDesc}</p>
          <div className="mt-5 relative z-[1]">
            <div className="text-[11px] uppercase tracking-wider mb-1" style={{ color: labelColor }}>Starting from</div>
            <div className="font-poppins text-xl font-black" style={{ color: s.color }}>
              ${s.priceFrom.toLocaleString()}
              <span className="text-sm font-normal" style={{ color: priceSubColor }}> – ${s.priceTo.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="flip-back flex flex-col p-7"
          style={{
            background: cardBackBg,
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            border: `1px solid ${s.color}35`,
            borderRadius: '14px',
          }}>
          <h3 className="font-poppins font-bold mb-3 text-sm" style={{ color: s.color }}>{s.title}</h3>
          <p className="text-[.82rem] leading-relaxed mb-4" style={{ color: descColor }}>{s.fullDesc}</p>
          <ul className="space-y-2 flex-1">
            {s.features.map((f, j) => (
              <li key={j} className="flex items-start gap-2 text-[.82rem]" style={{ color: descColor }}>
                <CheckCircle size={12} style={{ color: s.color, flexShrink:0, marginTop:3 }} />{f}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between pt-4 mt-2" style={{ borderTop: `1px solid ${borderDiv}` }}>
            <span className="text-[11px]" style={{ color: labelColor }}>⏱ {s.delivery}</span>
            <button onClick={go}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-[.8rem] font-bold hover:opacity-90 transition-all"
              style={{ background:`linear-gradient(135deg,${s.color},#34d399)`, color: '#fff' }}>
              Get Quote <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Services() {
  const theme = useTheme()
  const isLight = theme === 'light'
  return (
    <section id="services" className="section"
      style={{ background: isLight ? 'var(--bg)' : 'linear-gradient(180deg,#000 0%,#080808 100%)', transition: 'background .35s' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.6 }} className="text-center mb-14">
          <span className="badge mb-5 inline-flex"><span className="badge-dot"/>What We Build</span>
          <h2 className="sec-title">Services Built for <span className="text-grad">Results</span></h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text2)' }}>From $100 branding to enterprise AI ecosystems. Hover each card to explore.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => <ServiceCard key={s.id} s={s} i={i} isLight={isLight} />)}
        </div>
        <p className="text-center text-xs mt-8" style={{ color: 'var(--text3)' }}>✦ Hover cards to flip & see full features · All prices USD · 50% advance</p>
      </div>
    </section>
  )
}
