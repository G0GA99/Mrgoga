import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageIntro() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          style={{ pointerEvents: 'none' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4"
          >
            {/* G logo mark */}
            <motion.svg
              width="72" height="72" viewBox="0 0 40 40" fill="none"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              <defs>
                <linearGradient id="igMark" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              <path d="M28 6 A16 16 0 1 0 36 20 L29 20 A9 9 0 0 0 25 12 Z" fill="url(#igMark)" />
              <rect x="19" y="17" width="12" height="6" rx="3" fill="url(#igMark)" />
            </motion.svg>

            {/* G0GA */}
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="font-poppins font-black text-white"
              style={{ fontSize: 'clamp(3rem, 9vw, 5rem)', letterSpacing: '0.03em', lineHeight: 1 }}
            >G0GA</motion.span>

            {/* Gradient line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
              style={{
                width: '100%', height: '1px',
                background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)',
                transformOrigin: 'center',
              }}
            />

            {/* AI AGENCY — user approved this */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ delay: 0.55 }}
              className="font-inter font-medium uppercase"
              style={{ fontSize: '0.62rem', letterSpacing: '0.35em', color: '#9ca3af' }}
            >AI Agency</motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
