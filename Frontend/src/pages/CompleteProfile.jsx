import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer,toast } from 'react-toastify';

import { useUser } from '@/context/UserContext';

function CompleteProfile() {
  const { refreshUser } = useUser();
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('profileStep');
    return saved ? parseInt(saved) : 1;
  });
  const [photoPreview, setPhotoPreview] = useState(() => {
    const saved = localStorage.getItem('profilePhoto');
    return saved || null;
  });
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      username: '',
      location: '',
      bio: '',
      experienceLevel: 'Beginner',
      experienceYears: 0,
      programmingLanguages: [],
      domains: [],
      availability: 'Full-time',
      photo: null
    },
    mode: 'onChange'
  });

  // Save step to localStorage
  useEffect(() => {
    localStorage.setItem('profileStep', step.toString());
  }, [step]);

  // Save photo preview to localStorage
  useEffect(() => {
    if (photoPreview) {
      localStorage.setItem('profilePhoto', photoPreview);
    }
  }, [photoPreview]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const subscription = watch((value) => {
      const { email, username, ...rest } = value;
      localStorage.setItem('profileForm', JSON.stringify(rest));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check-auth`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          const userData = response.data.user;
          
          // Clear any existing form data when loading a new user
          localStorage.removeItem('profileForm');
          localStorage.removeItem('profileStep');
          localStorage.removeItem('profilePhoto');
          
          // Always set email and username from API
          setValue('email', userData.email);
          setValue('username', userData.username);

          // Set other fields from API data
          setValue('location', userData.location || '');
          setValue('bio', userData.bio || '');
          setValue('experienceLevel', userData.experienceLevel || 'BEGINNER');
          setValue('experienceYears', userData.experienceYear || 0);
          setValue('programmingLanguages', userData.preferredLanguages || []);
          setValue('domains', userData.additionalSkills || []);
          setValue('availability', userData.availability || 'FULL-TIME');
          
          if (userData.profilePicture) {
            setPhotoPreview(`data:image/jpeg;base64,${userData.profilePicture}`);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token, setValue]);

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress the image
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas dimensions to max 200x200 while maintaining aspect ratio
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with reduced quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
          setPhotoPreview(compressedBase64);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLanguageToggle = (language) => {
    const currentLanguages = watch('programmingLanguages') || [];
    const updatedLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter(lang => lang !== language)
      : [...currentLanguages, language];
    setValue('programmingLanguages', updatedLanguages);
  };

  const handleDomainToggle = (domain) => {
    const currentDomains = watch('domains') || [];
    const updatedDomains = currentDomains.includes(domain)
      ? currentDomains.filter(d => d !== domain)
      : [...currentDomains, domain];
    setValue('domains', updatedDomains);
  };

  // Clear localStorage when form is submitted successfully
  const onSubmit = async (data) => {
    try {
      // Validate required fields
      if (!data.programmingLanguages || data.programmingLanguages.length === 0) {
        // alert("Please select at least one programming language");
        toast.error("Please select at least one programming language", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          
        });
        return;
      }
      if (!data.domains || data.domains.length === 0) {
        // alert("Please select at least one domain");
        toast.error("Please select at least one domain", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          
        });
        return;
      }

      // Transform the data to match backend field names
      const submitData = {
        location: data.location,
        bio: data.bio,
        experienceLevel: data.experienceLevel,
        experienceYear: data.experienceYears,
        preferredLanguages: data.programmingLanguages,
        availability: data.availability,
        additionalSkills: data.domains,
        profilePicture: photoPreview ? photoPreview.split(',')[1] : null // Remove the data URL prefix
      };

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/complete-profile`, submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Clear all saved data after successful submission
      localStorage.removeItem('profileForm');
      localStorage.removeItem('profileStep');
      localStorage.removeItem('profilePhoto');

      // Refresh user context to ensure Dashboard gets the latest data
      await refreshUser();
      
      // alert("Profile updated!");
      toast.success('Profile updated!', {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                        
                        });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      // alert(err.response?.data?.message || "Error updating profile");
      toast.error(err.response?.data?.message || "Error updating profile", {
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
  };

  const programmingLanguages = [
    'JavaScript', 'Python', 'Java',
    'C++', 'Ruby', 'PHP',
    'Swift', 'Kotlin', 'Go'
  ];

  const domainSkills = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Cloud Computing',
    'DevOps',
    'Cybersecurity',
    'UI/UX Design',
    'Game Development',
    'Blockchain',
    'AR/VR',
    'IoT'
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 relative overflow-hidden flex flex-col items-center">
       {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2563EB]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#60A5FA]/10 rounded-full blur-[120px] pointer-events-none"></div>

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
      
      <div className="flex items-center gap-2 mb-8 relative z-10 mt-4">
        {/* <span className="text-[#2563EB] text-2xl">&lt;/&gt;</span>
        <span className="text-[#2563EB] text-2xl font-semibold">DevHub</span> */}
        <span className="bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#3B82F6] bg-clip-text text-transparent text-3xl sm:text-4xl font-bold drop-shadow-[0_2px_8px_rgba(37,99,235,0.25)] animate-gradient-x select-none">
              &lt;/&gt;
            </span>
            <span className="ml-2 relative text-3xl sm:text-4xl font-extrabold  tracking-wide select-none">
              <span className="bg-gradient-to-r from-[#60A5FA] via-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,150,245,0.15)] animate-gradient-x">
                Dev
              </span>
              <span className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(162,89,198,0.17)] animate-gradient-x">
                Hub
              </span>
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-[#60A5FA]/50 via-[#2563EB]/30 to-transparent rounded-full blur-sm opacity-80 pointer-events-none"></span>
            </span>
      </div>

      <div className="w-full max-w-3xl dark:bg-[#111]/60 bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-[#2563EB]/30 shadow-[0_0_40px_rgba(37,99,235,0.2)] relative z-10 transition-all">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#2563EB] mb-2">{step === 1 ? "Create Profile" : "Professional Details"}</h1>
         <div className="w-full dark:bg-gray-800 bg-gray-200 h-1.5 rounded-full mb-8 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#2563EB] to-[#60A5FA] h-full transition-all duration-500 ease-out"
              style={{ width: step === 1 ? '50%' : '100%' }}
            ></div>
         </div>
         
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 ? (
            <>
              <p className="dark:text-gray-400 text-gray-600 mb-8 text-lg">
                Let's set up the basics. This helps the community identify you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-7 space-y-6">

                <div>
                     <label className="text-sm font-medium dark:text-gray-400 text-gray-600 mb-1 block">Username</label>
                    <input
                      type="text"
                      placeholder="Username"
                      {...register("username", {
                        required: "Username is required",
                        pattern: {
                          value: /^[a-zA-Z0-9_-]+$/,
                          message: "Username can only contain letters, numbers, underscores and dashes"
                        }
                      })}
                      disabled
                      className={`w-full dark:bg-black/50 bg-gray-50 dark:text-white text-gray-900 pl-4 pr-4 py-3 rounded-xl border ${errors.username ? 'border-red-500' : 'border-[#2563EB]/20'} focus:outline-none focus:border-[#60A5FA] disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    {errors.username && (
                      <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium dark:text-gray-400 text-gray-600 mb-1 block">Email</label>
                    <input
                      type="email"
                      placeholder="Email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                      disabled
                      className={`w-full dark:bg-black/50 bg-gray-50 dark:text-white text-gray-900 pl-4 pr-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-[#2563EB]/20'} focus:outline-none focus:border-[#60A5FA] disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium dark:text-gray-400 text-gray-600 mb-1 block">Location</label>
                    <input
                      type="text"
                      placeholder="City, Country"
                      {...register("location", {
                        required: "Location is required",
                        minLength: { value: 2, message: "Location must be at least 2 characters" }
                      })}
                      className={`w-full dark:bg-black/50 bg-gray-50 dark:text-white text-gray-900 pl-4 pr-4 py-3 rounded-xl border ${errors.location ? 'border-red-500' : 'border-[#2563EB]/20'} focus:outline-none focus:border-[#60A5FA] transition-colors`}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                    )}
                  </div>
                  <div>
                     <label className="text-sm font-medium dark:text-gray-400 text-gray-600 mb-1 block">Bio</label>
                    <textarea
                      placeholder="Tell us a bit about yourself..."
                      {...register("bio", {
                        required: "Bio is required",
                        maxLength: { value: 500, message: "Bio must be less than 500 characters" }
                      })}
                      rows="4"
                      className={`w-full dark:bg-black/50 bg-gray-50 dark:text-white text-gray-900 pl-4 pr-4 py-3 rounded-xl border ${errors.bio ? 'border-red-500' : 'border-[#2563EB]/20'} focus:outline-none focus:border-[#60A5FA] transition-colors resize-none`}
                    />
                    {errors.bio && (
                      <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-5 flex flex-col items-center justify-start pt-4">
                  {photoPreview ? (
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full opacity-75 blur transition duration-1000 group-hover:duration-200"></div>
                      <img 
                        src={photoPreview} 
                        alt="Profile preview" 
                        className="relative w-40 h-40 rounded-full object-cover border-4 dark:border-black border-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview(null);
                          setValue('photo', null);
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1.5 text-sm hover:bg-red-600 transition-colors z-20 shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-full mb-4 flex items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] border border-[#60A5FA]/30 shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                      <span className="text-[#60A5FA] text-5xl font-bold">
                        {watch('username')?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  {/* <div className="w-40 h-40 bg-[#2563EB]/20 rounded-3xl"></div> */}
                  <input
                    type="file"
                    {...register("photo")}
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                    accept="image/*"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="mt-6 px-6 py-2 rounded-full border border-[#60A5FA]/50 text-[#60A5FA] font-semibold cursor-pointer hover:bg-[#60A5FA] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(255,150,245,0.2)]"
                  >
                    Upload Photo
                  </label>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white px-10 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  Next Step →
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="dark:text-gray-400 text-gray-600 mb-8 text-lg">
                Showcase your expertise. This helps in matching you with the right teams.
              </p>

              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div>
                    <label className="text-sm font-medium dark:text-gray-400 text-gray-600 mb-3 block">Experience Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Beginner', 'Intermediate', 'Expert'].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setValue('experienceLevel', level)}
                          className={`px-2 py-2.5 text-sm sm:text-base rounded-lg font-medium transition-all duration-300 ${
                            watch('experienceLevel') === level
                              ? 'bg-[#2563EB] text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                              : 'dark:bg-black/40 bg-gray-100 dark:text-gray-400 text-gray-600 border border-[#2563EB]/20 hover:border-[#60A5FA]/50 dark:hover:text-white hover:text-black'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    {errors.experienceLevel && (
                      <p className="text-red-500 text-sm mt-1">{errors.experienceLevel.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium dark:text-gray-400 text-gray-600 mb-3 block">Years of Experience</label>
                    <input
                      type="number"
                      {...register("experienceYears", {
                        required: "Experience years is required",
                        min: { value: 0, message: "Experience years cannot be negative" },
                        max: { value: 50, message: "Please enter a valid experience" }
                      })}
                      min="0"
                      className={`w-full dark:bg-black/50 bg-gray-50 dark:text-white text-gray-900 pl-4 pr-4 py-2.5 rounded-xl border ${errors.experienceYears ? 'border-red-500' : 'border-[#2563EB]/20'} focus:outline-none focus:border-[#60A5FA] transition-colors`}
                    />
                    {errors.experienceYears && (
                      <p className="text-red-500 text-sm mt-1">{errors.experienceYears.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium dark:text-gray-400 text-gray-600 mb-3 block">Programming Languages <span className="text-[#2563EB] text-xs">(Multi-select)</span></label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {programmingLanguages.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleLanguageToggle(lang)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          (watch('programmingLanguages') || []).includes(lang)
                            ? 'bg-[#2563EB]/80 text-white border border-[#60A5FA]/50 shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                            : 'dark:bg-black/40 bg-gray-100 dark:text-gray-400 text-gray-600 border border-[#2563EB]/20 hover:bg-[#2563EB]/20 dark:hover:text-white hover:text-black'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                  {errors.programmingLanguages && (
                    <p className="text-red-500 text-sm mt-1">{errors.programmingLanguages.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium dark:text-gray-400 text-gray-600 mb-3 block">Domains <span className="text-[#2563EB] text-xs">(Multi-select)</span></label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {domainSkills.map(domain => (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => handleDomainToggle(domain)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          (watch('domains') || []).includes(domain)
                            ? 'bg-[#2563EB]/80 text-white border border-[#60A5FA]/50 shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                            : 'dark:bg-black/40 bg-gray-100 dark:text-gray-400 text-gray-600 border border-[#2563EB]/20 hover:bg-[#2563EB]/20 dark:hover:text-white hover:text-black'
                        }`}
                      >
                        {domain}
                      </button>
                    ))}
                  </div>
                  {errors.domains && (
                    <p className="text-red-500 text-sm mt-1">{errors.domains.message}</p>
                  )}
                </div>

                <div>
                   <label className="text-sm font-medium dark:text-gray-400 text-gray-600 mb-3 block">Availability</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['Full-time', 'Weekends', 'Part-time'].map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setValue('availability', time)}
                          className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                            watch('availability') === time
                              ? 'bg-[#2563EB] text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                              : 'dark:bg-black/40 bg-gray-100 dark:text-gray-400 text-gray-600 border border-[#2563EB]/20 hover:border-[#60A5FA]/50 dark:hover:text-white hover:text-black'
                          }`}
                        >
                          {time.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                    {errors.availability && (
                      <p className="text-red-500 text-sm mt-1">{errors.availability.message}</p>
                    )}
                  </div>
              </div>

              <div className="mt-10 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="dark:text-gray-400 text-gray-600 dark:hover:dark:text-white text-gray-900 hover:text-black px-6 py-2 transition-colors font-medium flex items-center group"
                >
                  <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white px-10 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  Complete Profile
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;