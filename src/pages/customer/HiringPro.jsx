import React from 'react';
import { ArrowRight, Bot, Building2, ShieldCheck, Users } from 'lucide-react';
import Header from '../../components/public/Header';
import Footer from '../../components/public/Footer';
import CompanyOnboarding from '../hiringpro/CompanyOnboarding';
import { Link } from 'react-router-dom';

const HiringPro = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-2xl p-8 mb-10">
            <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl"></div>
            <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                <Bot className="h-4 w-4" />
                AI Agentic HRM Platform
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mt-4 text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-indigo-600" />
                WFH‑HRM Access Pro
              </h1>
              <p className="text-lg text-gray-600 mt-3 max-w-2xl">
                Launch your hiring workspace with secure onboarding, AI-driven document generation, and modern HR workflows.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Secure multi-tenant setup
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  Company branding ready
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/customer/hiring-platform"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
                >
                  Enter Hiring Platform
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="inline-flex items-center text-sm text-gray-500">
                  Continue below to complete onboarding details.
                </span>
              </div>
            </div>
          </div>
          <CompanyOnboarding />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HiringPro;
