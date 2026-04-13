import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { testimonials } from '../data/content'

function TestimonialCard({ t, i }) {
  return (
    <motion.div initial={{ opacity:0, y:36 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, amount:.1 }} transition={{ duration:.55, delay: i*.1 }}
      className="glass-card p-8 rounded-2xl relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-[.06]"
        style={{ background: i%2===0?'#10b981':'#34d399' }} />
      <Quote size={26} className="mb-4" style={{ color:'rgba(16,185,129,.2)' }} />
      <div className="flex gap-0.5 mb-4">
        {Array(t.rating).fill(0).map((_, j) => (
          <motion.span key={j} initial={{ opacity:0, scale:.5 }} whileInView={{ opacity:1, scale:1 }}
            transition={{ delay: j*.08 }} className="text-amber-400 text-sm">★</motion.span>
        ))}
      </div>
      <p className="text-gray-300 text-sm leading-relaxed italic mb-6">"{t.quote}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-white/6">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black"
          style={{ background:'linear-gradient(135deg,#10b981,#34d399)' }}>{t.author[0]}</div>
        <div>
          <div className="font-semibold text-sm">{t.author}</div>
          <div className="text-gray-600 text-xs">{t.company} · {t.location}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Testimonials() {
  const [idx, setIdx] = useState(0)
  const prev = () => setIdx(i => (i - 1 + testimonials.length) % testimonials.length)
  const next = () => setIdx(i => (i + 1) % testimonials.length)

  // Auto-advance mobile carousel
  useEffect(() => {
    const t = setInterval(next, 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="testimonials" className="section" style={{ background:'linear-gradient(180deg,#050505 0%,#000 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.6 }} className="text-center mb-14">
          <span className="badge mb-5 inline-flex"><span className="badge-dot"/>Client Stories</span>
          <h2 className="sec-title">What Clients <span className="text-grad">Say</span></h2>
        </motion.div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 gap-5 mb-12">
          {testimonials.map((t, i) => <TestimonialCard key={t.id} t={t} i={i} />)}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <div className="relative overflow-hidden rounded-2xl mb-5">
            <AnimatePresence mode="wait">
              <motion.div key={idx} initial={{ opacity:0, x:50 }} animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:-50 }} transition={{ duration:.3 }}
                className="glass-card p-7 rounded-2xl">
                <Quote size={24} className="text-teal/20 mb-3" />
                <div className="flex gap-0.5 mb-3">
                  {Array(testimonials[idx].rating).fill(0).map((_, j) => <span key={j} className="text-amber-400 text-sm">★</span>)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic mb-5">"{testimonials[idx].quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black"
                    style={{ background:'linear-gradient(135deg,#10b981,#34d399)' }}>{testimonials[idx].author[0]}</div>
                  <div>
                    <div className="font-semibold text-sm">{testimonials[idx].author}</div>
                    <div className="text-gray-600 text-xs">{testimonials[idx].company} · {testimonials[idx].location}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button onClick={prev} className="w-9 h-9 rounded-full card flex items-center justify-center hover:border-teal/40 hover:text-teal transition-all"><ChevronLeft size={16}/></button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`rounded-full transition-all ${i===idx?'w-5 h-2 bg-teal':'w-2 h-2 bg-white/15'}`} />
              ))}
            </div>
            <button onClick={next} className="w-9 h-9 rounded-full card flex items-center justify-center hover:border-teal/40 hover:text-teal transition-all"><ChevronRight size={16}/></button>
          </div>
        </div>

        {/* Trust row */}
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          className="flex flex-wrap justify-center gap-10 pt-12 border-t border-white/5">
          {[['50+','Projects'],['98%','Retention'],['4.9★','Rating'],['$2M+','Revenue']].map(([v,l], i) => (
            <div key={i} className="text-center">
              <div className="font-poppins text-xl font-black text-grad">{v}</div>
              <div className="text-gray-600 text-xs mt-1">{l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
