# Configuration Guide

This directory contains centralized configuration for API and Socket connections.

## 📁 Files

- **`api.js`** - Centralized API and Socket configuration from environment variables

## 🔧 Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

### Required

```env
VITE_API_URL=http://localhost:5000/api
```

### Optional

```env
VITE_SOCKET_URL=http://localhost:5000
```

If `VITE_SOCKET_URL` is not set, it will be automatically derived from `VITE_API_URL` by removing the `/api` suffix.

## 📝 Examples

### Development (Local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Production
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
```

### Render.com or Similar Hosting
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

## 🚀 Usage

```javascript
import { API_CONFIG } from '../config/api';

console.log(API_CONFIG.API_URL);    // http://localhost:5000/api
console.log(API_CONFIG.SOCKET_URL); // http://localhost:5000
```

## ⚠️ Important Notes

1. **Socket URL**: The socket server runs on the same server as the API, so the socket URL should be the base URL without `/api`
2. **Environment Variables**: All Vite environment variables must be prefixed with `VITE_` to be accessible in the frontend
3. **Restart Required**: After changing `.env` file, you must restart your development server
4. **CORS**: Make sure your backend CORS settings allow connections from your frontend URL

## 🔍 Debugging

In development mode, the configuration will be logged to the console:

```
🔧 API Configuration: {
  API_URL: "http://localhost:5000/api",
  SOCKET_URL: "http://localhost:5000",
  ENV: "development"
}
```

## 🐛 Troubleshooting

### Socket Not Connecting

1. **Check Environment Variables**: Make sure `VITE_API_URL` is set correctly
2. **Check Backend**: Ensure the backend server is running and socket.io is configured
3. **Check CORS**: Verify backend CORS settings allow your frontend URL
4. **Check Console**: Look for connection errors in browser console
5. **Check Network**: Verify the socket URL is accessible (try opening it in browser)

### API Calls Failing

1. **Check API URL**: Verify `VITE_API_URL` is correct
2. **Check Backend**: Ensure backend is running
3. **Check Network**: Open browser DevTools > Network tab to see failed requests
4. **Check CORS**: Verify backend CORS settings
