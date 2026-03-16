import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

function UserProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setUserProfile(response.data.user);
        } else {
          setError('Failed to fetch user profile');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.response?.data?.message || 'Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#2563EB] text-white px-4 py-2 rounded hover:bg-[#2563EB]/80"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="dark:text-gray-400 text-gray-600 mb-4">User not found</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#2563EB] text-white px-4 py-2 rounded hover:bg-[#2563EB]/80"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="dark:bg-black/80 bg-white/80 border-b-2 border-[#60A5FA] p-3 sm:p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#3B82F6] bg-clip-text text-transparent text-3xl font-bold drop-shadow-[0_2px_8px_rgba(37,99,235,0.25)] animate-gradient-x select-none">
              &lt;/&gt;
            </span>
            <span className="font-extrabold text-2xl tracking-wide select-none">
              <span className="bg-gradient-to-r from-[#60A5FA] via-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">Dev</span>
              <span className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">Connect</span>
            </span>

          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#2563EB] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#2563EB]/80 transition-colors text-sm sm:text-base"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Profile Hero Card */}
        <div className="bg-gradient-to-br dark:from-[#1E3A8A] dark:via-[#111] dark:to-[#1E3A8A] from-blue-50 via-white to-blue-50 rounded-2xl sm:rounded-3xl border-2 border-[#2563EB]/50 p-6 sm:p-8 mb-6 sm:mb-8 shadow-2xl relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#60A5FA]/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 mb-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-[#2563EB] to-[#60A5FA] rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center shadow-xl border-4 border-[#2563EB]/30">
                  {userProfile?.profilePicture ? (
                    <img
                      src={`data:image/jpeg;base64,${userProfile.profilePicture}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="dark:text-white text-gray-900 text-4xl sm:text-5xl lg:text-6xl font-bold">
                      {userProfile?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-4 border-[#1E3A8A]"></div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">
                  {userProfile?.username || 'User'}
                </h1>
                <p className="dark:text-gray-300 text-gray-600 text-base sm:text-lg mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {userProfile?.email || 'No email provided'}
                </p>
              </div>
            </div>

            {/* Bio */}
            {userProfile?.bio && (
              <div className="dark:bg-[#111]/50 bg-gray-100/80 rounded-xl p-4 sm:p-5 border border-[#2563EB]/20 mb-6">
                <h3 className="text-sm font-semibold text-[#60A5FA] uppercase tracking-wide mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> Bio
                </h3>
                <p className="dark:text-white text-gray-900 text-sm sm:text-base leading-relaxed">{userProfile.bio}</p>
              </div>
            )}

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location */}
              <div className="dark:bg-[#111]/50 bg-gray-100/80 rounded-xl p-4 border border-[#2563EB]/20">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <h3 className="text-xs font-semibold text-[#60A5FA] uppercase tracking-wide">Location</h3>
                </div>
                <p className="dark:text-white text-gray-900 text-sm sm:text-base font-medium">
                  {userProfile?.location || 'Not specified'}
                </p>
              </div>

              {/* Experience Level */}
              <div className="dark:bg-[#111]/50 bg-gray-100/80 rounded-xl p-4 border border-[#2563EB]/20">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  <h3 className="text-xs font-semibold text-[#60A5FA] uppercase tracking-wide">Level</h3>
                </div>
                <p className="dark:text-white text-gray-900 text-sm sm:text-base font-medium">
                  {userProfile?.experienceLevel ?
                    userProfile.experienceLevel.charAt(0) + userProfile.experienceLevel.slice(1).toLowerCase()
                    : 'Not specified'}
                </p>
              </div>

              {/* Experience Years */}
              <div className="dark:bg-[#111]/50 bg-gray-100/80 rounded-xl p-4 border border-[#2563EB]/20">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <h3 className="text-xs font-semibold text-[#60A5FA] uppercase tracking-wide">Experience</h3>
                </div>
                <p className="dark:text-white text-gray-900 text-sm sm:text-base font-medium">
                  {userProfile?.experienceYear !== undefined && userProfile?.experienceYear !== null
                    ? `${userProfile.experienceYear} year${userProfile.experienceYear !== 1 ? 's' : ''}`
                    : 'Not specified'}
                </p>
              </div>

              {/* Availability */}
              <div className="dark:bg-[#111]/50 bg-gray-100/80 rounded-xl p-4 border border-[#2563EB]/20">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h3 className="text-xs font-semibold text-[#60A5FA] uppercase tracking-wide">Availability</h3>
                </div>
                <p className="dark:text-white text-gray-900 text-sm sm:text-base font-medium">
                  {userProfile?.availability ?
                    userProfile.availability.replace('-', ' ').charAt(0) + userProfile.availability.slice(1).toLowerCase()
                    : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Programming Languages */}
          <div className="bg-gradient-to-br dark:from-[#1E3A8A] dark:via-[#111] dark:to-[#1E3A8A] from-blue-50 via-white to-blue-50 rounded-2xl sm:rounded-3xl border-2 border-[#2563EB]/50 p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-lg sm:text-xl font-bold text-[#60A5FA] mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> Programming Languages
              </h3>
              {userProfile?.preferredLanguages && userProfile.preferredLanguages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userProfile.preferredLanguages.map((lang, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="dark:text-gray-400 text-gray-600 text-sm sm:text-base">No programming languages specified</p>
              )}
            </div>
          </div>

          {/* Additional Skills */}
          <div className="bg-gradient-to-br dark:from-[#1E3A8A] dark:via-[#111] dark:to-[#1E3A8A] from-blue-50 via-white to-blue-50 rounded-2xl sm:rounded-3xl border-2 border-[#2563EB]/50 p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#60A5FA]/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-lg sm:text-xl font-bold text-[#60A5FA] mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Additional Skills
              </h3>
              {userProfile?.additionalSkills && userProfile.additionalSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userProfile.additionalSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-[#2563EB]/20 dark:text-white text-[#2563EB] border border-[#2563EB]/50 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="dark:text-gray-400 text-gray-600 text-sm sm:text-base">No additional skills specified</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {/* <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="bg-gray-700 dark:text-white text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium"
          >
            ← Go Back
          </button>
          <Link 
            to={`/network`}
            className="bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white px-6 py-3 rounded-lg hover:from-[#3B82F6] hover:to-[#60A5FA] transition-all text-sm sm:text-base font-semibold shadow-lg text-center"
          >
            View Network
          </Link>
        </div> */}
      </div>
    </div>
  );
}

export default UserProfile; 