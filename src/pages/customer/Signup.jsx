import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Upload, X } from 'lucide-react';
import api from '../../utils/axios';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';

const CustomerSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const avatarInputRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Avatar image must be less than 5MB');
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('country', formData.country);
      if (avatar) {
        submitData.append('avatar', avatar);
      }

      const response = await api.post('/auth/register', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Use AuthContext register to properly set user state
        const result = await register({
          token: response.data.token,
          user: response.data.user
        });
        
        if (result.success) {
          // For spbajaj25@gmail.com, navigate to customer plans
          navigate('/customer/plans');
        }
      }
    } catch (err) {
      // Handle validation errors (array) or single error message
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Multiple validation errors
        const errorMessages = errorData.errors.map(e => e.msg || e.message).join(', ');
        setError(errorMessages || 'Please check your input and try again');
      } else {
        // Single error message
        setError(errorData?.message || 'Registration failed. Please try again.');
      }
      console.error('Signup error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-20 right-0 w-72 h-72 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-[-40px] w-96 h-96 bg-purple-100 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/85 border border-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-blue-600 tracking-[0.3em] uppercase">
              Join Ask Sam
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-3">Create an Account</h1>
            <p className="text-gray-600">Get started in minutes and track your service minutes effortlessly.</p>
          </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture (Optional)
            </label>
            <div className="relative">
              {avatarPreview ? (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-400"
                >
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <Upload className="w-4 h-4" />
              <span>{avatarPreview ? 'Change' : 'Upload'} Avatar</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your country"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-60 transition"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center">
            <span className="flex-grow border-t border-gray-200" />
            <span className="mx-3 text-xs font-semibold text-gray-400 tracking-[0.3em]">
              OR
            </span>
            <span className="flex-grow border-t border-gray-200" />
          </div>
          <div className="mt-6">
            <SocialAuthButtons />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/customer/login" className="text-blue-600 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignup;

