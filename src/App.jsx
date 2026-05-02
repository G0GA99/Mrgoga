import { useState, useEffect } from 'react'
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
import Payment      from './components/Payment'

function MainSite() {
  const [theme, setTheme] = useState(() => localStorage.getItem('g0ga_theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('g0ga_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <div className="min-h-screen font-inter" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <PageIntro />
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <Pricing />
        <Calculator />
        <Team />
        <Testimonials />
        <Payment />
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
