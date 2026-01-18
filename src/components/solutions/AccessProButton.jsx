import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';

const SERVICE_KEY_MAP = [
  { match: '/ask-sam', key: 'ask_sam' },
  { match: '/solutions/expense-monitor', key: 'expense_monitor' },
  { match: '/solutions/sams-smart-reports', key: 'sams_smart_reports' },
  { match: '/solutions/sam-reports', key: 'sam_reports' },
  { match: '/solutions/merge-spreadsheets', key: 'merge_spreadsheets' },
  { match: '/solutions/forecasts', key: 'forecasts' },
  { match: '/solutions/risk-fraud', key: 'risk_fraud' },
  { match: '/solutions/hiring', key: 'hiring' },
  { match: '/solutions/facebook-ads', key: 'facebook_ads' },
  { match: '/resume-builder', key: 'resume_builder' },
  { match: '/solutions/linkedin-helper', key: 'linkedin_helper' },
  { match: '/solutions/industry-solutions', key: 'industry_solutions' },
  { match: '/solutions/document-converter', key: 'document_converter' }
];

const AccessProButton = ({ proPath, customerProPath, agentProPath, serviceKey, className = '' }) => {
  const { isAuthenticated, user } = useAuth();
  const [message, setMessage] = useState('');
  const [accessMap, setAccessMap] = useState([]);
  const location = useLocation();
  
  const resolvedCustomerPath = customerProPath || proPath;
  const resolvedAgentPath = agentProPath || (resolvedCustomerPath?.startsWith('/customer/')
    ? resolvedCustomerPath.replace('/customer/', '/agent/')
    : resolvedCustomerPath?.startsWith('/') ? `/agent${resolvedCustomerPath}` : resolvedCustomerPath);

  const isCustomer = isAuthenticated && user?.role === 'customer';
  const isAgent = isAuthenticated && user?.role === 'agent';
  const isAgentPro = isAgent && user?.pro_access_enabled;

  const resolvedServiceKey = useMemo(() => {
    if (serviceKey) return serviceKey;
    const match = SERVICE_KEY_MAP.find((item) => location.pathname.startsWith(item.match));
    return match?.key || '';
  }, [location.pathname, serviceKey]);

  useEffect(() => {
    if (!isCustomer || !resolvedServiceKey) return;
    api.get('/customer/sam-studios-access')
      .then((response) => {
        if (Array.isArray(response.data?.access)) {
          setAccessMap(response.data.access);
        }
      })
      .catch(() => {});
  }, [isCustomer, resolvedServiceKey]);

  const hasCustomerAccess = useMemo(() => {
    if (!isCustomer || !resolvedServiceKey) return false;
    const entry = accessMap.find((item) => item.key === resolvedServiceKey);
    return !!entry?.enabled;
  }, [accessMap, isCustomer, resolvedServiceKey]);

  if ((isCustomer && hasCustomerAccess) || isAgentPro) {
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

  if (isCustomer && !hasCustomerAccess) {
    return (
      <div className="flex flex-col items-start">
        <button
          type="button"
          className={`inline-flex items-center justify-center px-8 py-4 bg-gray-300 text-gray-700 font-semibold rounded-lg cursor-not-allowed ${className}`}
        >
          Access Pro Version
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
        <span className="mt-2 text-xs text-gray-500">Access restricted by administrator.</span>
      </div>
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
