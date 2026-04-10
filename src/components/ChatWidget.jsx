import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

function ts() {
  const d = new Date()
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
}

const QUICK = ['Services', 'Pricing', 'Book a Call', 'AI Demo', 'AI Agents', 'Portfolio']

async function askClaude(message, history) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    })
    const data = await res.json()
    return data.reply || "Sorry, something went wrong. Please WhatsApp us directly! 💬"
  } catch {
    return "I'm having a moment — please WhatsApp us directly for instant help! 💬"
  }
}

export default function ChatWidget() {
  const [open,   setOpen]   = useState(false)
  const [msgs,   setMsgs]   = useState([{ id:1, role:'bot', text:"Hi! 👋 I'm G0GA's AI Assistant.\n\nAsk me about services, pricing, booking, or our AI work.", time:ts() }])
  const [input,  setInput]  = useState('')
  const [typing, setTyping] = useState(false)
  const [unread, setUnread] = useState(0)
  const endRef = useRef(null)

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => endRef.current?.scrollIntoView({ behavior:'smooth' }), 80) }
  }, [open, msgs])

  const send = async (txt) => {
    const t = (txt || input).trim()
    if (!t || typing) return
    setInput('')

    const userMsg = { id: Date.now(), role:'user', text:t, time:ts() }
    setMsgs(p => [...p, userMsg])
    setTyping(true)

    const logs = JSON.parse(localStorage.getItem('g0ga_chat') || '[]')
    logs.push({ msg:t, ts: new Date().toISOString() })
    localStorage.setItem('g0ga_chat', JSON.stringify(logs))

    const currentHistory = [...msgs, userMsg]
    const reply = await askClaude(t, currentHistory)

    setMsgs(p => [...p, { id: Date.now()+1, role:'bot', text: reply, time:ts() }])
    setTyping(false)
    if (!open) setUnread(n => n+1)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[500] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:20, scale:.96 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:20, scale:.96 }} transition={{ duration:.22 }}
            className="w-[340px] rounded-2xl overflow-hidden flex flex-col"
            style={{ maxHeight:'510px', background:'#0a0a0a', border:'1px solid rgba(16,185,129,.22)', boxShadow:'0 24px 60px rgba(0,0,0,.8)' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/6"
              style={{ background:'linear-gradient(135deg,rgba(16,185,129,.12),rgba(10,10,10,.95))' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#10b981,#34d399)' }}>
                <Bot size={17} className="text-black" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">G0GA AI Assistant</div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink" />
                  Powered by Claude AI · 24/7
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white transition-colors"><X size={17}/></button>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight:'270px' }}>
              {msgs.map(m => (
                <div key={m.id} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                  <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-[.82rem] leading-relaxed whitespace-pre-line ${m.role==='user' ? 'text-black font-medium rounded-br-sm' : 'text-gray-300 rounded-bl-sm'}`}
                    style={{ background: m.role==='user' ? 'linear-gradient(135deg,#10b981,#34d399)' : '#1a1a1a' }}>
                    {m.text}
                    <div className={`text-[10px] mt-1 ${m.role==='user'?'text-black/50':'text-gray-700'}`}>{m.time}</div>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 h-10" style={{ background:'#1a1a1a' }}>
                    {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-teal animate-bounce" style={{ animationDelay:`${i*.13}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
            {/* Quick replies */}
            <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth:'none' }}>
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)} disabled={typing}
                  className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-teal/20 text-teal hover:bg-teal/8 transition-colors whitespace-nowrap disabled:opacity-40">
                  {q}
                </button>
              ))}
            </div>
            {/* Input */}
            <div className="px-4 pb-4 flex gap-2 border-t border-white/5 pt-3">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
                placeholder="Type a message…" disabled={typing}
                className="flex-1 text-white text-[.82rem] rounded-xl px-4 py-2.5 outline-none transition-colors placeholder-gray-700 disabled:opacity-50"
                style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,.08)' }} />
              <button onClick={() => send()} disabled={typing || !input.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-black hover:opacity-90 hover:scale-105 transition-all disabled:opacity-40"
                style={{ background:'linear-gradient(135deg,#10b981,#34d399)' }}>
                <Send size={15}/>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toggle button */}
      <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:.94 }}
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full flex items-center justify-center text-black relative"
        style={{ background:'linear-gradient(135deg,#10b981,#34d399)', boxShadow:'0 6px 28px rgba(16,185,129,.55)' }}>
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x"    initial={{ rotate:-90,opacity:0 }} animate={{ rotate:0,opacity:1 }} exit={{ rotate:90,opacity:0  }}><X size={22}/></motion.div>
            : <motion.div key="chat" initial={{ rotate:90, opacity:0 }} animate={{ rotate:0,opacity:1 }} exit={{ rotate:-90,opacity:0 }}><MessageCircle size={22}/></motion.div>
          }
        </AnimatePresence>
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">{unread}</span>
        )}
      </motion.button>
    </div>
  )
}
