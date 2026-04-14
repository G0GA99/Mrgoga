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
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          style={{ pointerEvents: 'none' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-5"
          >
            {/* Badge — large, glowing */}
            <motion.svg
              width="80" height="80" viewBox="0 0 36 36" fill="none"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <defs>
                <linearGradient id="ig" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <rect width="36" height="36" rx="9" fill="url(#ig)" />
              <text
                x="18" y="24.5"
                textAnchor="middle"
                fontFamily="'Poppins', -apple-system, sans-serif"
                fontWeight="900"
                fontSize="17"
                letterSpacing="-0.5"
                fill="white"
              >G0</text>
            </motion.svg>

            {/* Wordmark */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="font-poppins font-black text-white"
              style={{ fontSize: 'clamp(3rem, 9vw, 5rem)', letterSpacing: '-2px', lineHeight: 1 }}
            >
              G0GA
            </motion.span>

            {/* Gradient line */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
              style={{
                height: '1.5px',
                borderRadius: '99px',
                background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)',
              }}
            />

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.65 }}
              className="font-inter font-medium text-gray-400 uppercase"
              style={{ fontSize: '0.62rem', letterSpacing: '0.35em' }}
            >
              AI Agency
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
