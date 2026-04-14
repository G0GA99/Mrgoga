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
            {/* Wordmark — large, cinematic */}
            <div className="flex items-center" style={{ gap: '0px' }}>
              <motion.span
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22,1,0.36,1] }}
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 900,
                  fontSize: 'clamp(3.5rem, 10vw, 6rem)',
                  letterSpacing: '-3px',
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1,
                }}>G</motion.span>

              {/* The "0" — brand signature with circle */}
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.22,1,0.36,1] }}
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 900,
                  fontSize: 'clamp(3.5rem, 10vw, 6rem)',
                  letterSpacing: '-3px',
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1,
                  display: 'inline-block',
                  border: '2.5px solid rgba(16,185,129,0.6)',
                  borderRadius: '50%',
                  padding: '0 6px',
                  margin: '0 2px',
                }}>0</motion.span>

              <motion.span
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22,1,0.36,1] }}
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 900,
                  fontSize: 'clamp(3.5rem, 10vw, 6rem)',
                  letterSpacing: '-3px',
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1,
                }}>GA</motion.span>
            </div>

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
