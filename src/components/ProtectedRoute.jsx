import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  // #region debug log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/2f137257-445b-4027-94f4-f63f4a70e66e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.jsx:9',message:'ProtectedRoute check',data:{requiredRole:role,userRole:user?.role,hasUser:!!user,loading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  }, [user, loading, role]);
  // #endregion

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

