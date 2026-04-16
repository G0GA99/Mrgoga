import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Lock, Users, Briefcase, Activity, TrendingUp, LogOut, RefreshCw, AlertCircle, MessageSquare, Send, ChevronRight } from 'lucide-react'

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
                  className="flex-1 bg-white/6 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25 transition-colors"
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

// ─── Main Admin ───────────────────────────────────────────────────────────────

export default function Admin() {
  const [authed, setAuthed]   = useState(() => sessionStorage.getItem('g0ga_admin') === 'yes')
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [tab, setTab]         = useState('dashboard') // 'dashboard' | 'agents'

  const login = () => { sessionStorage.setItem('g0ga_admin','yes'); setAuthed(true) }
  const logout = () => { sessionStorage.removeItem('g0ga_admin'); setAuthed(false) }

  const fetchData = async () => {
    setLoading(true); setError(null)
    try {
      const r = await fetch('/api/admin-data', { headers: { 'x-admin-token': ADMIN_SECRET } })
      if (!r.ok) throw new Error('Failed to load')
      setData(await r.json())
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (authed) fetchData() }, [authed])

  if (!authed) return <LoginScreen onLogin={login} />

  const newLeads     = data?.leads?.filter(l => l.status === 'new').length || 0
  const activeProj   = data?.projects?.filter(p => p.status === 'in_progress').length || 0
  const totalLeads   = data?.leads?.length || 0
  const totalLogs    = data?.logs?.length || 0

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
                <LeadsTable leads={data?.leads || []} />
              </div>
              <AgentLog logs={data?.logs || []} />
            </div>

            {/* Projects */}
            <ProjectsTable projects={data?.projects || []} />
          </>
        )}

        {tab === 'agents' && <AgentChat />}

        <p className="text-center text-gray-700 text-xs pb-4">
          G0GA Admin · Data from Supabase · Auto-refreshes on load
        </p>
      </div>
    </div>
  )
}
