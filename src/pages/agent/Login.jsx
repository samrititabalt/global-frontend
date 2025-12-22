import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/form/PasswordInput';

const AgentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password, 'agent');
      
      if (result.success) {
        // Ensure we stay on agent routes - prevent any redirects
        navigate('/agent/dashboard', { replace: true });
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 -right-8 w-72 h-72 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/80 border border-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-blue-600 tracking-[0.3em] uppercase">
              Welcome back
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-3">Agent Portal</h1>
            <p className="text-gray-600">
              Sign in to manage requests and track your service minutes.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your email"
              />
            </div>

            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-60 transition"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;

