import React from 'react'
import { motion as Motion } from 'framer-motion';
import { Search, ArrowRight, Users, Building2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Hero = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  let dashboardPath = "/login";
  if (isAuthenticated) {
    dashboardPath = user?.role === "hotelstaff" ? "/hotel-staff-dashboard" : "/guest-dashboard";
  }

  const stats = [
    { icon: Users, label: "Active Guests", value: "100K+" },
    { icon: Building2, label: "Hotels", value: "10K+" },
    { icon: TrendingUp, label: "Bookings", value: "50K+" },
  ];
  return (
    <section className="relative pt-24 pb-10 bg-white min-h-screen flex items-center">
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <Motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight pt-10'
          >
            Find Your Perfect Stay or
            <span className='block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-2'>
              Hotel Experience</span>
          </Motion.h1>

          <Motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-xl md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed'
          >
            Nepstay helps guests discover great stays and helps hotel teams manage bookings, rooms, and service with less friction.
          </Motion.p>

          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-16'
          >

            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              onClick={() => navigate("/guest-dashboard")}
            >

              <Search className='w-5 h-5' />
              <span>Find Rooms</span>
              <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
            </Motion.button>

            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='bg-white border-2 border-gray-200 text-gray-600 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all  duration-300 shadow-sm hover:shadow-md'
              onClick={() => navigate(dashboardPath)}
            >
              Manage Booking
            </Motion.button>

            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='bg-white border-2 border-blue-200 text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md'
              onClick={() => navigate('/verify-email')}
            >
              Verify Email
            </Motion.button>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto'
          >
            {stats.map((stat, index) => (
              <Motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className='flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors  '
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className='text-2xl font-bold text-gray-900'>{stat.value}</div>
                <div className='text-sm text-gray-600 font-medium'>{stat.label}</div>
              </Motion.div>
            ))}
          </Motion.div>
        </div>
      </div>

      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-30 ' />
        <div className='absolute bottom-20 right-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-30' />
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full blur-2xl opacity-20' />
      </div>

    </section>

  )
}

export default Hero
