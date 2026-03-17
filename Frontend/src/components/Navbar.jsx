import React from 'react';
import { Link, Links, useLocation } from 'react-router-dom';

const Navbar = ({ sidebarOpen, setSidebarOpen, userData }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { to: '/dashboard', label: 'Home' },
    { to: '/network', label: 'My Network' },
    { to: '/chats', label: 'Chats' },
  ];

  return (
    <header className="dark:bg-black/80 bg-white/80 backdrop-blur-md border-b border-[#2563EB]/20 p-3 sm:p-4 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center dark:text-gray-400 text-gray-700 dark:bg-gray-800 bg-gray-100 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>


          <div className="flex items-center">
            <Link to="/dashboard">
              <span className="bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#3B82F6] bg-clip-text text-transparent text-3xl font-bold drop-shadow-[0_2px_8px_rgba(37,99,235,0.25)] animate-gradient-x select-none">
                &lt;/&gt;
              </span>
              <span className="font-extrabold text-2xl tracking-wide select-none">
                <span className="bg-gradient-to-r from-[#60A5FA] via-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">Dev</span>
                <span className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">Connect</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4 sm:space-x-8">
          <nav className="hidden md:flex space-x-4 lg:space-x-6">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm lg:text-base font-medium transition-colors relative pb-1 ${isActive(to)
                  ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                  : 'dark:text-gray-200 text-gray-600 hover:text-[#2563EB] border-b-2 border-transparent hover:border-[#2563EB]/40'
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden sm:inline-block w-8 h-8 sm:w-10 sm:h-10 bg-[#2563EB] rounded-full overflow-hidden flex items-center justify-center ring-2 ring-[#2563EB]/30">
            {userData?.profilePicture && userData.profilePicture !== 'data:image/jpeg;base64' ? (
              <img
                src={userData.profilePicture.startsWith('data:') ? userData.profilePicture : `data:image/jpeg;base64,${userData.profilePicture}`}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <span className="dark:text-white text-gray-900 text-sm sm:text-lg font-semibold">{userData?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
        </div>

        {/* Mobile Icon Buttons - Network and Chat (Visible on Mobile) */}
        <div className="flex items-center gap-2 md:hidden absolute right-1 top-1/2 -translate-y-1/2">
          {/* Network Icon */}
          <Link
            to="/network"
            className="w-9 h-9 flex items-center justify-center dark:text-white text-gray-700 dark:hover:bg-white/10 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="My Network"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </Link>

          {/* Chat Icon */}
          <Link
            to="/chats"
            className="w-9 h-9 flex items-center justify-center dark:text-white text-gray-700 dark:hover:bg-white/10 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Chats"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
