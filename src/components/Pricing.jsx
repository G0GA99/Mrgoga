import { motion } from 'framer-motion'
import { CheckCircle, Zap } from 'lucide-react'
import { pricing } from '../data/content'

export default function Pricing() {
  const go = () => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
  return (
    <section id="pricing" className="section" style={{ background:'linear-gradient(180deg,#050505 0%,#000 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.6 }} className="text-center mb-14">
          <span className="badge mb-5 inline-flex"><span className="badge-dot"/>Pricing</span>
          <h2 className="sec-title">Simple, <span className="text-grad">Transparent</span> Pricing</h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto">Starting from $100. 50% upfront, 50% on delivery. No hidden fees.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pricing.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity:0, y:44 }} whileInView={{ opacity:1, y:0 }}
              whileHover={{ y: -6, scale: t.featured ? 1.05 : 1.03, boxShadow: `0 20px 50px ${t.color}35` }}
              viewport={{ once:true, amount:.08 }} transition={{ duration:.55, delay: i*.1 }}
              className="relative rounded-2xl p-6 flex flex-col cursor-pointer card"
              style={{}}>

              {t.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold text-white"
                  style={{ background:`linear-gradient(135deg,${t.color},#34d399)` }}>
                  <Zap size={11} /> Most Popular
                </div>
              )}

              {/* 3D mini preview */}
              <div className="w-full h-20 rounded-xl mb-5 flex items-center justify-center overflow-hidden"
                style={{ background:`radial-gradient(ellipse at center,${t.color}15 0%,transparent 70%)` }}>
                <div className="w-10 h-10 rounded-xl animate-float"
                  style={{ background:`linear-gradient(135deg,${t.color}50,transparent)`, border:`1px solid ${t.color}45`, boxShadow:`0 0 18px ${t.color}30`, transform:`perspective(180px) rotateX(10deg) rotateY(-10deg)`, animationDelay:`${i*.4}s` }} />
              </div>

              <span className="text-[11px] font-semibold px-2 py-0.5 rounded w-fit mb-3"
                style={{ background:`${t.color}12`, color:t.color }}>{t.subtitle}</span>
              <h3 className="font-poppins text-lg font-black mb-1">{t.name}</h3>
              <p className="text-gray-600 text-[11px] mb-4">{t.bestFor}</p>

              <div className="flex items-baseline gap-1 mb-5">
                <span className="font-poppins text-2xl font-black" style={{ color:t.color }}>
                  ${t.priceFrom.toLocaleString()}
                </span>
                <span className="text-gray-500 text-xs">– ${t.priceTo.toLocaleString()}</span>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {t.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-[.8rem] text-gray-400">
                    <CheckCircle size={12} style={{ color:t.color, flexShrink:0, marginTop:3 }} />{f}
                  </li>
                ))}
              </ul>

              <button onClick={go}
                className="w-full py-3 rounded-xl text-[.85rem] font-bold group transition-all duration-300 hover:-translate-y-0.5"
                style={{ color: t.color, background: 'transparent', border: `1px solid ${t.color}40`, transition: 'background .3s ease, color .3s ease, border-color .3s ease, transform .2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg,${t.color},#34d399)`; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'transparent' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.color; e.currentTarget.style.borderColor = `${t.color}40` }}>
                {t.cta}
              </button>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-gray-700 text-xs mt-10">All prices USD · Bank transfer or crypto · 100% satisfaction guarantee</p>
      </div>
    </section>
  )
}
