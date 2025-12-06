/**
 * Axios Configuration
 * 
 * This file configures the axios instance used for all API calls.
 * 
 * TO CHANGE THE BACKEND API URL:
 * 1. Create a .env file in the frontend directory (if it doesn't exist)
 * 2. Add: VITE_API_URL=http://your-backend-url/api
 *    Example: VITE_API_URL=http://localhost:5000/api
 *    Example: VITE_API_URL=https://api.yourdomain.com/api
 * 3. Restart your development server
 * 
 * If VITE_API_URL is not set, it defaults to '/api' (relative URL)
 * 
 * The API URL is now centralized in src/config/api.js
 */

import axios from 'axios';
import { API_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: API_CONFIG.API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/customer/login';
    }
    return Promise.reject(error);
  }
);

export default api;

