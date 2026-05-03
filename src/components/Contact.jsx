import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, Clock, Globe, MessageSquare, Mail } from 'lucide-react'
import SocialIcon, { SOCIALS_CONTACT } from './SocialIcons'

const SERVICES = ['Branding & Animation','Web Experience','Product Visualization','AI Integration','Data Visualization','Full Package']
const BUDGETS  = ['Under $500','$500–$2,000','$2,000–$5,000','$5,000–$10,000','$10,000+']

export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', company:'', service:'', budget:'', message:'' })
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setSending(true)

    const leads = JSON.parse(localStorage.getItem('g0ga_leads') || '[]')
    leads.push({ ...form, date: new Date().toISOString() })
    localStorage.setItem('g0ga_leads', JSON.stringify(leads))

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.ok) setError('Server error — please WhatsApp us directly.')
      else setDone(true)
    } catch {
      setError('Network error — please WhatsApp us directly.')
    }
    setSending(false)
  }

  return (
    <section id="contact" className="section" style={{ background:'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6">

        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.6 }} className="text-center mb-14">
          <span className="badge mb-5 inline-flex"><span className="badge-dot" />Build Together</span>
          <h2 className="sec-title">Start Your <span className="text-grad">AI Journey</span></h2>
          <p className="text-base max-w-lg mx-auto" style={{ color:'var(--text2)' }}>
            Free 30-min strategy call. Zero obligation. Map your project today.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left info */}
          <motion.div initial={{ opacity:0, x:-24 }} whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }} transition={{ duration:.6 }}>
            {[
              { icon: <Clock size={18} />,        t: 'Response Time',     b: 'Under 2 hours — AI agents run 24/7' },
              { icon: <Globe size={18} />,         t: 'Clients Worldwide', b: 'USA · UK · Canada · Europe · Middle East' },
              { icon: <MessageSquare size={18} />, t: 'WhatsApp Direct',   b: 'For instant replies, WhatsApp us anytime' },
              { icon: <Mail size={18} />,          t: 'Email Us',          b: 'gogamr0.01@gmail.com', href: 'mailto:gogamr0.01@gmail.com' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-teal"
                  style={{ background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.18)' }}>
                  {item.icon}
                </div>
                <div>
                  <h5 className="font-semibold text-sm mb-0.5">{item.t}</h5>
                  {item.href
                    ? <a href={item.href} className="text-sm hover:underline" style={{ color:'var(--teal)' }}>{item.b}</a>
                    : <p className="text-sm" style={{ color:'var(--text2)' }}>{item.b}</p>
                  }
                </div>
              </div>
            ))}

            <a href="https://wa.me/923091989556" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm text-white mb-6 hover:-translate-y-0.5 transition-all"
              style={{ background:'#25D366', boxShadow:'0 4px 18px rgba(37,211,102,.28)' }}>
              <span className="text-lg">💬</span> Chat on WhatsApp
            </a>

            <div className="flex gap-2.5 flex-wrap">
              {SOCIALS_CONTACT.map(s => <SocialIcon key={s.name} {...s} />)}
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div initial={{ opacity:0, x:24 }} whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }} transition={{ duration:.6 }}>
            {done ? (
              <div className="card p-10 text-center rounded-2xl"
                style={{ borderColor:'rgba(74,222,128,.2)', background:'rgba(74,222,128,.02)' }}>
                <CheckCircle size={44} className="text-emerald-400 mx-auto mb-4" />
                <h3 className="font-poppins text-xl font-bold mb-2">Message Received!</h3>
                <p className="text-sm" style={{ color:'var(--text2)' }}>Our AI agents are on it. You will hear back within 2 hours.</p>
                <p className="text-gray-600 text-xs mt-3">Ready to start? View our <button onClick={() => { document.getElementById('payment')?.scrollIntoView({behavior:'smooth'}) }} className="text-teal hover:underline">payment options →</button></p>
                <button
                  onClick={() => { setDone(false); setForm({ name:'',email:'',company:'',service:'',budget:'',message:'' }) }}
                  className="mt-5 text-teal text-sm hover:underline">
                  Send another message →
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="card p-8 rounded-2xl space-y-4" aria-busy={sending}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider mb-1.5 block" style={{ color:'var(--text3)' }}>Name *</label>
                    <input required value={form.name} onChange={upd('name')} placeholder="John Smith" className="field" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider mb-1.5 block" style={{ color:'var(--text3)' }}>Email *</label>
                    <input required type="email" value={form.email} onChange={upd('email')} placeholder="you@co.com" className="field" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider mb-1.5 block" style={{ color:'var(--text3)' }}>Company</label>
                  <input value={form.company} onChange={upd('company')} placeholder="Acme Corp" className="field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider mb-1.5 block" style={{ color:'var(--text3)' }}>Service *</label>
                    <select required value={form.service} onChange={upd('service')} className="field cursor-pointer">
                      <option value="">Select…</option>
                      {SERVICES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider mb-1.5 block" style={{ color:'var(--text3)' }}>Budget</label>
                    <select value={form.budget} onChange={upd('budget')} className="field cursor-pointer">
                      <option value="">Select…</option>
                      {BUDGETS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider mb-1.5 block" style={{ color:'var(--text3)' }}>Project Details *</label>
                  <textarea required value={form.message} onChange={upd('message')} rows={4}
                    placeholder="Describe your goals and what you need…" className="field resize-none" />
                </div>
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <button type="submit" disabled={sending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-black font-bold rounded-xl text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all glow disabled:opacity-60"
                  style={{ background:'linear-gradient(135deg,#10b981,#34d399)' }}>
                  <Send size={16} /> {sending ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  )
}
