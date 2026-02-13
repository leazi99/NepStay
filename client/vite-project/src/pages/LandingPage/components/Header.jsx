import React from 'react'
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {

  const isAuthenticated = true;
  const user = { fullName: 'Ujjwal', role: 'employer' };
  const navigate = useNavigate();
  return <motion.header
  initial={{opacity:0,y:-20}}
  animate={{opacity:1,y:0}}
  transition={{duration:0.6}}
  className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 '>
    <div className='container mx-auto px-4 '>
      <div className='flex items-center justify-between h-16'>
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
            <Briefcase className='w-5 h-5 text-white' />
          </div>
          <span className='text-xl font-bold text-gray-900'>KaamSathi</span>
        </div>
        <nav className='hidden md:flex items-center space-x-8'>
          <a href="" onClick={() => navigate("/find-jobs")} className=' text-gray-600 hover:text-gray-900 transition-colors font-medium'>Find Jobs</a>
          <a href="" onClick={() => navigate(isAuthenticated && user?.role === "employer" ? "/employer-dashboard" : "/login")} className='text-gray-600 hover:text-gray-900 transition-colors font-medium'>For Employer</a>
        </nav>

        <div className=''>
          {isAuthenticated ? (
            <div className='flex items-center space-x-3'>
              <span className=''>Welcome, {user?.fullName}</span>
              <a
                href={user?.role === 'employer' ? "/employer-dashboard" : "/find-jobs"}
                className='text-gray-600 hover:text-gray-900 transition-colors font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md rounded-lg px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              >
                Dashboard
              </a>
            </div>
          ) : (
            <>
              <a href="/login" className='text-gray-600 hover:text-gray-900 transition-colors font-medium'>
                Login
              </a>
              <a href="/signup" className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  </motion.header>
}

export default Header
