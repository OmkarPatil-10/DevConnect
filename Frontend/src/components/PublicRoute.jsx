import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

/**
 * PublicRoute component - Redirects authenticated users to dashboard
 * If user is already logged in, redirect them away from auth pages
 */
function PublicRoute({ children }) {
  const { userData, loading } = useUser();
  const token = localStorage.getItem('token');

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563EB] mb-4"></div>
          <p className="dark:text-gray-400 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (token && userData) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is not authenticated, render the public component (login/register)
  return children;
}

export default PublicRoute;

