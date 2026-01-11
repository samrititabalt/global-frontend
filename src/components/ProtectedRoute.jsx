import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    const loginPath = role === 'customer' ? '/customer/login' : 
                     role === 'agent' ? '/agent/login' : 
                     '/admin/login';
    return <Navigate to={loginPath} replace />;
  }

  // Special exception: Allow spbajaj25@gmail.com to access admin and customer routes
  const isOwnerEmail = user.email && user.email.toLowerCase() === 'spbajaj25@gmail.com';
  const canAccess = user.role === role || 
                    (isOwnerEmail && role === 'admin') || 
                    (isOwnerEmail && role === 'customer');
  
  if (!canAccess) {
    const dashboardPath = user.role === 'customer' ? '/customer/dashboard' : 
                         user.role === 'agent' ? '/agent/dashboard' : 
                         '/admin/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;

