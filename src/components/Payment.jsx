import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, CheckCircle, Bitcoin, Wallet } from 'lucide-react'

const WALLETS = [
  {
    id: 'usdt',
    name: 'USDT',
    network: 'BEP-20 (BSC)',
    address: '0x10f1A4b9Bb09416682d46D75CAD7Eb8cEfB49a5C',
    icon: '₮',
    color: '#26a17b',
    note: 'Binance Smart Chain — fastest & cheapest',
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    network: 'BTC Network',
    address: 'bc1qu0cgaw2mah04c0dk9p0f3cpfxk2vey48sek4kd',
    icon: '₿',
    color: '#f7931a',
    note: 'Bitcoin native — universal',
  },
]

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
      style={copied
        ? { background:'rgba(16,185,129,.15)', color:'#10b981' }
        : { background:'rgba(255,255,255,.06)', color:'#9ca3af' }}>
      {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function Payment() {
  return (
    <section id="payment" className="section" style={{ background:'linear-gradient(180deg,#000 0%,#050505 100%)' }}>
      <div className="max-w-4xl mx-auto px-6">

        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.6 }} className="text-center mb-12">
          <span className="badge mb-5 inline-flex"><span className="badge-dot" />Payments</span>
          <h2 className="sec-title">Secure <span className="text-grad">Payment</span> Options</h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto">
            We accept crypto payments globally. Fast, borderless, zero chargebacks.
          </p>
        </motion.div>

        {/* Payment model */}
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.5 }}
          className="glass-card p-6 rounded-2xl mb-8">
          <h4 className="font-poppins font-bold text-sm mb-4 text-center">Payment Structure</h4>
          <div className="grid grid-cols-3 gap-4">
            {[
              { pct:'50%', label:'Upfront', desc:'To start the project', color:'#10b981' },
              { pct:'30%', label:'Midpoint', desc:'At 80% completion', color:'#3b82f6' },
              { pct:'20%', label:'Delivery', desc:'On final delivery', color:'#a78bfa' },
            ].map(p => (
              <div key={p.pct} className="text-center p-4 rounded-xl"
                style={{ background:`${p.color}08`, border:`1px solid ${p.color}20` }}>
                <div className="font-poppins text-2xl font-black mb-1" style={{ color:p.color }}>{p.pct}</div>
                <div className="font-semibold text-xs mb-0.5">{p.label}</div>
                <div className="text-gray-600 text-[10px]">{p.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Wallet addresses */}
        <div className="space-y-4">
          {WALLETS.map((w, i) => (
            <motion.div key={w.id} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ duration:.5, delay:i*.1 }}
              className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black"
                  style={{ background:`${w.color}15`, border:`1px solid ${w.color}30`, color:w.color }}>
                  {w.icon}
                </div>
                <div>
                  <div className="font-poppins font-bold">{w.name}</div>
                  <div className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5"
                    style={{ background:`${w.color}12`, color:w.color }}>
                    {w.network}
                  </div>
                </div>
                <div className="ml-auto text-gray-600 text-[11px] text-right hidden sm:block">{w.note}</div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)' }}>
                <code className="text-xs text-gray-300 flex-1 break-all leading-relaxed">{w.address}</code>
                <CopyBtn text={w.address} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Important note */}
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }}
          viewport={{ once:true }} transition={{ delay:.3 }}
          className="mt-6 p-4 rounded-xl text-center"
          style={{ background:'rgba(16,185,129,.04)', border:'1px solid rgba(16,185,129,.12)' }}>
          <p className="text-gray-500 text-xs leading-relaxed">
            ⚠️ Always verify the wallet address before sending. Send a small test payment first for large amounts.
            After payment, WhatsApp us the transaction hash for instant confirmation.
            <a href="https://wa.me/923091989556" className="text-teal hover:underline ml-1">
              +92 309 1989556
            </a>
          </p>
        </motion.div>

      </div>
    </section>
  )
}
