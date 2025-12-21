import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Customer Routes
import CustomerLogin from './pages/customer/Login';
import CustomerSignup from './pages/customer/Signup';
import ForgotPassword from './pages/customer/ForgotPassword';
import ResetPassword from './pages/customer/ResetPassword';
import CustomerPlans from './pages/customer/Plans';
import CustomerPaymentSuccess from './pages/customer/PaymentSuccess';
import CustomerPaymentCancel from './pages/customer/PaymentCancel';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerChat from './pages/customer/Chat';

// Agent Routes
import AgentLogin from './pages/agent/Login';
import AgentForgotPassword from './pages/agent/ForgotPassword';
import AgentResetPassword from './pages/agent/ResetPassword';
import AgentDashboard from './pages/agent/Dashboard';
import AgentChat from './pages/agent/Chat';

// Admin Routes
import AdminLogin from './pages/admin/Login';
import AdminForgotPassword from './pages/admin/ForgotPassword';
import AdminResetPassword from './pages/admin/ResetPassword';
import AdminDashboard from './pages/admin/Dashboard';
import AdminServices from './pages/admin/Services';
import AdminSubServices from './pages/admin/SubServices';
import AdminPlans from './pages/admin/Plans';
import AdminAgents from './pages/admin/Agents';
import AdminTransactions from './pages/admin/Transactions';
import AdminCustomers from './pages/admin/Customers';
import AdminChats from './pages/admin/Chats';
import FirstCallDeck from './pages/admin/FirstCallDeck';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import WhyUsPage from './pages/WhyUsPage';
import AboutUs from './pages/AboutUs';
import AskSam from './pages/AskSam';
import Services from './pages/Services';
import Industry from './pages/Industry';
import CaseStudies from './pages/CaseStudies';
import ContactUs from './pages/ContactUs';
import Plans from './pages/Plans';
import PlanCheckout from './pages/PlanCheckout';
import Profile from './pages/profile/Profile';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            {/* public routes  */}
            <Route path="/" element={<Home />} />
            <Route path="/why-us" element={<WhyUsPage />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/ask-sam" element={<AskSam />} />
            <Route path="/services" element={<Services />} />
            <Route path="/industry" element={<Industry />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/plans/:planSlug" element={<PlanCheckout />} />

            {/* Customer Routes */}
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/signup" element={<CustomerSignup />} />
            <Route path="/customer/forgot-password" element={<ForgotPassword />} />
            <Route path="/customer/reset-password" element={<ResetPassword />} />
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
              path="/customer/payment/cancel" 
              element={
                <ProtectedRoute role="customer">
                  <CustomerPaymentCancel />
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
              path="/customer/profile" 
              element={
                <ProtectedRoute role="customer">
                  <Profile />
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
            <Route path="/agent/forgot-password" element={<AgentForgotPassword />} />
            <Route path="/agent/reset-password" element={<AgentResetPassword />} />
            <Route 
              path="/agent/dashboard" 
              element={
                <ProtectedRoute role="agent">
                  <AgentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agent/profile" 
              element={
                <ProtectedRoute role="agent">
                  <Profile />
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
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/profile" 
              element={
                <ProtectedRoute role="admin">
                  <Profile />
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
            <Route 
              path="/admin/first-call-deck" 
              element={
                <ProtectedRoute role="admin">
                  <FirstCallDeck />
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

