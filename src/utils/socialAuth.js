import { API_CONFIG } from '../config/api';

const buildDefaultAuthUrl = (provider) => {
  // Get the API base URL (e.g., '/api' or 'http://localhost:5000/api')
  let apiUrl = (API_CONFIG.API_URL || '/api').replace(/\/+$/, '');
  
  // Ensure apiUrl ends with /api
  // If it's a full URL without /api, add it
  // If it's just a base URL, ensure /api is present
  if (apiUrl.startsWith('http')) {
    // Full URL like 'https://global-backend-tj49.onrender.com'
    if (!apiUrl.endsWith('/api')) {
      // If it doesn't end with /api, add it
      apiUrl = `${apiUrl}/api`;
    }
  } else if (apiUrl !== '/api' && !apiUrl.endsWith('/api')) {
    // Relative URL that's not /api
    apiUrl = '/api';
  }
  
  // Build the OAuth URL: {API_URL}/auth/{provider}
  // Examples:
  // - '/api' + '/auth/google' = '/api/auth/google'
  // - 'http://localhost:5000/api' + '/auth/google' = 'http://localhost:5000/api/auth/google'
  // - 'https://global-backend-tj49.onrender.com/api' + '/auth/google' = 'https://global-backend-tj49.onrender.com/api/auth/google'
  const authPath = `/auth/${provider}`;
  
  return `${apiUrl}${authPath}`;
};

export const SOCIAL_AUTH_URLS = {
  google: import.meta.env.VITE_GOOGLE_AUTH_URL || buildDefaultAuthUrl('google'),
  microsoft: import.meta.env.VITE_MICROSOFT_AUTH_URL || buildDefaultAuthUrl('microsoft'),
};

export const getProviderUrl = (provider) => SOCIAL_AUTH_URLS[provider];

export const redirectToProvider = (provider) => {
  const targetUrl = getProviderUrl(provider);
  if (!targetUrl) {
    console.warn(`Missing auth URL for provider: ${provider}`);
    return;
  }
  window.location.href = targetUrl;
};


