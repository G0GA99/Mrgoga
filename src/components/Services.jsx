import { motion } from 'framer-motion'
import { CheckCircle, ArrowUpRight } from 'lucide-react'
import { services } from '../data/content'

function ServiceCard({ s, i }) {
  const go = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  return (
    <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, amount:.08 }} transition={{ duration:.55, delay: i*.09 }}
      className="flip-card h-[370px]">
      <div className="flip-inner">

        {/* Front */}
        <div className="flip-front shimmer card flex flex-col p-7 cursor-pointer"
          style={{ borderColor:`${s.color}20` }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5 relative z-[1]"
            style={{ background:`${s.color}12`, border:`1px solid ${s.color}30` }}>
            {s.icon}
          </div>
          <h3 className="font-poppins text-[1.05rem] font-bold mb-2 relative z-[1]" style={{ color: s.color }}>
            {s.title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed flex-1 relative z-[1]">{s.shortDesc}</p>
          <div className="mt-5 relative z-[1]">
            <div className="text-[11px] text-gray-600 uppercase tracking-wider mb-1">Starting from</div>
            <div className="font-poppins text-xl font-black" style={{ color: s.color }}>
              ${s.priceFrom.toLocaleString()}
              <span className="text-sm text-gray-600 font-normal"> – ${s.priceTo.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="flip-back flex flex-col p-7"
          style={{ background:`linear-gradient(135deg,${s.color}10,#0a0a0a)`, border:`1px solid ${s.color}35`, borderRadius:'14px' }}>
          <h3 className="font-poppins font-bold mb-3 text-sm" style={{ color: s.color }}>{s.title}</h3>
          <p className="text-gray-400 text-[.82rem] leading-relaxed mb-4">{s.fullDesc}</p>
          <ul className="space-y-2 flex-1">
            {s.features.map((f, j) => (
              <li key={j} className="flex items-start gap-2 text-[.82rem] text-gray-400">
                <CheckCircle size={12} style={{ color: s.color, flexShrink:0, marginTop:3 }} />{f}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between pt-4 border-t border-white/8 mt-2">
            <span className="text-[11px] text-gray-600">⏱ {s.delivery}</span>
            <button onClick={go}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-[.8rem] font-bold text-black hover:opacity-90 transition-all"
              style={{ background:`linear-gradient(135deg,${s.color},#34d399)` }}>
              Get Quote <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Services() {
  return (
    <section id="services" className="section" style={{ background:'linear-gradient(180deg,#000 0%,#080808 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.6 }} className="text-center mb-14">
          <span className="badge mb-5 inline-flex"><span className="badge-dot"/>What We Build</span>
          <h2 className="sec-title">Services Built for <span className="text-grad">Results</span></h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto">From $100 branding to enterprise AI ecosystems. Hover each card to explore.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => <ServiceCard key={s.id} s={s} i={i} />)}
        </div>
        <p className="text-center text-gray-700 text-xs mt-8">✦ Hover cards to flip & see full features · All prices USD · 50% advance</p>
      </div>
    </section>
  )
}
