import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dot   = useRef(null)
  const ring  = useRef(null)
  const pos   = useRef({ x: -100, y: -100 })
  const ring_ = useRef({ x: -100, y: -100 })
  const raf   = useRef(null)

  useEffect(() => {
    const onMove = e => { pos.current = { x: e.clientX, y: e.clientY } }

    const loop = () => {
      if (dot.current) {
        dot.current.style.left = pos.current.x + 'px'
        dot.current.style.top  = pos.current.y + 'px'
      }
      raf.current = requestAnimationFrame(loop)
    }

    document.addEventListener('mousemove', onMove)
    raf.current = requestAnimationFrame(loop)
    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  // Hide on touch devices
  if ('ontouchstart' in window) return null

  return (
    <div ref={dot} style={{
      position: 'fixed', pointerEvents: 'none', zIndex: 9999,
      width: 10, height: 10, borderRadius: '50%',
      background: '#10b981',
      transform: 'translate(-50%,-50%)',
      boxShadow: '0 0 4px rgba(16,185,129,.4)',
    }} />
  )
}
