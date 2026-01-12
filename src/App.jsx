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
import TimesheetCalculator from './pages/admin/TimesheetCalculator';
import RecentActivity from './pages/admin/RecentActivity';

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
import FirstCallDeckPublic from './pages/FirstCallDeckPublic';

// Service Pages
import UKAccountingTaxationReporting from './pages/services/UKAccountingTaxationReporting';
import ESG from './pages/services/ESG';
import MarketResearch from './pages/services/MarketResearch';
import ContactCentreSupport from './pages/services/ContactCentreSupport';
import RecruitmentStaffing from './pages/services/RecruitmentStaffing';
import EquityResearchManagement from './pages/services/EquityResearchManagement';
import IndustryReports from './pages/services/IndustryReports';
import SoftwareTechSupport from './pages/services/SoftwareTechSupport';

// Solution Pages
import SamsSmartReports from './pages/solutions/SamsSmartReports';
import ExpenseMonitor from './pages/solutions/ExpenseMonitor';
import ExpenseMonitorPro from './pages/solutions/ExpenseMonitorPro';
import MergeSpreadsheets from './pages/solutions/MergeSpreadsheets';
import MergeSpreadsheetsPro from './pages/solutions/MergeSpreadsheetsPro';
import Forecasts from './pages/solutions/Forecasts';
import LinkedInHelper from './pages/solutions/LinkedInHelper';
import LinkedInHelperPro from './pages/solutions/LinkedInHelperPro';
import ErrorBoundary from './components/ErrorBoundary';
import RiskFraud from './pages/solutions/RiskFraud';
import Hiring from './pages/solutions/Hiring';
import FacebookAdsQuickLaunch from './pages/solutions/FacebookAdsQuickLaunch';
import SolutionPro from './pages/customer/SolutionPro';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeBuilderCreate from './pages/customer/ResumeBuilderCreate';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import DataDeletion from './pages/legal/DataDeletion';

// Admin Components
import { EditModeProvider } from './components/admin/EditModeToggle';
import EditModeToggle from './components/admin/EditModeToggle';
import AdminIndicator from './components/admin/AdminIndicator';

function App() {
  return (
    <AuthProvider>
      <EditModeProvider>
        <SocketProvider>
          <Router>
            {/* Admin Edit Mode Toggle - Fixed position top right */}
            <EditModeToggle />
            
            {/* Admin Indicator - Fixed position bottom right */}
            <AdminIndicator />
            
            <div className="pt-[60px]">
              <Routes>
            {/* Public Routes */}
            {/* public routes  */}
            <Route path="/" element={<Home />} />
            <Route path="/why-us" element={<WhyUsPage />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/ask-sam" element={<AskSam />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/uk-accounting-taxation-reporting" element={<UKAccountingTaxationReporting />} />
            <Route path="/services/esg" element={<ESG />} />
            <Route path="/services/market-research" element={<MarketResearch />} />
            <Route path="/services/contact-centre-support" element={<ContactCentreSupport />} />
            <Route path="/services/recruitment-staffing" element={<RecruitmentStaffing />} />
            <Route path="/services/equity-research-management" element={<EquityResearchManagement />} />
            <Route path="/services/industry-reports" element={<IndustryReports />} />
            <Route path="/services/software-tech-support" element={<SoftwareTechSupport />} />
            <Route path="/industry" element={<Industry />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/plans/:planSlug" element={<PlanCheckout />} />
            <Route path="/first-call-deck" element={<FirstCallDeckPublic />} />
            
            {/* Solution Pages */}
            <Route path="/solutions/sams-smart-reports" element={<SamsSmartReports />} />
            <Route path="/solutions/expense-monitor" element={<ExpenseMonitor />} />
            <Route path="/expense-monitor-pro" element={<ExpenseMonitorPro />} />
            <Route path="/solutions/merge-spreadsheets" element={<MergeSpreadsheets />} />
            <Route path="/merge-spreadsheets-pro" element={<MergeSpreadsheetsPro />} />
            <Route path="/solutions/forecasts" element={<Forecasts />} />
            <Route path="/solutions/risk-fraud" element={<RiskFraud />} />
            <Route path="/solutions/hiring" element={<Hiring />} />
            <Route path="/solutions/facebook-ads" element={<FacebookAdsQuickLaunch />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/solutions/linkedin-helper" element={<LinkedInHelper />} />
            <Route path="/linkedin-helper-pro" element={<ErrorBoundary><LinkedInHelperPro /></ErrorBoundary>} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/data-deletion" element={<DataDeletion />} />

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
            <Route 
              path="/customer/solution-pro" 
              element={
                <ProtectedRoute role="customer">
                  <SolutionPro />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume-builder/create" 
              element={
                <ProtectedRoute role="customer">
                  <ResumeBuilderCreate />
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
              path="/admin/recent-activity" 
              element={
                <ProtectedRoute role="admin">
                  <RecentActivity />
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
            <Route 
              path="/admin/timesheet-calculator" 
              element={
                <ProtectedRoute role="admin">
                  <TimesheetCalculator />
                </ProtectedRoute>
              } 
            />

            </Routes>
          </div>
        </Router>
      </SocketProvider>
      </EditModeProvider>
    </AuthProvider>
  );
}

export default App;

