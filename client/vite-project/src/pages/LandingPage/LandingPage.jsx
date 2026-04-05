import React from 'react'
import Header from './components/Header';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import Features from './components/Features';
import Analytics from './components/Analytics';
import Footer from './components/Footer';
const LandingPage = () => {
  return (
    <div className='min-h-screen'>
     <Header />
     <Hero />
    <AboutUs />
     <Features />
     <Analytics />
     <Footer />
    </div>
  )
}

export default LandingPage
