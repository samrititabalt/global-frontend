import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

const EmployeeLogin = () => {
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companies, setCompanies] = useState([]);
  const [companyError, setCompanyError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await api.get('/hiring-pro/companies');
        setCompanies(response.data.companies || []);
      } catch (err) {
        setCompanies([]);
      }
    };
    loadCompanies();
  }, []);

  const canCreateProfile = companies.length > 0 && companyId;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/hiring-pro/auth/login', { email, password, role: 'employee' });
      if (response.data.success) {
        localStorage.setItem('hiringProEmployeeToken', response.data.token);
        localStorage.removeItem('hiringProToken');
        navigate('/hiring-pro/employee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setCompanyError('');

    if (!companies.length) {
      setCompanyError('Your company has not been onboarded yet. Please ask your employer to set up Hiring Pro before you continue.');
      return;
    }
    if (!companyId) {
      setCompanyError('Please select a company.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/hiring-pro/employee/signup', {
        name: fullName,
        email,
        companyId
      });
      if (response.data.success) {
        localStorage.setItem('hiringProEmployeeToken', response.data.token);
        localStorage.removeItem('hiringProToken');
        navigate('/hiring-pro/employee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Profile creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Employee Onboarding & Login</h2>
        <p className="text-sm text-gray-600 mb-6">
          <span className="font-semibold">Important:</span> Create your employee profile using your email address.
          You will receive a temporary OTP/password by email after profile creation.
        </p>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold border ${mode === 'signup' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            Create Employee Profile
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold border ${mode === 'login' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            Employee Login
          </button>
        </div>

        {mode === 'signup' ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              placeholder="Full Name"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              placeholder="Email Address"
              required
            />
            <div>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                required
              >
                <option value="">Select Company</option>
                {companies.map(company => (
                  <option key={company._id} value={company._id}>{company.name}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Select the company you are joining. If your company is not listed, ask your employer to first create their company profile in Hiring Pro.
              </p>
              {companyError && (
                <p className="mt-2 text-xs text-red-600">{companyError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !canCreateProfile}
              className={`w-full rounded-lg py-2 font-semibold ${loading || !canCreateProfile ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-indigo-600 text-white'}`}
            >
              {loading ? 'Creating profile...' : 'Create Profile'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              placeholder="Email Address"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              placeholder="Password"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployeeLogin;
