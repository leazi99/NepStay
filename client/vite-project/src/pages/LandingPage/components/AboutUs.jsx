import React from 'react';
import { Users, BriefcaseBusiness, ShieldCheck, Sparkles } from 'lucide-react';

const aboutHighlights = [
  {
    icon: Users,
    title: 'For Job Seekers',
    description:
      'Create a profile, showcase your skills, and apply to opportunities that match your goals and experience.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'For Employers',
    description:
      'Post jobs, review qualified applicants, and hire faster with a streamlined recruitment workflow.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted Platform',
    description:
      'KaamSathi is built to support reliable communication, transparent hiring, and better decision making.',
  },
  {
    icon: Sparkles,
    title: 'Career Growth',
    description:
      'From first internships to experienced roles, we help people and companies grow together.',
  },
];

const AboutUs = () => {
  return (
    <section id='about-us' className='py-20 bg-gray-50 scroll-mt-24'>
      <div className='container mx-auto px-4'>
        <div className='max-w-5xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              About <span className='text-orange-600'>KaamSathi</span>
            </h2>
            <p className='text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto'>
              KaamSathi is a job and hiring platform created to connect talented people with the right opportunities.
              Our goal is simple: make hiring easier for employers and make job discovery clearer and faster for job seekers.
              With role-based dashboards, messaging, applications, and review features, KaamSathi supports the full journey from
              job posting to successful hiring.
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