import React from 'react'
import { employerFeatures, jobSeekerFeatures } from "../../../utils/data"

const Features = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Empowering Connections, Transforming Careers: Discover the Future of Job Search and{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Recruitment
            </span>{" "}
            with KaamSathi
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            At KaamSathi, we are dedicated to revolutionizing the job search and recruitment experience. Our platform is designed to connect job seekers with their dream jobs and employers with the perfect candidates.
          </p>
        </div>

        <div className="space-y-20">
          {/* Job Seekers Section */}
          <div>
            <div className="flex items-center space-x-4 mb-10">
              <h3 className="text-2xl font-bold text-gray-900">For Job Seekers</h3>
              <div className="h-1 flex-1 bg-gradient-to-r from-blue-600 to-transparent rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {jobSeekerFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-blue-600 group-hover:text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Employers Section */}
          <div>
            <div className="flex items-center space-x-4 mb-10">
              <div className="h-1 flex-1 bg-gradient-to-l from-purple-600 to-transparent rounded-full" />
              <h3 className="text-2xl font-bold text-gray-900">For Employers</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(employerFeatures || []).map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-purple-600 group-hover:text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

  )
}

export default Features
