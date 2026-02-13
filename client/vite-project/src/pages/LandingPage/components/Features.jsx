import React from 'react'
import {employerFeatures,jobSeekerFeatures} from "../../../utils/data"

const Features = () => {
  return (
    <section className=''>
 <div className=''>
      <div className=''>
        <h2 className=''>
          Empowering Connections, Transforming Careers: Discover the Future of Job Search and <span className=''>Recruitment</span> with KaamSathi
        </h2>
        <p className=''>
          At KaamSathi, we are dedicated to revolutionizing the job search and recruitment experience. Our platform is designed to connect job seekers with their dream jobs and employers with the perfect candidates. With a user-friendly interface, powerful search capabilities, and personalized recommendations, KaamSathi is your trusted partner in navigating the ever-evolving world of work. Whether you're a job seeker looking for your next opportunity or an employer seeking top talent, KaamSathi is here to empower your journey and transform the way you connect with opportunities.
        </p>
      </div>

      <div className=''>
        <div>
          <div className=''>
            <h3 className=''>For Job Seekers</h3>
            <div className='' />
          </div>
        </div>
      </div>

      <div className=''>
        {jobSeekerFeatures.map((feature,index)=>(
          <div 
          key={index}
          className=''
          >

            <div className=''>
              <feature.icon className='' />
              </div>
              <div>
                <h4 className=''>{feature.title}</h4>
                <p className=''>{feature.description}</p>
        </div>
        </div>
        ))}
      </div>
    </div>
    
    </section>
   
  )
}

export default Features
