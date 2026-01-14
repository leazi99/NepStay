import React from 'react'
import assets from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'
import "../styles/header.css"


const Navbar = () => {

  const navigate=useNavigate();

  return (
    <div className='nav'>
      <img src={assets.kaamlogo} alt="" className='arrow' />
      <button onClick={()=>navigate('/login')} className='flex items-center gap-2 border border-gray-500 rounded-full  px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all' >Login <img src={assets.arrow_icon} alt="" /></button>
      <span>Find Work</span>
      <span></span>
    </div>
  )
}

export default Navbar

