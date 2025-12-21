import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut } from 'react-icons/fi';

const Layout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  const minuteBalance = user?.tokenBalance ?? 0;

  const handleLogout = () => {
    logout();
    const loginPath =
      role === 'agent' ? '/agent/login' : role === 'admin' ? '/admin/login' : '/customer/login';
    navigate(loginPath);
  };

  const getDashboardPath = () => {
    if (role === 'agent') return '/agent/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/customer/dashboard';
  };

  const getProfilePath = () => {
    if (role === 'agent') return '/agent/profile';
    if (role === 'admin') return '/admin/profile';
    return '/customer/profile';
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-12 w-96 h-96 bg-blue-200 rounded-full blur-[140px] opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-purple-100 rounded-full blur-[140px] opacity-60"></div>
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="bg-white/80 border-b border-white/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-8">
                <Link to={getDashboardPath()} className="flex items-center gap-3 group">
                  {!logoError ? (
                    <div className="flex flex-col">
                      <img
                        src="/assets/tabalt-logo.png.jpg"
                        alt="Tabalt Logo"
                        className="h-10 w-auto object-contain"
                        onError={() => setLogoError(true)}
                      />
                      <span className="text-xs text-gray-600 font-medium mt-1">UK Outsourcing Partners</span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Tabalt
                      </span>
                      <span className="text-xs text-gray-600 font-medium">UK Outsourcing Partners</span>
                    </div>
                  )}
                </Link>
                <div className="hidden md:flex items-center space-x-6">
                  {role === 'customer' && (
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
                  <Link
                    to={getProfilePath()}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Profile
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3">
                  <span className="text-gray-700 font-medium">{user?.name}</span>
                  {role && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 uppercase tracking-wide">
                      {role}
                    </span>
                  )}
                  {role === 'customer' && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                      {Number(minuteBalance).toLocaleString()} min left
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors rounded-full border border-transparent hover:border-gray-200"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1">
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${title ? 'pt-10 pb-6' : 'py-8'}`}>
            {title && (
              <div className="pb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-blue-600 font-semibold">
                  Dashboard
                </p>
                <h1 className="text-4xl font-bold text-gray-900 mt-2">{title}</h1>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

