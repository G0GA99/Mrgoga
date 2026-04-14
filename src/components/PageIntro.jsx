import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageIntro() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
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
            {/* G0GA — large bold wordmark */}
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(3.5rem, 10vw, 5.5rem)',
                letterSpacing: '0.04em',
                color: '#ffffff',
                lineHeight: 1,
              }}
            >G0GA</motion.span>

            {/* Thin gradient line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              style={{
                width: '100%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)',
                transformOrigin: 'center',
              }}
            />

            {/* AGENCY tagline */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ delay: 0.55 }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: '0.6rem',
                letterSpacing: '0.35em',
                color: '#9ca3af',
                textTransform: 'uppercase',
              }}
            >Agency</motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
