import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Lock, Users, Briefcase, Activity, TrendingUp, LogOut, RefreshCw, AlertCircle, MessageSquare, Send, ChevronRight, Play, Mail, Zap, CheckCircle, XCircle, Clock, Plus, Edit2, Trash2, Image, Upload, Link } from 'lucide-react'

const ADMIN_SECRET = 'g0ga-admin-2025'

function LoginScreen({ onLogin }) {
  const [pass, setPass] = useState('')
  const [err, setErr]   = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (pass === ADMIN_SECRET) { onLogin(); setErr(false) }
    else { setErr(true) }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-poppins font-black text-4xl text-grad mb-2">G0GA</div>
          <p className="text-gray-600 text-sm">Admin Dashboard · CEO Only</p>
        </div>
        <form onSubmit={submit} className="glass-card p-8 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Lock size={16} className="text-teal" />
            <span className="text-sm font-semibold text-gray-300">Enter Admin Password</span>
          </div>
          <input
            type="password" value={pass} onChange={e => setPass(e.target.value)}
            placeholder="Password" autoFocus
            className="field"
          />
          {err && <p className="text-red-400 text-xs">Wrong password</p>}
          <button type="submit"
            className="w-full py-3 rounded-xl text-black font-bold text-sm hover:opacity-90 transition-all glow"
            style={{ background:'linear-gradient(135deg,#10b981,#34d399)' }}>
            Enter Dashboard
          </button>
        </form>
      </motion.div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color = '#10b981' }) {
  return (
    <div className="glass-card p-5 rounded-2xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background:`${color}15`, border:`1px solid ${color}30` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-poppins text-2xl font-black" style={{ color }}>{value}</div>
      {sub && <div className="text-gray-600 text-xs mt-1">{sub}</div>}
    </div>
  )
}

function LeadsTable({ leads }) {
  const statusColor = { new:'#10b981', contacted:'#3b82f6', call_scheduled:'#f59e0b', converted:'#34d399', closed:'#6b7280' }
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/6 flex items-center gap-2">
        <Users size={16} className="text-teal" />
        <span className="font-poppins font-bold text-sm">Leads</span>
        <span className="ml-auto text-gray-600 text-xs">{leads.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              {['Name','Email','Service','Budget','Source','Status','Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-gray-700">No leads yet</td></tr>
            )}
            {leads.map(l => (
              <tr key={l.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-semibold">{l.name}</td>
                <td className="px-4 py-3 text-gray-400">{l.email}</td>
                <td className="px-4 py-3 text-gray-400">{l.service || '—'}</td>
                <td className="px-4 py-3 text-gray-400">{l.budget || '—'}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/6 text-gray-400">
                    {l.source?.replace('_',' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold"
                    style={{ background:`${statusColor[l.status] || '#6b7280'}18`, color: statusColor[l.status] || '#6b7280' }}>
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{new Date(l.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProjectsTable({ projects }) {
  const statusColor = { inquiry:'#f59e0b', in_progress:'#3b82f6', review:'#a78bfa', delivered:'#10b981', closed:'#6b7280' }
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/6 flex items-center gap-2">
        <Briefcase size={16} className="text-teal" />
        <span className="font-poppins font-bold text-sm">Projects</span>
        <span className="ml-auto text-gray-600 text-xs">{projects.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              {['Client','Title','Service','Assigned To','Status','Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-700">No projects yet</td></tr>
            )}
            {projects.map(p => (
              <tr key={p.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-semibold">{p.client_name}</td>
                <td className="px-4 py-3 text-gray-400">{p.title}</td>
                <td className="px-4 py-3 text-gray-400">{p.service || '—'}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal/10 text-teal">{p.assigned_to || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold"
                    style={{ background:`${statusColor[p.status] || '#6b7280'}18`, color: statusColor[p.status] || '#6b7280' }}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AgentLog({ logs }) {
  const agentColor = { Nova:'#6366f1', Kai:'#34d399', Zion:'#a78bfa', Zara:'#f59e0b', Alex:'#10b981' }
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/6 flex items-center gap-2">
        <Activity size={16} className="text-teal" />
        <span className="font-poppins font-bold text-sm">Agent Activity</span>
        <span className="ml-auto text-gray-600 text-xs">{logs.length} actions</span>
      </div>
      <div className="divide-y divide-white/4 max-h-80 overflow-y-auto">
        {logs.length === 0 && <p className="text-center py-8 text-gray-700 text-xs">No agent activity yet</p>}
        {logs.map(l => (
          <div key={l.id} className="px-6 py-3 flex items-start gap-3 hover:bg-white/2 transition-colors">
            <span className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
              style={{ background:`${agentColor[l.agent] || '#10b981'}15`, color: agentColor[l.agent] || '#10b981' }}>
              {l.agent}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-gray-400 text-xs">{l.action?.replace(/_/g,' ')}</span>
            </div>
            <span className="text-gray-700 text-[10px] flex-shrink-0">
              {new Date(l.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Agent Control ───────────────────────────────────────────────────────────

const AGENT_DEFS = [
  { name: 'Scout',  emoji: '🎯', color: '#10b981', desc: 'Find & email prospects globally' },
  { name: 'Nova',   emoji: '📣', color: '#6366f1', desc: 'Post content to LinkedIn' },
  { name: 'Kai',    emoji: '📈', color: '#34d399', desc: 'Run SEO audit on g0ga.vercel.app' },
  { name: 'Zion',   emoji: '✍️', color: '#a78bfa', desc: 'Write & publish blog/article' },
  { name: 'Zara',   emoji: '📋', color: '#f59e0b', desc: 'Check & update leads/projects' },
  { name: 'Luna',   emoji: '🔍', color: '#60a5fa', desc: 'Site health check' },
  { name: 'Vex',    emoji: '🛡️', color: '#f87171', desc: 'Reputation & competitor scan' },
]

function AgentControl({ logs }) {
  const [running, setRunning]   = useState({})
  const [results, setResults]   = useState({})
  const [emailSt, setEmailSt]   = useState(null) // null | 'loading' | 'ok' | 'error'
  const [emailMsg, setEmailMsg] = useState('')
  const [digestSt, setDigestSt] = useState(null)

  const lastRun = (agentName) => {
    const log = logs?.find(l => l.agent === agentName)
    if (!log) return 'Never'
    const d = new Date(log.created_at)
    const diff = Date.now() - d.getTime()
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    if (h > 23) return `${Math.floor(h/24)}d ago`
    if (h > 0)  return `${h}h ago`
    return `${m}m ago`
  }

  const runAgent = async (agentName) => {
    setRunning(p => ({ ...p, [agentName]: true }))
    setResults(p => ({ ...p, [agentName]: null }))
    try {
      const r = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_SECRET },
        body: JSON.stringify({ action: 'run-agent', agent: agentName }),
        signal: AbortSignal.timeout(100000),
      })
      const data = await r.json()
      setResults(p => ({ ...p, [agentName]: { ok: r.ok, data } }))
    } catch (e) {
      setResults(p => ({ ...p, [agentName]: { ok: false, data: { error: e.message } } }))
    } finally {
      setRunning(p => ({ ...p, [agentName]: false }))
    }
  }

  const testEmail = async () => {
    setEmailSt('loading')
    try {
      const r = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_SECRET },
        body: JSON.stringify({ action: 'test-email' }),
      })
      const data = await r.json()
      setEmailSt(data.ok ? 'ok' : 'error')
      setEmailMsg(data.message || data.error || '')
    } catch (e) {
      setEmailSt('error'); setEmailMsg(e.message)
    }
  }

  const sendDigest = async () => {
    setDigestSt('loading')
    try {
      const r = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_SECRET },
        body: JSON.stringify({ action: 'digest' }),
      })
      const data = await r.json()
      setDigestSt(data.ok ? 'ok' : 'error')
    } catch { setDigestSt('error') }
  }

  return (
    <div className="space-y-5">
      {/* Email Tools */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Mail size={16} className="text-teal" />
          <span className="font-poppins font-bold text-sm">Email Controls</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Test Email */}
          <div className="bg-white/4 rounded-xl p-4">
            <div className="text-xs font-semibold text-gray-300 mb-1">Test Email System</div>
            <div className="text-[10px] text-gray-600 mb-3">Verify Resend is working — sends test mail to gogamr0.01@gmail.com</div>
            <button onClick={testEmail} disabled={emailSt === 'loading'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}>
              {emailSt === 'loading' ? <RefreshCw size={12} className="animate-spin" /> : <Mail size={12} />}
              {emailSt === 'loading' ? 'Sending...' : 'Send Test Email'}
            </button>
            {emailSt === 'ok'    && <p className="text-green-400 text-[10px] mt-2 flex items-center gap-1"><CheckCircle size={10}/> {emailMsg || 'Email sent! Check inbox.'}</p>}
            {emailSt === 'error' && <p className="text-red-400   text-[10px] mt-2 flex items-center gap-1"><XCircle    size={10}/> {emailMsg || 'Failed — check RESEND_API_KEY'}</p>}
          </div>
          {/* Weekly Digest */}
          <div className="bg-white/4 rounded-xl p-4">
            <div className="text-xs font-semibold text-gray-300 mb-1">Send Weekly Digest Now</div>
            <div className="text-[10px] text-gray-600 mb-3">Force-send the weekly CEO summary email immediately</div>
            <button onClick={sendDigest} disabled={digestSt === 'loading'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)' }}>
              {digestSt === 'loading' ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
              {digestSt === 'loading' ? 'Sending...' : 'Send Digest'}
            </button>
            {digestSt === 'ok'    && <p className="text-green-400 text-[10px] mt-2 flex items-center gap-1"><CheckCircle size={10}/> Digest sent!</p>}
            {digestSt === 'error' && <p className="text-red-400   text-[10px] mt-2 flex items-center gap-1"><XCircle    size={10}/> Failed — check Supabase + Resend</p>}
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6 flex items-center gap-2">
          <Play size={16} className="text-teal" />
          <span className="font-poppins font-bold text-sm">Run Agents Manually</span>
          <span className="ml-auto text-gray-600 text-xs">Takes 30–90 sec per agent</span>
        </div>
        <div className="divide-y divide-white/5">
          {AGENT_DEFS.map(agent => {
            const res = results[agent.name]
            const busy = running[agent.name]
            return (
              <div key={agent.name} className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <span className="text-xl">{agent.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold" style={{ color: agent.color }}>{agent.name}</span>
                      <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                        <Clock size={9}/> {lastRun(agent.name)}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500">{agent.desc}</div>
                  </div>
                  <button onClick={() => runAgent(agent.name)} disabled={busy}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-black disabled:opacity-40 transition-all flex-shrink-0"
                    style={{ background: busy ? '#374151' : `linear-gradient(135deg,${agent.color},#34d399)`, color: busy ? '#6b7280' : 'black' }}>
                    {busy ? <RefreshCw size={12} className="animate-spin text-gray-400" /> : <Play size={12} />}
                    {busy ? 'Running...' : 'Run Now'}
                  </button>
                </div>
                {res && (
                  <div className={`mt-3 px-3 py-2 rounded-lg text-[11px] font-mono ${res.ok ? 'bg-green-500/8 text-green-300 border border-green-500/15' : 'bg-red-500/8 text-red-300 border border-red-500/15'}`}>
                    {res.ok
                      ? `✅ Done — ${JSON.stringify(res.data?.result || res.data).slice(0, 180)}`
                      : `❌ Error — ${res.data?.error || JSON.stringify(res.data).slice(0, 120)}`
                    }
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Agent Chat ──────────────────────────────────────────────────────────────

const AGENTS = [
  { name: 'Scout',  color: '#10b981', emoji: '🎯', desc: 'Outreach & Business Dev' },
  { name: 'Zara',   color: '#f59e0b', emoji: '📋', desc: 'Project Manager' },
  { name: 'Nova',   color: '#6366f1', emoji: '📣', desc: 'Marketing & Social' },
  { name: 'Kai',    color: '#34d399', emoji: '📈', desc: 'SEO Specialist' },
  { name: 'Zion',   color: '#a78bfa', emoji: '✍️', desc: 'Content Creator' },
  { name: 'Alex',   color: '#10b981', emoji: '💬', desc: 'Sales Consultant' },
  { name: 'Luna',   color: '#60a5fa', emoji: '🔍', desc: 'Site Health Monitor' },
  { name: 'Vex',    color: '#f87171', emoji: '🛡️', desc: 'Reputation Monitor' },
]

function AgentChat() {
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [messages, setMessages]           = useState([])
  const [input, setInput]                 = useState('')
  const [sending, setSending]             = useState(false)
  const bottomRef                         = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectAgent = (agent) => {
    setSelectedAgent(agent)
    setMessages([{
      role: 'agent',
      text: `Hey MrGoga. I'm ${agent.name} — ${agent.desc}. What do you want to know?`,
    }])
  }

  const send = async () => {
    if (!input.trim() || !selectedAgent || sending) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setSending(true)

    try {
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'agent')
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))

      const r = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_SECRET },
        body: JSON.stringify({ agent: selectedAgent.name, message: userMsg, history }),
      })
      const data = await r.json()
      setMessages(prev => [...prev, { role: 'agent', text: data.reply || 'No response.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'agent', text: 'Connection error. Try again.' }])
    } finally {
      setSending(false)
    }
  }

  const agentInfo = selectedAgent ? AGENTS.find(a => a.name === selectedAgent.name) : null

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/6 flex items-center gap-2">
        <MessageSquare size={16} className="text-teal" />
        <span className="font-poppins font-bold text-sm">Talk to Your Agents</span>
        <span className="ml-auto text-gray-600 text-xs">CEO Private</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 h-[480px]">
        {/* Agent selector */}
        <div className="border-r border-white/6 overflow-y-auto">
          {AGENTS.map(agent => (
            <button key={agent.name} onClick={() => selectAgent(agent)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/4 transition-colors border-b border-white/4"
              style={{ background: selectedAgent?.name === agent.name ? `${agent.color}10` : undefined }}>
              <span className="text-lg">{agent.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: selectedAgent?.name === agent.name ? agent.color : undefined }}>{agent.name}</div>
                <div className="text-[10px] text-gray-600 truncate">{agent.desc}</div>
              </div>
              {selectedAgent?.name === agent.name && <ChevronRight size={12} style={{ color: agent.color }} />}
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2 flex flex-col">
          {!selectedAgent ? (
            <div className="flex-1 flex items-center justify-center text-gray-700 text-sm flex-col gap-2">
              <MessageSquare size={32} className="opacity-30" />
              <span>Select an agent to start chatting</span>
            </div>
          ) : (
            <>
              {/* Agent header */}
              <div className="px-4 py-3 border-b border-white/6 flex items-center gap-2"
                style={{ background: `${agentInfo.color}08` }}>
                <span className="text-base">{agentInfo.emoji}</span>
                <div>
                  <span className="text-sm font-bold" style={{ color: agentInfo.color }}>{selectedAgent.name}</span>
                  <span className="text-gray-600 text-[10px] ml-2">{agentInfo.desc}</span>
                </div>
                <span className="ml-auto text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> online
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'text-black font-medium'
                        : 'text-gray-200 bg-white/6'
                    }`}
                      style={m.role === 'user' ? { background: `linear-gradient(135deg, ${agentInfo.color}, #34d399)` } : {}}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-white/6 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-white/6 flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder={`Ask ${selectedAgent.name} anything...`}
                  disabled={sending}
                  className="field flex-1"
                  style={{ borderRadius: '12px', padding: '10px 16px', fontSize: '0.875rem' }}
                />
                <button onClick={send} disabled={!input.trim() || sending}
                  className="px-4 py-2.5 rounded-xl text-black font-bold text-sm hover:opacity-90 disabled:opacity-30 transition-all flex items-center gap-1.5"
                  style={{ background: `linear-gradient(135deg, ${agentInfo.color}, #34d399)` }}>
                  <Send size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Portfolio Manager ────────────────────────────────────────────────────────

const PRESET_COLORS = ['#10b981','#34d399','#6366f1','#a78bfa','#f59e0b','#60a5fa','#f87171']
const PORT_TYPES    = ['AI Integration','Web Experience','Design','Automation','Product Viz','AI Ecosystem','Branding']
const PORT_LOCS     = ['USA','UK','Canada','Europe','UAE','Australia','Pakistan','Dubai','Germany','Global']

const BLANK = {
  title:'', client:'', location:'USA', type:'AI Integration', description:'',
  result1_val:'', result1_lbl:'', result2_val:'', result2_lbl:'',
  result3_val:'', result3_lbl:'', tech:'', accent_color:'#10b981',
  cover_image_url:'',
}

function PortfolioManager() {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [form,     setForm]     = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [msg,      setMsg]      = useState(null)
  const [uploading,setUploading]= useState(false)
  const fileInputRef = useRef(null)

  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 3500) }

  const uploadImage = async (file) => {
    if (!file) return
    const MAX = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX) return flash(false, 'File too large — max 10MB')
    setUploading(true)
    try {
      // 1 — get signed upload URL from server
      const urlRes = await fetch(`/api/admin-data?action=upload-url&filename=${encodeURIComponent(file.name)}`, {
        headers: { 'x-admin-token': ADMIN_SECRET }
      })
      const urlData = await urlRes.json()
      if (!urlRes.ok) return flash(false, urlData.error || 'Upload URL failed')

      // 2 — PUT file directly to Supabase Storage
      const putRes = await fetch(urlData.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!putRes.ok) return flash(false, 'Upload to storage failed')

      // 3 — save public URL in form
      setForm(p => ({ ...p, cover_image_url: urlData.publicUrl }))
      flash(true, 'Image uploaded!')
    } catch (e) {
      flash(false, 'Upload error: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin-data?action=portfolio-admin', {
        headers: { 'x-admin-token': ADMIN_SECRET }
      })
      const data = await r.json()
      setItems(data.items || [])
    } catch { flash(false, 'Failed to load portfolio') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form?.title?.trim()) return flash(false, 'Title is required')
    setSaving(true)
    try {
      const isNew = !form.id
      const r = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_SECRET },
        body: JSON.stringify({ action: isNew ? 'portfolio-add' : 'portfolio-update', ...form }),
      })
      const data = await r.json()
      if (!r.ok) return flash(false, data.error || 'Save failed')
      flash(true, isNew ? 'Portfolio item added!' : 'Updated successfully!')
      setForm(null)
      load()
    } catch (e) { flash(false, e.message) }
    finally { setSaving(false) }
  }

  const del = async (id) => {
    setDeleting(id)
    try {
      const r = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_SECRET },
        body: JSON.stringify({ action: 'portfolio-delete', id }),
      })
      const data = await r.json()
      if (!r.ok) return flash(false, data.error || 'Delete failed')
      flash(true, 'Deleted!')
      load()
    } catch (e) { flash(false, e.message) }
    finally { setDeleting(null) }
  }

  const field = (key, value, type = 'text', placeholder = '') => (
    type === 'textarea'
      ? <textarea
          value={value} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder} rows={3}
          className="field w-full text-xs resize-none" style={{ borderRadius:'10px', padding:'10px 14px' }} />
      : type === 'select'
        ? null
        : <input
            type={type} value={value}
            onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
            placeholder={placeholder}
            className="field w-full text-xs" style={{ borderRadius:'10px', padding:'10px 14px' }} />
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image size={16} className="text-teal" />
          <span className="font-poppins font-bold text-sm">Portfolio ({items.length} items)</span>
        </div>
        <button onClick={() => setForm({ ...BLANK })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-black text-xs font-bold transition-all"
          style={{ background:'linear-gradient(135deg,#10b981,#34d399)' }}>
          <Plus size={13} /> Add New
        </button>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold ${msg.ok ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {msg.ok ? <CheckCircle size={13}/> : <XCircle size={13}/>} {msg.text}
        </div>
      )}

      {/* Form */}
      {form && (
        <div className="glass-card rounded-2xl p-6 space-y-5 border border-teal/20">
          <div className="flex items-center justify-between mb-1">
            <span className="font-poppins font-bold text-sm text-teal">{form.id ? 'Edit Item' : 'Add New Item'}</span>
            <button onClick={() => setForm(null)} className="text-gray-600 hover:text-white transition-colors"><XCircle size={16}/></button>
          </div>

          {/* Row 1: Title + Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5 block">Project Title *</label>
              {field('title', form.title, 'text', 'e.g. TechCorp AI Dashboard')}
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5 block">Client Name</label>
              {field('client', form.client, 'text', 'e.g. Tech Startup')}
            </div>
          </div>

          {/* Row 2: Location + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5 block">Location</label>
              <select value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                className="field w-full text-xs" style={{ borderRadius:'10px', padding:'10px 14px' }}>
                {PORT_LOCS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5 block">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="field w-full text-xs" style={{ borderRadius:'10px', padding:'10px 14px' }}>
                {PORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5 block">Description</label>
            {field('description', form.description, 'textarea', 'Describe the project, what you built, what problem it solved...')}
          </div>

          {/* Results 1–3 */}
          <div>
            <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-2 block">Results (3 stats shown on card)</label>
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3].map(n => (
                <div key={n} className="bg-white/4 rounded-xl p-3 space-y-2">
                  <div className="text-[10px] text-gray-600 font-semibold">Result {n}</div>
                  <input value={form[`result${n}_val`]}
                    onChange={e => setForm(p => ({ ...p, [`result${n}_val`]: e.target.value }))}
                    placeholder="40%" className="field w-full text-xs" style={{ borderRadius:'8px', padding:'7px 10px' }} />
                  <input value={form[`result${n}_lbl`]}
                    onChange={e => setForm(p => ({ ...p, [`result${n}_lbl`]: e.target.value }))}
                    placeholder="Faster Ops" className="field w-full text-xs" style={{ borderRadius:'8px', padding:'7px 10px' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Tech Tags */}
          <div>
            <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5 block">Tech Tags <span className="text-gray-700 normal-case">(comma separated)</span></label>
            {field('tech', form.tech, 'text', 'React, AI Agents, WebGL, Supabase')}
          </div>

          {/* Cover Image */}
          <div>
            <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-2 block">Cover Image</label>
            <input type="file" ref={fileInputRef} accept="image/*,video/mp4,video/webm"
              className="hidden" onChange={e => uploadImage(e.target.files[0])} />

            {form.cover_image_url ? (
              <div className="relative rounded-xl overflow-hidden border border-teal/20 mb-2">
                <img src={form.cover_image_url} alt="Cover" className="w-full h-32 object-cover" />
                <button onClick={() => setForm(p => ({ ...p, cover_image_url: '' }))}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-500/80 transition-all">
                  <XCircle size={12}/>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-teal/30 hover:bg-teal/3 transition-all"
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#10b981' }}
                onDragLeave={e => { e.currentTarget.style.borderColor = '' }}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = ''; uploadImage(e.dataTransfer.files[0]) }}>
                {uploading
                  ? <div className="flex items-center justify-center gap-2 text-teal text-xs"><RefreshCw size={14} className="animate-spin"/>Uploading...</div>
                  : <div className="text-gray-600 text-xs"><Upload size={20} className="mx-auto mb-2 opacity-40"/><span className="text-teal font-semibold">Click to upload</span> or drag & drop<br/>JPG, PNG, WebP, MP4 — max 10MB</div>
                }
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Link size={12} className="text-gray-600 flex-shrink-0"/>
              <input type="url" value={form.cover_image_url}
                onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))}
                placeholder="Or paste image URL directly"
                className="field w-full text-xs" style={{ borderRadius:'8px', padding:'7px 10px' }} />
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-2 block">Card Accent Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, accent_color: c }))}
                  className="w-8 h-8 rounded-lg transition-all"
                  style={{ background: c, outline: form.accent_color === c ? `2px solid white` : '2px solid transparent', outlineOffset: '2px' }} />
              ))}
            </div>
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-3 pt-1">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-black text-xs font-bold disabled:opacity-50 transition-all"
              style={{ background:'linear-gradient(135deg,#10b981,#34d399)' }}>
              {saving ? <RefreshCw size={12} className="animate-spin"/> : <CheckCircle size={12}/>}
              {saving ? 'Saving...' : (form.id ? 'Save Changes' : 'Add to Portfolio')}
            </button>
            <button onClick={() => setForm(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-gray-600 text-sm">
            <RefreshCw size={14} className="animate-spin"/> Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-700 text-sm">
            <Image size={32} className="mx-auto mb-3 opacity-20"/>
            No portfolio items yet. Add your first project!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {items.map(item => (
              <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                {/* Color dot */}
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.accent_color || '#10b981' }} />
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{item.title}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                      style={{ background:`${item.accent_color || '#10b981'}15`, color: item.accent_color || '#10b981' }}>
                      {item.type}
                    </span>
                    {item.location && <span>{item.location}</span>}
                    {item.client && <span>· {item.client}</span>}
                    {!item.is_active && <span className="text-red-400">· Hidden</span>}
                  </div>
                </div>
                {/* Results preview */}
                <div className="hidden sm:flex gap-3 text-center flex-shrink-0">
                  {[1,2,3].map(n => item[`result${n}_val`] && (
                    <div key={n} className="min-w-[40px]">
                      <div className="text-xs font-black" style={{ color: item.accent_color || '#10b981' }}>{item[`result${n}_val`]}</div>
                      <div className="text-[9px] text-gray-600">{item[`result${n}_lbl`]}</div>
                    </div>
                  ))}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setForm({
                      id: item.id, title: item.title, client: item.client || '',
                      location: item.location || 'USA', type: item.type || 'AI Integration',
                      description: item.description || '',
                      result1_val: item.result1_val || '', result1_lbl: item.result1_lbl || '',
                      result2_val: item.result2_val || '', result2_lbl: item.result2_lbl || '',
                      result3_val: item.result3_val || '', result3_lbl: item.result3_lbl || '',
                      tech: item.tech || '', accent_color: item.accent_color || '#10b981',
                      cover_image_url: item.cover_image_url || '',
                    })}
                    className="p-2 rounded-lg text-gray-500 hover:text-teal hover:bg-teal/10 transition-all">
                    <Edit2 size={13}/>
                  </button>
                  <button onClick={() => { if (confirm(`Delete "${item.title}"?`)) del(item.id) }}
                    disabled={deleting === item.id}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-40">
                    {deleting === item.id ? <RefreshCw size={13} className="animate-spin"/> : <Trash2 size={13}/>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-gray-700 text-xs">Changes appear live on the website within seconds.</p>
    </div>
  )
}

// ─── Main Admin ───────────────────────────────────────────────────────────────

export default function Admin() {
  const [authed, setAuthed]   = useState(() => sessionStorage.getItem('g0ga_admin') === 'yes')
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [tab, setTab]         = useState('dashboard') // 'dashboard' | 'agents' | 'control' | 'portfolio'

  const login = () => { sessionStorage.setItem('g0ga_admin','yes'); setAuthed(true) }
  const logout = () => { sessionStorage.removeItem('g0ga_admin'); setAuthed(false) }

  const fetchData = async () => {
    setLoading(true); setError(null)
    try {
      const r = await fetch('/api/admin-data', { headers: { 'x-admin-token': ADMIN_SECRET } })
      if (!r.ok) throw new Error('Failed to load')
      setData(await r.json())
      localStorage.setItem('g0ga_admin_last_refresh', Date.now().toString())
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!authed) return
    fetchData()
    // Auto-refresh every 2 minutes
    const timer = setInterval(() => fetchData(), 2 * 60 * 1000)
    return () => clearInterval(timer)
  }, [authed])

  if (!authed) return <LoginScreen onLogin={login} />

  const WEEK_MS      = 7 * 24 * 60 * 60 * 1000
  const weekAgo      = new Date(Date.now() - WEEK_MS).toISOString()
  const newLeads     = data?.leads?.filter(l => l.status === 'new').length || 0
  const activeProj   = data?.projects?.filter(p => p.status === 'in_progress').length || 0
  const totalLeads   = data?.leads?.length || 0
  const totalLogs    = data?.logs?.length || 0
  // This week only
  const weekLeads    = data?.leads?.filter(l => l.created_at > weekAgo) || []
  const weekLogs     = data?.logs?.filter(l => l.created_at > weekAgo) || []
  const activeProjects = data?.projects?.filter(p => p.status === 'in_progress') || []
  const lastRefresh  = localStorage.getItem('g0ga_admin_last_refresh')
  const lastRefreshStr = lastRefresh
    ? new Date(Number(lastRefresh)).toLocaleString('en-PK', { timeZone: 'Asia/Karachi', hour12: true, weekday: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Never'

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-white/6"
        style={{ background:'rgba(0,0,0,.92)', backdropFilter:'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-poppins font-black text-xl text-grad">G0GA</span>
            <span className="text-gray-600 text-xs">/ Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <button onClick={() => setTab('dashboard')}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                style={{ background: tab === 'dashboard' ? 'rgba(16,185,129,.2)' : undefined, color: tab === 'dashboard' ? '#10b981' : '#6b7280' }}>
                Dashboard
              </button>
              <button onClick={() => setTab('agents')}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1"
                style={{ background: tab === 'agents' ? 'rgba(16,185,129,.2)' : undefined, color: tab === 'agents' ? '#10b981' : '#6b7280' }}>
                <MessageSquare size={11} /> Agents
              </button>
              <button onClick={() => setTab('control')}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1"
                style={{ background: tab === 'control' ? 'rgba(99,102,241,.2)' : undefined, color: tab === 'control' ? '#6366f1' : '#6b7280' }}>
                <Play size={11} /> Control
              </button>
              <button onClick={() => setTab('portfolio')}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1"
                style={{ background: tab === 'portfolio' ? 'rgba(245,158,11,.2)' : undefined, color: tab === 'portfolio' ? '#f59e0b' : '#6b7280' }}>
                <Image size={11} /> Portfolio
              </button>
            </div>
            <span className="text-gray-600 text-xs">MrGoga · CEO</span>
            <button onClick={fetchData} disabled={loading}
              className="p-2 rounded-lg hover:bg-white/6 text-gray-400 hover:text-white transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white border border-white/8 hover:border-white/20 transition-all">
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {tab === 'dashboard' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users}      label="New Leads"      value={newLeads}    sub="Awaiting contact"     color="#10b981" />
              <StatCard icon={Briefcase}  label="Total Leads"    value={totalLeads}  sub="All time"             color="#3b82f6" />
              <StatCard icon={TrendingUp} label="Active Projects" value={activeProj} sub="In progress"          color="#f59e0b" />
              <StatCard icon={Activity}   label="Agent Actions"  value={totalLogs}   sub="Total logged"         color="#a78bfa" />
            </div>

            {/* Leads + Agent Log */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <LeadsTable leads={weekLeads} />
              </div>
              <AgentLog logs={weekLogs} />
            </div>

            {/* Active Projects only */}
            <ProjectsTable projects={activeProjects} />
          </>
        )}

        {tab === 'agents'    && <AgentChat />}
        {tab === 'control'   && <AgentControl logs={data?.logs || []} />}
        {tab === 'portfolio' && <PortfolioManager />}

        <p className="text-center text-gray-700 text-xs pb-4">
          G0GA Admin · Showing this week's data · Active projects only · Last refreshed: {lastRefreshStr}
        </p>
      </div>
    </div>
  )
}
