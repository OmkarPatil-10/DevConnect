import React, { useContext, createContext, useState, useEffect } from "react";
import axios from "axios";

//create context with default value
const UserContext = createContext();

// Custom hook to use the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Setup axios interceptor for handling 401 responses globally
let isInterceptorSetup = false;
let isRedirecting = false;

const setupAxiosInterceptor = () => {
  if (isInterceptorSetup) return;
  
  // Response interceptor to handle 401 errors globally
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Session expired or unauthorized
        const token = localStorage.getItem("token");
        if (token && !isRedirecting) {
          // Clear token and redirect to login
          localStorage.removeItem("token");
          // Only redirect if we're not already on login/register page
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith("/auth/")) {
            isRedirecting = true;
            window.location.href = "/auth/login";
          }
        }
      }
      return Promise.reject(error);
    }
  );
  
  isInterceptorSetup = true;
};

// Provider component that wraps your app
export const UserProvider = ({ children }) => {
  // State variables
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Setup axios interceptor on mount
  useEffect(() => {
    setupAxiosInterceptor();
  }, []);

  // Function to fetch user data from the backend
  const fetchUserData = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setUserData(null);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/check-auth`,
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );
      setUserData(response.data.user);
      setError(null);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUserData(null);
      setError("Failed to fetch user data");
      if (err.response?.status === 401) {
        // Session expired
        localStorage.removeItem("token");
        setToken(null);
        // Redirect to login if not already there
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/auth/")) {
          window.location.href = "/auth/login";
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    setError(null);
    setToken(null);
    window.location.href = "/auth/login";
  };

  // Refresh user data function
  const refreshUser = () => {
    setLoading(true);
    fetchUserData();
  };

  // Listen for token changes in localStorage (e.g., after login)
  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Fetch user data when token changes
  useEffect(() => {
    setLoading(true);
    fetchUserData();
    // eslint-disable-next-line
  }, [token]);

  // Create the value object to pass to context
  const value = {
    userData,
    loading,
    error,
    logout,
    refreshUser,
    fetchUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
