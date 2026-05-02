import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, ChevronDown } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const HeroScene = lazy(() => import('./HeroScene'))

const stats = [
  { end: 50,  suffix: '+',  lbl: 'Projects' },
  { end: 95,  suffix: '%',  lbl: 'Satisfaction' },
  { end: 24,  suffix: '/7', lbl: 'AI Support' },
  { prefix: '$', end: 2, suffix: 'M+', lbl: 'Revenue Built' },
]

function CountUp({ end, suffix = '', prefix = '', duration = 1600 }) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          let start = 0
          const step = end / (duration / 16)
          const timer = setInterval(() => {
            start += step
            if (start >= end) { setCount(end); clearInterval(timer) }
            else setCount(Math.floor(start))
          }, 16)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{prefix}{count}{suffix}</span>
}

export default function Hero() {
  const theme = useTheme()
  const isLight = theme === 'light'
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const overlayBg = isLight
    ? 'linear-gradient(90deg,rgba(245,245,240,.97) 35%,rgba(245,245,240,.75) 60%,rgba(245,245,240,.1) 100%)'
    : 'linear-gradient(90deg,rgba(0,0,0,.96) 40%,rgba(0,0,0,.5) 65%,transparent 100%)'

  const sectionBg = isLight ? '#f5f5f0' : '#000000'

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: sectionBg, transition: 'background .35s ease' }}>

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: isLight ? 0.35 : 1 }}>
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      {/* Fade overlay — theme-aware */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: overlayBg, transition: 'background .35s ease' }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="max-w-[640px]">

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
            <span className="badge mb-6 inline-flex">
              <span className="badge-dot" />
              Premium AI Agency
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .1 }}
            className="font-poppins text-5xl md:text-6xl lg:text-[4.2rem] font-black leading-[1.04] mb-5"
            style={{ letterSpacing: '-1.5px', color: 'var(--text)' }}>
            AI-Powered<br />
            <span className="text-grad">Digital Agency</span><br />
            for Global Brands
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55, delay: .2 }}
            className="text-lg leading-relaxed mb-9 max-w-[520px]"
            style={{ color: 'var(--text2)' }}>
            Custom AI experiences, intelligent AI agents, and digital transformation — engineered for USA, UK, Canada, and Europe businesses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55, delay: .3 }}
            className="flex flex-wrap gap-3 mb-14">
            <button onClick={() => go('contact')}
              className="flex items-center gap-2 px-7 py-3.5 font-bold rounded-lg text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all glow"
              style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', color: '#fff' }}>
              Start Project <ArrowRight size={16} />
            </button>
            <button onClick={() => go('contact')}
              className="flex items-center gap-2 px-7 py-3.5 font-semibold rounded-lg text-sm hover:-translate-y-0.5 transition-all"
              style={{
                border: `1px solid ${isLight ? 'rgba(0,0,0,.15)' : 'rgba(255,255,255,.15)'}`,
                color: 'var(--text)',
                background: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,.4)'; e.currentTarget.style.color = '#10b981' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isLight ? 'rgba(0,0,0,.15)' : 'rgba(255,255,255,.15)'; e.currentTarget.style.color = 'var(--text)' }}>
              <CalendarDays size={16} /> Book Free Call
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55, delay: .42 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="stat-box">
                <div className="font-poppins text-2xl font-black text-grad text-glow">
                  <CountUp end={s.end} suffix={s.suffix} prefix={s.prefix || ''} />
                </div>
                <div className="text-xs mt-1 uppercase tracking-wider font-medium" style={{ color: 'var(--text3)' }}>
                  {s.lbl}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
        onClick={() => go('services')}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 transition-colors"
        style={{ color: 'var(--text3)' }}
        onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
        <span className="text-[10px] tracking-[.2em] uppercase font-medium">Scroll</span>
        <ChevronDown size={18} className="animate-bounce" />
      </motion.button>
    </section>
  )
}
