import { motion } from 'framer-motion'
import SocialIcon, { SOCIALS_CONTACT } from './SocialIcons'

const SERVICES = ['Branding & Animation','Web Experience','Product Visualization','AI Integration','Data Visualization']
const NAV      = ['Services','Portfolio','Pricing','Calculator','Team','Contact']
const TICKER   = ['React','Next.js','Node.js','Python','LangChain','Groq AI','Three.js','Framer Motion','Tailwind CSS','Vercel','Supabase','Stripe','Docker','TypeScript','OpenAI','AWS']

function Marquee() {
  const doubled = [...TICKER, ...TICKER]
  return (
    <div className="py-5 border-y border-white/5 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10" style={{ background:'linear-gradient(90deg,#000,transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10" style={{ background:'linear-gradient(-90deg,#000,transparent)' }} />
      <div className="flex gap-8 marquee-track whitespace-nowrap" style={{ width:'max-content' }}>
        {doubled.map((t, i) => (
          <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
            style={{ background:'rgba(16,185,129,.06)', border:'1px solid rgba(16,185,129,.14)', color:'rgba(16,185,129,.6)' }}>
            <span className="w-1 h-1 rounded-full bg-teal inline-block" style={{ background:'#10b981' }} />
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Footer() {
  const go = (id) => document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior:'smooth' })

  return (
    <footer style={{ background:'#000', borderTop:'1px solid rgba(255,255,255,.07)' }}>

      {/* Tech Stack Marquee */}
      <Marquee />

      {/* CTA Banner */}
      <div className="py-16 text-center relative overflow-hidden"
        style={{ background:'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(16,185,129,.06) 0%, transparent 70%)' }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.6 }}>
          <h2 className="font-poppins text-3xl md:text-4xl font-black mb-4" style={{ letterSpacing:'-0.5px' }}>
            Ready to Build Something <span className="text-grad">Extraordinary?</span>
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
            Free 30-minute strategy call. Zero obligation.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => go('contact')}
              className="px-7 py-3.5 text-black font-bold rounded-xl text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all glow"
              style={{ background:'linear-gradient(135deg,#10b981,#34d399)' }}>
              Start Project — From $100
            </button>
            <a href="https://wa.me/923091989556" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/12 font-semibold text-sm hover:border-teal/40 hover:text-teal transition-all">
              💬 WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="font-poppins font-black text-2xl text-grad mb-4">G0GA</div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-xs">
              Premium AI agency delivering intelligent automation, immersive AI experiences, and digital transformation for global brands.
            </p>
            <div className="flex gap-2.5 flex-wrap">
              {SOCIALS_CONTACT.map(s => <SocialIcon key={s.name} {...s} size={36} />)}
            </div>
          </div>

          {/* Services */}
          <div>
            <h5 className="font-poppins font-bold text-sm mb-5">Services</h5>
            <ul className="space-y-3">
              {SERVICES.map(s => (
                <li key={s}>
                  <button onClick={() => go('services')}
                    className="text-gray-600 text-sm hover:text-teal transition-colors text-left">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav */}
          <div>
            <h5 className="font-poppins font-bold text-sm mb-5">Company</h5>
            <ul className="space-y-3">
              {NAV.map(l => (
                <li key={l}>
                  <button onClick={() => go(l)} className="text-gray-600 text-sm hover:text-teal transition-colors">{l}</button>
                </li>
              ))}
              <li>
                <a href="https://wa.me/923091989556" target="_blank" rel="noopener noreferrer"
                  className="text-gray-600 text-sm hover:text-teal transition-colors">WhatsApp</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-700 text-xs">© 2025 G0GA Agency. All rights reserved. Built with AI.</p>
          <div className="flex gap-5">
            <button className="text-gray-700 text-xs hover:text-gray-500 transition-colors">Privacy Policy</button>
            <button className="text-gray-700 text-xs hover:text-gray-500 transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
