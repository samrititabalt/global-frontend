# Centralized API Service

This directory contains the centralized API service that handles all backend API calls.

## 📁 File Structure

- **`api.js`** - Main API service file containing all API endpoints organized by feature

## 🚀 How to Use

### Import the API Service

```javascript
// Import specific API modules
import { authAPI, customerAPI, adminAPI } from '../services/api';

// Or import the default export (contains all APIs)
import API from '../services/api';
```

### Example Usage

```javascript
// Authentication
import { authAPI } from '../services/api';

// Login
const response = await authAPI.login({ email, password });
const { token, user } = response.data;

// Get current user
const userResponse = await authAPI.getCurrentUser();
```

```javascript
// Customer APIs
import { customerAPI } from '../services/api';

// Get services
const services = await customerAPI.getServices();

// Request a service
const chatSession = await customerAPI.requestService({
  serviceId: '123',
  subService: 'Sub Service Name'
});
```

```javascript
// Admin APIs
import { adminAPI } from '../services/api';

// Get all services
const services = await adminAPI.getServices();

// Create a service
const newService = await adminAPI.createService({
  name: 'Service Name',
  description: 'Description',
  subServices: []
});
```

## 🔧 Changing the Backend API URL and Socket URL

All configuration is now centralized in `src/config/api.js` and uses environment variables.

### Environment Variables Setup

1. Create a `.env` file in the `frontend` directory (if it doesn't exist)
2. Add the following variables:
   ```env
   # Required: Backend API URL
   VITE_API_URL=http://your-backend-url/api
   
   # Optional: Socket.io URL (auto-derived from API URL if not set)
   VITE_SOCKET_URL=http://your-backend-url
   ```
   
   Examples:
   ```env
   # Development
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   
   # Production
   VITE_API_URL=https://api.yourdomain.com/api
   VITE_SOCKET_URL=https://api.yourdomain.com
   ```

3. Restart your development server

### How It Works

- **API URL**: Used by axios for all HTTP requests
- **Socket URL**: Used by socket.io-client for real-time connections
- **Auto-derivation**: If `VITE_SOCKET_URL` is not set, it's automatically derived from `VITE_API_URL` by removing the `/api` suffix

### Configuration File

The configuration is managed in `src/config/api.js`. You can import it:

```javascript
import { API_CONFIG } from '../config/api';

console.log(API_CONFIG.API_URL);    // Your API URL
console.log(API_CONFIG.SOCKET_URL); // Your Socket URL
```

## 📚 Available API Modules

### `authAPI`
- `register(userData)` - Register a new customer
- `login(credentials)` - Login user
- `getCurrentUser()` - Get current authenticated user

### `customerAPI`
- `getPlans()` - Get all available plans
- `getServices()` - Get all services
- `requestService(data)` - Request a service
- `getChatSessions()` - Get all chat sessions
- `getChatSession(chatId)` - Get specific chat session
- `getTokenBalance()` - Get token balance

### `agentAPI`
- `getDashboard()` - Get dashboard data
- `acceptRequest(chatId)` - Accept chat request
- `getChatSession(chatId)` - Get chat session
- `completeChat(chatId)` - Mark chat as completed
- `updateStatus(status)` - Update agent status

### `adminAPI`
- `getDashboard()` - Get dashboard data
- **Services**: `getServices()`, `createService()`, `updateService()`, `deleteService()`
- **Plans**: `getPlans()`, `createPlan()`, `updatePlan()`, `deletePlan()`
- **Agents**: `getAgents()`, `createAgent()`, `updateAgent()`
- **Customers**: `getCustomers()`, `adjustCustomerTokens()`
- **Transactions**: `getTransactions()`, `approveTransaction()`, `rejectTransaction()`
- **Chats**: `getChats()`, `transferChat()`

### `paymentAPI`
- `createPayment(data)` - Create PayPal payment
- `executePayment(data)` - Execute PayPal payment

### `chatAPI`
- `sendMessage(data)` - Send text message
- `uploadFile(formData)` - Upload file/image/audio
- `getMessages(sessionId)` - Get messages for session
- `markMessageAsRead(messageId)` - Mark message as read

## 🔒 Authentication

All API calls automatically include the authentication token from `localStorage`. The token is added via the axios interceptor in `utils/axios.js`.

## 🔌 Socket Connection

The socket connection is managed in `context/SocketContext.jsx` and uses the centralized configuration:

```javascript
import { useSocket } from '../context/SocketContext';

const { socket, isConnected } = useSocket();

// Check connection status
if (isConnected) {
  socket.emit('joinChat', chatId);
}
```

The socket automatically:
- Connects when user is authenticated
- Reconnects on disconnect
- Includes authentication token
- Handles connection errors gracefully

## ⚠️ Error Handling

The API service uses axios interceptors to handle:
- **401 Unauthorized**: Automatically redirects to login page
- **Other errors**: Returns error response that can be caught with try/catch

Example:
```javascript
try {
  const response = await customerAPI.getServices();
  // Handle success
} catch (error) {
  // Handle error
  console.error(error.response?.data?.message || 'An error occurred');
}
```

## 📝 Migration Guide

If you have existing code using direct axios calls, migrate to the centralized API:

**Before:**
```javascript
import api from '../utils/axios';

const response = await api.get('/customer/services');
```

**After:**
```javascript
import { customerAPI } from '../services/api';

const response = await customerAPI.getServices();
```

This provides:
- ✅ Better code organization
- ✅ Easier to maintain
- ✅ Type safety (if using TypeScript)
- ✅ Single place to change API structure
- ✅ Consistent error handling
