import React from 'react'
import { customerFeatures, hotelStaffFeatures } from "../../../utils/data"

const Features = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Modern hotel operations for teams, guests, and every stay in between.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Nepstay is being refactored into a professional hotel management platform for reservations, service, billing, and guest experience.
          </p>
        </div>

        <div className="space-y-20">
          
          <div>
            <div className="flex items-center space-x-4 mb-10">
              <h3 className="text-2xl font-bold text-slate-900">For Guests</h3>
              <div className="h-1 flex-1 bg-gradient-to-r from-amber-500 to-transparent rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {customerFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-600 transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-amber-600 group-hover:text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Employers Section */}
          <div>
            <div className="flex items-center space-x-4 mb-10">
              <div className="h-1 flex-1 bg-gradient-to-l from-teal-600 to-transparent rounded-full" />
              <h3 className="text-2xl font-bold text-slate-900">For Hotel Staff</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(hotelStaffFeatures || []).map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-600 transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-teal-600 group-hover:text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
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
