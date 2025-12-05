import React from 'react';
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

  if (user.role !== role) {
    const dashboardPath = user.role === 'customer' ? '/customer/dashboard' : 
                         user.role === 'agent' ? '/agent/dashboard' : 
                         '/admin/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;

