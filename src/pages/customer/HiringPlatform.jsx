import React from 'react';
import { Building2, Users, ShieldCheck, ArrowRight, FileText } from 'lucide-react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const HiringPlatform = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Hiring Platform</h1>
          </div>
          <p className="text-gray-600 mb-8">
            Manage onboarding, offer letters, employee records, timesheets, holidays, and HR workflows
            with a clean, multi-tenant dashboard designed for growing teams.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="h-6 w-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Review timesheets, approve holidays, manage employee profiles, and generate offer letters.
              </p>
              <Link
                to="/hiring-pro/company-admin"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Open Admin Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Employee Dashboard</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Submit timesheets, apply for holidays, upload documents, and view offer letters.
              </p>
              <Link
                to="/hiring-pro/employee"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition"
              >
                Open Employee Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Offer Letter & Onboarding Gateway</h3>
            </div>
            <p className="text-sm text-gray-600">
              Use the Admin Dashboard to generate AI-driven offer letters and manage employee onboarding records.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HiringPlatform;
