import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import api from '../../utils/axios';
import PasswordInput from '../../components/form/PasswordInput';

const AgentResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: formData.password
      });
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/agent/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your new password</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 mr-2" />
                <p className="font-semibold">Password reset successfully!</p>
              </div>
              <p className="text-sm mt-2">Redirecting to login...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <PasswordInput
              label="New Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Enter new password"
              autoComplete="new-password"
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/agent/login"
            className="text-blue-600 hover:underline text-sm"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AgentResetPassword;

