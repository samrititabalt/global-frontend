import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiHome } from 'react-icons/fi';

const Layout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    const loginPath = user.role === 'customer' ? '/customer/login' : 
                     user.role === 'agent' ? '/agent/login' : 
                     '/admin/login';
    navigate(loginPath);
  };

  const getDashboardPath = () => {
    if (user.role === 'customer') return '/customer/dashboard';
    if (user.role === 'agent') return '/agent/dashboard';
    return '/admin/dashboard';
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              <Link to={getDashboardPath()} className="flex items-center space-x-2 group">
                <span className="text-2xl font-bold text-gray-900 group-hover:text-primary-800 transition-colors">
                  Horatio
                </span>
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                {user?.role === 'customer' && (
                  <Link 
                    to="/customer/plans" 
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Plans
                  </Link>
                )}
                <Link 
                  to={getDashboardPath()} 
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-gray-700 font-medium">{user?.name}</span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 uppercase tracking-wide">
                  {user?.role}
                </span>
                {user?.role === 'customer' && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accent-100 text-accent-800">
                    {user?.tokenBalance || 0} Tokens
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <FiLogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className={title ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : ""}>
        {title && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
            <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;

