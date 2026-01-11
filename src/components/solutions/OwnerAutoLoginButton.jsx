import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const OwnerAutoLoginButton = ({ ownerEmail, autoLoginOwnerAsCustomer, onSuccess, className = '', text = 'Try Free' }) => {
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);
  const navigate = useNavigate();
  
  const handleClick = async (e) => {
    // Check if user is owner email (check stored user or current login)
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');
    
    // Always check if this is owner email - if so, auto-login as customer
    const isOwner = storedUser?.email?.toLowerCase() === ownerEmail || 
                   localStorage.getItem('ownerEmail') === ownerEmail ||
                   (token && storedUser?.email?.toLowerCase() === ownerEmail);
    
    if (isOwner) {
      // If already logged in as customer, proceed normally
      if (storedUser?.role === 'customer') {
        return; // Let Link handle navigation
      }
      
      // Otherwise, auto-login as customer
      e.preventDefault();
      try {
        setAutoLoggingIn(true);
        const result = await autoLoginOwnerAsCustomer();
        
        if (result.success) {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/customer/solution-pro');
          }
        } else {
          // If auto-login fails, proceed to signup
          navigate('/customer/signup');
        }
      } catch (error) {
        console.error('Auto-login error:', error);
        navigate('/customer/signup');
      } finally {
        setAutoLoggingIn(false);
      }
    }
    // If not owner, let the Link handle navigation normally (to signup)
  };

  return (
    <Link
      to="/customer/signup"
      onClick={handleClick}
      className={`inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {autoLoggingIn ? 'Logging in...' : text}
      {!autoLoggingIn && <ArrowRight className="ml-2 h-5 w-5" />}
    </Link>
  );
};

export default OwnerAutoLoginButton;
