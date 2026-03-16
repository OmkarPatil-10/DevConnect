import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

function NotFound() {
  const navigate = useNavigate();
  const { userData } = useUser();
  const token = localStorage.getItem('token');

  const handleGoBack = () => {
    if (token && userData) {
      navigate('/dashboard');
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        {/* 404 Animation/Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-9xl sm:text-[12rem] font-bold bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
              404
            </h1>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#2563EB]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#60A5FA]/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-white text-gray-900">
            Page Not Found
          </h2>
          <p className="text-lg sm:text-xl dark:text-gray-400 text-gray-600 mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-sm sm:text-base text-gray-500">
            It might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white rounded-lg hover:from-[#3B82F6] hover:to-[#60A5FA] transition-all font-semibold shadow-lg w-full sm:w-auto"
          >
            {token && userData ? 'Go to Dashboard' : 'Go to Login'}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 dark:bg-gray-800 bg-gray-100 dark:text-white text-gray-900 rounded-lg dark:hover:bg-gray-700 hover:bg-gray-200 transition-colors font-semibold w-full sm:w-auto border dark:border-gray-700 border-gray-300"
          >
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        {token && userData && (
          <div className="mt-8 pt-8 border-t dark:border-gray-800 border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Quick Links:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/dashboard"
                className="text-[#2563EB] hover:text-[#60A5FA] transition-colors text-sm"
              >
                Dashboard
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                to="/search"
                className="text-[#2563EB] hover:text-[#60A5FA] transition-colors text-sm"
              >
                Search Developers
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                to="/join-sprint"
                className="text-[#2563EB] hover:text-[#60A5FA] transition-colors text-sm"
              >
                Join Sprint
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                to="/create-sprint"
                className="text-[#2563EB] hover:text-[#60A5FA] transition-colors text-sm"
              >
                Create Sprint
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotFound;

