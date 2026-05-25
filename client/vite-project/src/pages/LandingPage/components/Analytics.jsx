import React from 'react'
import { motion as Motion } from 'framer-motion';
import { TrendingUp, Users, BedDouble, Building2 } from 'lucide-react';

const Analytics = () => {
  const stats = [
    { icon: TrendingUp, label: "Guest Satisfaction", value: "98%", growth: "+4%", bgClass: "bg-blue-50 text-blue-600" },
    { icon: Users, label: "Active Guests", value: "100K+", growth: "+15%", bgClass: "bg-indigo-50 text-indigo-600" },
    { icon: BedDouble, label: "Stays Completed", value: "120K+", growth: "+22%", bgClass: "bg-purple-50 text-purple-600" },
    { icon: Building2, label: "Partner Hotels", value: "1.2K+", growth: "+18%", bgClass: "bg-teal-50 text-teal-600" }
  ];

  return (
    <section className='py-20 bg-white relative overflow-hidden '>
      <div className='container mx-auto px-4  '>
        <Motion.div 
          initial={{opacity:0,y:20}}
          whileInView={{opacity:1,y:0}}
          animate={{opacity:1,y:0}}
          transition={{delay:0.2,duration:0.6}}
          viewport={{once:true}}
          className=' text-center mb-12'
        >
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Platform
            <span className='bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent ml-2'>Analytics</span>
          </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto '>
            Join thousands of satisfied guests and hotel operators who trust Nepstay for their stay and management needs.
          </p>
        </Motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6'>
          {stats.map((stat, index) => (
            <Motion.div
              key={index}
              initial={{opacity:0,y:20}}
              whileInView={{opacity:1,y:0}}
              animate={{opacity:1,y:0}}
              transition={{delay:0.2*index,duration:0.6}}
              viewport={{once:true}}
              className='bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 '
            >
              <div className='flex items-center justify-between mb-4' >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgClass}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className='text-green-500 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full '>
                  {stat.growth}
                </span>
              </div>
              <h3 className='text-3xl font-bold text-gray-900 mb-2'>{stat.value}</h3>
              <p className='text-gray-600'>{stat.label}</p>
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Analytics

