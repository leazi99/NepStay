import React,{useState}from 'react';
import {Link,useNavigate}from 'react-router-dom';
import {Card} from '../../components/Card.jsx';
import Input from'../../components/Input.jsx';
import Button from'../../components/Button.jsx';
import {Mail,Lock,LogIn}from 'lucide-react';
import './Auth.css';
const Login = () => {
  const navigate=useNavigate();
  const[loading,setLoading]=useState(false);

  const [error,setError]=useState("");

  const handleLogin=async(e)=>{
    e.preventDefault();
    setLoaading(true);
    setError("");

    const formData=new FormData(e.target);
    const email=formData.get("email");
    const password=formData.get("password");

    try{
      const res=await fetch("/api/auth/login",{
        method:"POST",
        headers:{
          "Content-Type":'application/json'
        },
        body:JSON.stringify({email,password})
      });

      const data=await res.json();
      if(!res.ok){
        throw new Error(data.message || "Login failed");

      }
      localStorage.setItem("userInfo",JSON.stringify(data));
      if(data.role==="client"){
        navigate("/client");

      }else if(data.role==="freelancer"){
        navigate("/freelancer");
      }else{
        navigate("/");
      }
    }catch(error){
      setError(error.message);

    }finally{
      setLoading(false);
    }
  };
  return (
    <div>
      <Card className="auth-card">
        <div className='auth-header'>
          <h1 className='auth-title'>Welcome Back</h1>
          <p className='auth-subtitle'>Login to KaamSathi to continue</p>
        </div>

        <form action="" onSubmit={handleLogin} className='auth-form'>
          {error && <div className='auth-error' style={{color:'red',marginBottom='1rem',textAlign='center'}}>{error}</div>}
          <Input 
          name="email"
          label="Email Address"
          type="email"
          placeholder="Email Address"
          icon={Mail}
          required>
          </Input>

          <Input 
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          required>
          </Input>

          <div className='auth-options'>
            <label className='checkbox-label'>
              <input type="checkbox" />
              <span>Remeber me</span>
            </label>
            <Link to='/forgot-password' className='auth-link'>Forgot Password?</Link>
          </div>

          <Button type="submit" className='w-full' isLoading={loading}>
            Sign In <LogIn size={16} /></Button>
        </form>

        <div className='auth-footer'>
          <p>Don't have an account? <Link to="/signup" className='auth-link'>Sign Up</Link></p>
        </div>
      </Card>
      
    </div>
  )
}

export default Login
