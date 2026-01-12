import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * AdminIndicator Component
 * Shows admin login status and logout button on all pages (bottom right corner)
 */
const AdminIndicator = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  if (!isAdmin) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2"
      style={{
        fontSize: '11px',
        minWidth: '140px',
      }}
    >
      <div className="flex items-center gap-1.5 flex-1">
        <User size={12} className="text-gray-600" />
        <span className="text-gray-700 font-medium">Admin User</span>
        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
          ADMIN
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-100"
        title="Logout"
      >
        <LogOut size={12} />
        <span className="text-xs">Logout</span>
      </button>
    </div>
  );
};

export default AdminIndicator;
