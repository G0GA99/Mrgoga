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
          <div className="flex flex-col items-center gap-6">

            {/* Animated circle logo */}
            <div className="relative flex items-center justify-center">

              {/* Main teal circle */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: 160, height: 160,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 60px rgba(16,185,129,0.45)',
                }}
              >
                {/* G0GA text animates in */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    fontFamily: 'Arial Black, Arial, sans-serif',
                    fontWeight: 900,
                    fontSize: '2rem',
                    color: 'white',
                    letterSpacing: '3px',
                  }}
                >G0GA</motion.span>
              </motion.div>
            </div>

            {/* AI AGENCY */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.7 }}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '0.6rem',
                letterSpacing: '0.35em',
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
