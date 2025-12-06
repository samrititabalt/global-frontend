# Socket Connection Setup Guide

## ✅ What Was Fixed

1. **Centralized Configuration**: Created `src/config/api.js` to manage all API and Socket URLs from environment variables
2. **Socket Connection**: Fixed socket connection to use environment variables instead of hardcoded URLs
3. **Better Error Handling**: Added comprehensive error handling and reconnection logic
4. **Connection Status**: Added `isConnected` status to socket context

## 🔧 Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Backend API URL (Required)
VITE_API_URL=http://localhost:5000/api

# Socket URL (Optional - auto-derived if not set)
VITE_SOCKET_URL=http://localhost:5000
```

### For Production (Render.com example):
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

## 📁 Files Changed

1. **`src/config/api.js`** (NEW) - Centralized configuration
2. **`src/utils/axios.js`** - Updated to use centralized config
3. **`src/context/SocketContext.jsx`** - Fixed to use environment variables and improved connection handling
4. **`src/components/ChatInterface.jsx`** - Updated to use new socket context structure

## 🚀 How to Use

### In Components

```javascript
import { useSocket } from '../context/SocketContext';

const { socket, isConnected } = useSocket();

// Check if connected
if (isConnected && socket) {
  socket.emit('joinChat', chatId);
}
```

### Connection Status

The socket context now provides:
- `socket`: The socket.io instance (null if not connected)
- `isConnected`: Boolean indicating connection status

## 🔍 Debugging

### Check Console Logs

When the app starts, you'll see:
```
🔧 API Configuration: {
  API_URL: "http://localhost:5000/api",
  SOCKET_URL: "http://localhost:5000",
  ENV: "development"
}
```

### Socket Connection Logs

- ✅ `Socket connected: [socket-id]` - Successfully connected
- ❌ `Socket connection error: [error]` - Connection failed
- 🔄 `Reconnection attempt #X` - Trying to reconnect
- ✅ `Reconnected after X attempts` - Successfully reconnected

## 🐛 Troubleshooting

### Socket Not Connecting

1. **Check Environment Variables**
   - Verify `.env` file exists in `frontend` directory
   - Check `VITE_API_URL` is set correctly
   - Restart dev server after changing `.env`

2. **Check Backend**
   - Ensure backend server is running
   - Verify socket.io is configured on backend
   - Check backend CORS settings allow your frontend URL

3. **Check Network**
   - Open browser DevTools > Network tab
   - Look for WebSocket connections
   - Check for CORS errors in console

4. **Check Backend Socket Configuration**
   - Backend should have CORS configured for socket.io
   - Socket should be on same server as API

### Common Issues

**Issue**: Socket connects but immediately disconnects
- **Solution**: Check backend authentication middleware for socket connections

**Issue**: CORS errors
- **Solution**: Update backend CORS settings to include your frontend URL

**Issue**: Socket URL incorrect
- **Solution**: Set `VITE_SOCKET_URL` explicitly in `.env` file

## 📝 Notes

- Socket automatically reconnects on disconnect
- Socket includes authentication token automatically
- Socket only connects when user is authenticated
- Socket cleans up properly on component unmount
