import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import PageIntro    from './components/PageIntro'
import Admin        from './components/Admin'

function MainSite() {
  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <PageIntro />
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<MainSite />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
