import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageIntro() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2400)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          style={{ pointerEvents: 'none' }}
        >
          <div className="flex flex-col items-center gap-4">

            {/* G0GA text */}
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'Arial Black, Arial, sans-serif',
                fontWeight: 900,
                fontSize: '3.2rem',
                color: 'white',
                letterSpacing: '6px',
                lineHeight: 1,
              }}
            >G0GA</motion.span>

            {/* Gradient line */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 120,
                height: 1.5,
                background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)',
                borderRadius: 99,
              }}
            />

            {/* AI Agency */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '0.6rem',
                letterSpacing: '0.38em',
                color: '#9ca3af',
                textTransform: 'uppercase',
              }}
            >AI Agency</motion.span>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
