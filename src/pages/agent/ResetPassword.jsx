import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, Shield } from 'lucide-react';
import api from '../../utils/axios';
import PasswordInput from '../../components/form/PasswordInput';

const AgentResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Verify OTP, 2: Reset Password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
    resetToken: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Step 1: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.otp) {
      setError('Please enter both email and verification code');
      return;
    }

    if (formData.otp.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/verify-reset-otp', {
        email: formData.email,
        role: 'agent',
        otp: formData.otp
      });

      if (response.data.success) {
        formData.resetToken = response.data.resetToken;
        setStep(2);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
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
      const response = await api.post('/auth/reset-password', {
        email: formData.email,
        role: 'agent',
        resetToken: formData.resetToken,
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
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 -right-8 w-72 h-72 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/80 border border-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              {step === 1 ? (
                <Shield className="w-10 h-10 text-blue-600" />
              ) : (
                <Lock className="w-10 h-10 text-blue-600" />
              )}
            </div>
            <p className="text-sm font-semibold text-blue-600 tracking-[0.3em] uppercase">
              {step === 1 ? 'Verify Code' : 'Set New Password'}
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-3">
              {step === 1 ? 'Enter Verification Code' : 'Reset Password'}
            </h1>
            <p className="text-gray-600">
              {step === 1 
                ? 'Enter the 6-digit code sent to your email' 
                : 'Create a strong new password for your account'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-center mb-3">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <p className="font-semibold text-green-900 mb-2">Password Reset Successful!</p>
                <p className="text-sm text-green-700">Redirecting to login...</p>
              </div>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-60 transition font-semibold"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
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
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-60 transition font-semibold"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center space-y-2">
            {step === 1 && (
              <Link
                to="/agent/forgot-password"
                className="block text-blue-600 hover:underline text-sm font-medium"
              >
                Didn't receive code? Resend
              </Link>
            )}
            <Link
              to="/agent/login"
              className="block text-gray-600 hover:underline text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentResetPassword;
