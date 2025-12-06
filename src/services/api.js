/**
 * Centralized API Service
 * 
 * This file contains all API endpoints for the application.
 * To change the backend API URL, modify the baseURL in utils/axios.js
 * or set the VITE_API_URL environment variable.
 * 
 * All API calls go through the configured axios instance which handles:
 * - Authentication tokens
 * - Error handling
 * - Request/response interceptors
 */

import api from '../utils/axios';

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const authAPI = {
  /**
   * Register a new customer
   * @param {Object} userData - { name, email, phone, country }
   * @returns {Promise} Response with token and user data
   */
  register: (userData) => api.post('/auth/register', userData),

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Response with token and user data
   */
  login: (credentials) => api.post('/auth/login', credentials),

  /**
   * Get current authenticated user
   * @returns {Promise} Response with user data
   */
  getCurrentUser: () => api.get('/auth/me'),
};

// ============================================================================
// CUSTOMER API
// ============================================================================

export const customerAPI = {
  /**
   * Get all available plans
   * @returns {Promise} Response with plans array
   */
  getPlans: () => api.get('/customer/plans'),

  /**
   * Get all services with sub-services
   * @returns {Promise} Response with services array
   */
  getServices: () => api.get('/customer/services'),

  /**
   * Request a service and create chat session
   * @param {Object} data - { serviceId, subService }
   * @returns {Promise} Response with chat session data
   */
  requestService: (data) => api.post('/customer/request-service', data),

  /**
   * Get all chat sessions for customer
   * @returns {Promise} Response with chat sessions array
   */
  getChatSessions: () => api.get('/customer/chat-sessions'),

  /**
   * Get specific chat session with messages
   * @param {string} chatId - Chat session ID
   * @returns {Promise} Response with chat session and messages
   */
  getChatSession: (chatId) => api.get(`/customer/chat-session/${chatId}`),

  /**
   * Get customer token balance
   * @returns {Promise} Response with balance
   */
  getTokenBalance: () => api.get('/customer/token-balance'),
};

// ============================================================================
// AGENT API
// ============================================================================

export const agentAPI = {
  /**
   * Get agent dashboard data
   * @returns {Promise} Response with dashboard data (pendingRequests, activeChats, completedCases)
   */
  getDashboard: () => api.get('/agent/dashboard'),

  /**
   * Accept a pending chat request
   * @param {string} chatId - Chat session ID
   * @returns {Promise} Response with chat session data
   */
  acceptRequest: (chatId) => api.post(`/agent/accept-request/${chatId}`),

  /**
   * Get specific chat session with messages
   * @param {string} chatId - Chat session ID
   * @returns {Promise} Response with chat session and messages
   */
  getChatSession: (chatId) => api.get(`/agent/chat-session/${chatId}`),

  /**
   * Mark chat as completed
   * @param {string} chatId - Chat session ID
   * @returns {Promise} Response with success message
   */
  completeChat: (chatId) => api.post(`/agent/complete-chat/${chatId}`),

  /**
   * Update agent online/offline status
   * @param {Object} status - { isOnline, isAvailable }
   * @returns {Promise} Response with updated agent status
   */
  updateStatus: (status) => api.put('/agent/status', status),
};

// ============================================================================
// ADMIN API
// ============================================================================

export const adminAPI = {
  // Dashboard
  /**
   * Get admin dashboard data
   * @returns {Promise} Response with dashboard stats and recent transactions
   */
  getDashboard: () => api.get('/admin/dashboard'),

  // Services Management
  /**
   * Get all services
   * @returns {Promise} Response with services array
   */
  getServices: () => api.get('/admin/services'),

  /**
   * Create a new service
   * @param {Object} serviceData - { name, description, subServices }
   * @returns {Promise} Response with created service
   */
  createService: (serviceData) => api.post('/admin/services', serviceData),

  /**
   * Update a service
   * @param {string} serviceId - Service ID
   * @param {Object} serviceData - { name, description, subServices, isActive }
   * @returns {Promise} Response with updated service
   */
  updateService: (serviceId, serviceData) => api.put(`/admin/services/${serviceId}`, serviceData),

  /**
   * Delete a service
   * @param {string} serviceId - Service ID
   * @returns {Promise} Response with success message
   */
  deleteService: (serviceId) => api.delete(`/admin/services/${serviceId}`),

  // Plans Management
  /**
   * Get all plans
   * @returns {Promise} Response with plans array
   */
  getPlans: () => api.get('/admin/plans'),

  /**
   * Create a new plan
   * @param {Object} planData - { name, description, price, tokens, hoursPerMonth, bonusFeatures, isActive }
   * @returns {Promise} Response with created plan
   */
  createPlan: (planData) => api.post('/admin/plans', planData),

  /**
   * Update a plan
   * @param {string} planId - Plan ID
   * @param {Object} planData - { name, description, price, tokens, hoursPerMonth, bonusFeatures, isActive }
   * @returns {Promise} Response with updated plan
   */
  updatePlan: (planId, planData) => api.put(`/admin/plans/${planId}`, planData),

  /**
   * Delete a plan
   * @param {string} planId - Plan ID
   * @returns {Promise} Response with success message
   */
  deletePlan: (planId) => api.delete(`/admin/plans/${planId}`),

  // Agents Management
  /**
   * Get all agents
   * @returns {Promise} Response with agents array
   */
  getAgents: () => api.get('/admin/agents'),

  /**
   * Create a new agent
   * @param {Object} agentData - { name, email, phone, country, serviceCategory }
   * @returns {Promise} Response with created agent
   */
  createAgent: (agentData) => {
    const formData = new FormData();
    Object.keys(agentData).forEach(key => {
      formData.append(key, agentData[key]);
    });
    return api.post('/admin/agents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /**
   * Update an agent
   * @param {string} agentId - Agent ID
   * @param {Object} agentData - Agent data to update
   * @returns {Promise} Response with updated agent
   */
  updateAgent: (agentId, agentData) => api.put(`/admin/agents/${agentId}`, agentData),

  // Customers Management
  /**
   * Get all customers
   * @returns {Promise} Response with customers array
   */
  getCustomers: () => api.get('/admin/customers'),

  /**
   * Adjust customer tokens
   * @param {string} customerId - Customer ID
   * @param {Object} data - { amount, reason }
   * @returns {Promise} Response with updated balance
   */
  adjustCustomerTokens: (customerId, data) => api.put(`/admin/customers/${customerId}/tokens`, data),

  // Transactions Management
  /**
   * Get all transactions
   * @returns {Promise} Response with transactions array
   */
  getTransactions: () => api.get('/admin/transactions'),

  /**
   * Approve a transaction
   * @param {string} transactionId - Transaction ID
   * @returns {Promise} Response with updated transaction
   */
  approveTransaction: (transactionId) => api.post(`/admin/transactions/${transactionId}/approve`),

  /**
   * Reject a transaction
   * @param {string} transactionId - Transaction ID
   * @returns {Promise} Response with updated transaction
   */
  rejectTransaction: (transactionId) => api.post(`/admin/transactions/${transactionId}/reject`),

  // Chats Management
  /**
   * Get all chat sessions
   * @returns {Promise} Response with chats array
   */
  getChats: () => api.get('/admin/chats'),

  /**
   * Transfer chat to another agent
   * @param {string} chatId - Chat session ID
   * @param {Object} data - { agentId }
   * @returns {Promise} Response with updated chat session
   */
  transferChat: (chatId, data) => api.post(`/admin/chats/${chatId}/transfer`, data),
};

// ============================================================================
// PAYMENT API
// ============================================================================

export const paymentAPI = {
  /**
   * Create PayPal payment
   * @param {Object} data - { planId }
   * @returns {Promise} Response with paymentId, approvalUrl, and transactionId
   */
  createPayment: (data) => api.post('/payment/create', data),

  /**
   * Execute PayPal payment
   * @param {Object} data - { paymentId, payerId }
   * @returns {Promise} Response with transaction data
   */
  executePayment: (data) => api.post('/payment/execute', data),
};

// ============================================================================
// CHAT API
// ============================================================================

export const chatAPI = {
  /**
   * Send a text message
   * @param {Object} data - { chatSessionId, content }
   * @returns {Promise} Response with message data
   */
  sendMessage: (data) => api.post('/chat/message', data),

  /**
   * Upload file/image/audio
   * @param {FormData} formData - FormData with file and chatSessionId
   * @returns {Promise} Response with message data
   */
  uploadFile: (formData) => api.post('/chat/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  /**
   * Get all messages for a chat session
   * @param {string} sessionId - Chat session ID
   * @returns {Promise} Response with messages array
   */
  getMessages: (sessionId) => api.get(`/chat/sessions/${sessionId}/messages`),

  /**
   * Mark message as read
   * @param {string} messageId - Message ID
   * @returns {Promise} Response with updated message
   */
  markMessageAsRead: (messageId) => api.put(`/chat/message/${messageId}/read`),

  /**
   * Edit a message
   * @param {string} messageId - Message ID
   * @param {Object} data - { content }
   * @returns {Promise} Response with updated message
   */
  editMessage: (messageId, data) => api.put(`/chat/message/${messageId}`, data),

  /**
   * Delete a message
   * @param {string} messageId - Message ID
   * @returns {Promise} Response with deleted message
   */
  deleteMessage: (messageId) => api.delete(`/chat/message/${messageId}`),
};

// ============================================================================
// DEFAULT EXPORT - All APIs combined
// ============================================================================

const API = {
  auth: authAPI,
  customer: customerAPI,
  agent: agentAPI,
  admin: adminAPI,
  payment: paymentAPI,
  chat: chatAPI,
};

export default API;
