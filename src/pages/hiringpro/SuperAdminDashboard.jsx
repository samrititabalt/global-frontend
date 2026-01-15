import React, { useState } from 'react';
import api from '../../utils/axios';

const SuperAdminDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem('hiringProToken'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCompanies = async (authToken) => {
    const response = await api.get('/hiring-pro/super/companies', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    setCompanies(response.data.companies || []);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/hiring-pro/auth/login', {
        email,
        password,
        role: 'super_admin'
      });
      if (response.data.success) {
        localStorage.setItem('hiringProToken', response.data.token);
        setToken(response.data.token);
        await loadCompanies(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!token) return;
    await loadCompanies(token);
  };

  if (!token) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Super Admin Login</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            placeholder="Super admin email"
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
            className="w-full rounded-lg bg-gray-900 text-white py-2 font-semibold"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Super Admin Console</h2>
          <p className="text-sm text-gray-500">Platform-wide company overview</p>
        </div>
        <button
          onClick={handleRefresh}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
      <div className="space-y-3">
        {companies.map(company => (
          <div key={company._id} className="rounded-lg border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">{company.name}</p>
            <p className="text-sm text-gray-600">Signing Authority: {company.signingAuthority?.name} ({company.signingAuthority?.title})</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
