import React from 'react';
import { Users } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import CompanyOnboarding from '../hiringpro/CompanyOnboarding';
import CompanyAdminDashboard from '../hiringpro/CompanyAdminDashboard';
import EmployeeDashboard from '../hiringpro/EmployeeDashboard';
import SuperAdminDashboard from '../hiringpro/SuperAdminDashboard';

const HiringPro = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="h-8 w-8" />
              Hiring Pro
            </h1>
            <p className="text-xl text-indigo-100">Multi-tenant HR onboarding platform for modern teams</p>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
            <CompanyOnboarding />
            <div className="space-y-6">
              <CompanyAdminDashboard />
              <EmployeeDashboard />
            </div>
          </div>
          <SuperAdminDashboard />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HiringPro;
