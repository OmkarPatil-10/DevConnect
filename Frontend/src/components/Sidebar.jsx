import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

const Sidebar = ({ isOpen, onClose, onSignOut, isMobileOnly = false }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <aside
        className={`w-64 dark:bg-[#1a1a1a]/60 bg-white/80 backdrop-blur-xl border-r border-[#2563EB]/20 fixed left-0 top-[60px] sm:top-[73px] bottom-0 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isOpen
          ? "translate-x-0"
          : `-translate-x-full ${!isMobileOnly ? "lg:translate-x-0" : ""}`
          }`}
      >
        <nav className="p-4 space-y-2 flex-grow overflow-y-auto custom-scrollbar">
          <Link
            to="/dashboard"
            onClick={onClose}
            className={`block py-3 px-4 rounded-xl transition-all font-medium ${isActive("/dashboard")
              ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              : "text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
          >
            Dashboard
          </Link>
          <Link
            to="/search"
            onClick={onClose}
            className={`block py-3 px-4 rounded-xl transition-all font-medium ${isActive("/search")
              ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              : "text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
          >
            Search Developers
          </Link>
          <Link
            to="/join-sprint"
            onClick={onClose}
            className={`block py-3 px-4 rounded-xl transition-all font-medium ${isActive("/join-sprint")
              ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              : "text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
          >
            Join Sprint
          </Link>
          <Link
            to="/create-sprint"
            onClick={onClose}
            className={`block py-3 px-4 rounded-xl transition-all font-medium ${isActive("/create-sprint")
              ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              : "text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
          >
            Create Sprint
          </Link>

        </nav>
        {/* Theme Toggle & Sign Out */}
        <div className="p-4 border-t border-[#2563EB]/20 dark:bg-[#1E3A8A]/30 bg-blue-50/50">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full py-3 px-4 mb-3 rounded-xl transition-all flex items-center justify-center gap-3 font-medium border border-[#2563EB]/20 hover:border-[#2563EB]/40 dark:bg-white/5 bg-white dark:text-gray-300 text-gray-600 dark:hover:bg-white/10 hover:bg-blue-50 group"
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
                  className="h-5 w-5 text-[#2563EB] group-hover:-rotate-12 transition-transform duration-300"
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

          <button
            onClick={onSignOut}
            className="w-full py-3 px-4 dark:bg-white/5 bg-white dark:text-gray-300 text-gray-600 dark:text-gray-300 text-gray-600 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all flex items-center justify-center gap-2 font-medium border border-white/5 dark:border-white/5 border-gray-200 hover:border-red-500/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L4 7.414 5.414 6l3.293 3.293L12 6l2 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Sign Out
          </button>
          <div className="mt-4 text-center">
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">DevConnect v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

