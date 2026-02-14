import React from 'react'
import {motion} from 'framer-motion';
import { TrendingUp,Users,Briefcase,Target } from 'lucide-react';

const Analytics = () => {
  const stats=[
    {icon:TrendingUp,label:"Growth",value:"91%"},
    {icon:Users,label:"Active Users",value:"100K+"},
    {icon:Briefcase,label:"Jobs Posted",value:"50K+"},
    {icon:Target,label:"Successful Hires",value:"20K+"},
  ]
  return (
    <section className=''>
      <div className=''>
        <motion.div 
        initial={{opacity:0,y:20}}
        whileInView={{opacity:1,y:0}}
        animate={{opacity:1,y:0}}
        transition={{delay:0.2,duration:0.6}}
        viewport={{once:true}}
        className='max-w-3xl mx-auto text-center mb-12'>
          <h2 className=''>
            Platform
            <span className=''>Analytics</span>
          </h2>
<p className=''>Join Thousands of Satisfied Users Who Found Their Perfect Match with KaamSathi</p>
</motion.div>
<div className=''>
  <stats.map((stat,index)=>(
    <motion.div
    key={index}
    initial={{opacity:0,y:20}}
    whileInView={{opacity:1,y:0}}
    animate={{opacity:1,y:0}}
    transition={{delay:0.2*index,duration:0.6}}
    viewport={{once:true}}
    className='flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors  '>
      <div className='' >
        <div className={`w-12 h-12 bg-${stat.icon}-100 rounded-xl flex items-center justify-center mb-2`}/>
      </div>
      <stat.icon className='w-8 h-8 text-blue-600' />
      <span className='text-xl font-bold'>{stat.value}</span>
      <span className='text-gray-600'>{stat.label}</span>
    </motion.div>
  ))
</div>
      </div>
    </section>
   
  )
}

export default Analytics
