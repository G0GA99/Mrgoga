import Navbar       from './components/Navbar'
import Hero         from './components/Hero'
import Services     from './components/Services'
import Portfolio    from './components/Portfolio'
import Pricing      from './components/Pricing'
import Calculator   from './components/Calculator'
import Team         from './components/Team'
import Testimonials from './components/Testimonials'
import Contact      from './components/Contact'
import Footer       from './components/Footer'
import ChatWidget   from './components/ChatWidget'
import CustomCursor from './components/CustomCursor'

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <Pricing />
        <Calculator />
        <Team />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
      <CustomCursor />
    </div>
  )
}
