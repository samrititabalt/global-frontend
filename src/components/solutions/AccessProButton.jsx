import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OwnerAutoLoginButton from './OwnerAutoLoginButton';

const AccessProButton = ({ proPath, ownerEmail = 'spbajaj25@gmail.com', className = '' }) => {
  const { isAuthenticated, user, autoLoginOwnerAsCustomer } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is customer or agent with pro access
  const isCustomer = isAuthenticated && (
    user?.role === 'customer' || 
    user?.email?.toLowerCase() === ownerEmail
  );
  const isAgentPro = isAuthenticated && user?.role === 'agent' && user?.pro_access_enabled;

  if (isCustomer || isAgentPro) {
    return (
      <Link
        to={proPath}
        className={`inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${className}`}
      >
        Access Pro Version
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    );
  }

  if (isAuthenticated && user?.role === 'agent' && !user?.pro_access_enabled) {
    return (
      <div className="flex flex-col items-start">
        <button
          type="button"
          className={`inline-flex items-center justify-center px-8 py-4 bg-gray-300 text-gray-600 font-semibold rounded-lg cursor-not-allowed ${className}`}
          disabled
        >
          Access Restricted
        </button>
        <span className="mt-2 text-xs text-gray-500">Please contact admin to enable Pro access.</span>
      </div>
    );
  }

  // For non-customers, use OwnerAutoLoginButton which redirects to signup
  return (
    <OwnerAutoLoginButton
      ownerEmail={ownerEmail}
      autoLoginOwnerAsCustomer={autoLoginOwnerAsCustomer}
      onSuccess={() => navigate(proPath)}
      text="Access Pro Version"
      className={className}
    />
  );
};

export default AccessProButton;
