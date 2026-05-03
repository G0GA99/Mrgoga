import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { team } from '../data/content'

const ceo        = team.find(m => m.isCeo)
const mgmt       = team.filter(m => m.type === 'management')
const developers = team.filter(m => m.type === 'developer')

// Live activity feed — rotates every 4s
const ACTIVITY_FEED = [
  { agent: 'Nova',  icon: '📣', msg: 'Posted on LinkedIn — "How AI saves 40h/week"' },
  { agent: 'Alex',  icon: '🎯', msg: 'Closed a deal with a US client — $3,200' },
  { agent: 'Zara',  icon: '📋', msg: 'Assigned Orion to build e-commerce dashboard' },
  { agent: 'Orion', icon: '⚡', msg: 'Deployed client web app to Vercel' },
  { agent: 'Cypher',icon: '🤖', msg: 'Integrated AI chatbot for SaaS client' },
  { agent: 'Kai',   icon: '📈', msg: 'G0GA ranked #4 for "AI agency Pakistan"' },
  { agent: 'Zion',  icon: '✍️', msg: 'Published new case study — 3x ROI client' },
  { agent: 'Blaze', icon: '🎨', msg: 'Delivered Figma-to-code for UK startup' },
  { agent: 'Atlas', icon: '☁️', msg: 'Auto-scaled client server — 0 downtime' },
  { agent: 'Rex',   icon: '🔗', msg: 'Smart contract audited & deployed on Ethereum' },
]

function LiveFeed() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % ACTIVITY_FEED.length), 3500)
    return () => clearInterval(t)
  }, [])

  const item = ACTIVITY_FEED[idx]
  return (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-3 px-5 py-3 rounded-xl"
      style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)' }}>
      <span className="text-lg">{item.icon}</span>
      <div className="text-sm">
        <span className="font-bold" style={{ color:'var(--teal)' }}>{item.agent}</span>
        <span style={{ color:'var(--text2)' }}> — {item.msg}</span>
      </div>
      <span className="ml-auto text-[10px] whitespace-nowrap" style={{ color:'var(--text3)' }}>just now</span>
    </motion.div>
  )
}

function AgentCard({ m, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      className="glass-card p-5 text-center rounded-2xl group"
      style={{ borderColor: `${m.color}20` }}>

      {/* Avatar */}
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full animate-spin-slow opacity-30"
          style={{ border: `2px dashed ${m.color}` }} />
        <div className="absolute inset-1.5 rounded-full flex items-center justify-center text-2xl"
          style={{
            background: `radial-gradient(circle, ${m.color}18 0%, transparent 70%)`,
            border: `1px solid ${m.color}30`
          }}>
          {m.icon}
        </div>
        {/* Online pulse dot */}
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 pulse-dot"
          style={{ background: m.color, borderColor:'var(--bg)' }} />
      </div>

      <h4 className="font-poppins font-black text-sm mb-0.5">{m.name}</h4>
      <p className="text-xs font-semibold mb-3" style={{ color: m.color }}>{m.role}</p>
      <p className="text-[11px] leading-relaxed mb-3" style={{ color:'var(--text3)' }}>{m.bio}</p>

      {/* Live tag */}
      <div className="text-[10px] font-medium mb-3 px-2 py-1 rounded-full inline-block"
        style={{ background: `${m.color}10`, color: m.color }}>
        {m.liveTag}
      </div>

      {/* Skills */}
      <div className="flex gap-1 justify-center flex-wrap">
        {m.skills.map(s => (
          <span key={s} className="text-[10px] px-2 py-0.5 rounded border"
            style={{ background:'rgba(16,185,129,.06)', borderColor:'var(--border)', color:'var(--text2)' }}>{s}</span>
        ))}
      </div>
    </motion.div>
  )
}

export default function Team() {
  return (
    <section id="team" className="section" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: .6 }} className="text-center mb-14">
          <span className="badge mb-5 inline-flex"><span className="badge-dot" />Meet the Team</span>
          <h2 className="sec-title">10 AI Agents + <span className="text-grad">1 Human CEO</span></h2>
          <p className="text-base max-w-lg mx-auto" style={{ color:'var(--text2)' }}>
            A fully automated agency. Agents work 24/7 — CEO approves, receives payments, grows the business.
          </p>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: .5 }}
          className="max-w-2xl mx-auto mb-12">
          <div className="text-center text-[11px] text-gray-600 uppercase tracking-wider mb-3 font-semibold">
            ● Live Agent Activity
          </div>
          <LiveFeed />
        </motion.div>

        {/* CEO Card */}
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: .6 }}
          className="max-w-sm mx-auto mb-12">
          <div className="ceo-glass relative p-8 text-center rounded-2xl"
            style={{
              background: 'var(--glass-card-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(16,185,129,.28)',
              boxShadow: '0 0 60px rgba(16,185,129,.08)'
            }}>
            <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(16,185,129,.12)', color: '#10b981', border: '1px solid rgba(16,185,129,.3)' }}>
              CEO
            </span>
            {/* Avatar */}
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full animate-spin-slow opacity-40"
                style={{ border: '2px dashed #10b981' }} />
              <div className="absolute inset-1.5 rounded-full flex items-center justify-center text-3xl"
                style={{ background: 'radial-gradient(circle, rgba(16,185,129,.2) 0%, transparent 70%)', border: '1px solid rgba(16,185,129,.4)' }}>
                {ceo.icon}
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 pulse-dot"
                style={{ borderColor:'var(--bg)' }}
                style={{ background: '#10b981' }} />
            </div>
            <h4 className="font-poppins font-black text-xl mb-1">{ceo.name}</h4>
            <p className="text-teal text-xs font-semibold mb-3">{ceo.role}</p>
            <p className="text-xs leading-relaxed mb-5" style={{ color:'var(--text2)' }}>{ceo.bio}</p>
            <div className="flex gap-1.5 justify-center flex-wrap">
              {ceo.skills.map(s => (
                <span key={s} className="text-[10px] px-2.5 py-1 rounded-full border font-medium"
                  style={{ background: 'rgba(16,185,129,.08)', color: '#10b981', border: '1px solid rgba(16,185,129,.25)' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Management Agents */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: .5 }}
          className="mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,.2))' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color:'var(--text3)' }}>Management Agents</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(16,185,129,.2), transparent)' }} />
          </div>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {mgmt.map((m, i) => <AgentCard key={m.id} m={m} i={i} />)}
        </div>

        {/* Developer Agents */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: .5 }}
          className="mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,.2))' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color:'var(--text3)' }}>Developer Agents</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(16,185,129,.2), transparent)' }} />
          </div>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {developers.map((m, i) => <AgentCard key={m.id} m={m} i={i} />)}
        </div>

        {/* Bottom note */}
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: .4 }}
          className="text-center text-xs mt-10" style={{ color:'var(--text3)' }}>
          ✦ All agents powered by Claude AI + Groq · Online 24/7 · No breaks · No errors
        </motion.p>
      </div>
    </section>
  )
}
