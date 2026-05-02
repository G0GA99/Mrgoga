import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon } from 'lucide-react'

const links = ['Services', 'Portfolio', 'Pricing', 'Team', 'Contact']

function LogoMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lgMain" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="lgFill" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Container */}
      <rect x="1" y="1" width="34" height="34" rx="11" fill="url(#lgFill)" stroke="url(#lgMain)" strokeWidth="1.2" />
      {/* G letterform — arc top-right + horizontal bar */}
      <path
        d="M24 14.2C22.3 11.9 20.3 10.8 18 10.8C13.5 10.8 9.8 14.5 9.8 19C9.8 23.5 13.5 27.2 18 27.2C21.7 27.2 24.8 24.9 25.9 21.6H18V19H28V21.8C26.8 26.2 22.8 29.2 18 29.2C12.4 29.2 7.8 24.6 7.8 19C7.8 13.4 12.4 8.8 18 8.8C20.9 8.8 23.5 10 25.4 12L24 14.2Z"
        fill="url(#lgMain)"
      />
      {/* Circuit dot top-right corner accent */}
      <circle cx="30" cy="6" r="2" fill="url(#lgMain)" opacity="0.7" />
      <line x1="28.5" y1="6" x2="25" y2="6" stroke="url(#lgMain)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

export default function Navbar({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const [active, setActive]     = useState('')

  const isLight = theme === 'light'

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

  const navBg = scrolled
    ? isLight
      ? 'rgba(240,244,248,0.93)'
      : 'rgba(6,6,15,0.90)'
    : 'transparent'

  const borderBottom = scrolled
    ? isLight
      ? '1px solid rgba(0,0,0,0.08)'
      : '1px solid rgba(255,255,255,0.06)'
    : '1px solid transparent'

  const textColor      = isLight ? '#0f172a' : '#f1f5f9'
  const textMuted      = isLight ? '#64748b'  : '#6b7280'
  const textActive     = isLight ? '#059669'  : '#10b981'
  const outlineBorder  = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'
  const outlineText    = isLight ? '#475569'  : '#9ca3af'

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: navBg,
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom,
          padding: scrolled ? '12px 0' : '20px 0',
          transition: 'padding .4s ease, background .35s ease, border-color .35s ease',
        }}>

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group">
            <div className="transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
              <LogoMark />
            </div>
            <span
              className="font-poppins font-black text-xl text-grad tracking-tight"
              style={{ letterSpacing: '-0.5px' }}>
              G0GA
            </span>
          </button>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-7">
            {links.map(l => (
              <li key={l}>
                <button
                  onClick={() => go(l)}
                  className="relative text-sm font-medium transition-colors duration-300"
                  style={{ color: active === l.toLowerCase() ? textActive : textMuted }}>
                  {l}
                  <span
                    className="absolute -bottom-1 left-0 h-px rounded-full transition-all duration-300"
                    style={{
                      width: active === l.toLowerCase() ? '100%' : '0%',
                      background: 'linear-gradient(90deg, var(--teal), var(--teal2))',
                    }} />
                </button>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isLight ? 'Switch to Dark' : 'Switch to Light'}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{
                border: `1px solid ${outlineBorder}`,
                color: outlineText,
                background: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--teal)'
                e.currentTarget.style.color = 'var(--teal)'
                e.currentTarget.style.background = 'rgba(16,185,129,.07)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = outlineBorder
                e.currentTarget.style.color = outlineText
                e.currentTarget.style.background = 'transparent'
              }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -30, scale: .7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 30, scale: .7 }}
                  transition={{ duration: .2 }}>
                  {isLight ? <Moon size={15} /> : <Sun size={15} />}
                </motion.span>
              </AnimatePresence>
            </button>

            <button
              onClick={() => go('Contact')}
              className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300"
              style={{
                border: `1px solid ${outlineBorder}`,
                color: outlineText,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(16,185,129,.35)'
                e.currentTarget.style.color = 'var(--teal)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = outlineBorder
                e.currentTarget.style.color = outlineText
              }}>
              Free Call
            </button>

            <button
              onClick={() => go('Contact')}
              className="px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 hover:opacity-90 hover:-translate-y-px"
              style={{
                background: 'linear-gradient(135deg, var(--teal), var(--teal2))',
                boxShadow: '0 4px 18px rgba(16,185,129,.28)',
                color: '#fff',
              }}>
              Start Project →
            </button>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: textMuted }}>
              {isLight ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              className="transition-colors"
              style={{ color: textMuted }}
              onClick={() => setOpen(true)}>
              <Menu size={22} />
            </button>
          </div>
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
            style={{
              background: isLight ? 'rgba(240,244,248,.97)' : 'rgba(6,6,15,.97)',
              backdropFilter: 'blur(28px)',
            }}>

            <button
              className="absolute top-5 right-6 transition-colors"
              style={{ color: textMuted }}
              onClick={() => setOpen(false)}>
              <X size={24} />
            </button>

            {/* Mobile logo */}
            <div className="absolute top-5 left-6 flex items-center gap-2">
              <LogoMark />
              <span className="font-poppins font-black text-lg text-grad">G0GA</span>
            </div>

            {links.map((l, i) => (
              <motion.button
                key={l}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => go(l)}
                className="font-poppins text-3xl font-bold transition-colors"
                style={{ color: active === l.toLowerCase() ? 'var(--teal)' : textColor }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--teal)'}
                onMouseLeave={e => e.currentTarget.style.color = active === l.toLowerCase() ? 'var(--teal)' : textColor}>
                {l}
              </motion.button>
            ))}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              onClick={() => go('Contact')}
              className="mt-2 px-10 py-3.5 font-bold text-base rounded-2xl text-white"
              style={{
                background: 'linear-gradient(135deg, var(--teal), var(--teal2))',
                boxShadow: '0 8px 30px rgba(16,185,129,.3)',
              }}>
              Start Project
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
