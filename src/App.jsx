import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Customer Routes
import CustomerLogin from './pages/customer/Login';
import CustomerSignup from './pages/customer/Signup';
import CustomerPlans from './pages/customer/Plans';
import CustomerPaymentSuccess from './pages/customer/PaymentSuccess';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerChat from './pages/customer/Chat';

// Agent Routes
import AgentLogin from './pages/agent/Login';
import AgentDashboard from './pages/agent/Dashboard';
import AgentChat from './pages/agent/Chat';

// Admin Routes
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminServices from './pages/admin/Services';
import AdminSubServices from './pages/admin/SubServices';
import AdminPlans from './pages/admin/Plans';
import AdminAgents from './pages/admin/Agents';
import AdminTransactions from './pages/admin/Transactions';
import AdminCustomers from './pages/admin/Customers';
import AdminChats from './pages/admin/Chats';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import WhyUsPage from './pages/WhyUsPage';
import Plans from './pages/Plans';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/why-us" element={<WhyUsPage />} />
            <Route path="/plans" element={<Plans />} />

            {/* Customer Routes */}
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/signup" element={<CustomerSignup />} />
            <Route 
              path="/customer/plans" 
              element={
                <ProtectedRoute role="customer">
                  <CustomerPlans />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/payment/success" 
              element={
                <ProtectedRoute role="customer">
                  <CustomerPaymentSuccess />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/dashboard" 
              element={
                <ProtectedRoute role="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/chat/:chatId" 
              element={
                <ProtectedRoute role="customer">
                  <CustomerChat />
                </ProtectedRoute>
              } 
            />

            {/* Agent Routes */}
            <Route path="/agent/login" element={<AgentLogin />} />
            <Route 
              path="/agent/dashboard" 
              element={
                <ProtectedRoute role="agent">
                  <AgentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agent/chat/:chatId" 
              element={
                <ProtectedRoute role="agent">
                  <AgentChat />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/services" 
              element={
                <ProtectedRoute role="admin">
                  <AdminServices />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/sub-services" 
              element={
                <ProtectedRoute role="admin">
                  <AdminSubServices />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/plans" 
              element={
                <ProtectedRoute role="admin">
                  <AdminPlans />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/agents" 
              element={
                <ProtectedRoute role="admin">
                  <AdminAgents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/transactions" 
              element={
                <ProtectedRoute role="admin">
                  <AdminTransactions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/customers" 
              element={
                <ProtectedRoute role="admin">
                  <AdminCustomers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/chats" 
              element={
                <ProtectedRoute role="admin">
                  <AdminChats />
                </ProtectedRoute>
              } 
            />

          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

