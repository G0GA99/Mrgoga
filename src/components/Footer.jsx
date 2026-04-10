import { motion } from 'framer-motion'

const SERVICES = ['Branding & Animation','Web Experience','Product Visualization','AI Integration','Data Visualization']
const NAV      = ['Services','Portfolio','Pricing','Calculator','Team','Contact']
const SOCIALS  = [
  { label:'YT', href:'https://youtube.com/@g0ga',        bg:'#FF0000', title:'YouTube'   },
  { label:'TT', href:'https://tiktok.com/@g0ga',          bg:'#111',    title:'TikTok'    },
  { label:'IG', href:'https://instagram.com/g0ga.agency', bg:'#E1306C', title:'Instagram' },
  { label:'FB', href:'https://facebook.com/g0gaagency',   bg:'#1877F2', title:'Facebook'  },
  { label:'in', href:'https://linkedin.com/company/g0ga', bg:'#0A66C2', title:'LinkedIn'  },
]

export default function Footer() {
  const go = (id) => document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior:'smooth' })

  return (
    <footer style={{ background:'#000', borderTop:'1px solid rgba(255,255,255,.07)' }}>

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
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title}
                  className="social-3d w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background:s.bg }}>
                  {s.label}
                </a>
              ))}
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
