import { motion } from 'framer-motion'
import { team } from '../data/content'

function Avatar({ m }) {
  return (
    <div className="relative w-20 h-20 mx-auto mb-5">
      <div className="absolute inset-0 rounded-full animate-spin-slow opacity-35"
        style={{ border:`2px dashed ${m.isCeo ? '#10b981' : '#34d399'}` }} />
      <div className="absolute inset-1.5 rounded-full flex items-center justify-center text-3xl"
        style={{ background:`radial-gradient(circle, ${m.isCeo?'rgba(16,185,129,.15)':'rgba(52,211,153,.1)'} 0%, transparent 70%)`, border:`1px solid ${m.isCeo?'rgba(16,185,129,.35)':'rgba(52,211,153,.25)'}` }}>
        {m.icon}
      </div>
      <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-black bg-emerald-400" style={{ animation:'blink 2.5s ease-in-out infinite' }} />
    </div>
  )
}

export default function Team() {
  return (
    <section id="team" className="section bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.6 }} className="text-center mb-14">
          <span className="badge mb-5 inline-flex"><span className="badge-dot"/>Our Team</span>
          <h2 className="sec-title">Human + <span className="text-grad">AI</span> Working Together</h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">1 strategic CEO + 4 specialized AI agents — always on, always delivering.</p>
        </motion.div>

        {/* CEO */}
        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.6 }}
          className="max-w-xs mx-auto mb-8">
          <div className="card lift p-8 text-center rounded-2xl relative"
            style={{ borderColor:'rgba(16,185,129,.3)', boxShadow:'0 0 40px rgba(16,185,129,.07)' }}>
            <span className="absolute top-3 right-3 text-[10px] font-bold text-teal bg-teal/10 px-2 py-0.5 rounded">CEO</span>
            <Avatar m={team[0]} />
            <h4 className="font-poppins font-black text-lg mb-1">{team[0].name}</h4>
            <p className="text-teal text-xs font-semibold mb-3">{team[0].role}</p>
            <p className="text-gray-500 text-xs leading-relaxed mb-4">{team[0].bio}</p>
            <div className="flex gap-1.5 justify-center flex-wrap">
              {team[0].skills.map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-teal/8 text-teal border border-teal/20">{s}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Agents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.slice(1).map((m, i) => (
            <motion.div key={m.id} initial={{ opacity:0, y:36 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, amount:.1 }} transition={{ duration:.55, delay: i*.1 }}
              className="card lift p-6 text-center rounded-2xl">
              <Avatar m={m} />
              <h4 className="font-poppins font-bold text-sm mb-1">{m.name}</h4>
              <p className="text-teal2 text-[11px] font-semibold mb-3">{m.role}</p>
              <p className="text-gray-600 text-[11px] leading-relaxed mb-4">{m.bio}</p>
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation:'blink 2.5s ease-in-out infinite' }} />
                <span className="text-emerald-400 text-[10px] font-semibold">Online 24/7</span>
              </div>
              <div className="flex gap-1 justify-center flex-wrap">
                {m.skills.map(s => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-white/4 text-gray-500 border border-white/8">{s}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
