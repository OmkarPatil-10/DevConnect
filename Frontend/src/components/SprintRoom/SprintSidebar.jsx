import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

function SprintSidebar({ onNavigate }) {
  const { sprintId } = useParams();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: `/sprint/${sprintId}/home`, label: 'Home', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { path: `/sprint/${sprintId}/board`, label: 'Team Board', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
    { path: `/sprint/${sprintId}/chat`, label: 'Chats', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
    { path: `/sprint/${sprintId}/teams`, label: 'Teams', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { path: `/sprint/${sprintId}/end`, label: 'Summary', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
  ];

  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="w-56 sm:w-64 dark:bg-[#1a1a1a]/40 bg-white/80 backdrop-blur-xl border-r border-[#2563EB]/20 min-h-screen flex flex-col h-full shadow-[5px_0_20px_rgba(0,0,0,0.5)] z-50">
      {/* Header */}
      <div className="dark:bg-[#1E3A8A]/60 bg-blue-50 backdrop-blur-md p-4 sm:p-6 relative border-b border-[#2563EB]/20">
        {/* Go Back Button */}
        <Link
          to="/dashboard"
          onClick={handleLinkClick}
          className="absolute top-4 sm:top-6 left-3 sm:left-4 w-7 h-7 sm:w-8 sm:h-8 hidden lg:flex items-center justify-center dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 rounded-lg transition-colors group border dark:border-white/5 border-gray-200"
          title="Go back to Dashboard"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 dark:text-gray-300 text-gray-500 group-hover:dark:text-white text-gray-900 dark:group-hover:dark:text-white text-gray-900 group-hover:text-gray-900 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="dark:text-white text-gray-800 font-bold text-lg sm:text-xl text-center dark:bg-gradient-to-r dark:from-white dark:to-gray-400 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Sprint Room</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl transition-all font-medium ${isActive(item.path)
                ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] translate-x-1'
                : 'dark:text-gray-300 text-gray-600 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 hover:translate-x-1'
                }`}
            >
              <span className="flex-shrink-0 text-[#60A5FA]  transition-colors">{item.icon}</span>
              <span className="text-sm sm:text-base">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer with Theme Toggle */}
      <div className="p-4 border-t border-[#2563EB]/20 dark:bg-[#1E3A8A]/30 bg-blue-50/50">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full py-2.5 px-4 mb-3 rounded-xl transition-all flex items-center justify-center gap-3 font-medium border border-[#2563EB]/20 hover:border-[#2563EB]/40 dark:bg-white/5 bg-white dark:text-gray-300 text-gray-600 dark:hover:bg-white/10 hover:bg-blue-50 group text-sm"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <>
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
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-[#2563EB] group-hover:-rotate-12 transition-transform duration-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span>Dark Mode</span>
            </>
          )}
        </button>
        <p className="text-xs text-center text-gray-500 font-mono">DevHub v1.0</p>
      </div>
    </div>
  );
}

export default SprintSidebar;

