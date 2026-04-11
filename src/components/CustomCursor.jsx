import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dot   = useRef(null)
  const ring  = useRef(null)
  const pos   = useRef({ x: -100, y: -100 })
  const ring_ = useRef({ x: -100, y: -100 })
  const raf   = useRef(null)

  useEffect(() => {
    const onMove = e => { pos.current = { x: e.clientX, y: e.clientY } }

    const onEnter = () => ring.current?.style && (ring.current.style.transform = 'translate(-50%,-50%) scale(1.7)', ring.current.style.borderColor = '#34d399')
    const onLeave = () => ring.current?.style && (ring.current.style.transform = 'translate(-50%,-50%) scale(1)',   ring.current.style.borderColor = 'rgba(16,185,129,.55)')

    const loop = () => {
      ring_.current.x += (pos.current.x - ring_.current.x) * 0.12
      ring_.current.y += (pos.current.y - ring_.current.y) * 0.12

      if (dot.current) {
        dot.current.style.left = pos.current.x + 'px'
        dot.current.style.top  = pos.current.y + 'px'
      }
      if (ring.current) {
        ring.current.style.left = ring_.current.x + 'px'
        ring.current.style.top  = ring_.current.y + 'px'
      }
      raf.current = requestAnimationFrame(loop)
    }

    document.addEventListener('mousemove', onMove)
    document.querySelectorAll('a,button,input,select,textarea,[data-hover]').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    raf.current = requestAnimationFrame(loop)
    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  // Hide on touch devices
  if ('ontouchstart' in window) return null

  return (
    <>
      {/* Dot */}
      <div ref={dot} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9999,
        width: 7, height: 7, borderRadius: '50%',
        background: '#10b981',
        transform: 'translate(-50%,-50%)',
        transition: 'opacity .2s',
      }} />
      {/* Ring */}
      <div ref={ring} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9998,
        width: 36, height: 36, borderRadius: '50%',
        border: '1.5px solid rgba(16,185,129,.55)',
        transform: 'translate(-50%,-50%) scale(1)',
        transition: 'transform .18s ease, border-color .18s ease',
      }} />
    </>
  )
}
