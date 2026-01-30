import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import HiringPlatform from './pages/customer/HiringPlatform';

// Agent Routes
import AgentLogin from './pages/agent/Login';
import AgentForgotPassword from './pages/agent/ForgotPassword';
import AgentResetPassword from './pages/agent/ResetPassword';
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
import FirstCallDeck from './pages/admin/FirstCallDeck';
import TimesheetCalculator from './pages/admin/TimesheetCalculator';
import RecentActivity from './pages/admin/RecentActivity';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';
import ProAccessGuard from './components/ProAccessGuard';
import CompanyOnboarding from './pages/hiringpro/CompanyOnboarding';
import CompanyAdminDashboard from './pages/hiringpro/CompanyAdminDashboard';
import EmployeeDashboard from './pages/hiringpro/EmployeeDashboard';
import SuperAdminDashboard from './pages/hiringpro/SuperAdminDashboard';
import EmployeeLogin from './pages/hiringpro/EmployeeLogin';

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
import IndustrySolutions from './pages/solutions/IndustrySolutions';
import DocumentConverter from './pages/solutions/DocumentConverter';
import ExpenseMonitor from './pages/solutions/ExpenseMonitor';
import ExpenseMonitorPro from './pages/solutions/ExpenseMonitorPro';
import MergeSpreadsheets from './pages/solutions/MergeSpreadsheets';
import MergeSpreadsheetsPro from './pages/solutions/MergeSpreadsheetsPro';
import Forecasts from './pages/solutions/Forecasts';
import LinkedInHelper from './pages/solutions/LinkedInHelper';
import SamReports from './pages/solutions/SamReports';
import SamReportsPro from './pages/solutions/SamReportsPro';
import ErrorBoundary from './components/ErrorBoundary';
import RiskFraud from './pages/solutions/RiskFraud';
import Hiring from './pages/solutions/Hiring';
import FacebookAdsQuickLaunch from './pages/solutions/FacebookAdsQuickLaunch';
import SolutionPro from './pages/customer/SolutionPro';
import ForecastsPro from './pages/customer/ForecastsPro';
import RiskFraudPro from './pages/customer/RiskFraudPro';
import HiringPro from './pages/customer/HiringPro';
import AgentHiringPro from './pages/agent/HiringPro';
import IndustrySolutionsPro from './pages/customer/IndustrySolutionsPro';
import DocumentConverterPro from './pages/customer/DocumentConverterPro';
import ResumeBuilder from './pages/ResumeBuilder';
import SharedChartView from './pages/public/SharedChartView';
import ResumeBuilderCreate from './pages/customer/ResumeBuilderCreate';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import DataDeletion from './pages/legal/DataDeletion';
import MarketResearch360 from './pages/market-research/MarketResearch360';
import MarketResearchPlatformLanding from './pages/market-research/MarketResearchPlatformLanding';
import MarketResearchPublicDashboard from './pages/market-research/MarketResearchPublicDashboard';
import MarketResearchAdminDashboard from './pages/market-research/MarketResearchAdminDashboard';
import Home2 from './pages/Home2';

// Admin Components
import { EditModeProvider } from './components/admin/EditModeToggle';
import EditModeToggle from './components/admin/EditModeToggle';
import AdminIndicator from './components/admin/AdminIndicator';

const AppRoutes = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isMarketResearch360 = location.pathname.startsWith('/market-research-360');

  return (
    <div className={isHomePage || isMarketResearch360 ? 'pt-0' : 'pt-[60px]'}>
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
            <Route path="/solutions/industry-solutions" element={<IndustrySolutions />} />
            <Route path="/solutions/document-converter" element={<DocumentConverter />} />
            <Route path="/solutions/expense-monitor" element={<ExpenseMonitor />} />
            <Route
              path="/expense-monitor-pro"
              element={
                <ProtectedRoute role="customer">
                  <ProAccessGuard requiredRole="customer">
                    <ExpenseMonitorPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route path="/solutions/merge-spreadsheets" element={<MergeSpreadsheets />} />
            <Route
              path="/merge-spreadsheets-pro"
              element={
                <ProtectedRoute role="customer">
                  <ProAccessGuard requiredRole="customer">
                    <MergeSpreadsheetsPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route path="/solutions/forecasts" element={<Forecasts />} />
            <Route path="/solutions/risk-fraud" element={<RiskFraud />} />
            <Route path="/solutions/hiring" element={<Hiring />} />
            <Route path="/solutions/facebook-ads" element={<FacebookAdsQuickLaunch />} />
            <Route path="/solutions/sam-reports" element={<SamReports />} />
            <Route path="/solutions/sam-reports-pro" element={<SamReportsPro />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/solutions/linkedin-helper" element={<LinkedInHelper />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/data-deletion" element={<DataDeletion />} />
            <Route path="/market-research-360" element={<MarketResearch360 />} />
            <Route path="/market-research-360/:company" element={<MarketResearchPlatformLanding />} />
            <Route path="/market-research-360/:company/public" element={<MarketResearchPublicDashboard />} />
            <Route path="/market-research-360/:company/admin" element={<MarketResearchAdminDashboard />} />
            <Route path="/home-2" element={<Home2 />} />
            
            {/* Shared Chart View - Public */}
            <Route path="/share/chart/:shareId" element={<SharedChartView />} />

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
              path="/customer/hiring-platform"
              element={
                <ProtectedRoute role="customer">
                  <HiringPlatform />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/customer/hiring-platform" 
              element={
                <ProtectedRoute role="customer">
                  <HiringPlatform />
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
                  <ProAccessGuard requiredRole="customer">
                    <SolutionPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/forecasts-pro" 
              element={
                <ProtectedRoute role="customer">
                  <ProAccessGuard requiredRole="customer">
                    <ForecastsPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/risk-fraud-pro" 
              element={
                <ProtectedRoute role="customer">
                  <ProAccessGuard requiredRole="customer">
                    <RiskFraudPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/hiring-pro" 
              element={
                <ProtectedRoute role="customer">
                  <ProAccessGuard requiredRole="customer">
                    <HiringPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/solutions/industry-solutions-pro" 
              element={
                <ProtectedRoute role="customer">
                  <ProAccessGuard requiredRole="customer">
                    <IndustrySolutionsPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/industry-solutions-pro" 
              element={
                <ProtectedRoute role="customer">
                  <ProAccessGuard requiredRole="customer">
                    <IndustrySolutionsPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/document-converter-pro" 
              element={
                <ProtectedRoute role="customer">
                  <ProAccessGuard requiredRole="customer">
                    <DocumentConverterPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/expense-monitor-pro" 
              element={
                <ProtectedRoute role="customer">
                  <ProAccessGuard requiredRole="customer">
                    <ExpenseMonitorPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/merge-spreadsheets-pro" 
              element={
                <ProtectedRoute role="customer">
                  <ProAccessGuard requiredRole="customer">
                    <MergeSpreadsheetsPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume-builder/create" 
              element={
                <ProtectedRoute role="customer">
                  <ProAccessGuard requiredRole="customer">
                    <ResumeBuilderCreate />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/resume-builder-pro" 
              element={
                <ProtectedRoute role="customer">
                  <ProAccessGuard requiredRole="customer">
                    <ResumeBuilderCreate />
                  </ProAccessGuard>
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
            <Route 
              path="/agent/solution-pro" 
              element={
                <ProtectedRoute role="agent">
                  <ProAccessGuard requiredRole="agent">
                    <SolutionPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agent/forecasts-pro" 
              element={
                <ProtectedRoute role="agent">
                  <ProAccessGuard requiredRole="agent">
                    <ForecastsPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agent/risk-fraud-pro" 
              element={
                <ProtectedRoute role="agent">
                  <ProAccessGuard requiredRole="agent">
                    <RiskFraudPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agent/hiring-pro" 
              element={
                <ProtectedRoute role="agent">
                  <ProAccessGuard requiredRole="agent">
                    <AgentHiringPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route path="/hiring-pro/onboarding" element={<CompanyOnboarding />} />
            <Route path="/hiring-pro/company-admin" element={<CompanyAdminDashboard />} />
            <Route path="/hiring-pro/employee" element={<EmployeeDashboard />} />
            <Route path="/hiring-pro/employee-login" element={<EmployeeLogin />} />
            <Route path="/hiring-pro/super-admin" element={<SuperAdminDashboard />} />
            <Route 
              path="/agent/industry-solutions-pro" 
              element={
                <ProtectedRoute role="agent">
                  <ProAccessGuard requiredRole="agent">
                    <IndustrySolutionsPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agent/document-converter-pro" 
              element={
                <ProtectedRoute role="agent">
                  <ProAccessGuard requiredRole="agent">
                    <DocumentConverterPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agent/expense-monitor-pro" 
              element={
                <ProtectedRoute role="agent">
                  <ProAccessGuard requiredRole="agent">
                    <ExpenseMonitorPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agent/merge-spreadsheets-pro" 
              element={
                <ProtectedRoute role="agent">
                  <ProAccessGuard requiredRole="agent">
                    <MergeSpreadsheetsPro />
                  </ProAccessGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agent/resume-builder-pro" 
              element={
                <ProtectedRoute role="agent">
                  <ProAccessGuard requiredRole="agent">
                    <ResumeBuilderCreate />
                  </ProAccessGuard>
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
  );
};

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
            
            <AppRoutes />
          </Router>
        </SocketProvider>
      </EditModeProvider>
    </AuthProvider>
  );
}

export default App;

