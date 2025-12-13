import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import api from '../../utils/axios';

const AgentForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { 
        email, 
        role: 'agent' 
      });
      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
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
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-blue-600 tracking-[0.3em] uppercase">
              Password Recovery
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-3">Forgot Password?</h1>
            <p className="text-gray-600">
              Enter your email to receive a verification code
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-6">
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-center mb-3">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <p className="font-semibold text-green-900 mb-2">Verification Code Sent!</p>
                <p className="text-sm text-green-700 mb-4">
                  We've sent a 6-digit verification code to your email address.
                </p>
                <p className="text-sm text-green-600">
                  Please check your inbox (and spam folder) and enter the code on the next page.
                </p>
              </div>
              <div className="space-y-3">
                <Link
                  to="/agent/reset-password"
                  className="block w-full bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 font-semibold transition"
                >
                  Enter Verification Code
                </Link>
                <Link
                  to="/agent/login"
                  className="block text-blue-600 hover:underline text-sm"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-60 transition font-semibold"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/agent/login"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Remember your password? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentForgotPassword;
