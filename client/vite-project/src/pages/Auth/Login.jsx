import React, { useState } from 'react'
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    success: false
  });

  const validateEmail = (email) => {
    if(!email.trim()) return "Email is Required";
    const emailRegex="/^[^\s@]+@[^\s@]+\.[^\s@]+$/";
    if(!emailRegex.test(email))
      return "Please eneter a valid email address";
    return"";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (formState.errors[name]) {
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, [name]: '' }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!validateEmail(formData.email)) errors.email = 'Invalid email format';

    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';

    if (Object.keys(errors).length > 0) {
      setFormState(prev => ({ ...prev, errors }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true }));


    setTimeout(() => {
      setFormState(prev => ({ ...prev, loading: false, success: true }));
  
    }, 1500);
  };

  if(formState.success){
    return(
      <div className=''>
        <motion.div
        initial={{opacity:0, scale:0.9}}
        animate={{opacity:1,scale:1}}
        className=''>
          <CheckCircle className='"w-16 h-16 text-green-500 mx-auto mb-4 '/>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Welcome Back</h2>
          <p className='text-gray-600 mb-4'>
            You have been successfully logged in.
          </p>
          <div className='animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent' />
          <p className='text-sm text-gray-500 mt-2'>Redirecting to your dashborad.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-10">
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>Welcome Back</h2>
          <p className='text-gray-500'>Sign in to your KaamSathi account</p>
        </div>

        <form className='space-y-6' onSubmit={handleSubmit}>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Email Address</label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 rounded-xl border ${formState.errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:ring-2 focus:border-transparent transition-all outline-none`}
                placeholder='Enter your email' />
            </div>
            {formState.errors.email && (
              <p className='text-red-500 text-xs mt-1.5 flex items-center gap-1'>
                <AlertCircle className='w-3.5 h-3.5' />
                {formState.errors.email}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Password</label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type={formState.showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-11 pr-12 py-3 rounded-xl border ${formState.errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:ring-2 focus:border-transparent transition-all outline-none`}
                placeholder='Enter your password' />
              <button
                type="button"
                onClick={() => setFormState({ ...formState, showPassword: !formState.showPassword })}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'>
                {formState.showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
              </button>
            </div>
            {formState.errors.password && (
              <p className='text-red-500 text-xs mt-1.5 flex items-center gap-1'>
                <AlertCircle className='w-3.5 h-3.5' />
                {formState.errors.password}
              </p>
            )}
          </div>

          <div className='flex items-center justify-between'>
            <label className='flex items-center space-x-2 cursor-pointer'>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500' />
              <span className='text-sm text-gray-600'>Remember me</span>
            </label>
            <Link to="/forgot-password" size="sm" className='text-sm font-medium text-blue-600 hover:text-blue-700'>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={formState.loading}
            className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100'>
            {formState.loading ? (
              <>
                <Loader className='w-5 h-5 animate-spin' />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          <p className='text-center text-gray-600 text-sm mt-8'>
            Don't have an account?{' '}
            <Link to="/signup" className='text-blue-600 font-semibold hover:underline'>
              Create account
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}

export default Login

