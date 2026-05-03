import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator as Calc, Send } from 'lucide-react'

const svcs = [
  { label:'Branding & Animation',    min:100,  max:500   },
  { label:'Web Experience',           min:1000, max:5000  },
  { label:'Product Visualization',   min:5000, max:10000 },
  { label:'AI Integration',             min:2000, max:8000  },
  { label:'Data Visualization',      min:3000, max:12000 },
]
const addons = [
  { label:'None',                         val:0    },
  { label:'+ WhatsApp Integration',       val:500  },
  { label:'+ CRM / Analytics Dashboard',  val:1200 },
  { label:'+ AR / VR Integration',        val:2500 },
  { label:'+ Email Automation',           val:600  },
]
const lvls = ['Basic','Standard','Advanced','Complex','Enterprise']

export default function Calculator() {
  const [svcI, setSvcI]   = useState(0)
  const [addI, setAddI]   = useState(0)
  const [cplx, setCplx]   = useState(2)

  const est = useMemo(() => {
    const s = svcs[svcI]
    const mul = 1 + cplx * 0.2
    return Math.round((((s.min + s.max) / 2) * mul + addons[addI].val) / 50) * 50
  }, [svcI, addI, cplx])

  const pct = Math.min(((est - 100) / 29900) * 100, 100)

  return (
    <section id="calculator" className="py-20" style={{ background:'var(--bg)' }}>
      <div className="max-w-xl mx-auto px-6">
        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.6 }}
          className="card rounded-2xl p-8 border" style={{ borderColor:'rgba(16,185,129,.15)' }}>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,#10b981,#34d399)' }}>
              <Calc size={19} className="text-black" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-lg">Price Calculator</h3>
              <p className="text-xs" style={{ color:'var(--text3)' }}>Instant project estimate</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-medium mb-2 block uppercase tracking-wider" style={{ color:'var(--text3)' }}>Service</label>
              <select value={svcI} onChange={e => setSvcI(+e.target.value)} className="field cursor-pointer">
                {svcs.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block uppercase tracking-wider" style={{ color:'var(--text3)' }}>Add-on</label>
              <select value={addI} onChange={e => setAddI(+e.target.value)} className="field cursor-pointer">
                {addons.map((a, i) => <option key={i} value={i}>{a.label}{a.val ? ` (+$${a.val.toLocaleString()})` : ''}</option>)}
              </select>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color:'var(--text3)' }}>Complexity</label>
                <span className="text-xs font-bold" style={{ color:'var(--teal)' }}>{lvls[cplx]}</span>
              </div>
              <input type="range" min={0} max={4} value={cplx} onChange={e => setCplx(+e.target.value)} className="w-full" />
              <div className="flex justify-between mt-1.5">
                {lvls.map((l, i) => (
                  <span key={i} className="text-[10px]"
                    style={{ color: i===cplx ? 'var(--teal)' : 'var(--text3)', fontWeight: i===cplx ? 600 : 400 }}>
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Bar */}
            <div>
              <div className="flex justify-between text-[10px] mb-1.5" style={{ color:'var(--text3)' }}>
                <span>$100</span><span>$30,000+</span>
              </div>
              <div className="w-full h-2.5 bg-card2 rounded-full overflow-hidden">
                <motion.div animate={{ width:`${pct}%` }} transition={{ type:'spring', stiffness:90 }}
                  className="h-full rounded-full" style={{ background:'linear-gradient(90deg,#10b981,#34d399)' }} />
              </div>
            </div>

            {/* Result */}
            <motion.div key={est} initial={{ scale:.97 }} animate={{ scale:1 }}
              className="rounded-xl p-6 text-center"
              style={{ background:'radial-gradient(ellipse at center,rgba(16,185,129,.12) 0%,var(--card-bg) 70%)', border:'1px solid rgba(16,185,129,.2)' }}>
              <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color:'var(--text3)' }}>Estimated Investment</p>
              <div className="font-poppins text-5xl font-black text-grad text-glow">${est.toLocaleString()}</div>
              <p className="text-xs mt-2" style={{ color:'var(--text2)' }}>Exact quote after free 30-min consultation</p>
            </motion.div>

            <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior:'smooth' })}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-black font-bold rounded-xl text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all glow"
              style={{ background:'linear-gradient(135deg,#10b981,#34d399)' }}>
              <Send size={16} /> Get Exact Quote
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
