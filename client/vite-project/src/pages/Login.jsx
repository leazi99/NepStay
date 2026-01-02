import React from 'react'
import { useState } from 'react'
import assets from '../assets/assets.js'

const Login = () => {

  const [state, setState] = useState('Sign Up');
  return (
    <div className='Login'>
<img src={assets.kaamlogo} alt="" />
<div>
  <h2>{state==='Sign Up' ?'Create  account':'Login '}</h2>
  <p>{state==='Sign Up' ?'Create Your account':'Login to your account'}</p>
  <form >
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
