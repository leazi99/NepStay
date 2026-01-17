import React from 'react'

const Footer = () => {
  return (
    <footer className='footer'>
      <div className='container'>
    <div className='footer-grid'>
      <div className='footer-col'>
        <h3>KaamSathi</h3>
        <p>Empowering the future of work in Nepal.Connect,Collaborate,and grow together.</p>
      </div>

      <div className='footer-col'>
        <h4 className='footer-heading'>For Clients</h4>
        <ul className='footer-links'>
          <li>Post a Job</li>
          <li>Browse Talent</li>
          <li>Project Catalog</li>
          <li>Employer Resources</li>
          <li>Talent Marketplace</li>
        </ul>
      </div>

      <div className='footer-col'>
        <h4 className='footer-heading'>For Freelancers</h4>
        <ul className='footer-links'>
          <li>Browse Jobs</li>
          <li>Create Profile</li>
          <li>Project Catalog</li>
          <li>Freelancer Resources</li>
          <li>Direct Contracts</li>
        </ul>
      </div>

      <div className='footer-col'>
        <h4 className='footer-heading'>Resources</h4>
        <ul className='footer-links'>
          <li>Help & Support</li>
          <li>Privacy Policy</li>
          <li>Terms of Service</li>
          <li>Blog</li>
          <li>Success Stories</li>
        </ul>
      </div>
    </div>

      </div>

      <div className='footer-bottom'>
        <p>&copy;{new Date().getFullYear()}KaamSathi.All rights reserved</p>
      </div>
      
    </footer>
  )
}

export default Footer
