import React from 'react';
import { Users, Building2, ShieldCheck, Sparkles } from 'lucide-react';

const aboutHighlights = [
  {
    icon: Users,
    title: 'For Guests',
    description:
      'Discover and book standard, deluxe, and suite rooms effortlessly. Track your reservations, payments, and history in a unified guest dashboard.',
  },
  {
    icon: Building2,
    title: 'For Hotel Staff',
    description:
      'Manage rooms, handle reservations, track occupancies, and monitor billing with role-based dashboards tailored for hospitality teams.',
  },
  {
    icon: ShieldCheck,
    title: 'Seamless Bookings',
    description:
      'Get instant confirmations, secure payments, and reliable room service requests, ensuring a smooth stay from check-in to check-out.',
  },
  {
    icon: Sparkles,
    title: 'Efficient Operations',
    description:
      'Empower your hotel business with analytics, easy room inventory updates, and responsive staff-guest communications.',
  },
];

const AboutUs = () => {
  return (
    <section id='about-us' className='py-20 bg-gray-50 scroll-mt-24'>
      <div className='container mx-auto px-4'>
        <div className='max-w-5xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              About <span className='text-orange-600'>Nepstay</span>
            </h2>
            <p className='text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto'>
              Nepstay is a modern hotel management and booking platform created to connect guests with their ideal stays and empower hotel staff with efficient management tools.
              Our goal is simple: make hotel operations and reservations smoother for hotel owners, and make booking a seamless experience for guests.
              With role-based dashboards, messaging, room postings, and review features, Nepstay supports the full journey from reservation to check-out.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {aboutHighlights.map((item) => (
              <div key={item.title} className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow'>
                <div className='w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4'>
                  <item.icon className='w-6 h-6 text-orange-600' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>{item.title}</h3>
                <p className='text-gray-600'>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;