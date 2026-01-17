import React from 'react'
import { useState } from 'react'
import assets from '../assets/assets.js'
import "../styles/header.css";


const Login = () => {

  const [state, setState] = useState(false);
  const handleState=(e)=>{
e.preventDefault();
setState(true);

setTimeout(()=>{
  setState(false);
  navigate('/email-verify');

},3000);
}
  
  return (
    <div className='auth-page'>
      <Card className='auth-card'>
        <div className='auth-card-header'>
          <h1 className='auth-card-title'>Welcome Back To KaamSathi</h1>
          <p>Login to KaamSathi and find your dream job or hire the best talent.</p>
        </div>
        <form onSubmit={handleState} className='auth-form'>
          <Input label="Email" type="email" placeholder='Enter your email' icon={assets.mail_icon}required />
          <Input label="Password" type="password" placeholder="••••••••" icon={assets.lock_icon} />
          <div className='auth-options'>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-link">Forgot Password ?</Link>
          </div>

          <Button type="submit" className="w-full" isLoading={state} > 
            Sign In<Login size={16}/>
          </Button>
        </form>
        <div className='auth-footer'>
          <p>Dont have an account? <Link to="/signup" className="auth-link">Sign Up</Link></p>
        </div>
      </Card>
      </div>
  );
};

export default Login
