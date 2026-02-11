import React from 'react'
import assets from '../assets/assets.js'
import '../styles/header.css'

import{motion} from 'framer-motion';
import{BriefCase} from 'lucide-react';
import{useNavigate} from 'react-router-dom';



const Header = () => {
  return (
    <div className='box'>
      <img src={assets.header_img} alt="" className='w-36 h-36 rounded-full mb-6'/>
      <h3>#1 Freelancing Platform in Nepal</h3>
      <h1>Work Your way. </h1>
      <h1 className='color'>Hire the best</h1>
      <h2>Welcome to KaamSathi</h2>
      <p>Connect with top talent or find your dream projects. KaamSathi bridges the gap between skilled professionals and visionary businesses.</p>
      <button>Get Started</button>
      <button className='go'><img src={assets.travel} alt="" />Find Work</button>
      <button><img src={assets.work} alt="" />Hire Talent</button>
     
    </div>

  )
}

export default Header
