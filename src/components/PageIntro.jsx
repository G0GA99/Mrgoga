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
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          style={{ pointerEvents: 'none' }}
        >
          <div className="flex flex-col items-center" style={{ gap: 0 }}>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              style={{
                fontFamily: 'Arial Black, Arial, sans-serif',
                fontWeight: 900,
                fontSize: '3rem',
                letterSpacing: '8px',
                lineHeight: 1,
                marginBottom: 10,
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >G0GA</motion.span>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              style={{
                width: 100,
                height: 1,
                background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)',
                marginBottom: 8,
              }}
            />

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                fontSize: '0.55rem',
                letterSpacing: '0.4em',
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
