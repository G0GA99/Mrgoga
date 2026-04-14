import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageIntro() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          style={{ pointerEvents: 'none' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.12 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-5"
          >
            {/* Logo mark */}
            <motion.svg
              width="56" height="56" viewBox="0 0 28 28" fill="none"
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.22,1,0.36,1] }}>
              <polygon points="14,1 25.5,7.5 25.5,20.5 14,27 2.5,20.5 2.5,7.5"
                fill="none" stroke="url(#ig)" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="3.5" fill="url(#ig)" />
              <line x1="14" y1="10.5" x2="14" y2="5"   stroke="url(#ig)" strokeWidth="1" strokeLinecap="round" />
              <line x1="17.5" y1="16"  x2="22" y2="18.5" stroke="url(#ig)" strokeWidth="1" strokeLinecap="round" />
              <line x1="10.5" y1="16"  x2="6"  y2="18.5" stroke="url(#ig)" strokeWidth="1" strokeLinecap="round" />
              <defs>
                <linearGradient id="ig" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </motion.svg>

            <span
              className="font-poppins font-black text-6xl md:text-8xl text-grad"
              style={{ letterSpacing: '-3px' }}
            >
              G0GA
            </span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeInOut' }}
              className="h-[2px] rounded-full"
              style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 text-xs tracking-[0.3em] uppercase font-medium"
            >
              AI Agency
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
