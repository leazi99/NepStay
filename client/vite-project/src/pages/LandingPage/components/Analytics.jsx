import React from 'react'
import {motion} from 'framer-motion';
import { TrendingUp,Users,Briefcase,Target } from 'lucide-react';

const Analytics = () => {
  const stats=[
    {icon:TrendingUp,label:"Growth",value:"91%",growth:"+90%"},
    {icon:Users,label:"Active Users",value:"100K+",growth:"+20%"},
    {icon:Briefcase,label:"Jobs Posted",value:"50K+",growth:"+25%"},
    {icon:Target,label:"Successful Hires",value:"20K+",growth:"+30%"}
  ]
  return (
    <section className='py-20 bg-white relative overflow-hidden '>
      <div className='container mx-auto px-4  '>
        <motion.div 
        initial={{opacity:0,y:20}}
        whileInView={{opacity:1,y:0}}
        animate={{opacity:1,y:0}}
        transition={{delay:0.2,duration:0.6}}
        viewport={{once:true}}
        className=' text-center mb-12'>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Platform
            <span className='bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent'>Analytics</span>
          </h2>
<p className='text-xl text-gray-600 max-w-3xl mx-auto '>Join Thousands of Satisfied Users Who Found Their Perfect Match with KaamSathi</p>
</motion.div>
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6'>
  {stats.map((stat,index)=>(
    <motion.div
    key={index}
    initial={{opacity:0,y:20}}
    whileInView={{opacity:1,y:0}}
    animate={{opacity:1,y:0}}
    transition={{delay:0.2*index,duration:0.6}}
    viewport={{once:true}}
    className='bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 '>
      <div className='flex items-center justify-between mb-4' >
        <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-2`}/>
        <stat.icon className={`w-6 h-6 text-${stat.color}-600`}/>
      </div>
      <span className='text-green-500 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full '>
        {stat.growth}
      </span>
      <h3 className='text-3xl font-bold text-gray-900 mb-2'>{stat.value}</h3>
      <p className='text-gray-600'>{stat.label}</p>
    </motion.div>
  ))}
</div>
      </div>
    </section>
   
  )
}

export default Analytics
