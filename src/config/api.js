/**
 * Centralized API Configuration
 * 
 * This file manages all API and Socket configuration from environment variables.
 * 
 * REQUIRED ENVIRONMENT VARIABLES (in frontend/.env):
 * - VITE_API_URL: Backend API URL (e.g., http://localhost:5000/api or https://api.yourdomain.com/api)
 * - VITE_SOCKET_URL: Socket.io URL (optional, defaults to API URL without /api)
 * 
 * Example .env file:
 * VITE_API_URL=http://localhost:5000/api
 * VITE_SOCKET_URL=http://localhost:5000
 * 
 * OR for production:
 * VITE_API_URL=https://api.yourdomain.com/api
 * VITE_SOCKET_URL=https://api.yourdomain.com
 */

// Get API URL from environment variable
const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (apiUrl) {
    return apiUrl;
  }
  
  // Default to relative URL if not set
  return '/api';
};

// Get Socket URL from environment variable or derive from API URL
const getSocketUrl = () => {
  // If explicitly set, use it
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  if (socketUrl) {
    return socketUrl;
  }
  
  // Otherwise, derive from API URL
  const apiUrl = getApiUrl();
  
  // If API URL is relative, socket should also be relative
  if (apiUrl.startsWith('/')) {
    return '';
  }
  
  // Remove /api from the end if present
  if (apiUrl.endsWith('/api')) {
    return apiUrl.replace('/api', '');
  }
  
  // If no /api, return as is (might be the base URL)
  return apiUrl.replace(/\/api\/?$/, '');
};

// Export configuration
export const API_CONFIG = {
  // API Base URL
  API_URL: getApiUrl(),
  
  // Socket.io URL
  SOCKET_URL: getSocketUrl(),
  
  // Check if we're in development
  IS_DEV: import.meta.env.DEV,
  
  // Check if we're in production
  IS_PROD: import.meta.env.PROD,
};

// Log configuration in development (for debugging)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    API_URL: API_CONFIG.API_URL,
    SOCKET_URL: API_CONFIG.SOCKET_URL,
    ENV: import.meta.env.MODE,
  });
}

export default API_CONFIG;
