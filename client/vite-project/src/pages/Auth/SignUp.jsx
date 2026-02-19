import React, { useState } from 'react';
import {motion} from 'framer-motion';
import{
  User,
  Mail,
  Lock,
  Upload,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader


}from 'lucide-react';

const SignUp = () => {

  const [formData,setFormData]=useState({
    fullName:"",
    email:"",
    password:"",
    role:"",
    avatar:null,
  });

  const [formState,setFormState]=useState({
    loading:false,
    errors:{},
    showPassword:false,
    avatarPreview:null,
    success:false,

  });
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

  const handleRoleChange=(role)=>{

  };

  const handleAvatarChange=(e)=>{

  };

  const validateForm=()=>{

  }

  const handleSubmit=async(e)=>{

  };

    if(formState.success){
      return(
        <div className='min-h-screen flex items-center justify-center bg-gray-50 '>
          <motion.div
          initial={{opacity:0, scale:0.9}}
          animate={{opacity:1,scale:1}}
          className='bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center'>
            <CheckCircle className='"w-16 h-16 text-green-500 mx-auto mb-4 '/>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Account Created Successfully.</h2>
            <p className='text-gray-600 mb-4'>
             Welcome to KaamSathi! Your account has been successfully created.
            </p>
            <div className='animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent' />
            <p className='text-sm text-gray-500 mt-2'>Redirecting to your dashborad.</p>
          </motion.div>
        </div>
      );
    }

  

  return (
    <div className=''>
      <motion.div
      initial={{opacity:0,y:20}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.6}}
      className=''
      >
        <div className=''>
          <h2 className=''>Create Account</h2>
          <p className=''>Join thousands of professionals finding their dream jobs</p>
        </div>

        <form onSubmit={handleSubmit} className=''>
          <div >
            <label className=''>
              FullName
            </label>

            <div className=''>
              <User className=''/>
              <input type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}

              className={`w-full  pl-10 pr-4 py-3 rounded-lg border${
                formState.errors.fullName
                ?"border-red-500"
                :"border-gray-300"
              }focus:ring-2  focus-ring-blue-500 focus:border-transparent transition-colors`}
              placeholder="Enter your full name"
              />
            </div>

            {formState.errors.fullName && (
              <p className=''>
                <AlertCircle className='' />
                {formState.errors.fullName}
              </p>
            )}

            <div>
              <label className=''>
                Email Address
              </label>
              <div className=''>
                <Mail className=''/>
                <input type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  formState.errors.email ?"border-red-500 ":"border-gray-300"}focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder='Enter your email'
                ></input>

              </div>

              {formState.errors.email &&(
                 <p className=''>
                  <AlertCircle className='' />
                  {formState.errors.email}
              

                </p>)}
               
              
            </div>

            <div>
              <label className=''>
                Password
              </label>
              <div className=''>
                <Lock className='' />
                
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default SignUp
