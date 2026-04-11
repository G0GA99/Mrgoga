import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const links = ['Services', 'Portfolio', 'Pricing', 'Team', 'Contact']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const go = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/92 backdrop-blur-xl border-b border-white/8 py-3' : 'py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-poppins font-black text-2xl text-grad tracking-tight">
            G0GA
          </button>
          <ul className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <li key={l}>
                <button onClick={() => go(l)}
                  className="nav-link text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200">
                  {l}
                </button>
              </li>
            ))}
          </ul>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => go('Contact')}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-white/15 text-white hover:border-teal/40 hover:text-teal transition-all">
              Free Call
            </button>
            <button onClick={() => go('Contact')}
              className="px-5 py-2 text-sm font-semibold text-black rounded-lg hover:opacity-90 transition-all glow-sm"
              style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}>
              Start Project →
            </button>
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-xl flex flex-col items-center justify-center gap-7">
            <button className="absolute top-5 right-6 text-gray-500 hover:text-white" onClick={() => setOpen(false)}>
              <X size={26} />
            </button>
            {links.map((l, i) => (
              <motion.button key={l} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }} onClick={() => go(l)}
                className="font-poppins text-3xl font-bold text-white hover:text-grad transition-colors">
                {l}
              </motion.button>
            ))}
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              onClick={() => go('Contact')}
              className="mt-4 px-8 py-3 text-black font-bold text-lg rounded-xl"
              style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}>
              Start Project
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
