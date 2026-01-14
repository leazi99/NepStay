import React from 'react'
import { useState } from 'react'
import assets from '../assets/assets.js'
import "../styles/header.css";

const Login = () => {

  const [state, setState] = useState('Sign Up');
  return (
    <div className='Login'>
<img src={assets.kaamlogo} alt="" />
<div className='create'>
  <h2>{state==='Sign Up' ?'Create  account':'Login '}</h2>
  <p>{state==='Sign Up' ?'Create Your account':'Login to your account'}</p>
  <form >
    <div className='landing'>
          <h2>Welcome</h2>
          <p>Whats bring you here today?</p>

      <div>
        
        <h3>Employers</h3>
        <p>Hire smarter. Build stronger teams.</p>
      </div>

      <div>
        <h3>Employee</h3>
        <p>Your skills deserve the right opportunity.</p>
      </div>
      </div>
    <div>
      <img src={assets.person_icon} alt="" />
      <input type="text" placeholder='Email or Username' />
      <input type="text" placeholder='Password' />
      </div>Create Account</form>

</div>
    </div>
  )
}

export default Login
