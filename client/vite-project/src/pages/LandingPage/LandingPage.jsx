import React from 'react'
import Header from './components/Header';
import BrandHeader from '../../components/ui/BrandHeader';
import BrandFooter from '../../components/ui/BrandFooter';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import Features from './components/Features';
import Analytics from './components/Analytics';
import Footer from './components/Footer';
const LandingPage = () => {
  return (
    <div className='min-h-screen'>
    <BrandHeader />
    <Header />
     <Hero />
    <AboutUs />
     <Features />
     <Analytics />
    <Footer />
    <BrandFooter />
    </div>
  )
}

export default LandingPage
