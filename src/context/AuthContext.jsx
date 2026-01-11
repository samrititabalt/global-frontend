import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import api from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is authenticated
  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      return { success: false, message: 'Not authenticated' };
    }

    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.data.user;
      
      // Special handling for spbajaj25@gmail.com
      // If user was logged in as admin or customer, preserve that role from localStorage
      if (userData.email && userData.email.toLowerCase() === 'spbajaj25@gmail.com') {
        userData.canAccessAdmin = true;
        // Check if user was logged in with a specific role (stored in localStorage)
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (storedUser && storedUser.email === userData.email) {
          // Preserve role from login/registration (admin or customer)
          if (storedUser.role === 'admin' || storedUser.role === 'customer') {
            userData.role = storedUser.role;
          }
        }
      }
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Clear stored user on error
      setToken(null);
      setUser(null);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Session expired' 
      };
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        await refreshUser();
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email, password, expectedRole = null) => {
    try {
      const response = await authAPI.login({ email, password, expectedRole });
      const { token: newToken, user: userData } = response.data;
      
      // Validate that the user role matches expected role before setting token
      // Exception: Allow spbajaj25@gmail.com to login as admin even if role is agent/customer
      const isOwnerEmail = userData.email && userData.email.toLowerCase() === 'spbajaj25@gmail.com';
      if (expectedRole && userData.role !== expectedRole && !(isOwnerEmail && expectedRole === 'admin')) {
        return {
          success: false,
          message: `Access denied. ${userData.role === 'customer' ? 'Customer' : userData.role === 'agent' ? 'Agent' : 'Admin'} accounts can only login through the ${userData.role} portal.`
        };
      }
      
      localStorage.setItem('token', newToken);
      // Store user data temporarily to preserve role for refreshUser
      if (userData.email && userData.email.toLowerCase() === 'spbajaj25@gmail.com') {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('ownerEmail', userData.email);
      }
      setToken(newToken);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      // Don't let axios interceptor redirect during login - handle it in the component
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      // If it's a 401/403, don't trigger the interceptor redirect
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Clear token to prevent stale auth state
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  // Auto-login owner as customer for solutions access
  const autoLoginOwnerAsCustomer = async () => {
    try {
      const ownerEmail = 'spbajaj25@gmail.com';
      const response = await api.post('/public/ensure-owner-customer', { email: ownerEmail });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('ownerEmail', ownerEmail);
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, message: 'Auto-login failed' };
    } catch (error) {
      console.error('Auto-login error:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const register = async (userData) => {
    try {
      // If userData already contains token and user (from direct API call), use those
      if (userData.token && userData.user) {
        localStorage.setItem('token', userData.token);
        // Store user data temporarily for spbajaj25@gmail.com
        if (userData.user.email && userData.user.email.toLowerCase() === 'spbajaj25@gmail.com') {
          localStorage.setItem('user', JSON.stringify(userData.user));
        }
        setToken(userData.token);
        setUser(userData.user);
        return { success: true };
      }
      
      // Otherwise, call the API
      const response = await authAPI.register(userData);
      const { token: newToken, user: userInfo } = response.data;
      
      localStorage.setItem('token', newToken);
      // Store user data temporarily for spbajaj25@gmail.com
      if (userInfo.email && userInfo.email.toLowerCase() === 'spbajaj25@gmail.com') {
        localStorage.setItem('user', JSON.stringify(userInfo));
      }
      setToken(newToken);
      setUser(userInfo);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Clear stored user on logout
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    autoLoginOwnerAsCustomer,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

