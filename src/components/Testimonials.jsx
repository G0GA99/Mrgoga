import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Play, X } from 'lucide-react'
import { testimonials as staticTestimonials } from '../data/content'

// Detect if URL is a video
const isVideoUrl = url => url && /\.(mp4|webm|ogg)$/i.test(url)

// Map Supabase row to display format
function mapDbTestimonial(t) {
  const mediaUrl = t.client_photo_url || null
  return {
    id:       t.id,
    author:   t.client_name,
    company:  t.client_company || '',
    location: t.service || '',
    quote:    t.message,
    rating:   t.rating || 5,
    videoUrl: isVideoUrl(mediaUrl) ? mediaUrl : null,
    photoUrl: !isVideoUrl(mediaUrl) ? mediaUrl : null,
  }
}

// Video modal
function VideoModal({ url, onClose }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,.92)', backdropFilter:'blur(12px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale:.9 }} animate={{ scale:1 }} exit={{ scale:.9 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ aspectRatio:'9/16' }}>
        <video src={url} autoPlay controls playsInline
          className="absolute inset-0 w-full h-full object-cover bg-black" />
        <button onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10"
          style={{ background:'rgba(0,0,0,.7)', color:'#fff' }}>
          <X size={16} />
        </button>
      </motion.div>
    </motion.div>
  )
}

function TestimonialCard({ t, i }) {
  const [playing, setPlaying] = useState(false)

  return (
    <>
      <motion.div initial={{ opacity:0, y:36 }} whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true, amount:.1 }} transition={{ duration:.55, delay: i*.1 }}
        className="glass-card p-8 rounded-2xl relative overflow-hidden">

        {/* Bg glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-[.06]"
          style={{ background: i%2===0 ? '#10b981' : '#34d399' }} />

        {/* Video thumbnail or quote icon */}
        {t.videoUrl ? (
          <div className="relative mb-5 rounded-xl overflow-hidden cursor-pointer group"
            style={{ aspectRatio:'9/16', maxHeight:'240px' }}
            onClick={() => setPlaying(true)}>
            <video src={t.videoUrl} muted playsInline preload="metadata"
              className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background:'rgba(0,0,0,.35)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background:'rgba(16,185,129,.9)', boxShadow:'0 0 30px rgba(16,185,129,.5)' }}>
                <Play size={22} fill="white" color="white" className="ml-1" />
              </div>
            </div>
          </div>
        ) : (
          <Quote size={26} className="mb-4" style={{ color:'rgba(16,185,129,.2)' }} />
        )}

        {/* Stars */}
        <div className="flex gap-0.5 mb-4">
          {Array(t.rating || 5).fill(0).map((_, j) => (
            <motion.span key={j} initial={{ opacity:0, scale:.5 }} whileInView={{ opacity:1, scale:1 }}
              transition={{ delay: j*.08 }} className="text-amber-400 text-sm">★</motion.span>
          ))}
        </div>

        <p className="text-sm leading-relaxed italic mb-6" style={{ color:'var(--text)' }}>"{t.quote}"</p>

        <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor:'var(--border)' }}>
          {t.photoUrl ? (
            <img src={t.photoUrl} alt={t.author}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background:'linear-gradient(135deg,#10b981,#34d399)' }}>
              {(t.author||'?')[0]}
            </div>
          )}
          <div>
            <div className="font-semibold text-sm" style={{ color:'var(--text)' }}>{t.author}</div>
            <div className="text-xs" style={{ color:'var(--text3)' }}>
              {t.company}{t.location ? ` · ${t.location}` : ''}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {playing && <VideoModal url={t.videoUrl} onClose={() => setPlaying(false)} />}
      </AnimatePresence>
    </>
  )
}

export default function Testimonials() {
  const [items, setItems] = useState(staticTestimonials)
  const [idx, setIdx]     = useState(0)

  useEffect(() => {
    fetch('/api/admin-data?action=testimonials')
      .then(r => r.json())
      .then(data => { if (data.items?.length > 0) setItems(data.items.map(mapDbTestimonial)) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 4000)
    return () => clearInterval(t)
  }, [items.length])

  const prev = () => setIdx(i => (i - 1 + items.length) % items.length)
  const next = () => setIdx(i => (i + 1) % items.length)

  return (
    <section id="testimonials" className="section" style={{ background:'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.6 }} className="text-center mb-14">
          <span className="badge mb-5 inline-flex"><span className="badge-dot"/>Client Stories</span>
          <h2 className="sec-title">What Clients <span className="text-grad">Say</span></h2>
        </motion.div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 gap-5 mb-12">
          {items.map((t, i) => <TestimonialCard key={t.id || i} t={t} i={i} />)}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <div className="relative overflow-hidden rounded-2xl mb-5">
            <AnimatePresence mode="wait">
              <motion.div key={idx} initial={{ opacity:0, x:50 }} animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:-50 }} transition={{ duration:.3 }}>
                <TestimonialCard t={items[idx]} i={idx} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button onClick={prev}
              className="w-9 h-9 rounded-full card flex items-center justify-center hover:border-teal/40 hover:text-teal transition-all">
              <ChevronLeft size={16}/>
            </button>
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`rounded-full transition-all ${i===idx ? 'w-5 h-2' : 'w-2 h-2'}`}
                  style={{ background: i===idx ? 'var(--teal)' : 'rgba(255,255,255,.15)' }} />
              ))}
            </div>
            <button onClick={next}
              className="w-9 h-9 rounded-full card flex items-center justify-center hover:border-teal/40 hover:text-teal transition-all">
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>

        {/* Trust row */}
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          className="flex flex-wrap justify-center gap-10 pt-12 border-t"
          style={{ borderColor:'var(--border)' }}>
          {[['50+','Projects'],['98%','Retention'],['4.9★','Rating'],['$2M+','Revenue']].map(([v,l], i) => (
            <div key={i} className="text-center">
              <div className="font-poppins text-xl font-black text-grad">{v}</div>
              <div className="text-xs mt-1" style={{ color:'var(--text3)' }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
