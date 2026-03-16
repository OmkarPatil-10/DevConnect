import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { useUser } from '@/context/UserContext';
import LandingNavbar from '@/components/LandingNavbar';

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
  
      // Step 1: Login request
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, data);
  
      if (res?.data?.success) {
        const token = res.data.token;
        localStorage.setItem("token", token);
        refreshUser(); // Immediately fetch user data in the same tab
  
        // Show toast
        toast.success("Login successful", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
  
        // Step 2: Fetch user profile using token
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check-auth`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const user = response.data.user;
        console.log("Fetched user data:", user); // For debugging
        // Step 3: Check if profile is complete
        const isProfileComplete = (user) =>
          user.username?.trim() &&
          user.email?.trim() &&
          user.location?.trim() &&
          user.experienceLevel?.trim() &&
          user.experienceYear !== null &&
          user.experienceYear !== undefined &&
          Array.isArray(user.preferredLanguages) && user.preferredLanguages.length > 0 &&
          Array.isArray(user.additionalSkills) && user.additionalSkills.length > 0 &&
          user.availability?.trim();
        
  
        // Step 4: Navigate based on profile completeness
        if (response.data.success && isProfileComplete(user)) {
          console.log("Complete user data:", user);
          navigate("/dashboard");
        } else {
          navigate("/completeprofile");
        }
      } else {
        toast.error(res.data.message || "Login failed", {
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
      console.error("Login error:", err);
      toast.error("Login failed", {
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
                <Lock className="h-8 w-8 text-white" />
             </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#2563EB] mb-2">Welcome Back</h1>
            <p className="dark:text-gray-400 text-gray-600">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
            <div className="space-y-4">
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
                  {...register('password', { required: 'Password is required' })}
                  className="w-full dark:bg-black/50 bg-gray-100/80 dark:text-white text-gray-900 pl-10 pr-4 py-4 rounded-xl border dark:border-[#2563EB]/20 border-[#93C5FD]/30 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA] dark:placeholder-gray-600 placeholder-gray-400 transition-all duration-300"
                  placeholder="Password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 ml-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <Link to="/auth/register" className="dark:text-gray-400 text-gray-600 hover:text-[#60A5FA] transition-colors">
                Create an account
              </Link>
              <Link to="/forgot-password" className="text-[#60A5FA] hover:text-[#2563EB] transition-colors font-medium">
                Forgot Password?
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
                   Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;