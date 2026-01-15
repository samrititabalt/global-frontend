import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading, refreshUser } = useAuth();
  const [checkingAccess, setCheckingAccess] = useState(false);


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

  // Refresh agent permissions when accessing customer-only routes
  useEffect(() => {
    if (user && role === 'customer' && user.role === 'agent') {
      setCheckingAccess(true);
      refreshUser().finally(() => setCheckingAccess(false));
    }
  }, [user, role, refreshUser]);

  if (checkingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Special exception: Allow spbajaj25@gmail.com to access admin and customer routes
  const isOwnerEmail = user.email && user.email.toLowerCase() === 'spbajaj25@gmail.com';
  const isAgentPro = user.role === 'agent' && user.pro_access_enabled;
  const canAccess = user.role === role || 
                   (role === 'customer' && isAgentPro) ||
                   (isOwnerEmail && role === 'admin') || 
                   (isOwnerEmail && role === 'customer');
  
  if (!canAccess) {
    if (role === 'customer' && user.role === 'agent') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white px-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">Access restricted</h1>
            <p className="text-gray-600">Please contact admin to enable Pro access.</p>
          </div>
        </div>
      );
    }
    const dashboardPath = user.role === 'customer' ? '/customer/dashboard' : 
                         user.role === 'agent' ? '/agent/dashboard' : 
                         '/admin/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;

