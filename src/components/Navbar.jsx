import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const links = ['Services', 'Portfolio', 'Pricing', 'Team', 'Contact']

// Minimal G0GA logo mark — hexagon with circuit node
function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="14,1 25.5,7.5 25.5,20.5 14,27 2.5,20.5 2.5,7.5"
        fill="none"
        stroke="url(#logoGrad)"
        strokeWidth="1.5"
      />
      <circle cx="14" cy="14" r="3.5" fill="url(#logoGrad)" />
      <line x1="14" y1="10.5" x2="14" y2="5"   stroke="url(#logoGrad)" strokeWidth="1" strokeLinecap="round" />
      <line x1="17.5" y1="16"  x2="22" y2="18.5" stroke="url(#logoGrad)" strokeWidth="1" strokeLinecap="round" />
      <line x1="10.5" y1="16"  x2="6"  y2="18.5" stroke="url(#logoGrad)" strokeWidth="1" strokeLinecap="round" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const [active, setActive]     = useState('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
      let current = ''
      links.forEach(l => {
        const el = document.getElementById(l.toLowerCase())
        if (el && window.scrollY >= el.offsetTop - 130) current = l.toLowerCase()
      })
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'py-3 border-b border-white/6'
            : 'py-5'
        }`}
        style={scrolled ? { background: 'rgba(0,0,0,.88)', backdropFilter: 'blur(24px)' } : {}}>

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group">
            <div className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              <LogoMark />
            </div>
            <span className="font-poppins font-black text-xl text-grad tracking-tight"
              style={{ letterSpacing: '-0.5px' }}>
              G0GA
            </span>
          </button>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-7">
            {links.map(l => (
              <li key={l}>
                <button onClick={() => go(l)}
                  className="relative text-sm font-medium transition-colors duration-300 group"
                  style={{ color: active === l.toLowerCase() ? '#10b981' : '#9ca3af' }}>
                  {l}
                  <span className="absolute -bottom-1 left-0 h-px rounded-full transition-all duration-300"
                    style={{
                      width: active === l.toLowerCase() ? '100%' : '0%',
                      background: 'linear-gradient(90deg,#10b981,#34d399)'
                    }} />
                </button>
              </li>
            ))}
          </ul>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            <button onClick={() => go('Contact')}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-white/12 text-gray-400 hover:text-white hover:border-white/25 transition-all duration-300">
              Free Call
            </button>
            <button onClick={() => go('Contact')}
              className="px-5 py-2.5 text-sm font-bold text-black rounded-xl transition-all duration-300 hover:opacity-90 hover:-translate-y-px"
              style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', boxShadow: '0 4px 16px rgba(16,185,129,.25)' }}>
              Start Project →
            </button>
          </div>

          {/* Mobile menu btn */}
          <button className="md:hidden text-gray-400 hover:text-white transition-colors" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8"
            style={{ background: 'rgba(0,0,0,.97)', backdropFilter: 'blur(24px)' }}>

            <button className="absolute top-5 right-6 text-gray-500 hover:text-white transition-colors"
              onClick={() => setOpen(false)}>
              <X size={24} />
            </button>

            {/* Mobile logo */}
            <div className="absolute top-5 left-6 flex items-center gap-2">
              <LogoMark />
              <span className="font-poppins font-black text-lg text-grad">G0GA</span>
            </div>

            {links.map((l, i) => (
              <motion.button key={l}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => go(l)}
                className="font-poppins text-3xl font-bold text-white/80 hover:text-white transition-colors">
                {l}
              </motion.button>
            ))}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              onClick={() => go('Contact')}
              className="mt-2 px-10 py-3.5 text-black font-bold text-base rounded-2xl"
              style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', boxShadow: '0 8px 30px rgba(16,185,129,.3)' }}>
              Start Project
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
