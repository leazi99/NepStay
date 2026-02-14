import React from 'react'
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Analytics from './components/Analytics';
const LandingPage = () => {
  return (
    <div className='min-h-screen'>
     <Header />
     <Hero />
     <Features />
     <Analytics />
    </div>
  )
}

export default LandingPage
