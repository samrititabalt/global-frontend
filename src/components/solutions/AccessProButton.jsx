import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AccessProButton = ({ proPath, customerProPath, agentProPath, className = '' }) => {
  const { isAuthenticated, user } = useAuth();
  const [message, setMessage] = useState('');
  
  const resolvedCustomerPath = customerProPath || proPath;
  const resolvedAgentPath = agentProPath || (resolvedCustomerPath?.startsWith('/customer/')
    ? resolvedCustomerPath.replace('/customer/', '/agent/')
    : resolvedCustomerPath?.startsWith('/') ? `/agent${resolvedCustomerPath}` : resolvedCustomerPath);

  const isCustomer = isAuthenticated && user?.role === 'customer';
  const isAgent = isAuthenticated && user?.role === 'agent';
  const isAgentPro = isAgent && user?.pro_access_enabled;

  if (isCustomer || isAgentPro) {
    const targetPath = isCustomer ? resolvedCustomerPath : resolvedAgentPath;
    return (
      <Link
        to={targetPath}
        className={`inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${className}`}
      >
        Access Pro Version
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-start">
      <button
        type="button"
        className={`inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${className}`}
        onClick={() => {
          if (isAgent && !isAgentPro) {
            setMessage('You do not have access to this solution. Please contact your administrator.');
            return;
          }
          if (!isAuthenticated) {
            setMessage('Please log in to access the Pro version.');
            return;
          }
          setMessage('Access is restricted.');
        }}
      >
        Access Pro Version
        <ArrowRight className="ml-2 h-5 w-5" />
      </button>
      {message && (
        <span className="mt-2 text-xs text-gray-500">{message}</span>
      )}
    </div>
  );
};

export default AccessProButton;
