import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import LandingNavbar from '@/components/LandingNavbar';

function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, data);
      if(res?.data?.success){
        toast.success('Registration successful', {
                  position: "top-center",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: false,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "dark",
                  
                  });
        navigate("/auth/login");
      } else {
        toast.error(res.data.message, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          
        });
      }
    } catch (err) {
      toast.error('Registration failed', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Persistent Navbar */}
      <LandingNavbar />

      <div className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] dark:bg-[#2563EB]/20 bg-[#2563EB]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] dark:bg-[#60A5FA]/10 bg-[#93C5FD]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        
        <div className="w-full max-w-md space-y-8 dark:bg-[#111]/60 bg-white/70 backdrop-blur-xl rounded-3xl border dark:border-[#2563EB]/30 border-[#93C5FD]/40 p-8 dark:shadow-[0_0_40px_rgba(37,99,235,0.2)] shadow-[0_0_40px_rgba(37,99,235,0.08)] relative z-10 transition-all dark:hover:shadow-[0_0_60px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.12)]">
          <div className="text-center">
             <div className="inline-flex justify-center items-center h-16 w-16 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] mb-6 shadow-lg">
                <User className="h-8 w-8 text-white" />
             </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#2563EB] mb-2">Create Account</h1>
            <p className="dark:text-gray-400 text-gray-600">Join our community of developers today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
            <div className="space-y-4">


              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#60A5FA]">
                  <User className="h-5 w-5 dark:text-gray-500 text-gray-400 group-focus-within:text-[#60A5FA]" />
                </div>
                <input
                  type="text"
                  {...register('username', { 
                    required: 'Username is required',
                    minLength: { value: 2, message: 'Username must be at least 2 characters' }
                  })}
                  className="w-full dark:bg-black/50 bg-gray-100/80 dark:text-white text-gray-900 pl-10 pr-4 py-4 rounded-xl border dark:border-[#2563EB]/20 border-[#93C5FD]/30 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA] dark:placeholder-gray-600 placeholder-gray-400 transition-all duration-300"
                  placeholder="Username"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1 ml-1">{errors.username.message}</p>
                )}
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#60A5FA]">
                  <Mail className="h-5 w-5 dark:text-gray-500 text-gray-400 group-focus-within:text-[#60A5FA]" />
                </div>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className="w-full dark:bg-black/50 bg-gray-100/80 dark:text-white text-gray-900 pl-10 pr-4 py-4 rounded-xl border dark:border-[#2563EB]/20 border-[#93C5FD]/30 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA] dark:placeholder-gray-600 placeholder-gray-400 transition-all duration-300"
                  placeholder="Email Address"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 ml-1">{errors.email.message}</p>
                )}
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#60A5FA]">
                  <Lock className="h-5 w-5 dark:text-gray-500 text-gray-400 group-focus-within:text-[#60A5FA]" />
                </div>
                <input
                  type="password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="w-full dark:bg-black/50 bg-gray-100/80 dark:text-white text-gray-900 pl-10 pr-4 py-4 rounded-xl border dark:border-[#2563EB]/20 border-[#93C5FD]/30 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA] dark:placeholder-gray-600 placeholder-gray-400 transition-all duration-300"
                  placeholder="Password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 ml-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-center items-center text-sm">
              <span className="dark:text-gray-400 text-gray-600 mr-1">Already have an account?</span>
              <Link to="/auth/login" className="text-[#60A5FA] hover:text-[#2563EB] hover:underline font-medium transition-colors">
                Sign in
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#3B82F6] hover:to-[#2563EB]"
            >
              {isLoading ? (
                 <span className="flex items-center justify-center gap-2">
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   Creating account...
                </span>
              ) : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;