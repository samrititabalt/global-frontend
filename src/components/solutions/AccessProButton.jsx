import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OwnerAutoLoginButton from './OwnerAutoLoginButton';

const AccessProButton = ({ proPath, ownerEmail = 'spbajaj25@gmail.com', className = '' }) => {
  const { isAuthenticated, user, autoLoginOwnerAsCustomer } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is customer
  const isCustomer = isAuthenticated && (
    user?.role === 'customer' || 
    user?.email?.toLowerCase() === ownerEmail
  );

  if (isCustomer) {
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
