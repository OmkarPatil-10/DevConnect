import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

const LandingNavbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-[#60A5FA]/30 backdrop-blur-md sticky top-0 z-50 bg-black/80 dark:bg-black/80 bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#3B82F6] bg-clip-text text-transparent text-3xl font-bold drop-shadow-[0_2px_8px_rgba(37,99,235,0.25)] animate-gradient-x select-none">
              &lt;/&gt;
            </span>
            <span className="font-extrabold text-2xl tracking-wide select-none">
              <span className="bg-gradient-to-r from-[#60A5FA] via-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">Dev</span>
              <span className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">Connect</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/auth/login"
              className="hidden sm:inline-block dark:text-gray-300 text-gray-600 hover:text-[#60A5FA] font-medium transition-colors text-base"
            >
              Log in
            </Link>
            <Link
              to="/auth/register"
              className="hidden sm:inline-block bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2563EB] text-white px-3 py-1 rounded-full text-base font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)]"
            >
              Get Started
            </Link>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className=" relative p-2 rounded-full border border-[#60A5FA]/30 hover:border-[#60A5FA]/60 transition-all duration-300 hover:shadow-[0_0_12px_rgba(96,165,250,0.3)] group"
              aria-label="Toggle theme"
            >
              {/* Sun Icon (shown in dark mode, click to go light) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-5 w-5 text-[#60A5FA] transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0 absolute'
                  }`}
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              {/* Moon Icon (shown in light mode, click to go dark) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-5 w-5 text-[#2563EB] transition-all duration-300 ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0 absolute'
                  }`}
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
