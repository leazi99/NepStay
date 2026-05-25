import React from 'react'
import { Hotel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Header = () => {

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const scrollToAbout = (event) => {
    event.preventDefault();
    const targetElement = document.getElementById('about-us');
    targetElement?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 '>
        <div className='container mx-auto px-4 '>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-gradient-to-r from-orange-600 to-orange-600 rounded-lg flex items-center justify-center'>
                <Hotel className='w-5 h-5 text-white' />
              </div>
              <span className='text-xl font-bold text-gray-900'>Nepstay</span>
            </div>
            <nav className='hidden md:flex items-center space-x-8'>
              <button onClick={() => navigate('/hotels')} className='text-gray-600 hover:text-gray-900 transition-colors font-medium'>Book Rooms</button>
              <button onClick={() => navigate(isAuthenticated && user?.role === "hotelstaff" ? "/hotel-staff-dashboard" : "/login")} className='text-gray-600 hover:text-gray-900 transition-colors font-medium'>For Hotel Staff</button>
              <a href='#about-us' onClick={scrollToAbout} className='text-gray-600 hover:text-gray-900 transition-colors font-medium'>About Us</a>
            </nav>

            <div className=''>
              {isAuthenticated ? (
                <div className='flex items-center space-x-3'>
                  <span className=''>Welcome, {user?.name || user?.fullName}</span>
                  <a
                    href={user?.role === 'hotelstaff' ? "/hotel-staff-dashboard" : "/guest-dashboard"}
                    className='font-medium hover:from-orange-700 hover:to-orange-700 transition-all duration-300 shadow-sm hover:shadow-md rounded-lg px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-600 text-white'
                  >
                    Dashboard
                  </a>
                </div>
              ) : (
                <>
                  <a href="/login" className='text-gray-600 hover:text-gray-900 transition-colors font-medium'>
                    Login
                  </a>
                  <a href="/signup" className='bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors'>
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
    </header>
  )
}

export default Header
