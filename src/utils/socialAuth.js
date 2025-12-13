import { API_CONFIG } from '../config/api';

const sanitizeBaseUrl = () => {
  const apiUrl = (API_CONFIG.API_URL || '').replace(/\/+$/, '');
  if (!apiUrl) return '';
  if (apiUrl === '/api') return '';
  return apiUrl.endsWith('/api') ? apiUrl.replace(/\/api$/, '') : apiUrl;
};

const withLeadingSlash = (path) => (path.startsWith('/') ? path : `/${path}`);

const buildDefaultAuthUrl = (provider) => {
  const base = sanitizeBaseUrl();
  const path = withLeadingSlash(`auth/${provider}`);
  if (!base) {
    return path;
  }
  return `${base}${path}`;
};

export const SOCIAL_AUTH_URLS = {
  google: import.meta.env.VITE_GOOGLE_AUTH_URL || buildDefaultAuthUrl('google'),
  microsoft: import.meta.env.VITE_MICROSOFT_AUTH_URL || buildDefaultAuthUrl('microsoft'),
  apple: import.meta.env.VITE_APPLE_AUTH_URL || buildDefaultAuthUrl('apple'),
};

export const redirectToProvider = (provider) => {
  const targetUrl = SOCIAL_AUTH_URLS[provider];
  if (!targetUrl) {
    console.warn(`Missing auth URL for provider: ${provider}`);
    return;
  }
  window.location.href = targetUrl;
};


