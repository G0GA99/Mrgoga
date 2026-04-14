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
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4"
          >
            {/* Wordmark — large, cinematic, white bold */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              {/* Teal dot accent */}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.22,1,0.36,1] }}
                style={{
                  display: 'inline-block',
                  width: 14, height: 14,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  boxShadow: '0 0 20px rgba(16,185,129,0.7)',
                  flexShrink: 0,
                }}
              />
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.55, ease: [0.22,1,0.36,1] }}
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 900,
                  fontSize: 'clamp(3.5rem, 10vw, 5.5rem)',
                  letterSpacing: '0.02em',
                  color: '#ffffff',
                  lineHeight: 1,
                }}>G0GA</motion.span>
            </motion.div>

            {/* Gradient line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8, delay: 0.35, ease: 'easeInOut' }}
              style={{
                height: '1.5px',
                borderRadius: '99px',
                background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)',
              }}
            />

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ delay: 0.7 }}
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: '#9ca3af',
              }}
            >
              AI Agency
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
