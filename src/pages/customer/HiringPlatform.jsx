import React from 'react';
import { ArrowRight, Bot, Building2, FileText, ShieldCheck, Sparkles, Users, Workflow } from 'lucide-react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const HiringPlatform = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 p-8 text-white">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,_transparent_55%)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                <Bot className="h-4 w-4" />
                WFH‑HRM Platform Entry
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mt-4 flex items-center gap-3">
                <Building2 className="h-8 w-8" />
                AI-Powered Hiring & HR Workspace
              </h1>
              <p className="text-lg text-white/90 mt-3 max-w-3xl">
                Navigate instantly to the Admin or Employee dashboards. All workflows stay intact — now wrapped in a
                modern, guided experience.
              </p>
            </div>
          </div>

          <div className="p-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Sparkles, title: 'Agentic AI', description: 'Automate HR tasks, drafts, and approvals with AI copilots.' },
                { icon: Workflow, title: 'Unified Workflow', description: 'Manage hiring, onboarding, payroll, and compliance in one flow.' },
                { icon: ShieldCheck, title: 'Enterprise Ready', description: 'Secure, auditable, and multi-tenant by design.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
                  <item.icon className="h-7 w-7 text-indigo-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-200 p-6 bg-white shadow-sm">
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

              <div className="rounded-2xl border border-gray-200 p-6 bg-white shadow-sm">
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

            <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
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
      </div>
    </Layout>
  );
};

export default HiringPlatform;
