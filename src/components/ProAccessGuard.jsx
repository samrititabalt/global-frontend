import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProAccessGuard = ({ requiredRole, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Please log in</h1>
          <p className="text-gray-600">Log in to access this Pro solution.</p>
        </div>
      </div>
    );
  }

  if (user.role === 'admin') {
    return children;
  }

  if (requiredRole === 'agent') {
    if (user.role !== 'agent' || !user.pro_access_enabled) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white px-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">Access restricted</h1>
            <p className="text-gray-600">You do not have access to this solution. Please contact your administrator.</p>
          </div>
        </div>
      );
    }
  }

  if (requiredRole === 'customer' && user.role !== 'customer') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Access restricted</h1>
          <p className="text-gray-600">You do not have access to this solution. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProAccessGuard;
